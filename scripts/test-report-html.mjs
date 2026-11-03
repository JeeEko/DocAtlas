import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const bin = path.join(root, 'bin/docatlas.js');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'docatlas-report-html-'));
fs.writeFileSync(
  path.join(tmp, 'package.json'),
  JSON.stringify({ name: 'html-test', description: 'x', scripts: {} })
);
fs.writeFileSync(path.join(tmp, 'README.md'), '# HTML test\n');
execFileSync('git', ['init'], { cwd: tmp, stdio: 'pipe' });

execFileSync('node', [bin, 'init', tmp, '--force'], { stdio: 'pipe' });
execFileSync('node', [bin, 'report', tmp], { stdio: 'pipe' });

const indexPath = path.join(tmp, 'doc-atlas', 'report', 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('index.html missing');
  process.exit(1);
}
const html = fs.readFileSync(indexPath, 'utf8');
if (!html.includes('Health') || !/\d+\/100/.test(html)) {
  console.error('dashboard missing health score');
  process.exit(1);
}
if (!html.includes('Documentation artifacts')) {
  console.error('dashboard missing artifacts section');
  process.exit(1);
}
if (!fs.existsSync(path.join(tmp, 'doc-atlas', 'report', 'workflow.html'))) {
  console.error('workflow.html missing');
  process.exit(1);
}

const docsDir = path.join(tmp, 'doc-atlas', 'report', 'docs');
if (!fs.existsSync(docsDir) || fs.readdirSync(docsDir).length < 2) {
  console.error('expected rendered doc pages');
  process.exit(1);
}

console.log('test-report-html.mjs: all assertions passed');
