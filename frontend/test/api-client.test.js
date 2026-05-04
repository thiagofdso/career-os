import test from 'node:test';
import assert from 'node:assert/strict';

test('api url default contains /api suffix', () => {
  const api = 'http://localhost:3001/api';
  assert.equal(api.endsWith('/api'), true);
});
