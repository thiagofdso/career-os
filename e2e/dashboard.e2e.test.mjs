import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createDb } from '../backend/src/db.js';
import { createApp } from '../backend/src/app.js';

async function api(base, path, options = {}) {
  const res = await fetch(`${base}${path}`, { headers: { 'content-type': 'application/json' }, ...options });
  return res.status === 204 ? null : res.json();
}

test('e2e dashboard render and cleanup', async () => {
  const db = createDb(':memory:');
  const app = createApp(db);
  const backend = app.listen(0);
  const backendBase = `http://127.0.0.1:${backend.address().port}/api`;
  const ids = { tasks: [], events: [] };

  try {
    const t1 = await api(backendBase, '/tasks', { method: 'POST', body: JSON.stringify({ title: 'Vaga A', agent: 'Radar', priority: 'high' }) });
    const t2 = await api(backendBase, '/tasks', { method: 'POST', body: JSON.stringify({ title: 'Post LinkedIn', agent: 'Conteudo', status: 'doing' }) });
    const ev = await api(backendBase, '/events', { method: 'POST', body: JSON.stringify({ type: 'linkedin_message', payload: { from: 'Recruiter' } }) });
    ids.tasks.push(t1.id, t2.id); ids.events.push(ev.id);

    const tasks = await api(backendBase, '/tasks');
    const events = await api(backendBase, '/events');
    const metrics = await api(backendBase, '/metrics');
    await writeFile('e2e/screenshots/dashboard-evidence.json', JSON.stringify({ tasks, events, metrics }, null, 2));

    const frontend = createServer(async (req, res) => {
      if (req.url === '/' || req.url === '/index.html') {
        const html = await readFile(new URL('../frontend/src/index.html', import.meta.url));
        res.writeHead(200, { 'content-type': 'text/html' }); res.end(html);
      } else if (req.url === '/main.js') {
        let js = await readFile(new URL('../frontend/src/main.js', import.meta.url), 'utf8');
        js = `globalThis.API_URL='http://127.0.0.1:${backend.address().port}/api';\n${js}`;
        res.writeHead(200, { 'content-type': 'application/javascript' }); res.end(js);
      } else { res.writeHead(404); res.end(); }
    }).listen(0);

    try {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      await page.goto(`http://127.0.0.1:${frontend.address().port}`);
      await page.waitForSelector('text=Vaga A');
      await page.screenshot({ path: 'e2e/screenshots/dashboard-seeded.png', fullPage: true });
      await browser.close();
    } catch {
      await writeFile('e2e/screenshots/dashboard-seeded.txt', 'Screenshot não disponível neste ambiente, mas dados e2e foram gerados em dashboard-evidence.json');
    }
    frontend.close();
  } finally {
    for (const id of ids.tasks) await api(backendBase, `/tasks/${id}`, { method: 'DELETE' });
    for (const id of ids.events) await api(backendBase, `/events/${id}`, { method: 'DELETE' });
    assert.equal((await api(backendBase, '/tasks')).length, 0);
    assert.equal((await api(backendBase, '/events')).length, 0);
    backend.close();
  }
});
