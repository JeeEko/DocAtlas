import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getMcpPackageDir, isMcpDepsInstalled } from '../lib/mcp-deps.js';
import { getToolkitRoot } from '../lib/paths.js';

const toolkitRoot = getToolkitRoot();
const mcpDir = getMcpPackageDir(toolkitRoot);

assert.ok(fs.existsSync(path.join(mcpDir, 'package.json')), 'packages/mcp/package.json exists');

const fakeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'docatlas-mcp-deps-'));
try {
  const fakeMcp = path.join(fakeRoot, 'packages', 'mcp');
  fs.mkdirSync(fakeMcp, { recursive: true });
  fs.writeFileSync(
    path.join(fakeMcp, 'package.json'),
    JSON.stringify({ name: 'fake-mcp', dependencies: { '@modelcontextprotocol/sdk': '1.0.0' } }),
    'utf8'
  );
  assert.equal(isMcpDepsInstalled(fakeRoot), false, 'missing node_modules → not installed');
} finally {
  fs.rmSync(fakeRoot, { recursive: true, force: true });
}

if (isMcpDepsInstalled(toolkitRoot)) {
  console.log('test-setup-mcp.mjs: MCP deps present in toolkit');
} else {
  console.log('test-setup-mcp.mjs: MCP deps not installed (CI installs before MCP smoke)');
}

console.log('test-setup-mcp.mjs: all assertions passed');
