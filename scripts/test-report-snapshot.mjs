import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const bin = path.join(root, 'bin/docatlas.js');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'docatlas-report-'));
const appPkg = {
  name: 'report-test-app',
  description: 'Report snapshot test',
  scripts: { dev: 'node index.js' },
};
fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify(appPkg));
fs.writeFileSync(path.join(tmp, 'README.md'), '# Report test\n\nQuick start.\n');
execFileSync('git', ['init'], { cwd: tmp, stdio: 'pipe' });

execFileSync('node', [bin, 'init', tmp, '--force'], { stdio: 'pipe' });

const out = execFileSync('node', [bin, 'report', tmp, '--json'], { encoding: 'utf8' });
const snapshot = JSON.parse(out);

if (!snapshot.ok) {
  console.error('snapshot not ok:', snapshot.error);
  process.exit(1);
}
if (typeof snapshot.health?.score !== 'number') {
  console.error('missing health.score');
  process.exit(1);
}
if (!Array.isArray(snapshot.artifacts) || snapshot.artifacts.length < 3) {
  console.error('expected artifacts array');
  process.exit(1);
}
if (!Array.isArray(snapshot.docTree)) {
  console.error('expected docTree');
  process.exit(1);
}
if (!Array.isArray(snapshot.workflow) || snapshot.workflow.length !== 4) {
  console.error('expected 4 workflow phases');
  process.exit(1);
}

const reportDir = path.join(tmp, 'doc-atlas', 'report');
if (!fs.existsSync(path.join(reportDir, 'snapshot.json'))) {
  console.error('snapshot.json not written to report dir');
  process.exit(1);
}

console.log('test-report-snapshot.mjs: all assertions passed');
