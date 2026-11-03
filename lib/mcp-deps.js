import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { getToolkitRoot } from './paths.js';

export function getMcpPackageDir(toolkitRoot = getToolkitRoot()) {
  return path.join(toolkitRoot, 'packages', 'mcp');
}

export function isMcpDepsInstalled(toolkitRoot = getToolkitRoot()) {
  const mcpDir = getMcpPackageDir(toolkitRoot);
  const marker = path.join(mcpDir, 'node_modules', '@modelcontextprotocol', 'sdk', 'package.json');
  return fs.existsSync(marker);
}

/**
 * Install packages/mcp dependencies when missing (sync). Returns { installed, ok, logs }.
 */
export function ensureMcpDepsInstalled(options = {}) {
  const toolkitRoot = options.toolkitRoot ?? getToolkitRoot();
  const mcpDir = getMcpPackageDir(toolkitRoot);
  const logs = [];

  if (!fs.existsSync(path.join(mcpDir, 'package.json'))) {
    logs.push('MCP package not found in toolkit — skip install');
    return { installed: false, ok: false, logs };
  }

  if (isMcpDepsInstalled(toolkitRoot)) {
    return { installed: false, ok: true, logs };
  }

  logs.push(
    `MCP dependencies missing — running npm install in ${path.relative(toolkitRoot, mcpDir) || 'packages/mcp'}`
  );

  const result = spawnSync('npm', ['install', '--prefix', mcpDir], {
    cwd: toolkitRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.stdout?.trim()) logs.push(result.stdout.trim());
  if (result.stderr?.trim()) logs.push(result.stderr.trim());

  if (result.status !== 0) {
    logs.push('npm install failed — run manually: npm install --prefix packages/mcp');
    return { installed: false, ok: false, logs };
  }

  if (!isMcpDepsInstalled(toolkitRoot)) {
    logs.push('npm install finished but MCP SDK still missing');
    return { installed: true, ok: false, logs };
  }

  logs.push('MCP dependencies installed');
  return { installed: true, ok: true, logs };
}
