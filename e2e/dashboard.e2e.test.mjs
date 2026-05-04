import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const BACKEND_PORT = 3101;
const FRONTEND_PORT = 3100;
const API = `http://127.0.0.1:${BACKEND_PORT}/api`;

async function waitForHealth() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${API}/health`);
      if (res.ok) return;
    } catch {}
    await wait(500);
  }
  throw new Error('backend not ready');
}

test('dashboard renders seeded backend data and captures screenshots', async () => {
  await mkdir('e2e/screenshots', { recursive: true });

  const backend = spawn('npm', ['run', 'dev'], { cwd: 'backend', stdio: 'inherit', env: { ...process.env, PORT: String(BACKEND_PORT), SQLITE_PATH: 'e2e.db' } });
  await waitForHealth();
  const frontend = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(FRONTEND_PORT)], { cwd: 'frontend', stdio: 'inherit', env: { ...process.env, VITE_API_URL: API } });
  await wait(2500);

  try {
    await fetch(`${API}/tasks`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: 'E2E Task A', description: 'task seeded', status: 'triagem', agent: 'radar' }) });
    await fetch(`${API}/tasks`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: 'E2E Task B', description: 'task seeded 2', status: 'waiting_approval', agent: 'orchestrator', needsApproval: true }) });
    await fetch(`${API}/events`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'seed', payload: { source: 'e2e' } }) });

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://127.0.0.1:${FRONTEND_PORT}`);
    await page.waitForTimeout(1500);

    const screens = [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'approvals', label: 'Fila de Aprovação' },
      { id: 'radar', label: 'Radar de Oportunidades' },
      { id: 'networking', label: 'Networking Estratégico' },
      { id: 'content', label: 'Conteúdo e Autoridade' },
      { id: 'portfolio', label: 'Portfólio e Projetos' },
      { id: 'inbox', label: 'Entrevistas e Conversão' },
      { id: 'orchestrator', label: 'Orquestrador Central' },
      { id: 'interviews', label: 'Entrevistas' },
      { id: 'metrics', label: 'Métricas de Carreira' },
    ];

    for (let i = 0; i < screens.length; i++) {
      const screen = screens[i];
      if (screen.id !== 'dashboard') {
        await page.getByRole('button', { name: screen.label }).click();
        await page.waitForTimeout(1000);
      }
      const fileIndex = String(i + 1).padStart(2, '0');
      await page.screenshot({ path: `e2e/screenshots/${fileIndex}-${screen.id}.png`, fullPage: true });
    }

    await browser.close();

    const tasks = await (await fetch(`${API}/tasks`)).json();
    assert.ok(tasks.some((t) => t.title === 'E2E Task A'));
  } finally {
    const tasks = await (await fetch(`${API}/tasks`)).json().catch(() => []);
    for (const t of tasks) await fetch(`${API}/tasks/${t.id}`, { method: 'DELETE' });
    const events = await (await fetch(`${API}/events`)).json().catch(() => []);
    for (const e of events) await fetch(`${API}/events/${e.id}`, { method: 'DELETE' });

    backend.kill('SIGTERM');
    frontend.kill('SIGTERM');
  }
});
