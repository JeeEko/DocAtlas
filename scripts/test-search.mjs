import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bootstrapProject } from '../lib/bootstrap.js';
import { rankChunks, getBusinessContextContent, getJourneyContent, queryContextShortcut } from '../lib/search.js';
import { getLayout } from '../lib/layout.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'docatlas-search-'));

try {
  bootstrapProject(root, { force: true, withGovernance: false, journeyName: 'SearchTest' });

  const layout = getLayout(root);
  fs.writeFileSync(
    layout.docAbs('business/contexts/auth.md'),
    `# Auth context

## Authentication flow

Users authenticate via JWT tokens stored in cookies.

## Rules

| Rule | Source | Epistemic | Confidence |
|------|--------|-----------|------------|
| Sessions expire after 24h | src/auth/session.ts#L10 | OBSERVED | [verified] |
`,
    'utf8'
  );

  fs.writeFileSync(
    layout.docAbs('JOURNEY-Login.md'),
    `# Login journey

## Step 1 — Login page

Route: \`/login\`

## Step 2 — Auth API

Route: \`POST /api/auth/login\`
`,
    'utf8'
  );

  const authResults = rankChunks(root, 'authentication JWT cookies', { limit: 5 });
  assert.ok(authResults.length > 0, 'should find auth-related chunks');
  assert.ok(
    authResults.some((r) => r.path.includes('auth') || r.body.toLowerCase().includes('jwt')),
    'top result should relate to auth'
  );

  const ctx = getBusinessContextContent(root, 'auth');
  assert.ok(ctx, 'should load auth context doc');
  assert.match(ctx.content, /JWT/);

  const journeys = getJourneyContent(root, 'login');
  assert.ok(journeys.length > 0, 'should find login journey');

  const shortcut = queryContextShortcut(root, 'auth');
  assert.match(shortcut, /AI_CONTEXT/);

  console.log('test-search.mjs: all assertions passed');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
