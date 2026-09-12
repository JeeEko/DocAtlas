const ECOMMERCE_STEPS = [
  { id: 'catalog', label: 'Browse catalog', keywords: ['product', 'catalog'], prefer: ['app/page.tsx', '/page.tsx'] },
  { id: 'cart', label: 'Shopping cart', keywords: ['cart'] },
  { id: 'checkout', label: 'Checkout', keywords: ['checkout'] },
  { id: 'order', label: 'Order confirmation', keywords: ['order'] },
];

const AUTH_APP_STEPS = [
  { id: 'login', label: 'Sign in', keywords: ['login', 'signin', 'sign-in', 'auth'] },
  { id: 'register', label: 'Register', keywords: ['register', 'signup', 'sign-up'] },
  { id: 'dashboard', label: 'Dashboard / home', keywords: ['dashboard', 'home'], prefer: ['dashboard/page'] },
  { id: 'profile', label: 'Profile / settings', keywords: ['profile', 'settings', 'account'] },
];

const SKIP_PAGE_HINTS = [
  'layout.',
  'loading.',
  'error.',
  'not-found.',
  'template.',
  'global-error.',
  '_app.',
  'middleware.',
];

export function buildJourneySteps(webPages, apiRoutes, clientApi, journeyName) {
  const ecommerce = buildTemplateSteps(webPages, apiRoutes, clientApi, ECOMMERCE_STEPS);
  if (ecommerce.length >= 2) {
    return augmentWithDiscovery(ecommerce, webPages, apiRoutes, clientApi, 'ecommerce');
  }

  const authApp = buildTemplateSteps(webPages, apiRoutes, clientApi, AUTH_APP_STEPS);
  if (authApp.length >= 2) {
    return augmentWithDiscovery(authApp, webPages, apiRoutes, clientApi, 'auth-app');
  }

  const discovered = buildRouteDiscoverySteps(webPages, apiRoutes, clientApi, journeyName);
  return { steps: discovered, mode: 'discovery' };
}

function augmentWithDiscovery(baseSteps, webPages, apiRoutes, clientApi, mode) {
  const usedPages = new Set(baseSteps.map((s) => s.page).filter(Boolean));
  const usedApiKeys = new Set();
  for (const s of baseSteps) {
    for (const r of s.apiRoutes) {
      const parts = r.path.split('/').filter(Boolean);
      if (parts[1]) usedApiKeys.add(`/api/${parts[1]}`.toLowerCase());
    }
  }

  const extra = buildRouteDiscoverySteps(
    webPages.filter((p) => !usedPages.has(p.file)),
    apiRoutes,
    clientApi,
    'More',
    usedPages,
    usedApiKeys
  );

  const merged = [...baseSteps];
  for (const step of extra) {
    if (merged.length >= 12) break;
    const dup = merged.some(
      (s) => s.page === step.page || (s.label === step.label && s.page && step.page)
    );
    if (!dup) merged.push(step);
  }

  const totalRoutes = groupApiRoutes(apiRoutes).length + rankPages(webPages).length;
  const finalMode = merged.length > baseSteps.length && totalRoutes > baseSteps.length + 1
    ? `${mode}+discovery`
    : mode;

  return { steps: merged, mode: finalMode };
}

function buildTemplateSteps(webPages, apiRoutes, clientApi, template) {
  const steps = [];
  const usedPages = new Set();

  for (const flow of template) {
    const page = pickPage(webPages, flow, usedPages);
    if (page) usedPages.add(page.file);

    const relatedCalls = dedupeCalls(clientApi.filter((c) => stepMatchesClient(c, flow)));
    const relatedRoutes = dedupeRoutes(apiRoutes.filter((r) => stepMatchesApi(r, flow)));

    if (!page && !relatedCalls.length && !relatedRoutes.length) continue;

    steps.push(makeStep(flow.label, page, relatedCalls, relatedRoutes));
  }

  return steps;
}

function buildRouteDiscoverySteps(webPages, apiRoutes, clientApi, journeyName, usedPages = new Set(), usedApiKeys = new Set()) {
  const steps = [];

  const rankedPages = rankPages(webPages);
  for (const page of rankedPages) {
    if (steps.length >= 8) break;
    if (usedPages.has(page.file)) continue;
    usedPages.add(page.file);
    const label = labelFromPage(page);
    const relatedRoutes = matchApiForPage(apiRoutes, page, usedApiKeys);
    const relatedCalls = matchClientForPage(clientApi, page);
    steps.push(makeStep(label, page, relatedCalls, relatedRoutes));
  }

  for (const group of groupApiRoutes(apiRoutes)) {
    if (steps.length >= 12) break;
    if (usedApiKeys.has(group.key)) continue;
    if (steps.some((s) => s.apiRoutes.some((r) => r.path.startsWith(group.prefix)))) continue;
    usedApiKeys.add(group.key);
    steps.push({
      label: group.label,
      page: null,
      route: null,
      clientCalls: dedupeCalls(
        clientApi.filter((c) => c.path.startsWith(group.prefix) || c.path.includes(group.segment))
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
    confidence: page || relatedRoutes.length ? 'verified' : 'likely',
  };
}

function rankPages(pages) {
  return [...pages]
    .filter((p) => !SKIP_PAGE_HINTS.some((h) => p.file.toLowerCase().includes(h)))
    .sort((a, b) => scorePage(b) - scorePage(a));
}

function scorePage(page) {
  const hay = `${page.file} ${page.route}`.toLowerCase();
  let score = 0;
  if (page.route === '/' || page.route.endsWith('/page')) score += 5;
  for (const k of ['dashboard', 'home', 'login', 'admin', 'settings', 'profile', 'users', 'projects']) {
    if (hay.includes(k)) score += 4;
  }
  score -= hay.split('/').length;
  return score;
}

function labelFromPage(page) {
  const route = page.route === '/' ? 'Home' : page.route.split('/').filter(Boolean).pop() ?? 'Page';
  return titleCase(route.replace(/[[\]:]/g, ' ').replace(/-/g, ' '));
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
  return [...groups.values()].sort((a, b) => b.routes.length - a.routes.length);
}

function matchApiForPage(routes, page, usedApiKeys) {
  const hint = `${page.route} ${page.file}`.toLowerCase();
  const matched = routes.filter((r) => {
    const seg = r.path.split('/').filter(Boolean)[1] ?? '';
    return seg && (hint.includes(seg) || seg.includes(hint.split('/').pop() ?? ''));
  });
  for (const r of matched) {
    const parts = r.path.split('/').filter(Boolean);
    if (parts[1]) usedApiKeys.add(`/api/${parts[1]}`.toLowerCase());
  }
  return dedupeRoutes(matched).slice(0, 6);
}

function matchClientForPage(calls, page) {
  const hint = `${page.route} ${page.file}`.toLowerCase();
  return dedupeCalls(
    calls.filter((c) => {
      const seg = c.path.split('/').filter(Boolean)[1] ?? '';
      return hint.includes(seg) || c.fn.toLowerCase().includes(hint.split('/').pop() ?? 'zzz');
    })
  ).slice(0, 4);
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
  return bestScore > 0 ? best : null;
}

function stepMatchesApi(r, flow) {
  const p = r.path.toLowerCase();
  if (flow.id === 'catalog') return p.startsWith('/api/products') || p.includes('/product');
  if (flow.id === 'cart') return p.includes('/cart');
  if (flow.id === 'checkout') return p.includes('checkout');
  if (flow.id === 'order') return p.includes('/order');
  if (flow.id === 'login') return p.includes('/login') || p.includes('/auth') || p.includes('/signin');
  if (flow.id === 'register') return p.includes('/register') || p.includes('/signup');
  if (flow.id === 'dashboard') return p.includes('/dashboard') || p === '/api/me' || p.includes('/home');
  if (flow.id === 'profile') return p.includes('/profile') || p.includes('/settings') || p.includes('/account');
  return flow.keywords.some((k) => p.includes(k));
}

function stepMatchesClient(c, flow) {
  const fn = c.fn.toLowerCase();
  const p = c.path.toLowerCase();
  if (flow.id === 'catalog') return fn.includes('product') || p.includes('/product');
  if (flow.id === 'cart') return fn.includes('cart') || p.includes('/cart');
  if (flow.id === 'checkout') return fn.includes('checkout') || fn.includes('order');
  if (flow.id === 'order') return fn.includes('order') || p.includes('/order');
  if (flow.id === 'login') return fn.includes('login') || fn.includes('signin') || fn.includes('auth') || p.includes('/auth');
  if (flow.id === 'register') return fn.includes('register') || fn.includes('signup');
  if (flow.id === 'dashboard') return fn.includes('dashboard') || fn === 'getme' || p.includes('/me');
  if (flow.id === 'profile') return fn.includes('profile') || fn.includes('settings') || fn.includes('account');
  return flow.keywords.some((k) => fn.includes(k) || p.includes(k));
}

export function collectJourneyTerms(steps, scan) {
  const terms = new Set(scan.terms);
  for (const s of steps) {
    for (const r of s.apiRoutes) {
      const parts = r.path.split('/').filter(Boolean);
      for (const p of parts) {
        if (!p.startsWith(':') && p !== 'api' && p.length > 2) {
          terms.add(titleCase(p.replace(/-/g, ' ')));
        }
      }
    }
    if (s.label) terms.add(s.label.split('/')[0].trim());
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
  const pageLines = rankPages(webPages).slice(0, 40).map((p) => `- \`${p.route}\` → \`${p.file}\` [likely]`);
  const apiLines = dedupeRoutes(apiRoutes)
    .slice(0, 60)
    .map((r) => `- \`${r.method} ${r.path}\` in \`${r.file}\` [likely]`);
  return { pageLines, apiLines };
}
