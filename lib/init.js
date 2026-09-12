import fs from 'node:fs';
import path from 'node:path';
import { applyJourneyPlaceholder, bootstrapProject } from './bootstrap.js';
import { draftDocumentation } from './draft.js';
import { scanProject } from './scan.js';
import { writeText } from './paths.js';

export async function runInit(projectRoot, options) {
  const {
    force = false,
    journeyName: journeyOverride = '',
    withGovernance = true,
    skipDraft = false,
  } = options;

  if (!fs.existsSync(path.join(projectRoot, 'package.json')) && !fs.existsSync(path.join(projectRoot, '.git'))) {
    throw new Error('Run this command inside your project folder (needs package.json or .git).');
  }

  if (fs.existsSync(path.join(projectRoot, '.docatlas.json')) && !force) {
    throw new Error('DocAtlas already set up. Use --force to re-run, or delete .docatlas.json.');
  }

  const scan = scanProject(projectRoot);
  const journeyName = journeyOverride || scan.journey;

  console.log('');
  console.log('  DocAtlas — Learn the project. Write it down. Keep it updated.');
  console.log('');
  console.log(`  Project: ${scan.projectName}`);
  console.log(`  Folder:  ${projectRoot}`);
  console.log('');

  console.log('  Step 1/2  Adding documentation files...');
  bootstrapProject(projectRoot, { force: true, withGovernance, journeyName });
  applyJourneyPlaceholder(projectRoot, journeyName);

  if (!skipDraft) {
    console.log('  Step 2/2  Drafting docs from README and code layout...');
    const drafted = draftDocumentation(projectRoot, scan, journeyName);
    console.log(`             Wrote ${drafted.length} doc files (marked [likely] where guessed).`);
  }

  patchAgents(projectRoot, journeyName);

  console.log('');
  console.log('  Done!');
  console.log('');
  console.log('  Open:  docs/START_HERE.md');
  console.log('  Check: docatlas drift');
  console.log('  Next:  Open in Cursor and ask to refine the main user flow:', journeyName);
  console.log('');

  return { journeyName, scan };
}

function patchAgents(projectRoot, journeyName) {
  const agentsPath = path.join(projectRoot, 'AGENTS.md');
  if (!fs.existsSync(agentsPath)) return;
  let content = fs.readFileSync(agentsPath, 'utf8');
  if (!content.includes('START_HERE.md')) {
    content = content.replace(
      '| `docs/ONBOARDING.md` | New developer setup guide |',
      '| `docs/START_HERE.md` | **Read first** — 2-minute orientation |\n| `docs/ONBOARDING.md` | New developer setup guide |'
    );
  }
  content = content.replace(
    '- Bootstrap: `docatlas bootstrap --journey-name "__JOURNEY_NAME__"`',
    '- Setup: `docatlas init`'
  );
  content = content.replaceAll('__JOURNEY_NAME__', journeyName);
  writeText(agentsPath, content);
}
