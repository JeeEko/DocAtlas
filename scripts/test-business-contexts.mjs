#!/usr/bin/env node
/**
 * Business context detection tests
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapBusinessContexts, suggestBusinessContexts } from '../lib/business-contexts.js';
import { scanProject } from '../lib/scan.js';
import { bootstrapProject } from '../lib/bootstrap.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function makeMonorepo(base) {
  fs.mkdirSync(path.join(base, 'packages/billing'), { recursive: true });
  fs.mkdirSync(path.join(base, 'packages/identity'), { recursive: true });
  fs.writeFileSync(
    path.join(base, 'package.json'),
    JSON.stringify({
      name: 'enterprise-app',
      workspaces: ['packages/*'],
      description: 'Enterprise platform',
    })
  );
  fs.writeFileSync(
    path.join(base, 'packages/billing/package.json'),
    JSON.stringify({ name: '@corp/billing', description: 'Billing service' })
  );
  fs.writeFileSync(
    path.join(base, 'packages/identity/package.json'),
    JSON.stringify({ name: '@corp/identity', description: 'Identity service' })
  );
  fs.writeFileSync(path.join(base, 'README.md'), '# Enterprise App\n\nMulti-domain platform.');
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'docatlas-biz-'));
makeMonorepo(tmp);
const scan = scanProject(tmp);
const suggested = suggestBusinessContexts(scan, tmp, [
  { path: '/api/invoices' },
  { path: '/api/invoices/:id' },
  { path: '/api/users' },
]);

const slugs = suggested.map((c) => c.slug);
if (!slugs.some((s) => s.includes('billing') || s.includes('invoices'))) {
  console.error('Expected billing/invoices context, got:', slugs);
  process.exit(1);
}

bootstrapProject(tmp, { force: true, withGovernance: false });
mapBusinessContexts(tmp, { force: true });

const mapPath = path.join(tmp, 'doc-atlas/docs/business/CONTEXT-MAP.md');
const meta = JSON.parse(fs.readFileSync(path.join(tmp, 'doc-atlas/.docatlas.json'), 'utf8'));

if (!fs.existsSync(mapPath)) {
  console.error('Missing CONTEXT-MAP.md');
  process.exit(1);
}
if (!Array.isArray(meta.businessContexts) || meta.businessContexts.length < 2) {
  console.error('Expected >= 2 businessContexts in meta');
  process.exit(1);
}

console.log(`Business context tests OK (${meta.businessContexts.length} contexts)`);
