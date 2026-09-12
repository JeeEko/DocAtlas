import fs from 'node:fs';
import path from 'node:path';
import { getLayout, isDocAtlasInitialized } from './layout.js';
import { readBusinessContexts } from './business-contexts.js';

export function checkDrift(projectRoot, { strict = false } = {}) {
  const issues = [];
  const layout = getLayout(projectRoot);

  if (!isDocAtlasInitialized(projectRoot) && !fs.existsSync(path.join(projectRoot, 'AGENTS.md'))) {
    return { issues: ['No DocAtlas setup found — run docatlas init first'], exitCode: 1 };
  }

  const required = [
    layout.agentsRel,
    layout.metaRel,
    layout.docRel('ARCHITECTURE.md'),
    layout.docRel('BUSINESS.md'),
    layout.docRel('business/CONTEXT-MAP.md'),
    layout.docRel('ONBOARDING.md'),
    layout.docRel('RUNBOOK.md'),
    layout.docRel('GLOSSARY.md'),
  ];

  for (const rel of required) {
    if (!fs.existsSync(path.join(projectRoot, rel))) {
      issues.push(`missing required file: ${rel}`);
    }
  }

  checkBusinessContextDocs(projectRoot, layout, issues);

  if (fs.existsSync(layout.docsDirAbs)) {
    for (const file of walkMd(layout.docsDirAbs)) {
      const base = path.basename(file);
      if (base.startsWith('_')) continue;
      const content = fs.readFileSync(file, 'utf8');
      if (/TODO|TBD|__JOURNEY_NAME__|FILL_IN|PLACEHOLDER/.test(content)) {
        issues.push(`unresolved placeholder in ${path.relative(projectRoot, file).replace(/\\/g, '/')}`);
      }
    }
  }

  if (fs.existsSync(layout.agentsAbs)) {
    const agents = fs.readFileSync(layout.agentsAbs, 'utf8');
    if (/TODO|__JOURNEY_NAME__/.test(agents)) {
      issues.push(`unresolved placeholder in ${layout.agentsRel}`);
    }
  }

  return { issues, exitCode: strict && issues.length ? 1 : 0 };
}

function checkBusinessContextDocs(projectRoot, layout, issues) {
  if (!fs.existsSync(layout.metaAbs)) return;

  const contexts = readBusinessContexts(layout);
  if (!contexts.length) {
    issues.push('no business contexts mapped — run docatlas map-contexts');
    return;
  }

  for (const ctx of contexts) {
    const docRel =
      ctx.doc?.startsWith('docs/') ? layout.docRel(ctx.doc.slice('docs/'.length)) : layout.docRel(`business/contexts/${ctx.slug}.md`);
    const abs = path.join(projectRoot, docRel);
    if (!fs.existsSync(abs)) {
      issues.push(`missing business context doc: ${docRel} (${ctx.label ?? ctx.slug})`);
    }
  }
}

function walkMd(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMd(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}
