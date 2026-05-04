import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createServer as createViteServer } from 'vite';
import { createDb } from '../backend/src/db.js';
import { createApp } from '../backend/src/app.js';

async function api(base, path, options = {}) {
  const res = await fetch(`${base}${path}`, { headers: { 'content-type': 'application/json' }, ...options });
  return res.status === 204 ? null : res.json();
}

test('e2e dashboard with visual evidence screenshots', async () => {
  await mkdir('e2e/screenshots', { recursive: true });

  const db = createDb(':memory:');
  const app = createApp(db);
  const backend = app.listen(0);
  const backendBase = `http://127.0.0.1:${backend.address().port}/api`;
  const ids = { tasks: [], events: [] };

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
    ids.tasks.push(t1.id, t2.id);
    ids.events.push(ev.id);

    await page.goto(frontendUrl);
    await page.waitForSelector('text=CareerOS Dashboard');
    await page.waitForSelector('text=Vaga A');

    await page.waitForFunction(() => {
      const bodyBg = getComputedStyle(document.body).backgroundImage;
      const primaryButton = document.querySelector('button.primary');
      const primaryBg = primaryButton ? getComputedStyle(primaryButton).backgroundColor : '';
      return bodyBg && bodyBg !== 'none' && primaryBg && primaryBg !== 'rgba(0, 0, 0, 0)';
    });
    await page.screenshot({ path: 'e2e/screenshots/01-dashboard-inicial.png', fullPage: true });

    await page.getByPlaceholder('Título').fill('Nova tarefa E2E');
    await page.getByPlaceholder('Agente').fill('Orquestrador');
    await page.getByRole('button', { name: 'Nova tarefa' }).click();
    await page.waitForSelector('text=Nova tarefa E2E');
    await page.screenshot({ path: 'e2e/screenshots/02-dashboard-com-tarefa-nova.png', fullPage: true });

    await page.getByRole('button', { name: '✔ done' }).first().click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'e2e/screenshots/03-dashboard-tarefa-concluida.png', fullPage: true });
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
