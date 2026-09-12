import fs from 'node:fs';
import path from 'node:path';
import { getLayout, slug } from './layout.js';
import {
  buildJourneySteps,
  buildRouteInventory,
  collectJourneyTerms,
  dedupeRoutes,
} from './journey-builder.js';
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
  const apiRoutes = collectApiRoutes(projectRoot, scan.packages);
  const webPages = collectWebPages(projectRoot, scan.packages);
  const clientApi = collectClientApi(projectRoot, scan.packages);
  const { steps, mode } = buildJourneySteps(webPages, apiRoutes, clientApi, journeyName);
  const terms = collectJourneyTerms(steps, scan);
  const inventory = buildRouteInventory(webPages, apiRoutes);

  const journeyRel = layout.journeyRel(journeyName);
  writeJourneyDoc(layout, journeyName, steps, scan, mode);
  updateArchitecture(layout, journeyName, steps, inventory, mode);
  updateGlossary(layout, journeyName, terms);
  updateStartHere(layout, journeyName, journeyRel, steps);
  touchMeta(layout, journeyName, mode, steps.length);

  return { journeyRel, steps: steps.length, terms: terms.length, mode };
}

function collectApiRoutes(projectRoot, packages) {
  const routes = [];
  const dirs = packages.length ? packages.map((p) => p.dir) : [projectRoot];
  const patterns = [
    /app\.(get|post|put|delete|patch)\(\s*['"`]([^'"`]+)['"`]/g,
    /router\.(get|post|put|delete|patch)\(\s*['"`]([^'"`]+)['"`]/g,
    /\.(get|post|put|delete|patch)\(\s*['"`](\/[^'"`]+)['"`]/g,
  ];

  for (const dir of dirs) {
    walkFiles(dir, (file) => {
      if (!/\.(ts|js|tsx|jsx)$/.test(file)) return;
      const content = readText(file) ?? '';
      if (!/\.(get|post|put|delete|patch)\(/.test(content)) return;
      for (const re of patterns) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(content))) {
          const method = m[1].toUpperCase();
          const routePath = m[2];
          if (!routePath.startsWith('/')) continue;
          routes.push({
            method,
            path: routePath,
            file: rel(projectRoot, file),
          });
        }
      }
    });
  }
  return dedupeRoutes(routes);
}

function collectWebPages(projectRoot, packages) {
  const pages = [];
  const dirs = packages.length ? packages.map((p) => p.dir) : [projectRoot];

  for (const dir of dirs) {
    walkFiles(dir, (file) => {
      const base = path.basename(file);
      const relFile = rel(projectRoot, file);

      if (base === 'page.tsx' || base === 'page.jsx' || base === 'page.js') {
        pages.push({ file: relFile, route: inferAppRouterRoute(relFile), score: 0 });
        return;
      }

      if (/^pages\/.+\.(tsx|jsx|js)$/.test(relFile) && base !== '_app.tsx' && base !== '_document.tsx') {
        pages.push({ file: relFile, route: inferPagesRouterRoute(relFile), score: 0 });
      }
    });
  }
  return pages;
}

function inferAppRouterRoute(relFile) {
  if (/\/app\/page\.(tsx|jsx|js)$/.test(relFile)) return '/';
  const m = relFile.match(/app\/(.+)\/page\.(tsx|jsx|js)$/);
  if (!m) return '/';
  return '/' + m[1].replace(/\[([^\]]+)\]/g, ':$1');
}

function inferPagesRouterRoute(relFile) {
  const m = relFile.match(/pages\/(.+)\.(tsx|jsx|js)$/);
  if (!m) return '/';
  if (m[1] === 'index') return '/';
  return '/' + m[1].replace(/\/index$/, '').replace(/\[([^\]]+)\]/g, ':$1');
}

function collectClientApi(projectRoot, packages) {
  const calls = [];
  const dirs = packages.length ? packages.map((p) => p.dir) : [projectRoot];

  for (const dir of dirs) {
    walkFiles(dir, (file) => {
      if (!/\.(ts|js|tsx|jsx)$/.test(file)) return;
      const content = readText(file) ?? '';
      if (!content.includes('/api/') && !/fetch\s*\(/.test(content)) return;
      const relFile = rel(projectRoot, file);
      const fnBlock = /export (?:async )?function (\w+)/g;
      let m;
      while ((m = fnBlock.exec(content))) {
        const fn = m[1];
        const slice = content.slice(m.index, m.index + 800);
        const pm = slice.match(/[`'"](\/api\/[^'"`]+)[`'"]/);
        if (pm) calls.push({ fn, path: pm[1], file: relFile });
      }
    });
  }
  return calls;
}

function writeJourneyDoc(layout, journeyName, steps, scan, mode) {
  const lines = steps.flatMap((s, i) => {
    const rows = [`### ${i + 1}. ${s.label} [${s.confidence}]`];
    if (s.page) rows.push(`- **UI:** \`${s.page}\`${s.route ? ` (route \`${s.route}\`)` : ''}`);
    for (const c of s.clientCalls) {
      rows.push(`- **Client:** \`${c.file}\` → \`${c.fn}()\` → \`${c.path}\``);
    }
    for (const r of s.apiRoutes) {
      rows.push(`- **API:** \`${r.method} ${r.path}\` in \`${r.file}\``);
    }
    if (!s.page && !s.clientCalls.length && !s.apiRoutes.length) {
      rows.push('- No matching files found — fill in manually [uncertain]');
    }
    return rows;
  });

  const modeNote =
    'DocAtlas scanned pages and API routes from this repo’s structure — no domain-specific templates.';

  const content = `# Journey: ${journeyName}

${modeNote} Upgrade [likely] to [verified] after you run the app.

## Summary [likely]

${scan.description}

**Areas covered:** ${steps.length} step(s) — ${steps.map((s) => s.label).join(', ')}.

## Steps

${lines.join('\n\n')}

## Smoke test [likely]

\`\`\`bash
${(scan.quickStart[0] || 'npm run dev').split('\n')[0]}
\`\`\`

Walk through the steps above. See [ARCHITECTURE.md](ARCHITECTURE.md) for the full route inventory.

## Related

- [START_HERE.md](START_HERE.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
`;

  writeText(layout.journeyAbs(journeyName), content);
}

function updateArchitecture(layout, journeyName, steps, inventory, mode) {
  const archPath = layout.docAbs('ARCHITECTURE.md');
  if (!fs.existsSync(archPath)) return;

  const entryBlock = steps
    .flatMap((s) => {
      const items = [];
      if (s.page) items.push(`| ${s.label} UI | \`${s.page}\` | [likely] |`);
      for (const r of s.apiRoutes.slice(0, 2)) {
        items.push(`| ${s.label} API | \`${r.method} ${r.path}\` → \`${r.file}\` | [likely] |`);
      }
      if (!s.page && s.apiRoutes.length) {
        items.push(`| ${s.label} | API endpoints (see journey) | [likely] |`);
      }
      return items;
    })
    .join('\n');

  let content = readText(archPath) ?? '';

  const journeySection = `## Journey: ${journeyName} [likely]

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

  const inventorySection = `## Route inventory [likely]

Auto-scanned by \`docatlas refine\` from code structure. Not exhaustive — verify against the repo.

### Web pages

${inventory.pageLines.length ? inventory.pageLines.join('\n') : '- No pages detected — may use a non-standard router [uncertain]'}

### API routes

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

function touchMeta(layout, journeyName, mode, stepCount) {
  const meta = readJson(layout.metaAbs) ?? {};
  meta.journeyName = journeyName;
  meta.refinedAt = new Date().toISOString();
  meta.refineSource = 'docatlas refine';
  meta.refineMode = mode;
  meta.refineSteps = stepCount;
  writeText(layout.metaAbs, JSON.stringify(meta, null, 2) + '\n');
}

function walkFiles(dir, onFile, depth = 0) {
  if (depth > 10 || !fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', '.next', 'dist', 'build', 'coverage'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, onFile, depth + 1);
    else onFile(full);
  }
}

function rel(root, file) {
  return path.relative(root, file).replace(/\\/g, '/');
}
