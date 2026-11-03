#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pluginRoot = path.join(root, 'packages/cursor-plugin');
const templatesCursor = path.join(root, 'templates/.cursor');
const version = fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim();

function rimraf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dest, name);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

for (const sub of ['rules', 'skills', 'agents', 'commands']) {
  const src = path.join(templatesCursor, sub);
  const dest = path.join(pluginRoot, sub);
  if (!fs.existsSync(src)) continue;
  rimraf(dest);
  copyDir(src, dest);
}

const serverRoot = path.join(pluginRoot, 'server');
rimraf(serverRoot);
fs.mkdirSync(serverRoot, { recursive: true });
copyDir(path.join(root, 'packages/mcp/src'), path.join(serverRoot, 'src'));
fs.copyFileSync(path.join(root, 'packages/mcp/package.json'), path.join(serverRoot, 'package.json'));

const manifestPath = path.join(pluginRoot, '.cursor-plugin/plugin.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.version = version;
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Built cursor-plugin v${version}`);
