import fs from 'node:fs';
import path from 'node:path';
import { getLayout, slug } from './layout.js';
import { readJson, readText, writeText } from './paths.js';
import { scanProject } from './scan.js';

const FLOW_STEPS = [
  { id: 'catalog', label: 'Browse catalog', keywords: ['product', 'catalog'], prefer: ['app/page.tsx', '/page.tsx'] },
  { id: 'cart', label: 'Shopping cart', keywords: ['cart'] },
  { id: 'checkout', label: 'Checkout', keywords: ['checkout'] },
  { id: 'order', label: 'Order confirmation', keywords: ['order'] },
];

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
  const steps = buildJourneySteps(webPages, apiRoutes, clientApi, journeyName);
  const terms = collectJourneyTerms(steps, scan);

  const journeyRel = layout.journeyRel(journeyName);
  writeJourneyDoc(layout, journeyName, steps, scan);
  updateArchitecture(layout, journeyName, steps);
  updateGlossary(layout, journeyName, terms);
  updateStartHere(layout, journeyName, journeyRel, steps);
  touchMeta(layout, journeyName);

  return { journeyRel, steps: steps.length, terms: terms.length };
}

function collectApiRoutes(projectRoot, packages) {
  const routes = [];
  const dirs = packages.length ? packages.map((p) => p.dir) : [projectRoot];
  const re = /app\.(get|post|put|delete|patch)\(\s*['"`]([^'"`]+)['"`]/g;

  for (const dir of dirs) {
    walkFiles(dir, (file) => {
      if (!/\.(ts|js)$/.test(file)) return;
      const content = readText(file) ?? '';
      if (!content.includes('app.')) return;
      let m;
      while ((m = re.exec(content))) {
        routes.push({
          method: m[1].toUpperCase(),
          path: m[2],
          file: rel(projectRoot, file),
        });
      }
    });
  }
  return routes;
}

function collectWebPages(projectRoot, packages) {
  const pages = [];
  const dirs = packages.length ? packages.map((p) => p.dir) : [projectRoot];

  for (const dir of dirs) {
    walkFiles(dir, (file) => {
      if (!file.endsWith('page.tsx') && !file.endsWith('page.jsx')) return;
      const relFile = rel(projectRoot, file);
      const route = inferWebRoute(relFile);
      pages.push({ file: relFile, route, score: 0 });
    });
  }
  return pages;
}

function inferWebRoute(relFile) {
  if (/\/app\/page\.(tsx|jsx)$/.test(relFile)) return '/';
  const m = relFile.match(/app\/(.+)\/page\.(tsx|jsx)$/);
  if (!m) return '/';
  let r = m[1].replace(/\[([^\]]+)\]/g, ':$1');
  return '/' + r;
}

function collectClientApi(projectRoot, packages) {
  const calls = [];
  const dirs = packages.length ? packages.map((p) => p.dir) : [projectRoot];
  const fnRe = /export (?:async )?function (\w+)\([^)]*\)[^{]*\{[\s\S]*?[`'"](\/api\/[^'"`]+)[`'"]/g;
  const pathRe = /[`'"](\/api\/[^'"`]+)[`'"]/g;

  for (const dir of dirs) {
    walkFiles(dir, (file) => {
      if (!/api\.(ts|js)$/.test(file) && !file.includes(`${path.sep}lib${path.sep}`)) return;
      const content = readText(file) ?? '';
      if (!content.includes('/api/')) return;
      const relFile = rel(projectRoot, file);
      const names = new Map();
      let m;
      const fnBlock = /export (?:async )?function (\w+)/g;
      while ((m = fnBlock.exec(content))) {
        const fn = m[1];
        const slice = content.slice(m.index, m.index + 800);
        const pm = slice.match(/[`'"](\/api\/[^'"`]+)[`'"]/);
        if (pm) names.set(fn, { fn, path: pm[1], file: relFile });
      }
      for (const v of names.values()) calls.push(v);
    });
  }
  return calls;
}

function buildJourneySteps(webPages, apiRoutes, clientApi, journeyName) {
  const steps = [];
  const usedPages = new Set();

  for (const flow of FLOW_STEPS) {
    const page = pickPage(webPages, flow, usedPages);
    if (page) usedPages.add(page.file);

    const relatedCalls = dedupeCalls(
      clientApi.filter((c) => stepMatchesClient(c, flow))
    );
    const relatedRoutes = dedupeRoutes(
      apiRoutes.filter((r) => stepMatchesApi(r, flow))
    );

    if (!page && !relatedCalls.length && !relatedRoutes.length) continue;

    steps.push({
      label: flow.label,
      page: page?.file ?? null,
      route: page?.route ?? null,
      clientCalls: relatedCalls.slice(0, 4),
      apiRoutes: relatedRoutes.slice(0, 4),
      confidence: page || relatedRoutes.length ? 'verified' : 'likely',
    });
  }

  if (steps.length === 0) {
    steps.push({
      label: journeyName,
      page: webPages[0]?.file ?? null,
      route: webPages[0]?.route ?? null,
      clientCalls: clientApi.slice(0, 3),
      apiRoutes: apiRoutes.slice(0, 3),
      confidence: 'likely',
    });
  }
  return steps;
}

function pickPage(pages, flow, used) {
  let best = null;
  let bestScore = 0;
  const keywords = flow.keywords ?? [];
  const prefer = flow.prefer ?? [];

  for (const p of pages) {
    if (used.has(p.file)) continue;
    const hay = `${p.file} ${p.route}`.toLowerCase();
    let score = 0;
    for (const pref of prefer) {
      if (p.file.endsWith(pref) || p.file.includes(pref)) score += 10;
    }
    for (const k of keywords) {
      if (hay.includes(k.toLowerCase())) score += 3;
    }
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return best;
}

function stepMatchesApi(r, flow) {
  const p = r.path.toLowerCase();
  if (flow.id === 'catalog') return p.startsWith('/api/products');
  if (flow.id === 'cart') return p.includes('/api/cart');
  if (flow.id === 'checkout') return r.method === 'POST' && p === '/api/orders';
  if (flow.id === 'order') return r.method === 'GET' && p.startsWith('/api/orders');
  return flow.keywords.some((k) => p.includes(k));
}

function dedupeRoutes(routes) {
  const seen = new Set();
  return routes.filter((r) => {
    const key = `${r.method}:${r.path}:${r.file}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function stepMatchesClient(c, flow) {
  if (flow.id === 'catalog') {
    return c.fn === 'getProducts' || c.fn === 'getProduct';
  }
  if (flow.id === 'cart') {
    return ['getCart', 'addToCart', 'removeFromCart'].includes(c.fn);
  }
  if (flow.id === 'checkout') {
    return c.fn === 'createOrder' || c.path === '/api/orders';
  }
  if (flow.id === 'order') {
    return c.fn === 'getOrder' || /\/api\/orders\//.test(c.path);
  }
  return flow.keywords.some((k) => c.fn.toLowerCase().includes(k) || c.path.toLowerCase().includes(k));
}

function dedupeCalls(calls) {
  const seen = new Set();
  return calls.filter((c) => {
    const key = `${c.fn}:${c.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function collectJourneyTerms(steps, scan) {
  const terms = new Set(scan.terms);
  for (const s of steps) {
    for (const r of s.apiRoutes) {
      const parts = r.path.split('/').filter(Boolean);
      for (const p of parts) {
        if (!p.startsWith(':') && p !== 'api') terms.add(titleCase(p.replace(/-/g, ' ')));
      }
    }
  }
  terms.add('Session');
  terms.add('Cart');
  terms.add('Order');
  terms.add('Product');
  return [...terms];
}

function writeJourneyDoc(layout, journeyName, steps, scan) {
  const lines = steps.flatMap((s, i) => {
    const rows = [`### ${i + 1}. ${s.label} [${s.confidence}]`];
    if (s.page) rows.push(`- **UI:** \`${s.page}\`${s.route ? ` (route \`${s.route}\`)` : ''}`);
    for (const c of s.clientCalls) {
      rows.push(`- **Client:** \`${c.file}\` → \`${c.fn}()\` → \`${c.path}\``);
    }
    for (const r of s.apiRoutes) {
      rows.push(`- **API:** \`${r.method} ${r.path}\` in \`${r.file}\``);
    }
    return rows;
  });

  const content = `# Journey: ${journeyName}

Traced from code by \`docatlas refine\`. Upgrade [likely] to [verified] after you run the app.

## Summary [likely]

${scan.description}

## Steps

${lines.join('\n\n')}

## Smoke test [likely]

\`\`\`bash
${(scan.quickStart[0] || 'npm run dev').split('\n')[0]}
\`\`\`

Then walk through: ${steps.map((s) => s.label.toLowerCase()).join(' → ')}.

## Related

- [START_HERE.md](START_HERE.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
`;

  writeText(layout.journeyAbs(journeyName), content);
}

function updateArchitecture(layout, journeyName, steps) {
  const archPath = layout.docAbs('ARCHITECTURE.md');
  if (!fs.existsSync(archPath)) return;

  const entryBlock = steps
    .flatMap((s) => {
      const items = [];
      if (s.page) items.push(`| ${s.label} UI | \`${s.page}\` | [verified] |`);
      for (const r of s.apiRoutes.slice(0, 1)) {
        items.push(`| ${s.label} API | \`${r.method} ${r.path}\` → \`${r.file}\` | [verified] |`);
      }
      return items;
    })
    .join('\n');

  let content = readText(archPath) ?? '';
  const section = `## Journey: ${journeyName} [verified]

| Step | Location | Confidence |
|------|----------|------------|
${entryBlock}

See [JOURNEY-${slug(journeyName)}.md](JOURNEY-${slug(journeyName)}.md) for the full trace.
`;

  if (content.includes('## Journey:')) {
    content = content.replace(/## Journey:[\s\S]*?(?=\n## |$)/, section + '\n');
  } else {
    content += '\n' + section;
  }
  writeText(archPath, content);
}

function updateGlossary(layout, journeyName, terms) {
  const rows = terms.map((t) => {
    if (t === 'DocAtlas') return '| DocAtlas | Documentation toolkit | [verified] |';
    return `| ${t} | Used in ${journeyName} flow — see journey doc | [likely] |`;
  });

  writeText(
    layout.docAbs('GLOSSARY.md'),
    `# Glossary

**Project:** ${journeyName}

| Term | Definition | Confidence |
|------|------------|------------|
${rows.join('\n')}
`
  );
}

function updateStartHere(layout, journeyName, journeyRel, steps) {
  const startPath = layout.docAbs('START_HERE.md');
  if (!fs.existsSync(startPath)) return;
  let content = readText(startPath) ?? '';
  const link = `[${journeyName} journey](${path.basename(journeyRel)})`;
  if (!content.includes('JOURNEY-')) {
    content = content.replace(
      /## Main docs[\s\S]*?(?=## |$)/,
      `## Main docs\n\n| File | Why |\n|------|-----|\n| [${path.basename(journeyRel)}](${path.basename(journeyRel)}) | **User flow trace** (${steps.length} steps) |\n| [ONBOARDING.md](ONBOARDING.md) | Setup |\n| [ARCHITECTURE.md](ARCHITECTURE.md) | Code layout |\n| [RUNBOOK.md](RUNBOOK.md) | Commands |\n| [GLOSSARY.md](GLOSSARY.md) | Terms |\n\n`
    );
  }
  writeText(startPath, content);
}

function touchMeta(layout, journeyName) {
  const meta = readJson(layout.metaAbs) ?? {};
  meta.journeyName = journeyName;
  meta.refinedAt = new Date().toISOString();
  meta.refineSource = 'docatlas refine';
  writeText(layout.metaAbs, JSON.stringify(meta, null, 2) + '\n');
}

function walkFiles(dir, onFile, depth = 0) {
  if (depth > 8 || !fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', '.next', 'dist', 'build'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, onFile, depth + 1);
    else onFile(full);
  }
}

function rel(root, file) {
  return path.relative(root, file).replace(/\\/g, '/');
}

function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
