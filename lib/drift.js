import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { readBusinessContexts } from './business-contexts.js';
import { detectFrameworks } from './frameworks.js';
import { isStale, readFreshness } from './freshness.js';
import { getLayout, isDocAtlasInitialized } from './layout.js';
import { collectApiRoutes } from './parsers/index.js';
import { readJson } from './paths.js';
import { scanProject } from './scan.js';
import { getRequiredDocPaths } from './taxonomy.js';

export function checkDrift(projectRoot, { strict = false, semantic = false } = {}) {
  const issues = [];
  const layout = getLayout(projectRoot);

  if (!isDocAtlasInitialized(projectRoot) && !fs.existsSync(path.join(projectRoot, 'AGENTS.md'))) {
    return { issues: ['No DocAtlas setup found — run docatlas init first'], exitCode: 1 };
  }

  const meta = readJson(layout.metaAbs) ?? {};
  const required = [
    layout.agentsRel,
    layout.metaRel,
    ...getRequiredDocPaths(meta).map((d) => layout.docRel(d)),
  ];

  for (const rel of required) {
    if (!fs.existsSync(path.join(projectRoot, rel))) {
      issues.push(`missing required file: ${rel}`);
    }
  }

  checkBusinessContextDocs(projectRoot, layout, issues);

  if (fs.existsSync(layout.docsDirAbs)) {
    for (const file of walkMd(layout.docsDirAbs)) {
      const base = path.basename(file);
      if (base.startsWith('_')) continue;
      const content = fs.readFileSync(file, 'utf8');
      if (/TODO|TBD|__JOURNEY_NAME__|FILL_IN|PLACEHOLDER/.test(content)) {
        issues.push(`unresolved placeholder in ${path.relative(projectRoot, file).replace(/\\/g, '/')}`);
      }
    }
  }

  if (fs.existsSync(layout.agentsAbs)) {
    const agents = fs.readFileSync(layout.agentsAbs, 'utf8');
    if (/TODO|__JOURNEY_NAME__/.test(agents)) {
      issues.push(`unresolved placeholder in ${layout.agentsRel}`);
    }
  }

  if (semantic || strict) {
    checkSemanticDrift(projectRoot, meta, issues);
    const stale = isStale(projectRoot, meta, 0);
    if (stale.stale && stale.distance != null && stale.distance > 5) {
      issues.push(
        `documentation may be stale: ${stale.distance} commits since last analysis (${readFreshness(meta).commit?.slice(0, 7) ?? 'unknown'}) — run docatlas-skill-update`
      );
    }
    checkVersionBaselines(projectRoot, meta, issues);
  }

  return { issues, exitCode: strict && issues.length ? 1 : 0 };
}

function checkBusinessContextDocs(projectRoot, layout, issues) {
  if (!fs.existsSync(layout.metaAbs)) return;

  const contexts = readBusinessContexts(layout);
  if (!contexts.length) {
    issues.push('no business contexts mapped — run docatlas map-contexts');
    return;
  }

  for (const ctx of contexts) {
    const docRel = ctx.doc?.startsWith('docs/')
      ? layout.docRel(ctx.doc.slice('docs/'.length))
      : layout.docRel(`business/contexts/${ctx.slug}.md`);
    const abs = path.join(projectRoot, docRel);
    if (!fs.existsSync(abs)) {
      issues.push(`missing business context doc: ${docRel} (${ctx.label ?? ctx.slug})`);
    }
  }
}

function checkSemanticDrift(projectRoot, meta, issues) {
  const stored = meta?.routeInventory;
  if (!Array.isArray(stored) || !stored.length) return;

  try {
    const scan = scanProject(projectRoot);
    const frameworks = detectFrameworks(scan.packages, projectRoot);
    const current = collectApiRoutes(projectRoot, scan.packages, frameworks).map((r) => r.path);
    const storedSet = new Set(stored);
    const currentSet = new Set(current);
    for (const route of stored) {
      if (!currentSet.has(route)) {
        issues.push(`semantic drift: route in docs inventory but not detected in code: ${route}`);
      }
    }
    for (const route of current.slice(0, 50)) {
      if (!storedSet.has(route) && stored.length > 3) {
        issues.push(`semantic drift: route in code but missing from stored inventory: ${route}`);
      }
    }
  } catch {
    // optional
  }
}

function checkVersionBaselines(projectRoot, meta, issues) {
  const versions = meta?.analyzedVersions;
  if (!Array.isArray(versions) || !versions.length) return;

  for (const v of versions) {
    if (!v.tag || !v.commit) continue;
    try {
      execFileSync('git', ['cat-file', '-e', `${v.commit}^{commit}`], { cwd: projectRoot, stdio: 'ignore' });
    } catch {
      issues.push(`version baseline ${v.tag}: commit ${v.commit.slice(0, 7)} not found in repository`);
    }
  }
}

function walkMd(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMd(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}
