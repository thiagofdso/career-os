import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('CORS Security', () => {
  let serverProcess;
  const port = 3006;
  let timeoutId;

  before(async () => {
    return new Promise((resolve, reject) => {
      serverProcess = spawn('node', [path.join(__dirname, 'server.js')], {
        env: {
          ...process.env,
          PORT: port.toString(),
          SQLITE_PATH: ':memory:',
          ALLOWED_ORIGINS: 'http://trusted.com,http://localhost:3000'
        }
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

  it('should allow trusted origin', async () => {
    const res = await fetch(`http://localhost:${port}/api/health`, {
      headers: { 'Origin': 'http://trusted.com' }
    });
    assert.strictEqual(res.headers.get('access-control-allow-origin'), 'http://trusted.com');
  });

  it('should allow default localhost:3000', async () => {
    const res = await fetch(`http://localhost:${port}/api/health`, {
      headers: { 'Origin': 'http://localhost:3000' }
    });
    assert.strictEqual(res.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  });

  it('should NOT allow untrusted origin', async () => {
    const res = await fetch(`http://localhost:${port}/api/health`, {
      headers: { 'Origin': 'http://malicious.com' }
    });
    // When CORS fails to match, it usually doesn't send the Access-Control-Allow-Origin header
    // or sends it with a different value.
    assert.notStrictEqual(res.headers.get('access-control-allow-origin'), 'http://malicious.com');
  });
});
