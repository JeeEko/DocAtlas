export function computeTraceCoverage(webPages, apiRoutes, steps) {
  const allPageKeys = new Set(webPages.map((p) => p.file));
  const allApiKeys = new Set(apiRoutes.map((r) => `${r.method}:${r.path}`));

  const coveredPages = new Set();
  const coveredApi = new Set();

  for (const step of steps) {
    if (step.page) coveredPages.add(step.page);
    if (step.pages) {
      for (const p of step.pages) coveredPages.add(p.file);
    }
    for (const r of step.apiRoutes) {
      coveredApi.add(`${r.method}:${r.path}`);
    }
  }

  const uncoveredPages = webPages.filter((p) => !coveredPages.has(p.file));
  const uncoveredApi = apiRoutes.filter((r) => !coveredApi.has(`${r.method}:${r.path}`));

  const total = allPageKeys.size + allApiKeys.size;
  const covered = coveredPages.size + coveredApi.size;
  const overall = total ? (covered / total) * 100 : 100;
  const pagePct = allPageKeys.size ? (coveredPages.size / allPageKeys.size) * 100 : 100;
  const apiPct = allApiKeys.size ? (coveredApi.size / allApiKeys.size) * 100 : 100;

  return {
    overall: Math.round(overall * 10) / 10,
    pagePct: Math.round(pagePct * 10) / 10,
    apiPct: Math.round(apiPct * 10) / 10,
    totalPages: allPageKeys.size,
    totalApi: allApiKeys.size,
    coveredPages: coveredPages.size,
    coveredApi: coveredApi.size,
    uncoveredPages,
    uncoveredApi,
  };
}

export function ensureMinimumCoverage(steps, webPages, apiRoutes, clientApi, minPct = 90) {
  let coverage = computeTraceCoverage(webPages, apiRoutes, steps);
  if (coverage.overall >= minPct || (coverage.totalPages + coverage.totalApi === 0)) {
    return { steps, coverage };
  }

  const augmented = [...steps];

  for (const page of coverage.uncoveredPages) {
    augmented.push({
      label: labelFromRoute(page.route),
      page: page.file,
      route: page.route,
      pages: [page],
      clientCalls: [],
      apiRoutes: [],
      confidence: page.confidence ?? 'likely',
    });
  }

  for (const route of coverage.uncoveredApi) {
    const prefix = route.path.split('/').filter(Boolean).slice(0, 2).join('/');
    let step = augmented.find((s) => s.label === labelFromRoute(`/${prefix}`) || s.route === `/${prefix}`);
    if (step) {
      step.apiRoutes.push(route);
      continue;
    }
    augmented.push({
      label: labelFromRoute(route.path),
      page: null,
      route: route.path,
      pages: [],
      clientCalls: [],
      apiRoutes: [route],
      confidence: route.confidence ?? 'verified',
    });
  }

  coverage = computeTraceCoverage(webPages, apiRoutes, augmented);
  return { steps: augmented, coverage };
}

function labelFromRoute(route) {
  if (route === '/') return 'Entry / home';
  const segment = route.split('/').filter(Boolean).pop() ?? 'route';
  return segment.replace(/[[\]:]/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
