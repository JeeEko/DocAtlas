import fs from 'node:fs';
import path from 'node:path';
import { getLayout, slug } from './layout.js';
import {
  buildJourneySteps,
  buildRouteInventory,
  collectJourneyTerms,
} from './journey-builder.js';
import { detectFrameworks } from './frameworks.js';
import { collectApiRoutes, collectClientApi, collectWebPages } from './parsers/index.js';
import { readJson, readText, writeText } from './paths.js';
import { scanProject } from './scan.js';

export function runRefine(projectRoot, options = {}) {
  const layout = getLayout(projectRoot);
  const meta = readJson(layout.metaAbs);
  if (!meta && !options.force) {
    throw new Error('Run docatlas init first.');
  }

  const journeyName = options.journeyName || meta?.journeyName || 'MainFlow';
  const scan = scanProject(projectRoot);
  const frameworks = detectFrameworks(scan.packages, projectRoot);
  const webPages = collectWebPages(projectRoot, scan.packages);
  const apiRoutes = collectApiRoutes(projectRoot, scan.packages, frameworks);
  const clientApi = collectClientApi(projectRoot, scan.packages);
  const minCoverage = options.minCoverage ?? 90;
  const { steps, mode, coverage } = buildJourneySteps(webPages, apiRoutes, clientApi, journeyName, {
    minCoverage,
  });
  const terms = collectJourneyTerms(steps, scan);
  const inventory = buildRouteInventory(webPages, apiRoutes);

  const journeyRel = layout.journeyRel(journeyName);
  writeJourneyDoc(layout, journeyName, steps, scan, coverage, frameworks);
  updateArchitecture(layout, journeyName, steps, inventory, coverage, frameworks);
  updateGlossary(layout, journeyName, terms);
  updateStartHere(layout, journeyName, journeyRel, steps);
  touchMeta(layout, journeyName, mode, steps.length, coverage, frameworks);

  return {
    journeyRel,
    steps: steps.length,
    terms: terms.length,
    mode,
    coverage,
    frameworks,
    pagesFound: webPages.length,
    apiFound: apiRoutes.length,
  };
}

function writeJourneyDoc(layout, journeyName, steps, scan, coverage, frameworks) {
  const lines = steps.flatMap((s, i) => {
    const rows = [`### ${i + 1}. ${s.label} [${s.confidence}]`];
    if (s.pages?.length > 1) {
      for (const p of s.pages) {
        rows.push(`- **UI:** \`${p.file}\` (route \`${p.route}\`)`);
      }
    } else if (s.page) {
      rows.push(`- **UI:** \`${s.page}\`${s.route ? ` (route \`${s.route}\`)` : ''}`);
    }
    for (const c of s.clientCalls) {
      rows.push(`- **Client:** \`${c.file}\` → \`${c.fn}()\` → \`${c.path}\``);
    }
    for (const r of s.apiRoutes) {
      rows.push(`- **API:** \`${r.method} ${r.path}\` in \`${r.file}\` (${r.source})`);
    }
    if (!s.page && !s.pages?.length && !s.clientCalls.length && !s.apiRoutes.length) {
      rows.push('- No matching files found — fill in manually [uncertain]');
    }
    return rows;
  });

  const detected = Object.entries(frameworks)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(', ');

  const content = `# Journey: ${journeyName}

DocAtlas traced **${coverage.overall}%** of detected routes (${coverage.coveredPages}/${coverage.totalPages} pages, ${coverage.coveredApi}/${coverage.totalApi} API endpoints). Parsers: ${detected || 'generic'}.

## Summary [likely]

${scan.description}

**Areas covered:** ${steps.length} step(s).

## Steps

${lines.join('\n\n')}

## Trace coverage

| Metric | Coverage |
|--------|----------|
| Overall | **${coverage.overall}%** |
| Pages | ${coverage.pagePct}% (${coverage.coveredPages}/${coverage.totalPages}) |
| API | ${coverage.apiPct}% (${coverage.coveredApi}/${coverage.totalApi}) |

${coverage.overall < 90 ? '⚠️ Coverage below 90% — add parsers for your stack or fill gaps manually.\n' : ''}
## Smoke test [likely]

\`\`\`bash
${(scan.quickStart[0] || 'npm run dev').split('\n')[0]}
\`\`\`

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full route inventory.

**Next (required):** run **\`/docatlas\`** in Cursor (discovery phase), or \`docatlas drift\` after discovery completes.

## Related

- [START_HERE.md](START_HERE.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
`;

  writeText(layout.journeyAbs(journeyName), content);
}

function updateArchitecture(layout, journeyName, steps, inventory, coverage, frameworks) {
  const archPath = layout.docAbs('ARCHITECTURE.md');
  if (!fs.existsSync(archPath)) return;

  const entryBlock = steps
    .flatMap((s) => {
      const items = [];
      if (s.page) items.push(`| ${s.label} UI | \`${s.page}\` | [${s.confidence}] |`);
      for (const r of s.apiRoutes.slice(0, 3)) {
        items.push(`| ${s.label} API | \`${r.method} ${r.path}\` → \`${r.file}\` | [${r.confidence ?? 'verified'}] |`);
      }
      if (!s.page && s.apiRoutes.length) {
        items.push(`| ${s.label} | ${s.apiRoutes.length} API endpoint(s) | [verified] |`);
      }
      return items;
    })
    .join('\n');

  let content = readText(archPath) ?? '';

  const journeySection = `## Journey: ${journeyName} [likely]

Trace coverage: **${coverage.overall}%** (pages ${coverage.pagePct}%, API ${coverage.apiPct}%).

| Step | Location | Confidence |
|------|----------|------------|
${entryBlock || '| (none) | Run docatlas refine again or edit manually | [uncertain] |'}

See [JOURNEY-${slug(journeyName)}.md](JOURNEY-${slug(journeyName)}.md) for the full trace.
`;

  if (content.includes('## Journey:')) {
    content = content.replace(/## Journey:[\s\S]*?(?=\n## |$)/, journeySection + '\n');
  } else {
    content += '\n' + journeySection;
  }

  const fw = Object.entries(frameworks)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(', ');

  const inventorySection = `## Route inventory [likely]

Auto-scanned by \`docatlas refine\` (${fw || 'generic'} parsers). **${coverage.overall}%** of detected routes mapped to journey steps.

### Web pages (${inventory.pageLines.length})

${inventory.pageLines.length ? inventory.pageLines.join('\n') : '- No pages detected — add a parser issue if your router is unsupported [uncertain]'}

### API routes (${inventory.apiLines.length})

${inventory.apiLines.length ? inventory.apiLines.join('\n') : '- No API routes detected — check server entry files [uncertain]'}
`;

  if (content.includes('## Route inventory')) {
    content = content.replace(/## Route inventory[\s\S]*?(?=\n## |$)/, inventorySection + '\n');
  } else {
    content += '\n' + inventorySection;
  }

  writeText(archPath, content);
}

function updateGlossary(layout, journeyName, terms) {
  const glossaryPath = layout.docAbs('GLOSSARY.md');
  const existing = readText(glossaryPath) ?? '';
  const existingTerms = new Set();
  for (const m of existing.matchAll(/\|\s*([^|]+)\s*\|/g)) {
    const t = m[1].trim();
    if (t !== 'Term' && t !== '------') existingTerms.add(t);
  }

  const rows = [...terms].map((t) => {
    if (t === 'DocAtlas') return '| DocAtlas | Documentation toolkit | [verified] |';
    if (existingTerms.has(t)) return null;
    return `| ${t} | Used in ${journeyName} flow — see journey doc | [likely] |`;
  }).filter(Boolean);

  if (existing.includes('| Term | Definition | Confidence |')) {
    if (rows.length) {
      writeText(glossaryPath, existing.trimEnd() + '\n' + rows.join('\n') + '\n');
    }
    return;
  }

  writeText(
    glossaryPath,
    `# Glossary

**Project:** ${journeyName}

| Term | Definition | Confidence |
|------|------------|------------|
${terms.map((t) => (t === 'DocAtlas' ? '| DocAtlas | Documentation toolkit | [verified] |' : `| ${t} | See journey or architecture docs | [likely] |`)).join('\n')}
`
  );
}

function updateStartHere(layout, journeyName, journeyRel, steps) {
  const startPath = layout.docAbs('START_HERE.md');
  if (!fs.existsSync(startPath)) return;
  let content = readText(startPath) ?? '';
  if (!content.includes('JOURNEY-')) {
    content = content.replace(
      /## Main docs[\s\S]*?(?=## |$)/,
      `## Main docs\n\n| File | Why |\n|------|-----|\n| [${path.basename(journeyRel)}](${path.basename(journeyRel)}) | **User flows** (${steps.length} areas traced) |\n| [ONBOARDING.md](ONBOARDING.md) | Setup |\n| [ARCHITECTURE.md](ARCHITECTURE.md) | Components + route inventory |\n| [RUNBOOK.md](RUNBOOK.md) | Commands |\n| [GLOSSARY.md](GLOSSARY.md) | Terms |\n\n`
    );
  }
  writeText(startPath, content);
}

function touchMeta(layout, journeyName, mode, stepCount, coverage, frameworks) {
  const meta = readJson(layout.metaAbs) ?? {};
  meta.journeyName = journeyName;
  meta.refinedAt = new Date().toISOString();
  meta.refineSource = 'docatlas refine';
  meta.refineMode = mode;
  meta.refineSteps = stepCount;
  meta.traceCoverage = coverage.overall;
  meta.parsers = Object.entries(frameworks)
    .filter(([, v]) => v)
    .map(([k]) => k);
  writeText(layout.metaAbs, JSON.stringify(meta, null, 2) + '\n');
}
