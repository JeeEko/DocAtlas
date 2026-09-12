import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { bootstrapProject } from '../lib/bootstrap.js';
import { computeHealthScore, scanDocMetrics } from '../lib/health.js';
import { getLayout } from '../lib/layout.js';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'docatlas-health-'));

try {
  bootstrapProject(root, { force: true, withGovernance: false, journeyName: 'HealthTest' });
  const layout = getLayout(root);
  fs.writeFileSync(
    layout.docAbs('business/contexts/billing.md'),
    `# Billing\n\n| Rule | Source | Epistemic | Confidence |\n|------|--------|-----------|------------|\n| Invoices monthly | src/billing.ts#L1 | OBSERVED | [verified] |\n`,
    'utf8'
  );

  const metrics = scanDocMetrics(root);
  assert.ok(metrics.verified >= 1, 'should count verified tags');
  const score = computeHealthScore(metrics);
  assert.ok(score >= 0 && score <= 100, 'score in range');
  console.log('test-health.mjs: all assertions passed');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
