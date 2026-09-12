import fs from 'node:fs';
import path from 'node:path';
import { DOC_ATLAS_DIR, ensureRootAgentsPointer, getLayout } from './layout.js';
import { copyFile, copyDir, ensureDir, getToolkitRoot, readVersion, writeText } from './paths.js';

export function bootstrapProject(projectRoot, options = {}) {
  const {
    force = false,
    minimal = false,
    withGovernance = true,
    journeyName = '',
  } = options;

  const toolkitRoot = getToolkitRoot();
  const templatesDir = path.join(toolkitRoot, 'templates');
  const docAtlasRoot = path.join(projectRoot, DOC_ATLAS_DIR);
  const logs = [];

  const copy = (src, dest) => {
    const result = copyFile(src, dest, { force });
    if (result.copied) logs.push(`created ${path.relative(projectRoot, dest)}`);
    return result;
  };

  ensureDir(docAtlasRoot);
  copy(path.join(templatesDir, 'AGENTS.md'), path.join(docAtlasRoot, 'AGENTS.md'));
  writeDocAtlasJson(projectRoot, { journeyName, force, toolkitRoot });
  ensureRootAgentsPointer(projectRoot);

  if (minimal) {
    return { logs, toolkitRoot };
  }

  copy(path.join(templatesDir, 'docs/ARCHITECTURE.md'), path.join(docAtlasRoot, 'docs/ARCHITECTURE.md'));
  copy(path.join(templatesDir, 'docs/BUSINESS.md'), path.join(docAtlasRoot, 'docs/BUSINESS.md'));
  copyDir(path.join(templatesDir, 'docs/business'), path.join(docAtlasRoot, 'docs/business'));
  copy(path.join(templatesDir, 'docs/ONBOARDING.md'), path.join(docAtlasRoot, 'docs/ONBOARDING.md'));
  copy(path.join(templatesDir, 'docs/RUNBOOK.md'), path.join(docAtlasRoot, 'docs/RUNBOOK.md'));
  copy(path.join(templatesDir, 'docs/GLOSSARY.md'), path.join(docAtlasRoot, 'docs/GLOSSARY.md'));

  copy(path.join(templatesDir, '.cursor/rules/docatlas-core.mdc'), path.join(projectRoot, '.cursor/rules/docatlas-core.mdc'));
  copy(path.join(templatesDir, '.cursor/rules/docatlas-docs.mdc'), path.join(projectRoot, '.cursor/rules/docatlas-docs.mdc'));

  copy(path.join(templatesDir, '.cursor/commands/docatlas.md'), path.join(projectRoot, '.cursor/commands/docatlas.md'));

  const skillsDir = path.join(templatesDir, '.cursor/skills');
  if (fs.existsSync(skillsDir)) {
    for (const name of fs.readdirSync(skillsDir)) {
      if (!name.startsWith('docatlas-skill-')) continue;
      const srcSkill = path.join(skillsDir, name, 'SKILL.md');
      if (fs.existsSync(srcSkill)) {
        copy(srcSkill, path.join(projectRoot, '.cursor/skills', name, 'SKILL.md'));
      }
    }
  }

  const prTemplate = path.join(projectRoot, '.github/pull_request_template.md');
  if (!fs.existsSync(prTemplate) || force) {
    copy(
      path.join(templatesDir, '.github/pull_request_template.md'),
      prTemplate
    );
  }
  copy(
    path.join(templatesDir, '.github/workflows/docatlas-drift-report.yml'),
    path.join(projectRoot, '.github/workflows/docatlas-drift-report.yml')
  );

  if (withGovernance) {
    const govSrc = path.join(toolkitRoot, 'GOVERNANCE');
    const govDest = path.join(docAtlasRoot, 'GOVERNANCE');
    ensureDir(govDest);
    for (const name of fs.readdirSync(govSrc)) {
      copy(path.join(govSrc, name), path.join(govDest, name));
    }
  }

  return { logs, toolkitRoot };
}

function writeDocAtlasJson(projectRoot, { journeyName, force, toolkitRoot }) {
  const layout = getLayout(projectRoot);
  const dest = layout.metaAbs;
  if (fs.existsSync(dest) && !force) return;
  const name = journeyName || path.basename(projectRoot);
  const version = readVersion(toolkitRoot);
  writeText(
    dest,
    `${JSON.stringify(
      {
        toolkitVersion: version,
        layout: 'nested',
        docAtlasDir: DOC_ATLAS_DIR,
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
  const layout = getLayout(projectRoot);
  const files = [
    layout.agentsAbs,
    layout.docAbs('ARCHITECTURE.md'),
    layout.docAbs('BUSINESS.md'),
    layout.docAbs('ONBOARDING.md'),
    layout.docAbs('RUNBOOK.md'),
    layout.docAbs('GLOSSARY.md'),
  ];
  for (const filePath of files) {
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replaceAll('__JOURNEY_NAME__', journeyName);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}
