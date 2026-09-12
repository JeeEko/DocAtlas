/**
 * Project-agnostic journey discovery with full route coverage.
 */

import { computeTraceCoverage, ensureMinimumCoverage } from './coverage.js';

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

export function buildJourneySteps(webPages, apiRoutes, clientApi, journeyName, options = {}) {
  const minCoverage = options.minCoverage ?? 90;
  let steps = discoverSteps(webPages, apiRoutes, clientApi, journeyName);
  const result = ensureMinimumCoverage(steps, webPages, apiRoutes, clientApi, minCoverage);
  return { steps: result.steps, mode: 'discovery', coverage: result.coverage };
}

function discoverSteps(webPages, apiRoutes, clientApi, journeyName) {
  const steps = [];
  const usedApiKeys = new Set();

  for (const group of groupPagesBySegment(rankPages(webPages))) {
    const relatedRoutes = [];
    for (const page of group.pages) {
      relatedRoutes.push(...matchApiForPage(apiRoutes, page, usedApiKeys));
    }
    const relatedCalls = dedupeCalls(
      group.pages.flatMap((page) => matchClientForPage(clientApi, page))
    );
    steps.push({
      label: group.label,
      page: group.pages[0]?.file ?? null,
      route: group.segment,
      pages: group.pages,
      clientCalls: relatedCalls.slice(0, 6),
      apiRoutes: dedupeRoutes(relatedRoutes).slice(0, 12),
      confidence: group.pages[0]?.confidence ?? 'likely',
    });
  }

  for (const group of groupApiRoutes(apiRoutes)) {
    if (usedApiKeys.has(group.key)) continue;
    if (steps.some((s) => s.apiRoutes.some((r) => r.path.startsWith(group.prefix)))) continue;
    usedApiKeys.add(group.key);
    steps.push({
      label: group.label,
      page: null,
      route: group.prefix,
      pages: [],
      clientCalls: dedupeCalls(
        clientApi.filter((c) => c.path.startsWith(group.prefix) || pathSharesSegment(c.path, group.segment))
      ).slice(0, 6),
      apiRoutes: dedupeRoutes(group.routes),
      confidence: 'verified',
    });
  }

  if (steps.length === 0) {
    steps.push({
      label: journeyName,
      page: webPages[0]?.file ?? null,
      route: webPages[0]?.route ?? null,
      pages: webPages.slice(0, 1),
      clientCalls: clientApi.slice(0, 6),
      apiRoutes: apiRoutes.slice(0, 12),
      confidence: 'likely',
    });
  }

  return steps;
}

function groupPagesBySegment(pages) {
  const groups = new Map();
  for (const page of pages) {
    const segment = page.route === '/' ? '/' : `/${page.route.split('/').filter(Boolean)[0] ?? 'app'}`;
    if (!groups.has(segment)) {
      groups.set(segment, { segment, label: labelFromSegment(segment), pages: [] });
    }
    groups.get(segment).pages.push(page);
  }
  return [...groups.values()].sort((a, b) => scoreSegment(a.segment) - scoreSegment(b.segment));
}

function scoreSegment(segment) {
  if (segment === '/') return 0;
  return segment.length;
}

function labelFromSegment(segment) {
  if (segment === '/') return 'Entry / home';
  const name = segment.split('/').filter(Boolean)[0] ?? 'app';
  return titleCase(name.replace(/[[\]:]/g, ' ').replace(/-/g, ' '));
}

function rankPages(pages) {
  return [...pages]
    .filter((p) => !SKIP_PAGE_HINTS.some((h) => p.file.toLowerCase().includes(h)))
    .sort((a, b) => scorePage(b) - scorePage(a) || a.route.localeCompare(b.route));
}

function scorePage(page) {
  let score = 0;
  const segments = page.route.split('/').filter(Boolean);
  if (page.route === '/') score += 100;
  score += Math.max(0, 40 - segments.length * 8);
  score -= (page.route.match(/:/g) ?? []).length * 12;
  if (page.confidence === 'verified') score += 15;
  return score;
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
  return matched;
}

function matchClientForPage(calls, page) {
  const segments = page.route.split('/').filter(Boolean).map((s) => s.replace(/^:/, '').toLowerCase());
  return calls.filter((c) => {
    const apiSeg = c.path.split('/').filter(Boolean)[1]?.toLowerCase() ?? '';
    const fn = c.fn.toLowerCase();
    return segments.some((s) => apiSeg.includes(s) || fn.includes(s));
  });
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
    const key = `${c.fn}:${c.path}:${c.file}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildRouteInventory(webPages, apiRoutes) {
  const pageLines = rankPages(webPages).map(
    (p) => `- \`${p.route}\` → \`${p.file}\` (${p.source ?? 'detected'}) [${p.confidence ?? 'likely'}]`
  );
  const apiLines = dedupeRoutes(apiRoutes).map(
    (r) => `- \`${r.method} ${r.path}\` in \`${r.file}\` (${r.source ?? 'detected'}) [${r.confidence ?? 'likely'}]`
  );
  return { pageLines, apiLines };
}

export function suggestJourneyName(projectName, packages) {
  const raw = projectName || packages[0]?.name || 'CoreFlows';
  const short = raw.split('/').pop().replace(/[^\w]+/g, '');
  return short ? `${short}Flows` : 'CoreFlows';
}

export { computeTraceCoverage };
