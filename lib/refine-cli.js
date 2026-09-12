import { isDocAtlasInitialized } from './layout.js';
import { runRefine } from './refine.js';

export function runRefineCommand(projectRoot, options = {}) {
  if (!isDocAtlasInitialized(projectRoot)) {
    throw new Error('Run docatlas init first.');
  }

  console.log('');
  console.log('  DocAtlas refine — tracing routes with framework parsers...');
  console.log('');

  const result = runRefine(projectRoot, options);

  console.log(`  Journey:   ${options.journeyName || 'from doc-atlas/.docatlas.json'}`);
  console.log(`  Wrote:     ${result.journeyRel}`);
  console.log(`  Detected:  ${result.pagesFound} pages, ${result.apiFound} API routes`);
  console.log(`  Steps:     ${result.steps} (${result.mode})`);
  console.log(`  Coverage:  ${result.coverage.overall}% (pages ${result.coverage.pagePct}%, API ${result.coverage.apiPct}%)`);

  if (result.coverage.overall < 90) {
    console.log('');
    console.log('  ⚠ Coverage below 90%. Check ARCHITECTURE route inventory for gaps.');
    console.log('     Open an issue at https://github.com/JeeEko/DocAtlas if your stack is unsupported.');
  }

  console.log('');
  console.log('  Next:  /docatlas  (discovery — validate context map and fill docs)');
  console.log('');
}
