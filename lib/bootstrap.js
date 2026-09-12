import fs from 'node:fs';
import path from 'node:path';
import { copyDir, copyFile, ensureDir, getToolkitRoot, readVersion, writeText } from './paths.js';

export function bootstrapProject(projectRoot, options = {}) {
  const {
    force = false,
    minimal = false,
    withGovernance = true,
    journeyName = '',
  } = options;

  const toolkitRoot = getToolkitRoot();
  const templatesDir = path.join(toolkitRoot, 'templates');
  const logs = [];

  const copy = (src, dest) => {
    const result = copyFile(src, dest, { force });
    if (result.copied) logs.push(`created ${path.relative(projectRoot, dest)}`);
    return result;
  };

  copy(path.join(templatesDir, 'AGENTS.md'), path.join(projectRoot, 'AGENTS.md'));
  writeDocAtlasJson(projectRoot, { journeyName, force, toolkitRoot });

  if (minimal) {
    return { logs, toolkitRoot };
  }

  copy(path.join(templatesDir, 'docs/ARCHITECTURE.md'), path.join(projectRoot, 'docs/ARCHITECTURE.md'));
  copy(path.join(templatesDir, 'docs/ONBOARDING.md'), path.join(projectRoot, 'docs/ONBOARDING.md'));
  copy(path.join(templatesDir, 'docs/RUNBOOK.md'), path.join(projectRoot, 'docs/RUNBOOK.md'));
  copy(path.join(templatesDir, 'docs/GLOSSARY.md'), path.join(projectRoot, 'docs/GLOSSARY.md'));

  copy(path.join(templatesDir, '.cursor/rules/docatlas-core.mdc'), path.join(projectRoot, '.cursor/rules/docatlas-core.mdc'));
  copy(path.join(templatesDir, '.cursor/rules/docatlas-docs.mdc'), path.join(projectRoot, '.cursor/rules/docatlas-docs.mdc'));
  copy(
    path.join(templatesDir, '.cursor/skills/docatlas-discovery/SKILL.md'),
    path.join(projectRoot, '.cursor/skills/docatlas-discovery/SKILL.md')
  );

  const cursorSkills = ['docatlas-init', 'docatlas-refine', 'docatlas-drift'];
  for (const skill of cursorSkills) {
    copy(
      path.join(templatesDir, '.cursor/skills', skill, 'SKILL.md'),
      path.join(projectRoot, '.cursor/skills', skill, 'SKILL.md')
    );
  }

  const commandsDir = path.join(templatesDir, '.cursor/commands');
  if (fs.existsSync(commandsDir)) {
    for (const name of fs.readdirSync(commandsDir)) {
      if (name.startsWith('docatlas-') && name.endsWith('.md')) {
        copy(path.join(commandsDir, name), path.join(projectRoot, '.cursor/commands', name));
      }
    }
  }

  copy(
    path.join(templatesDir, '.github/pull_request_template.md'),
    path.join(projectRoot, '.github/pull_request_template.md')
  );
  copy(
    path.join(templatesDir, '.github/workflows/docatlas-drift-report.yml'),
    path.join(projectRoot, '.github/workflows/docatlas-drift-report.yml')
  );

  if (withGovernance) {
    const govSrc = path.join(toolkitRoot, 'GOVERNANCE');
    const govDest = path.join(projectRoot, 'GOVERNANCE');
    ensureDir(govDest);
    for (const name of fs.readdirSync(govSrc)) {
      copy(path.join(govSrc, name), path.join(govDest, name));
    }
  }

  return { logs, toolkitRoot };
}

function writeDocAtlasJson(projectRoot, { journeyName, force, toolkitRoot }) {
  const dest = path.join(projectRoot, '.docatlas.json');
  if (fs.existsSync(dest) && !force) return;
  const name = journeyName || path.basename(projectRoot);
  const version = readVersion(toolkitRoot);
  writeText(
    dest,
    `${JSON.stringify(
      {
        toolkitVersion: version,
        journeyName: name,
        bootstrappedAt: new Date().toISOString(),
        draftedAt: null,
        repository: 'https://github.com/JeeEko/DocAtlas',
      },
      null,
      2
    )}\n`
  );
}

export function applyJourneyPlaceholder(projectRoot, journeyName) {
  if (!journeyName) return;
  const files = [
    'AGENTS.md',
    'docs/ARCHITECTURE.md',
    'docs/ONBOARDING.md',
    'docs/RUNBOOK.md',
    'docs/GLOSSARY.md',
  ];
  for (const rel of files) {
    const filePath = path.join(projectRoot, rel);
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replaceAll('__JOURNEY_NAME__', journeyName);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}
