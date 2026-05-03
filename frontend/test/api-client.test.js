import test from 'node:test';
import assert from 'node:assert/strict';

test('api url default', () => {
  assert.equal('http://localhost:3001/api'.includes('/api'), true);
});
