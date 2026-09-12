import fs from 'node:fs';
import path from 'node:path';
import { readBusinessContexts } from './business-contexts.js';
import { getLayout } from './layout.js';
import { readJson, writeText } from './paths.js';

function routeOverlap(ctxEvidence, routePath) {
  const seg = routePath.toLowerCase();
  return (ctxEvidence ?? []).some((e) => {
    const norm = String(e).toLowerCase();
    return seg.includes(norm.replace(/^api prefix /, '').trim()) || norm.includes(seg);
  });
}

export function linkContextsToJourneys(projectRoot, journeyName, apiRoutes = []) {
  const layout = getLayout(projectRoot);
  const meta = readJson(layout.metaAbs);
  if (!meta?.businessContexts?.length) return meta?.businessContexts ?? [];

  const journeySlug = journeyName.replace(/[^\w]+/g, '');
  const journeyKey = `JOURNEY-${journeySlug}`;

  for (const ctx of meta.businessContexts) {
    const journeys = new Set(ctx.journeys ?? []);
    const routes = new Set(ctx.routes ?? []);

    for (const route of apiRoutes) {
      if (routeOverlap(ctx.evidence, route.path)) {
        journeys.add(journeyKey);
        routes.add(route.path);
      }
    }

    ctx.journeys = [...journeys];
    ctx.routes = [...routes].slice(0, 20);
  }

  writeText(layout.metaAbs, `${JSON.stringify(meta, null, 2)}\n`);
  return meta.businessContexts;
}

export function appendJourneyLinkToContext(layout, ctxSlug, journeyRel) {
  const ctxPath = layout.docAbs(`business/contexts/${ctxSlug}.md`);
  if (!fs.existsSync(ctxPath)) return;
  let content = fs.readFileSync(ctxPath, 'utf8');
  if (content.includes(journeyRel)) return;
  if (/## Related journeys/.test(content)) {
    content = content.replace(
      /(## Related journeys[^\n]*\n\n)([\s\S]*?)(\n## Related technical|$)/,
      `$1- [${path.basename(journeyRel)}](../../${journeyRel.replace(/^doc-atlas\/docs\//, '')})\n$3`
    );
  }
  writeText(ctxPath, content);
}
