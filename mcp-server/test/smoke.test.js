import test from 'node:test';
import assert from 'node:assert/strict';
import { createApiClient } from '../src/index.js';

test('mcp api client handles 204', async () => {
  global.fetch = async () => ({ status: 204, json: async () => ({}) });
  const j = createApiClient('http://localhost:3001/api');
  const result = await j('/tasks/1', { method: 'DELETE' });
  assert.deepEqual(result, { ok: true });
});

test('mcp api client parses json', async () => {
  global.fetch = async () => ({ status: 200, json: async () => ({ id: 1 }) });
  const j = createApiClient('http://localhost:3001/api');
  const result = await j('/tasks');
  assert.equal(result.id, 1);
});
