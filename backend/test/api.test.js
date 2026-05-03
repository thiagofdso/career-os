import test from 'node:test';
import assert from 'node:assert/strict';
import { createDb } from '../src/db.js';
import { createApp } from '../src/app.js';

async function req(app, method, path, body) {
  const server = app.listen();
  const url = `http://127.0.0.1:${server.address().port}${path}`;
  const res = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  server.close();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

test('task lifecycle and metrics', async () => {
  const app = createApp(createDb(':memory:'));
  const created = await req(app, 'POST', '/api/tasks', { title: 'Nova vaga', agent: 'Radar' });
  assert.equal(created.status, 201);
  const updated = await req(app, 'PATCH', `/api/tasks/${created.body.id}`, { status: 'doing' });
  assert.equal(updated.body.status, 'doing');
  const metrics = await req(app, 'GET', '/api/metrics');
  assert.equal(metrics.body.byStatus.doing, 1);
  const deleted = await req(app, 'DELETE', `/api/tasks/${created.body.id}`);
  assert.equal(deleted.status, 204);
});

test('event lifecycle', async () => {
  const app = createApp(createDb(':memory:'));
  const event = await req(app, 'POST', '/api/events', { type: 'new_message', payload: { from: 'LinkedIn' } });
  assert.equal(event.status, 201);
  const patched = await req(app, 'PATCH', `/api/events/${event.body.id}`, { type: 'updated_message' });
  assert.equal(patched.body.type, 'updated_message');
  const deleted = await req(app, 'DELETE', `/api/events/${event.body.id}`);
  assert.equal(deleted.status, 204);
});
