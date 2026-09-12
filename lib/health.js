import fs from 'node:fs';
import path from 'node:path';
import { collectApiRoutes } from './parsers/index.js';
import { detectFrameworks } from './frameworks.js';
import { getCommitDistance, getHeadCommit, isStale, readFreshness } from './freshness.js';
import { getLayout } from './layout.js';
import { readJson } from './paths.js';
import { scanProject } from './scan.js';
import { walkFiles } from './walk.js';

const CONFIDENCE_RE = /\[(verified|likely|uncertain|planned)\]/gi;
const EVIDENCE_RE = /[`']?([\w./-]+\.(?:ts|tsx|js|jsx|py|go|rs|yaml|yml|json|md))(?:#L\d+(?:-L\d+)?)?[`']?/gi;

export function scanDocMetrics(projectRoot) {
  const layout = getLayout(projectRoot);
  const meta = readJson(layout.metaAbs) ?? {};
  const docsDir = layout.docsDirAbs;

  let verified = 0;
  let likely = 0;
  let uncertain = 0;
  let planned = 0;
  let placeholders = 0;
  let ruleRows = 0;
  let rulesWithEvidence = 0;
  let mdFiles = 0;

  if (fs.existsSync(docsDir)) {
    walkFiles(docsDir, (abs) => {
      if (!abs.endsWith('.md')) return;
      mdFiles++;
      const content = fs.readFileSync(abs, 'utf8');
      placeholders += (content.match(/\bTODO\b|\bTBD\b|__JOURNEY_NAME__|FILL_IN|PLACEHOLDER/g) ?? []).length;

      for (const m of content.matchAll(CONFIDENCE_RE)) {
        const tag = m[1].toLowerCase();
        if (tag === 'verified') verified++;
        else if (tag === 'likely') likely++;
        else if (tag === 'uncertain') uncertain++;
        else if (tag === 'planned') planned++;
      }

      if (content.includes('| Rule |') || content.includes('| rule |')) {
        const rows = content.split('\n').filter((l) => l.startsWith('|') && !l.includes('---') && !/Rule|rule/.test(l));
        for (const row of rows) {
          ruleRows++;
          EVIDENCE_RE.lastIndex = 0;
          if (EVIDENCE_RE.test(row)) rulesWithEvidence++;
        }
      }
    });
  }

  const freshness = readFreshness(meta);
  const stale = isStale(projectRoot, meta, 5);
  const head = getHeadCommit(projectRoot);
  const distance = freshness.commit && head ? getCommitDistance(projectRoot, freshness.commit, head) : null;

  let routeCoverage = null;
  try {
    const scan = scanProject(projectRoot);
    const frameworks = detectFrameworks(scan.packages, projectRoot);
    const liveRoutes = collectApiRoutes(projectRoot, scan.packages, frameworks);
    const stored = meta.routeInventory?.length ?? 0;
    if (liveRoutes.length > 0) {
      routeCoverage = Math.min(100, Math.round((stored / liveRoutes.length) * 100));
    }
  } catch {
    routeCoverage = null;
  }

  const evidenceCoverage = ruleRows > 0 ? Math.round((rulesWithEvidence / ruleRows) * 100) : null;
  const totalTags = verified + likely + uncertain + planned;
  const verifiedRatio = totalTags > 0 ? Math.round((verified / totalTags) * 100) : 0;

  return {
    verified,
    likely,
    uncertain,
    planned,
    verifiedRatio,
    evidenceCoverage,
    ruleRows,
    routeCoverage,
    freshnessDistance: distance,
    stale: stale.stale,
    placeholders,
    mdFiles,
    analyzedVersions: meta.analyzedVersions?.length ?? 0,
  };
}

export function computeHealthScore(metrics) {
  let score = 100;

  if (metrics.mdFiles === 0) return 0;

  score -= Math.min(30, metrics.placeholders * 2);
  score -= metrics.stale ? 15 : 0;
  if (metrics.freshnessDistance != null && metrics.freshnessDistance > 10) {
    score -= Math.min(15, Math.floor(metrics.freshnessDistance / 5));
  }

  if (metrics.verifiedRatio != null) {
    score = Math.round(score * 0.4 + metrics.verifiedRatio * 0.3);
  }

  if (metrics.evidenceCoverage != null) {
    score = Math.round(score * 0.7 + metrics.evidenceCoverage * 0.3);
  } else {
    score = Math.round(score * 0.85);
  }

  if (metrics.routeCoverage != null) {
    score = Math.round(score * 0.8 + metrics.routeCoverage * 0.2);
  }

  return Math.max(0, Math.min(100, score));
}

export function formatHealthReport(metrics, score) {
  const lines = [
    `DocAtlas Health Score: ${score}/100`,
    '',
    `Confidence tags: [verified]=${metrics.verified} [likely]=${metrics.likely} [uncertain]=${metrics.uncertain} [planned]=${metrics.planned}`,
    `Verified ratio: ${metrics.verifiedRatio}%`,
    metrics.evidenceCoverage != null
      ? `Evidence coverage (business rules): ${metrics.evidenceCoverage}% (${metrics.ruleRows} rules)`
      : 'Evidence coverage: n/a (no rule tables yet)',
    metrics.routeCoverage != null ? `Route inventory coverage: ${metrics.routeCoverage}%` : 'Route coverage: n/a',
    metrics.freshnessDistance != null
      ? `Freshness: ${metrics.stale ? 'stale' : 'ok'} (${metrics.freshnessDistance} commits behind HEAD)`
      : 'Freshness: never analyzed',
    `Placeholders (TODO/TBD): ${metrics.placeholders}`,
    `Markdown files: ${metrics.mdFiles}`,
  ];
  if (metrics.analyzedVersions > 0) {
    lines.push(`Version baselines tracked: ${metrics.analyzedVersions}`);
  }
  return lines.join('\n');
}
