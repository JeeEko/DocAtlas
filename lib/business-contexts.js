/**
 * Detect business areas / bounded contexts from repo structure.
 * Heuristics suggest candidates; discovery agent validates and fills docs.
 */

import fs from 'node:fs';
import path from 'node:path';
import { detectFrameworks } from './frameworks.js';
import { getLayout } from './layout.js';
import { collectApiRoutes } from './parsers/index.js';
import { readJson, writeText } from './paths.js';
import { scanProject } from './scan.js';

const GENERIC_PACKAGE_NAMES = new Set([
  'root',
  'app',
  'web',
  'api',
  'server',
  'client',
  'backend',
  'frontend',
  'main',
  'core',
  'shared',
  'common',
  'lib',
  'utils',
]);

const DOMAIN_FOLDER_NAMES = ['domains', 'modules', 'features', 'contexts', 'bounded-contexts'];

export function suggestBusinessContexts(scan, projectRoot, apiRoutes = []) {
  /** @type {Map<string, { slug: string, label: string, evidence: Set<string>, confidence: string }>} */
  const map = new Map();

  for (const pkg of scan.packages) {
    const short = (pkg.name?.split('/').pop() ?? 'root').replace(/^@/, '');
    const relDir = path.relative(projectRoot, pkg.dir).replace(/\\/g, '/') || '.';

    if (scan.packages.length === 1 && (short === 'root' || !short)) {
      addContext(map, slugify(scan.projectName || 'core'), labelize(scan.projectName || 'Core'), [
        'package.json (root)',
      ]);
      continue;
    }

    if (GENERIC_PACKAGE_NAMES.has(short.toLowerCase()) && scan.packages.length > 1) {
      addContext(map, slugify(path.basename(relDir) || short), labelize(path.basename(relDir) || short), [
        relDir,
      ]);
      continue;
    }

    addContext(map, slugify(short), labelize(short), [relDir, pkg.pkg?.description].filter(Boolean));
  }

  for (const folder of DOMAIN_FOLDER_NAMES) {
    for (const base of ['src', '']) {
      const dir = base ? path.join(projectRoot, base, folder) : path.join(projectRoot, folder);
      if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
        const rel = path.join(base, folder, entry.name).replace(/\\/g, '/').replace(/^\//, '');
        addContext(map, slugify(entry.name), labelize(entry.name), [rel]);
      }
    }
  }

  for (const group of groupApiPrefixes(apiRoutes)) {
    if (group.routes.length < 2 && group.segment.length < 3) continue;
    if (GENERIC_PACKAGE_NAMES.has(group.segment.toLowerCase())) continue;
    addContext(map, slugify(group.segment), group.label, [`API prefix ${group.prefix}`], 'likely');
  }

  let contexts = [...map.values()].map((c) => ({
    slug: c.slug,
    label: c.label,
    evidence: [...c.evidence].slice(0, 8),
    confidence: c.confidence,
  }));

  if (!contexts.length) {
    contexts = [
      {
        slug: slugify(scan.projectName || 'core'),
        label: labelize(scan.projectName || 'Core product'),
        evidence: ['project root — no strong boundaries detected'],
        confidence: 'uncertain',
      },
    ];
  }

  contexts.sort((a, b) => a.label.localeCompare(b.label));
  if (contexts.length > 15) {
    contexts = contexts
      .sort((a, b) => b.evidence.length - a.evidence.length || a.label.localeCompare(b.label))
      .slice(0, 15);
  }

  return contexts;
}

export function mapBusinessContexts(projectRoot, options = {}) {
  const { force = false } = options;
  const layout = getLayout(projectRoot);
  const scan = scanProject(projectRoot);

  let apiRoutes = [];
  try {
    const frameworks = detectFrameworks(scan.packages, projectRoot);
    apiRoutes = collectApiRoutes(projectRoot, scan.packages, frameworks);
  } catch {
    apiRoutes = [];
  }

  const contexts = suggestBusinessContexts(scan, projectRoot, apiRoutes).map((ctx) => ({
    ...ctx,
    doc: `docs/business/contexts/${ctx.slug}.md`,
  }));

  writeContextMap(layout, contexts, scan);
  for (const ctx of contexts) {
    scaffoldContextDoc(layout, ctx, scan, { force });
  }
  updateBusinessIndex(layout, contexts, scan);
  persistBusinessContexts(layout, contexts);

  return { contexts, count: contexts.length };
}

export function readBusinessContexts(layout) {
  const meta = readJson(layout.metaAbs);
  if (Array.isArray(meta?.businessContexts) && meta.businessContexts.length) {
    return meta.businessContexts;
  }
  const dir = path.join(layout.docsDirAbs, 'business', 'contexts');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
    .map((name) => {
      const slug = name.replace(/\.md$/, '');
      return { slug, label: labelize(slug), doc: `docs/business/contexts/${name}` };
    });
}

function addContext(map, slug, label, evidence, confidence = 'likely') {
  if (!slug) return;
  const existing = map.get(slug);
  if (existing) {
    for (const e of evidence) existing.evidence.add(e);
    if (confidence === 'uncertain' && existing.confidence !== 'uncertain') {
      existing.confidence = 'likely';
    }
    return;
  }
  map.set(slug, { slug, label, evidence: new Set(evidence), confidence });
}

function groupApiPrefixes(routes) {
  const groups = new Map();
  for (const r of routes) {
    const parts = r.path.split('/').filter(Boolean);
    const segment = parts[0] === 'api' ? (parts[1] ?? parts[0]) : (parts[0] ?? 'root');
    const prefix = parts[0] === 'api' && parts[1] ? `/api/${parts[1]}` : `/${segment}`;
    const key = prefix.toLowerCase();
    if (!groups.has(key)) {
      groups.set(key, {
        prefix,
        segment,
        label: labelize(segment),
        routes: [],
      });
    }
    groups.get(key).routes.push(r);
  }
  return [...groups.values()];
}

function slugify(name) {
  return (
    String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'core'
  );
}

function labelize(name) {
  return String(name)
    .replace(/[-_/]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function writeContextMap(layout, contexts, scan) {
  const rows = contexts
    .map(
      (ctx) =>
        `| ${ctx.label} | [contexts/${ctx.slug}.md](contexts/${ctx.slug}.md) | ${ctx.evidence.join('; ')} | [${ctx.confidence}] |`
    )
    .join('\n');

  const content = `# Business context map

**Project:** ${scan.projectName}

Map of business areas detected in this repository. **Validate during discovery** — merge, rename, or split contexts using evidence from README, ADRs, tests, and domain code.

> Auto-generated by DocAtlas \`map-contexts\` from packages, folder layout, and API prefixes. Not verified until discovery confirms.

## Detected contexts

| Context | Doc | Evidence | Confidence |
|---------|-----|----------|------------|
${rows}

## Relationships [uncertain]

TODO: How contexts depend on each other (during discovery).

## Open questions

- TODO: Contexts that need stakeholder confirmation
- TODO: Boundaries that overlap or should merge

## Related

- [Business overview](../BUSINESS.md)
- [Architecture](../ARCHITECTURE.md)
- [Journey traces](../JOURNEY-*.md)
`;

  writeText(path.join(layout.docsDirAbs, 'business', 'CONTEXT-MAP.md'), content);
}

function scaffoldContextDoc(layout, ctx, scan, { force }) {
  const dest = path.join(layout.docsDirAbs, 'business', 'contexts', `${ctx.slug}.md`);
  if (fs.existsSync(dest) && !force) return;

  const content = `# ${ctx.label}

**Business context** — scoped area within ${scan.projectName}.

> Template scaffold — fill during **discovery** from README, tests, validation code, and domain models. Do not invent rules.

**Evidence:** ${ctx.evidence.join('; ')}

## Scope [${ctx.confidence}]

What this area owns and what it explicitly does **not** own.

- **In scope:** TODO
- **Out of scope:** TODO

## Actors [uncertain]

| Actor | Goal in this context |
|-------|----------------------|
| TODO | TODO |

## Capabilities [uncertain]

What the product must do **in this area** (user-visible outcomes, not implementation):

1. TODO

## Business rules [uncertain]

| Rule | Evidence | Epistemic | Confidence |
|------|----------|-----------|------------|
| TODO | TODO | UNKNOWN | [uncertain] |

## Related journeys [uncertain]

Link to \`JOURNEY-*.md\` steps that touch this context:

- TODO

## Related technical [uncertain]

Pointers to components in [ARCHITECTURE.md](../../ARCHITECTURE.md):

- TODO
`;

  writeText(dest, content);
}

function updateBusinessIndex(layout, contexts, scan) {
  const links = contexts
    .map((ctx) => `- [${ctx.label}](business/contexts/${ctx.slug}.md) — [${ctx.confidence}]`)
    .join('\n');

  const content = `# Business overview

**Project:** ${scan.projectName}

Executive index for **business** documentation. Detailed rules and capabilities live in **per-context docs** — not in this file.

> See [business/CONTEXT-MAP.md](business/CONTEXT-MAP.md) for how areas were detected and how they relate.

## What problem does this solve? [uncertain]

${scan.description || 'TODO: Plain-language problem statement (1–3 sentences).'}

## Who uses it? [uncertain]

| Actor | Goal |
|-------|------|
| TODO | TODO |

## Business contexts

| Context | Doc |
|---------|-----|
${contexts.map((c) => `| ${c.label} | [business/contexts/${c.slug}.md](business/contexts/${c.slug}.md) |`).join('\n')}

### Quick links

${links}

## Out of scope (product-wide) [uncertain]

What the **whole product** does not do:

- TODO

## Related docs

- [Context map](business/CONTEXT-MAP.md) — areas, evidence, boundaries
- [Journey traces](JOURNEY-*.md) — user flows in code
- [Architecture](ARCHITECTURE.md) — technical design
- [Glossary](GLOSSARY.md) — terms
`;

  writeText(layout.docAbs('BUSINESS.md'), content);
}

function persistBusinessContexts(layout, contexts) {
  const meta = readJson(layout.metaAbs) ?? {};
  meta.businessContexts = contexts.map((ctx) => ({
    slug: ctx.slug,
    label: ctx.label,
    doc: ctx.doc,
    evidence: ctx.evidence,
    confidence: ctx.confidence,
    mappedAt: new Date().toISOString(),
  }));
  meta.businessMappedAt = new Date().toISOString();
  writeText(layout.metaAbs, `${JSON.stringify(meta, null, 2)}\n`);
}
