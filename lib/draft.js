import fs from 'node:fs';
import path from 'node:path';
import { getLayout } from './layout.js';
import { writeText } from './paths.js';

export function draftDocumentation(projectRoot, scan, journeyName) {
  const name = journeyName || scan.journey;
  const files = [];

  files.push(writeArchitecture(projectRoot, scan, name));
  files.push(writeOnboarding(projectRoot, scan, name));
  files.push(writeRunbook(projectRoot, scan, name));
  files.push(writeGlossary(projectRoot, scan, name));
  files.push(writeStartHere(projectRoot, scan, name));

  updateDocAtlasJson(projectRoot, name);
  return files;
}

function writeArchitecture(projectRoot, scan, name) {
  const layout = getLayout(projectRoot);
  const rel = layout.docRel('ARCHITECTURE.md');
  const components = scan.packages.map((p) => {
    const relDir = path.relative(projectRoot, p.dir).replace(/\\/g, '/') || '.';
    const desc = p.pkg?.description ?? inferPackageRole(p.name, p.pkg);
    return `| ${p.name} | \`${relDir}/\` | ${desc} [likely] |`;
  });

  if (components.length === 0) {
    for (const dir of scan.topDirs.slice(0, 12)) {
      components.push(`| ${dir} | \`${dir}/\` | Top-level package or module [likely] |`);
    }
  }

  const routeLines = scan.routes.slice(0, 30).map((r) => `- \`${r.path}\` (${r.type}) [likely]`);

  const content = `# Architecture

**Project:** ${name}

${scan.description} [likely]

> Auto-drafted by DocAtlas from README and code layout. Upgrade \`[likely]\` to \`[verified]\` after you confirm.

## Overview [likely]

${scan.description}

**Stack:** ${scan.stack.join(', ')}

## Components [likely]

| Component | Location | Responsibility |
|-----------|----------|----------------|
${components.join('\n')}

## Entry points [likely]

${routeLines.length ? routeLines.join('\n') : '- TODO: add routes after deeper review [uncertain]'}

## Data flow [likely]

Primary user flows: run \`docatlas refine\` to trace pages and API routes from the codebase.

## Related docs

- [Start here](START_HERE.md)
- [Onboarding](ONBOARDING.md)
- [Runbook](RUNBOOK.md)
- [Glossary](GLOSSARY.md)
`;

  writeText(layout.docAbs('ARCHITECTURE.md'), content);
  return rel;
}

function writeOnboarding(projectRoot, scan, name) {
  const layout = getLayout(projectRoot);
  const rel = layout.docRel('ONBOARDING.md');
  const setupBlock = scan.quickStart.length
    ? scan.quickStart.map((b) => '```bash\n' + b + '\n```').join('\n\n')
    : '```bash\n# See README.md for setup steps\n```';

  const projectLayout = scan.packages.length
    ? scan.packages.map((p) => {
        const relDir = path.relative(projectRoot, p.dir).replace(/\\/g, '/') || '.';
        return `| \`${relDir}/\` | ${p.pkg?.description ?? p.name} [likely] |`;
      })
    : scan.topDirs.slice(0, 10).map((d) => `| \`${d}/\` | Project folder [likely] |`);

  const engines = scan.rootPkg?.engines?.node ? `- Node.js ${scan.rootPkg.engines.node}` : '- Node.js (see package.json engines)';

  const content = `# Onboarding

**Project:** ${name}

Welcome! This guide was **auto-drafted** by DocAtlas from your repo. Skim it, run the commands, fix anything wrong.

## What is this? [likely]

${scan.description}

## Prerequisites [likely]

${engines}
- npm (or pnpm/yarn if the project uses them)

## Setup [likely]

${setupBlock}

## Project layout [likely]

| Path | Purpose |
|------|---------|
${projectLayout.join('\n')}
| \`doc-atlas/\` | Documentation (DocAtlas) |

## Next steps

1. Read [START_HERE.md](START_HERE.md)
2. Run the app locally and mark steps \`[verified]\` in [RUNBOOK.md](RUNBOOK.md)
3. In Cursor: ask to refine docs using \`.cursor/skills/docatlas-discovery/SKILL.md\`

## Related docs

- [Architecture](ARCHITECTURE.md)
- [Runbook](RUNBOOK.md)
`;

  writeText(layout.docAbs('ONBOARDING.md'), content);
  return rel;
}

function writeRunbook(projectRoot, scan, name) {
  const layout = getLayout(projectRoot);
  const rel = layout.docRel('RUNBOOK.md');
  const scripts = scan.rootPkg?.scripts ?? {};
  const lines = [];
  for (const key of ['dev', 'start', 'build', 'test', 'db:seed']) {
    if (scripts[key]) lines.push(`npm run ${key}  # ${scripts[key]}`);
  }
  const scriptBlock = lines.length ? '```bash\n' + lines.join('\n') + '\n```' : scan.quickStart[0] ? '```bash\n' + scan.quickStart[0] + '\n```' : '```bash\n# No scripts detected — see README.md\n```';

  const content = `# Runbook

**Project:** ${name}

Commands to run and troubleshoot. Auto-drafted from package.json [likely] — run each command and mark verified.

## Local development [likely]

${scriptBlock}

## Build [likely]

${scripts.build ? '```bash\nnpm run build\n```' : 'Not detected in root package.json [uncertain]'}

## Test [likely]

${scripts.test ? '```bash\nnpm test\n```' : 'Not detected in root package.json [uncertain]'}

## Drift check

After editing docs:

\`\`\`bash
docatlas drift
\`\`\`

## Related docs

- [Onboarding](ONBOARDING.md)
- [Architecture](ARCHITECTURE.md)
`;

  writeText(layout.docAbs('RUNBOOK.md'), content);
  return rel;
}

function writeGlossary(projectRoot, scan, name) {
  const layout = getLayout(projectRoot);
  const rel = layout.docRel('GLOSSARY.md');
  const rows = scan.terms.map((t) => {
    if (t === 'DocAtlas') return '| DocAtlas | Documentation toolkit — https://github.com/JeeEko/DocAtlas |';
    return `| ${t} | Domain or module term detected in repo layout [likely] |`;
  });

  const content = `# Glossary

**Project:** ${name}

| Term | Definition |
|------|------------|
${rows.join('\n')}

> Add precise definitions as you learn the domain. Replace \`[likely]\` with \`[verified]\` when confirmed.
`;

  writeText(layout.docAbs('GLOSSARY.md'), content);
  return rel;
}

function writeStartHere(projectRoot, scan, name) {
  const layout = getLayout(projectRoot);
  const rel = layout.docRel('START_HERE.md');
  const content = `# Start here

**Project:** ${name}

Read this first (2 minutes).

## What it does [likely]

${scan.description}

## Run it [likely]

${scan.quickStart[0] ? '```bash\n' + scan.quickStart.slice(0, 3).join('\n\n') + '\n```' : 'See [ONBOARDING.md](ONBOARDING.md)'}

## Main docs

| File | Why |
|------|-----|
| [ONBOARDING.md](ONBOARDING.md) | Setup and layout |
| [ARCHITECTURE.md](ARCHITECTURE.md) | How code is organized |
| [RUNBOOK.md](RUNBOOK.md) | Commands |
| [GLOSSARY.md](GLOSSARY.md) | Terms |

## Suggested user flow to document next

**${scan.journey}** — ask Cursor to trace this flow through the code and add file paths.

## For AI agents

Read this file first, then \`doc-atlas/AGENTS.md\`.
`;

  writeText(layout.docAbs('START_HERE.md'), content);
  return rel;
}

function updateDocAtlasJson(projectRoot, journeyName) {
  const layout = getLayout(projectRoot);
  const filePath = layout.metaAbs;
  if (!fs.existsSync(filePath)) return;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.journeyName = journeyName;
  data.draftedAt = new Date().toISOString();
  data.draftSource = 'docatlas init (auto-scan)';
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function inferPackageRole(name, pkg) {
  const n = name.toLowerCase();
  if (n.includes('web') || pkg?.dependencies?.next) return 'Web / UI';
  if (n.includes('api') || pkg?.dependencies?.hono) return 'HTTP API';
  if (n.includes('mcp')) return 'MCP integration';
  return 'Application module';
}
