#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { bootstrapProject } from '../lib/bootstrap.js';
import {
  getCommitDistance,
  getCurrentBranch,
  getHeadCommit,
  isStale,
  readFreshness,
  writeFreshness,
} from '../lib/freshness.js';
import { getLayout } from '../lib/layout.js';
import { readJson } from '../lib/paths.js';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'docatlas-fresh-'));
execFileSync('git', ['init'], { cwd: tmp });
execFileSync('git', ['config', 'user.email', 'test@test.com'], { cwd: tmp });
execFileSync('git', ['config', 'user.name', 'Test'], { cwd: tmp });
fs.writeFileSync(path.join(tmp, 'package.json'), '{"name":"fresh-test"}');
execFileSync('git', ['add', '.'], { cwd: tmp });
execFileSync('git', ['commit', '-m', 'init'], { cwd: tmp });

const head1 = getHeadCommit(tmp);
if (!head1) {
  console.error('Expected git HEAD');
  process.exit(1);
}

bootstrapProject(tmp, { force: true, withGovernance: false });
const layout = getLayout(tmp);

writeFreshness(layout, tmp);
const meta = readJson(layout.metaAbs);
const fresh = readFreshness(meta);
if (!fresh.commit) {
  console.error('writeFreshness should set commit');
  process.exit(1);
}

const stale1 = isStale(tmp, meta);
if (stale1.stale) {
  console.error('Should not be stale immediately after write');
  process.exit(1);
}

fs.writeFileSync(path.join(tmp, 'change.js'), 'console.log(1);');
execFileSync('git', ['add', 'change.js'], { cwd: tmp });
execFileSync('git', ['commit', '-m', 'change'], { cwd: tmp });

const stale2 = isStale(tmp, meta);
if (!stale2.stale) {
  console.error('Should be stale after new commit');
  process.exit(1);
}

const dist = getCommitDistance(tmp, fresh.commit, getHeadCommit(tmp));
if (dist !== 1) {
  console.error(`Expected distance 1, got ${dist}`);
  process.exit(1);
}

if (!fs.existsSync(layout.docAbs('AI_CONTEXT.md'))) {
  console.error('Missing AI_CONTEXT.md');
  process.exit(1);
}

console.log('Freshness tests OK');
