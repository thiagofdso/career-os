import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Task API PATCH', () => {
  let serverProcess;
  const port = process.env.TEST_PORT || 3005;
  let timeoutId;

  before(async () => {
    return new Promise((resolve, reject) => {
      serverProcess = spawn('node', [path.join(__dirname, 'server.js')], {
        env: { ...process.env, PORT: port.toString(), SQLITE_PATH: ':memory:' }
      });

      serverProcess.stdout.on('data', (data) => {
        if (data.toString().includes(`backend on :${port}`)) {
          clearTimeout(timeoutId);
          resolve();
        }
      });

      serverProcess.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      serverProcess.on('error', (err) => {
        clearTimeout(timeoutId);
        reject(err);
      });

      // Safety timeout
      timeoutId = setTimeout(() => reject(new Error('Server start timeout')), 5000);
    });
  });

  after(() => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  it('should return 404 for non-existent task on PATCH', async () => {
    const res = await fetch(`http://localhost:${port}/api/v1/task-vaga/9999`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' })
    });

    assert.strictEqual(res.status, 404);
    const body = await res.json();
    assert.deepStrictEqual(body, { error: 'not found' });
  });
});
