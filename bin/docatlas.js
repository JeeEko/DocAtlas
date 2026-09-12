#!/usr/bin/env node
import path from 'node:path';
import { checkDrift } from '../lib/drift.js';
import { runInit } from '../lib/init.js';
import { getToolkitRoot, readVersion } from '../lib/paths.js';
import { bootstrapProject, applyJourneyPlaceholder } from '../lib/bootstrap.js';
import { scanProject } from '../lib/scan.js';
import { draftDocumentation } from '../lib/draft.js';
import { runRefineCommand } from '../lib/refine-cli.js';
import { runMapContextsCommand } from '../lib/map-contexts-cli.js';
import { runUpdateCommand } from '../lib/update-command.js';
import { runDoctorCommand } from '../lib/doctor.js';
import { runInstallExplorerCommand } from '../lib/install-explorer.js';

const args = process.argv.slice(2);

function help() {
  console.log(`
DocAtlas — Learn the project. Write it down. Keep it updated.

USAGE
  docatlas init [options]     Add docs + auto-draft (start here)
  docatlas refine [options]   Trace main user flow in code (step 2)
  docatlas map-contexts       Detect business areas and scaffold context docs
  docatlas update             Analyze git diff and list docs needing refresh
  docatlas doctor             Verify DocAtlas kit and required docs
  docatlas install-explorer   Build and install DocAtlas Explorer VSIX
  docatlas drift [options]    Check for missing or placeholder docs
  docatlas version            Show version
  docatlas help               Show this message

INIT OPTIONS
  --journey-name <name>   Name for the main user flow (auto-detected if omitted)
  --force                 Re-run even if DocAtlas already exists
  --no-governance         Skip PR checklist and GOVERNANCE folder
  --scaffold-only         Copy templates only (no auto-draft)
  --taxonomy <tier>       standard (default) or enterprise doc tree

REFINE OPTIONS
  --journey-name <name>   Override journey name (default: from .docatlas.json)
  --min-coverage <pct>    Target trace coverage (default: 90)

MAP-CONTEXTS OPTIONS
  --force                 Overwrite existing context docs and CONTEXT-MAP.md

DRIFT OPTIONS
  --strict                Exit with error if issues found
  --semantic              Include route inventory and freshness checks

INSTALL (once per machine)
  npm install -g github:JeeEko/DocAtlas

EXAMPLES
  cd your-project
  docatlas init
  docatlas refine
  docatlas update           # after code changes — then docatlas-skill-update in Cursor
  /docatlas               # Cursor — full journey (init → refine → discovery → drift)
  docatlas drift

More: https://github.com/JeeEko/DocAtlas
`);
}

function parseFlags(argv) {
  const flags = {
    force: false,
    strict: false,
    semantic: false,
    withGovernance: true,
    skipDraft: false,
    journeyName: '',
    minCoverage: 90,
    taxonomy: 'standard',
    skipBuild: false,
  };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--force') flags.force = true;
    else if (a === '--strict') flags.strict = true;
    else if (a === '--no-governance') flags.withGovernance = false;
    else if (a === '--scaffold-only') flags.skipDraft = true;
    else if (a === '--journey-name') flags.journeyName = argv[++i] ?? '';
    else if (a === '--min-coverage') flags.minCoverage = Number(argv[++i] ?? 90);
    else if (a === '--semantic') flags.semantic = true;
    else if (a === '--taxonomy') flags.taxonomy = argv[++i] ?? 'standard';
    else if (a === '--skip-build') flags.skipBuild = true;
    else if (a.startsWith('-')) console.error(`Unknown option: ${a}`);
    else positional.push(a);
  }
  return { flags, positional };
}

async function main() {
  const cmd = args[0] ?? 'help';
  const rest = args.slice(1);
  const { flags, positional } = parseFlags(rest);
  const projectRoot = path.resolve(positional[0] ?? process.cwd());

  try {
    switch (cmd) {
      case 'init':
        await runInit(projectRoot, flags);
        break;
      case 'bootstrap': {
        const scan = scanProject(projectRoot);
        bootstrapProject(projectRoot, { ...flags, force: flags.force, journeyName: flags.journeyName || scan.journey });
        applyJourneyPlaceholder(projectRoot, flags.journeyName || scan.journey);
        if (!flags.skipDraft) draftDocumentation(projectRoot, scan, flags.journeyName || scan.journey);
        console.log('Bootstrap complete. Open doc-atlas/docs/START_HERE.md');
        break;
      }
      case 'refine':
        runRefineCommand(projectRoot, flags);
        break;
      case 'map-contexts':
        runMapContextsCommand(projectRoot, flags);
        break;
      case 'update':
        runUpdateCommand(projectRoot);
        break;
      case 'doctor': {
        const code = runDoctorCommand(projectRoot);
        process.exit(code);
        break;
      }
      case 'install-explorer': {
        runInstallExplorerCommand({ skipBuild: flags.skipBuild });
        break;
      }
      case 'drift': {
        const { issues, exitCode } = checkDrift(projectRoot, {
          strict: flags.strict,
          semantic: flags.semantic,
        });
        console.log(`[drift] checking ${projectRoot}`);
        if (!issues.length) console.log('[drift] no issues found');
        else {
          for (const i of issues) console.log(`[drift] ${i}`);
          console.log(`[drift] found ${issues.length} issue(s)`);
        }
        process.exit(exitCode);
        break;
      }
      case 'version':
      case '-v':
      case '--version':
        console.log(readVersion(getToolkitRoot()));
        break;
      case 'help':
      case '-h':
      case '--help':
        help();
        break;
      default:
        console.error(`Unknown command: ${cmd}\nRun docatlas help`);
        process.exit(1);
    }
  } catch (err) {
    console.error(`\n  Error: ${err.message}\n`);
    process.exit(1);
  }
}

main();
