/**
 * Project-agnostic journey discovery.
 * Infers flows from routes, pages, and API groupings in the repo —
 * never from domain templates (e-commerce, auth, etc.).
 */

const SKIP_PAGE_HINTS = [
  'layout.',
  'loading.',
  'error.',
  'not-found.',
  'template.',
  'global-error.',
  '_app.',
  '_document.',
  'middleware.',
];

const MAX_PAGE_STEPS = 10;
const MAX_API_STEPS = 12;
const MAX_TOTAL_STEPS = 14;

export function buildJourneySteps(webPages, apiRoutes, clientApi, journeyName) {
  const steps = discoverSteps(webPages, apiRoutes, clientApi, journeyName);
  return { steps, mode: 'discovery' };
}

function discoverSteps(webPages, apiRoutes, clientApi, journeyName) {
  const steps = [];
  const usedPages = new Set();
  const usedApiKeys = new Set();

  for (const page of rankPages(webPages)) {
    if (steps.length >= MAX_PAGE_STEPS) break;
    if (usedPages.has(page.file)) continue;
    usedPages.add(page.file);
    const relatedRoutes = matchApiForPage(apiRoutes, page, usedApiKeys);
    const relatedCalls = matchClientForPage(clientApi, page);
    steps.push(makeStep(labelFromPage(page), page, relatedCalls, relatedRoutes));
  }

  for (const group of groupApiRoutes(apiRoutes)) {
    if (steps.length >= MAX_TOTAL_STEPS) break;
    if (usedApiKeys.has(group.key)) continue;
    if (steps.some((s) => s.apiRoutes.some((r) => r.path.startsWith(group.prefix)))) continue;
    usedApiKeys.add(group.key);
    steps.push({
      label: group.label,
      page: null,
      route: group.prefix,
      clientCalls: dedupeCalls(
        clientApi.filter((c) => c.path.startsWith(group.prefix) || pathSharesSegment(c.path, group.segment))
      ).slice(0, 4),
      apiRoutes: dedupeRoutes(group.routes).slice(0, 6),
      confidence: 'likely',
    });
  }

  if (steps.length === 0) {
    steps.push({
      label: journeyName,
      page: webPages[0]?.file ?? null,
      route: webPages[0]?.route ?? null,
      clientCalls: clientApi.slice(0, 4),
      apiRoutes: apiRoutes.slice(0, 6),
      confidence: 'likely',
    });
  }

  return steps;
}

function makeStep(label, page, relatedCalls, relatedRoutes) {
  return {
    label,
    page: page?.file ?? null,
    route: page?.route ?? null,
    clientCalls: relatedCalls.slice(0, 4),
    apiRoutes: relatedRoutes.slice(0, 6),
    confidence: page || relatedRoutes.length ? 'likely' : 'uncertain',
  };
}

function rankPages(pages) {
  return [...pages]
    .filter((p) => !SKIP_PAGE_HINTS.some((h) => p.file.toLowerCase().includes(h)))
    .sort((a, b) => scorePage(b) - scorePage(a) || a.route.localeCompare(b.route));
}

/** Structural scoring only — no domain keywords. */
function scorePage(page) {
  let score = 0;
  const segments = page.route.split('/').filter(Boolean);

  if (page.route === '/') score += 100;
  score += Math.max(0, 40 - segments.length * 8);
  score -= (page.route.match(/:/g) ?? []).length * 12;

  if (/\/page\.(tsx|jsx|js)$/.test(page.file)) score += 5;
  if (/\/index\.(tsx|jsx|js)$/.test(page.file)) score += 8;

  return score;
}

function labelFromPage(page) {
  if (page.route === '/') return 'Entry / home';
  const segment = page.route.split('/').filter(Boolean).pop() ?? 'page';
  return titleCase(segment.replace(/[[\]:]/g, ' ').replace(/-/g, ' '));
}

function groupApiRoutes(routes) {
  const groups = new Map();
  for (const r of routes) {
    const parts = r.path.split('/').filter(Boolean);
    const segment = parts[1] ?? parts[0] ?? 'root';
    const prefix = parts[0] === 'api' && parts[1] ? `/api/${parts[1]}` : `/${segment}`;
    const key = prefix.toLowerCase();
    if (!groups.has(key)) {
      groups.set(key, { key, prefix, segment, label: titleCase(segment.replace(/-/g, ' ')), routes: [] });
    }
    groups.get(key).routes.push(r);
  }
  return [...groups.values()].sort((a, b) => b.routes.length - a.routes.length || a.prefix.localeCompare(b.prefix));
}

function matchApiForPage(routes, page, usedApiKeys) {
  const segments = page.route.split('/').filter(Boolean).map((s) => s.replace(/^:/, '').toLowerCase());
  const matched = routes.filter((r) => {
    const apiSeg = r.path.split('/').filter(Boolean)[1]?.replace(/^:/, '').toLowerCase() ?? '';
    return apiSeg && segments.some((s) => s === apiSeg || s.includes(apiSeg) || apiSeg.includes(s));
  });
  for (const r of matched) {
    const parts = r.path.split('/').filter(Boolean);
    if (parts[1]) usedApiKeys.add(`/api/${parts[1]}`.toLowerCase());
  }
  return dedupeRoutes(matched).slice(0, 6);
}

function matchClientForPage(calls, page) {
  const segments = page.route.split('/').filter(Boolean).map((s) => s.replace(/^:/, '').toLowerCase());
  return dedupeCalls(
    calls.filter((c) => {
      const apiSeg = c.path.split('/').filter(Boolean)[1]?.toLowerCase() ?? '';
      const fn = c.fn.toLowerCase();
      return segments.some((s) => apiSeg.includes(s) || fn.includes(s));
    })
  ).slice(0, 4);
}

function pathSharesSegment(path, segment) {
  return path.toLowerCase().includes(`/${segment.toLowerCase()}`);
}

export function collectJourneyTerms(steps, scan) {
  const terms = new Set(scan.terms);
  for (const s of steps) {
    for (const r of s.apiRoutes) {
      for (const p of r.path.split('/').filter(Boolean)) {
        if (!p.startsWith(':') && p !== 'api' && p.length > 2) {
          terms.add(titleCase(p.replace(/-/g, ' ')));
        }
      }
    }
    if (s.label) terms.add(s.label);
  }
  return [...terms];
}

export function dedupeRoutes(routes) {
  const seen = new Set();
  return routes.filter((r) => {
    const key = `${r.method}:${r.path}:${r.file}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildRouteInventory(webPages, apiRoutes) {
  const pageLines = rankPages(webPages).slice(0, 50).map((p) => `- \`${p.route}\` → \`${p.file}\` [likely]`);
  const apiLines = dedupeRoutes(apiRoutes)
    .slice(0, 80)
    .map((r) => `- \`${r.method} ${r.path}\` in \`${r.file}\` [likely]`);
  return { pageLines, apiLines };
}

export function suggestJourneyName(projectName, packages) {
  const raw = projectName || packages[0]?.name || 'CoreFlows';
  const short = raw.split('/').pop().replace(/[^\w]+/g, '');
  return short ? `${short}Flows` : 'CoreFlows';
}
