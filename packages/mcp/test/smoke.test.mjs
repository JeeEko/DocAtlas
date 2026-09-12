import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bootstrapProject } from '../../../lib/bootstrap.js';
import { getLayout } from '../../../lib/layout.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mcpEntry = path.join(__dirname, '../src/index.js');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'docatlas-mcp-'));

try {
  bootstrapProject(root, { force: true, withGovernance: false, journeyName: 'McpTest' });
  const layout = getLayout(root);
  fs.writeFileSync(
    layout.docAbs('ARCHITECTURE.md'),
    '# Architecture\n\n## Auth\n\nJWT middleware protects API routes.\n',
    'utf8'
  );

  const child = spawn('node', [mcpEntry], {
    env: { ...process.env, DOCATLAS_PROJECT_ROOT: root },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let stdout = '';
  child.stdout.on('data', (d) => {
    stdout += d.toString();
  });

  const initMsg = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test', version: '1.0.0' },
    },
  });

  child.stdin.write(`${initMsg}\n`);
  await new Promise((r) => setTimeout(r, 500));

  assert.ok(stdout.includes('jsonrpc'), 'MCP server should respond to initialize');
  child.kill();
  console.log('packages/mcp smoke test passed');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
