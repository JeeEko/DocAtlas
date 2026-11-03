import fs from 'node:fs';
import path from 'node:path';
import { checkDrift } from '../drift.js';
import { KIT_PATHS, runDoctor } from '../doctor.js';
import { computeHealthScore, scanDocMetrics } from '../health.js';
import { getLayout, isDocAtlasInitialized } from '../layout.js';
import { readJson, readVersion, getToolkitRoot } from '../paths.js';
import { getRequiredDocPaths, getDocTaxonomy } from '../taxonomy.js';

const PLACEHOLDER_RE = /TODO|TBD|__JOURNEY_NAME__|FILL_IN|PLACEHOLDER/;

const WORKFLOW_PHASES = [
  {
    id: 'init',
    title: 'Init',
    summary: 'Scaffold doc-atlas/, Cursor kit, and auto-drafts via docatlas init.',
  },
  {
    id: 'refine',
    title: 'Refine',
    summary: 'Trace routes and journey steps with docatlas refine (parser coverage).',
  },
  {
    id: 'discovery',
    title: 'Discovery',
    summary: 'Agent-driven exploration fills accurate docs (/docatlas Phase 3).',
  },
  {
    id: 'drift',
    title: 'Drift',
    summary: 'Verify completeness with docatlas drift; refresh with docatlas-skill-update.',
  },
];

function labelForDoc(relPath) {
  const base = path.basename(relPath, '.md').replace(/-/g, ' ');
  if (relPath.includes('business/contexts/')) return `Context: ${base}`;
  if (relPath.startsWith('JOURNEY-')) return `Journey: ${base.replace(/^JOURNEY\s*/i, '')}`;
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

function issuesForPath(issues, relDocPath) {
  const norm = relDocPath.replace(/\\/g, '/');
  return issues.filter((i) => i.includes(norm) || i.includes(path.basename(norm)));
}

function classifyArtifactStatus(relDocPath, projectRoot, driftIssues, staleIssue) {
  const abs = path.join(projectRoot, relDocPath);
  if (!fs.existsSync(abs)) {
    return { status: 'missing', issues: [`missing file: ${relDocPath}`] };
  }
  const matched = issuesForPath(driftIssues, relDocPath);
  const placeholder = matched.some((i) => i.includes('placeholder'));
  if (placeholder) {
    return { status: 'draft', issues: matched };
  }
  if (staleIssue && matched.some((i) => i.includes('stale'))) {
    return { status: 'stale', issues: matched };
  }
  if (matched.length) {
    return { status: 'draft', issues: matched };
  }
  const content = fs.readFileSync(abs, 'utf8');
  if (PLACEHOLDER_RE.test(content)) {
    return { status: 'draft', issues: [`unresolved placeholder in ${relDocPath}`] };
  }
  return { status: 'ready', issues: [] };
}

function buildDocTree(dirAbs, dirRel, projectRoot) {
  if (!fs.existsSync(dirAbs)) return [];
  const entries = fs.readdirSync(dirAbs, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  const nodes = [];
  for (const ent of entries) {
    if (ent.name.startsWith('_')) continue;
    const abs = path.join(dirAbs, ent.name);
    const rel = path.join(dirRel, ent.name).replace(/\\/g, '/');
    if (ent.isDirectory()) {
      const children = buildDocTree(abs, rel, projectRoot);
      if (children.length) nodes.push({ type: 'dir', name: ent.name, path: rel, children });
    } else if (ent.name.endsWith('.md')) {
      nodes.push({ type: 'file', name: ent.name, path: rel, slug: slugify(rel) });
    }
  }
  return nodes;
}

export function slugify(relPath) {
  return relPath
    .replace(/\.md$/i, '')
    .replace(/[/\\]+/g, '--')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function globMdPatterns(layout, projectRoot) {
  const docsAbs = layout.docsDirAbs;
  const artifacts = [];
  const meta = readJson(layout.metaAbs) ?? {};

  for (const doc of getRequiredDocPaths(meta)) {
    const rel = layout.docRel(doc);
    artifacts.push({
      id: slugify(rel),
      label: labelForDoc(doc),
      path: rel,
      phase: 'documentation',
    });
  }

  if (fs.existsSync(docsAbs)) {
    for (const file of fs.readdirSync(docsAbs)) {
      if (file.startsWith('JOURNEY-') && file.endsWith('.md')) {
        const rel = layout.docRel(file);
        if (!artifacts.some((a) => a.path === rel)) {
          artifacts.push({
            id: slugify(rel),
            label: labelForDoc(file),
            path: rel,
            phase: 'documentation',
          });
        }
      }
    }
    const ctxDir = path.join(docsAbs, 'business', 'contexts');
    if (fs.existsSync(ctxDir)) {
      for (const file of fs.readdirSync(ctxDir)) {
        if (!file.endsWith('.md') || file.startsWith('_')) continue;
        const rel = layout.docRel(path.join('business', 'contexts', file));
        if (!artifacts.some((a) => a.path === rel)) {
          artifacts.push({
            id: slugify(rel),
            label: labelForDoc(`business/contexts/${file}`),
            path: rel,
            phase: 'documentation',
          });
        }
      }
    }
  }

  for (const kitRel of KIT_PATHS) {
    artifacts.push({
      id: slugify(kitRel),
      label: path.basename(kitRel),
      path: kitRel,
      phase: 'kit',
    });
  }

  return { artifacts, meta };
}

function resolveProjectName(projectRoot, meta) {
  if (meta?.journeyName) return meta.journeyName;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    if (pkg.name) return pkg.name;
  } catch {
    /* ignore */
  }
  return path.basename(projectRoot);
}

export function buildReportSnapshot(projectRoot, options = {}) {
  const strictDrift = options.strictDrift ?? false;
  const semanticDrift = options.semanticDrift ?? true;

  if (!isDocAtlasInitialized(projectRoot)) {
    return {
      ok: false,
      error: 'DocAtlas not initialized — run docatlas init',
      generatedAt: new Date().toISOString(),
    };
  }

  const layout = getLayout(projectRoot);
  const { artifacts: artifactDefs, meta } = globMdPatterns(layout, projectRoot);
  const doctor = runDoctor(projectRoot, { score: true });
  const metrics = doctor.metrics ?? scanDocMetrics(projectRoot);
  const score = doctor.score ?? computeHealthScore(metrics);

  const driftResult = checkDrift(projectRoot, {
    strict: strictDrift,
    semantic: semanticDrift,
  });
  const driftIssues = driftResult.issues ?? [];

  const staleGlobal = driftIssues.some((i) => i.includes('stale'));

  const artifacts = artifactDefs.map((def) => {
    const rel = def.path;
    let status;
    let issues;
    if (def.phase === 'kit') {
      const abs = path.join(projectRoot, rel);
      if (!fs.existsSync(abs)) {
        status = 'missing';
        issues = [`missing kit file: ${rel}`];
      } else {
        status = 'ready';
        issues = [];
      }
    } else {
      ({ status, issues } = classifyArtifactStatus(rel, projectRoot, driftIssues, staleGlobal));
    }
    return { ...def, status, issues };
  });

  const kit = KIT_PATHS.map((rel) => ({
    path: rel,
    present: fs.existsSync(path.join(projectRoot, rel)),
  }));

  const docTreeRel = layout.docsDirRel.replace(/\\/g, '/');
  const docTree = buildDocTree(layout.docsDirAbs, docTreeRel, projectRoot);

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    docAtlasVersion: readVersion(getToolkitRoot()),
    projectName: resolveProjectName(projectRoot, meta),
    layout: layout.mode,
    taxonomy: getDocTaxonomy(meta),
    health: {
      score,
      metrics,
      doctorOk: doctor.ok,
      doctorIssues: doctor.issues,
    },
    drift: {
      count: driftIssues.length,
      issues: driftIssues,
      exitCode: driftResult.exitCode ?? 0,
    },
    kit: {
      present: kit.filter((k) => k.present).length,
      total: kit.length,
      files: kit,
    },
    artifacts,
    docTree,
    workflow: WORKFLOW_PHASES,
  };
}
