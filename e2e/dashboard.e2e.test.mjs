import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { chromium } from 'playwright';
import { createServer as createViteServer } from 'vite';

function createApiServer() {
  let taskId = 0;
  let eventId = 0;
  const tasks = [];
  const events = [];

  const server = createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    const send = (status, payload) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(payload == null ? '' : JSON.stringify(payload));
    };

    if (!url.pathname.startsWith('/api/')) return send(404, { error: 'not found' });

    const body = await new Promise((resolve) => {
      let data = '';
      req.on('data', (chunk) => { data += chunk; });
      req.on('end', () => resolve(data ? JSON.parse(data) : {}));
    });

    if (req.method === 'GET' && url.pathname === '/api/tasks') return send(200, tasks);
    if (req.method === 'POST' && url.pathname === '/api/tasks') {
      const task = { id: ++taskId, status: 'todo', priority: 'medium', ...body };
      tasks.push(task);
      return send(201, task);
    }
    if (req.method === 'DELETE' && /^\/api\/tasks\/\d+$/.test(url.pathname)) {
      const id = Number(url.pathname.split('/').pop());
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx >= 0) tasks.splice(idx, 1);
      res.writeHead(204); res.end(); return;
    }

    if (req.method === 'GET' && url.pathname === '/api/events') return send(200, events);
    if (req.method === 'POST' && url.pathname === '/api/events') {
      const event = { id: ++eventId, created_at: new Date().toISOString(), ...body };
      events.push(event);
      return send(201, event);
    }
    if (req.method === 'DELETE' && /^\/api\/events\/\d+$/.test(url.pathname)) {
      const id = Number(url.pathname.split('/').pop());
      const idx = events.findIndex((e) => e.id === id);
      if (idx >= 0) events.splice(idx, 1);
      res.writeHead(204); res.end(); return;
    }

    if (req.method === 'GET' && url.pathname === '/api/metrics') {
      return send(200, { tasks: { total: tasks.length }, events: { total: events.length } });
    }

    return send(404, { error: 'not found' });
  });

  return server;
}

async function api(base, path, options = {}) {
  const res = await fetch(`${base}${path}`, { headers: { 'content-type': 'application/json' }, ...options });
  return res.status === 204 ? null : res.json();
}

test('e2e dashboard with visual evidence screenshots', async () => {
  await mkdir('e2e/screenshots', { recursive: true });

  const backend = createApiServer().listen(0);
  const backendBase = `http://127.0.0.1:${backend.address().port}/api`;

  const frontend = await createViteServer({
    root: new URL('../frontend', import.meta.url).pathname,
    server: { port: 0, host: '127.0.0.1' },
    define: { 'import.meta.env.VITE_API_URL': JSON.stringify(backendBase) }
  });

  await frontend.listen();
  const frontendUrl = frontend.resolvedUrls.local[0];

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    const t1 = await api(backendBase, '/tasks', { method: 'POST', body: JSON.stringify({ title: 'Vaga A', agent: 'Radar', priority: 'high' }) });
    const t2 = await api(backendBase, '/tasks', { method: 'POST', body: JSON.stringify({ title: 'Post LinkedIn', agent: 'Conteudo', status: 'doing' }) });
    const ev = await api(backendBase, '/events', { method: 'POST', body: JSON.stringify({ type: 'linkedin_message', payload: { from: 'Recruiter' } }) });
    assert.ok(t1.id && t2.id && ev.id);

    await page.goto(frontendUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'e2e/screenshots/01-dashboard-inicial.png', fullPage: true });

    const approvalsNav = page.getByText('Aprovações', { exact: false }).first();
    if (await approvalsNav.count()) {
      await approvalsNav.click();
      await page.waitForTimeout(600);
    }
    await page.screenshot({ path: 'e2e/screenshots/02-aprovacoes.png', fullPage: true });

    const metricsNav = page.getByText('Métricas', { exact: false }).first();
    if (await metricsNav.count()) {
      await metricsNav.click();
      await page.waitForTimeout(600);
    }
    await page.screenshot({ path: 'e2e/screenshots/03-metricas.png', fullPage: true });
  } finally {
    await browser.close();
    await frontend.close();

    const allTasks = await api(backendBase, '/tasks');
    for (const task of allTasks) await api(backendBase, `/tasks/${task.id}`, { method: 'DELETE' });
    const allEvents = await api(backendBase, '/events');
    for (const event of allEvents) await api(backendBase, `/events/${event.id}`, { method: 'DELETE' });

    assert.equal((await api(backendBase, '/tasks')).length, 0);
    assert.equal((await api(backendBase, '/events')).length, 0);
    backend.close();
  }
});
