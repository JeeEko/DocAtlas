import fs from 'node:fs';
import path from 'node:path';

export function checkDrift(projectRoot, { strict = false } = {}) {
  const issues = [];

  if (!fs.existsSync(path.join(projectRoot, '.docatlas.json')) && !fs.existsSync(path.join(projectRoot, 'AGENTS.md'))) {
    return { issues: ['No DocAtlas setup found — run docatlas init first'], exitCode: 1 };
  }

  const required = [
    'AGENTS.md',
    '.docatlas.json',
    'docs/ARCHITECTURE.md',
    'docs/ONBOARDING.md',
    'docs/RUNBOOK.md',
    'docs/GLOSSARY.md',
  ];

  for (const rel of required) {
    if (!fs.existsSync(path.join(projectRoot, rel))) {
      issues.push(`missing required file: ${rel}`);
    }
  }

  const docsDir = path.join(projectRoot, 'docs');
  if (fs.existsSync(docsDir)) {
    for (const file of walkMd(docsDir)) {
      const content = fs.readFileSync(file, 'utf8');
      if (/TODO|TBD|__JOURNEY_NAME__|FILL_IN|PLACEHOLDER/.test(content)) {
        issues.push(`unresolved placeholder in ${path.relative(projectRoot, file).replace(/\\/g, '/')}`);
      }
    }
  }

  if (fs.existsSync(path.join(projectRoot, 'AGENTS.md'))) {
    const agents = fs.readFileSync(path.join(projectRoot, 'AGENTS.md'), 'utf8');
    if (/TODO|__JOURNEY_NAME__/.test(agents)) {
      issues.push('unresolved placeholder in AGENTS.md');
    }
  }

  const exitCode = issues.length && strict ? 1 : issues.length ? 0 : 0;
  return { issues, exitCode: strict && issues.length ? 1 : 0 };
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
