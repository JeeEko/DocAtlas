import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { readBusinessContexts } from './business-contexts.js';
import { getHeadCommit, isStale, readFreshness } from './freshness.js';
import { getLayout } from './layout.js';
import { readJson } from './paths.js';

const IMPACT_PATTERNS = {
  domain: [/src\/domains?\//i, /modules?\//i, /features?\//i, /domain\//i, /use.?case/i, /models?\//i],
  api: [/routes?\//i, /controllers?\//i, /handlers?\//i, /api\//i, /\.route\./i, /openapi/i],
  data: [/migrations?\//i, /schema/i, /prisma/i, /drizzle/i, /entities?\//i, /repositories?\//i],
  integration: [/events?\//i, /messaging/i, /kafka/i, /sqs/i, /webhook/i, /grpc/i],
  infra: [/docker/i, /\.github\/workflows/i, /k8s/i, /kubernetes/i, /terraform/i, /deploy/i, /helm/i],
  config: [/\.env/i, /config/i, /settings/i],
};

export function getChangedFiles(projectRoot, fromCommit) {
  if (!fromCommit) return { files: [], from: null, to: getHeadCommit(projectRoot) };
  try {
    const out = execFileSync('git', ['diff', '--name-only', `${fromCommit}..HEAD`], {
      cwd: projectRoot,
      encoding: 'utf8',
    }).trim();
    return {
      files: out ? out.split('\n').filter(Boolean) : [],
      from: fromCommit,
      to: getHeadCommit(projectRoot),
    };
  } catch {
    return { files: [], from: fromCommit, to: getHeadCommit(projectRoot) };
  }
}

export function categorizeChange(filePath) {
  const categories = [];
  for (const [cat, patterns] of Object.entries(IMPACT_PATTERNS)) {
    if (patterns.some((p) => p.test(filePath))) categories.push(cat);
  }
  if (!categories.length) {
    if (filePath.endsWith('.md')) categories.push('docs');
    else categories.push('other');
  }
  return categories;
}

export function hasArchitectureImpact(changedFiles) {
  if (!changedFiles.length) return false;
  return changedFiles.some((f) => {
    const cats = categorizeChange(f);
    return cats.some((c) => c !== 'docs' && c !== 'other');
  });
}

export function mapChangesToDocs(projectRoot, changedFiles) {
  const layout = getLayout(projectRoot);
  const meta = readJson(layout.metaAbs) ?? {};
  const contexts = readBusinessContexts(layout);
  const impacted = new Set();

  impacted.add(layout.docRel('AI_CONTEXT.md'));

  for (const file of changedFiles) {
    const cats = categorizeChange(file);
    if (cats.includes('domain')) {
      impacted.add(layout.docRel('business/CONTEXT-MAP.md'));
      impacted.add(layout.docRel('BUSINESS.md'));
      for (const ctx of contexts) {
        const evidence = ctx.evidence ?? [];
        if (evidence.some((e) => file.includes(e.replace(/\\/g, '/')))) {
          impacted.add(layout.docRel(`business/contexts/${ctx.slug}.md`));
        }
      }
      impacted.add(layout.docRel('GLOSSARY.md'));
    }
    if (cats.includes('api') || cats.includes('integration')) {
      impacted.add(layout.docRel('ARCHITECTURE.md'));
      for (const j of fs.existsSync(layout.docsDirAbs)
        ? fs.readdirSync(layout.docsDirAbs).filter((n) => n.startsWith('JOURNEY-'))
        : []) {
        impacted.add(layout.docRel(j));
      }
    }
    if (cats.includes('data')) {
      impacted.add(layout.docRel('ARCHITECTURE.md'));
    }
    if (cats.includes('infra')) {
      impacted.add(layout.docRel('RUNBOOK.md'));
      impacted.add(layout.docRel('ARCHITECTURE.md'));
    }
    if (cats.includes('config')) {
      impacted.add(layout.docRel('ONBOARDING.md'));
      impacted.add(layout.docRel('RUNBOOK.md'));
    }
  }

  return [...impacted].sort();
}

export function analyzeUpdate(projectRoot) {
  const layout = getLayout(projectRoot);
  const meta = readJson(layout.metaAbs) ?? {};
  const freshness = readFreshness(meta);
  const stale = isStale(projectRoot, meta);
  const diff = getChangedFiles(projectRoot, freshness.commit);
  const impact = hasArchitectureImpact(diff.files);
  const impactedDocs = impact ? mapChangesToDocs(projectRoot, diff.files) : [];

  return {
    freshness,
    stale,
    diff,
    impact,
    impactedDocs,
    skipReason: !diff.files.length
      ? 'no changes since last analysis'
      : !impact
        ? 'changes appear non-architectural (implementation-only or docs-only)'
        : null,
  };
}
