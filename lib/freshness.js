import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { readJson, writeText } from './paths.js';

export function getHeadCommit(projectRoot) {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: projectRoot,
      encoding: 'utf8',
    }).trim();
  } catch {
    return null;
  }
}

export function getCurrentBranch(projectRoot) {
  try {
    return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      cwd: projectRoot,
      encoding: 'utf8',
    }).trim();
  } catch {
    return null;
  }
}

export function getCommitDistance(projectRoot, fromCommit, toCommit = 'HEAD') {
  try {
    const out = execFileSync('git', ['rev-list', '--count', `${fromCommit}..${toCommit}`], {
      cwd: projectRoot,
      encoding: 'utf8',
    }).trim();
    return Number(out) || 0;
  } catch {
    return null;
  }
}

export function readFreshness(meta) {
  if (!meta) return { commit: null, at: null, branch: null };
  return {
    commit: meta.lastAnalyzedCommit ?? null,
    at: meta.lastAnalyzedAt ?? null,
    branch: meta.lastAnalyzedBranch ?? null,
  };
}

export function writeFreshness(layout, projectRoot, options = {}) {
  const commit = options.commit ?? getHeadCommit(projectRoot);
  const branch = options.branch ?? getCurrentBranch(projectRoot);
  const at = options.at ?? new Date().toISOString();

  const meta = readJson(layout.metaAbs) ?? {};
  meta.lastAnalyzedCommit = commit;
  meta.lastAnalyzedAt = at;
  meta.lastAnalyzedBranch = branch;

  if (options.versionTag && commit) {
    meta.analyzedVersions = meta.analyzedVersions ?? [];
    const existing = meta.analyzedVersions.findIndex((v) => v.tag === options.versionTag);
    const entry = { tag: options.versionTag, commit, at, branch };
    if (existing >= 0) meta.analyzedVersions[existing] = entry;
    else meta.analyzedVersions.push(entry);
  }

  writeText(layout.metaAbs, `${JSON.stringify(meta, null, 2)}\n`);

  updateAiContextFreshness(layout, { commit, at, branch });
  return { commit, at, branch };
}

export function isStale(projectRoot, meta, threshold = 0) {
  const { commit } = readFreshness(meta);
  if (!commit) return { stale: true, reason: 'never analyzed', distance: null };
  const head = getHeadCommit(projectRoot);
  if (!head) return { stale: false, reason: 'git unavailable', distance: null };
  if (head.startsWith(commit.slice(0, 7)) || commit.startsWith(head.slice(0, 7))) {
    return { stale: false, reason: 'up to date', distance: 0 };
  }
  const distance = getCommitDistance(projectRoot, commit, head);
  if (distance == null) return { stale: true, reason: 'unknown distance', distance: null };
  return {
    stale: distance > threshold,
    reason: distance > threshold ? 'commits behind HEAD' : 'up to date',
    distance,
  };
}

function updateAiContextFreshness(layout, { commit, at, branch }) {
  const aiPath = layout.docAbs('AI_CONTEXT.md');
  if (!fs.existsSync(aiPath)) return;

  let content = fs.readFileSync(aiPath, 'utf8');
  const table = `| Last analyzed commit | ${commit ?? 'unknown'} |
| Last analyzed at | ${at ?? '—'} |
| Branch | ${branch ?? '—'} |`;

  if (/## Freshness/.test(content)) {
    const footer =
      'Run **`/docatlas`** (discovery) or **`docatlas-skill-update`** after material code changes.\n\n';
    content = content.replace(
      /## Freshness[\s\S]*?(?=## Related)/,
      `## Freshness\n\n| Field | Value |\n|-------|-------|\n${table}\n\n${footer}`
    );
    writeText(aiPath, content);
  }
}

export function formatFreshnessRow(meta) {
  const { commit, at, branch } = readFreshness(meta);
  return `- **Last analyzed:** ${commit ? commit.slice(0, 7) : 'not yet'} (${at ?? '—'}) on \`${branch ?? '—'}\``;
}
