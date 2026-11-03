#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bin = path.join(root, 'bin/docatlas.js');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'docatlas-cursor-'));

fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify({ name: 't' }));
fs.writeFileSync(path.join(tmp, 'README.md'), '# t');

const init = spawnSync('node', [bin, 'init', tmp, '--force', '--cursor-native'], { encoding: 'utf8' });
if (init.status !== 0) {
  console.error(init.stdout, init.stderr);
  process.exit(1);
}

const meta = JSON.parse(fs.readFileSync(path.join(tmp, 'doc-atlas/.docatlas.json'), 'utf8'));
if (meta.distribution !== 'cursor' || meta.toolkitBranch !== 'cursor/cursor-native-95c0') {
  console.error(meta);
  process.exit(1);
}
if (fs.existsSync(path.join(tmp, '.github/workflows/docatlas-update-report.yml'))) {
  console.error('unexpected github workflow');
  process.exit(1);
}
console.log('cursor-native bootstrap OK');
