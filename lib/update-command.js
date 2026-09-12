import { isDocAtlasInitialized } from './layout.js';
import { analyzeUpdate } from './update-cli.js';

export function runUpdateCommand(projectRoot) {
  if (!isDocAtlasInitialized(projectRoot)) {
    throw new Error('Run docatlas init first.');
  }

  const result = analyzeUpdate(projectRoot);

  console.log('');
  console.log('  DocAtlas update — incremental refresh analysis');
  console.log('');

  if (result.freshness.commit) {
    console.log(`  Baseline:  ${result.freshness.commit.slice(0, 7)} (${result.freshness.at ?? '—'})`);
  } else {
    console.log('  Baseline:  never analyzed — run /docatlas discovery first');
  }

  console.log(`  Stale:     ${result.stale.stale ? 'yes' : 'no'} — ${result.stale.reason}`);
  if (result.stale.distance != null && result.stale.distance > 0) {
    console.log(`  Commits:   ${result.stale.distance} since last analysis`);
  }

  console.log(`  Changed:   ${result.diff.files.length} file(s) since baseline`);

  if (result.skipReason) {
    console.log('');
    console.log(`  Skip:      ${result.skipReason}`);
    console.log('  Action:    no doc update required');
  } else {
    console.log('');
    console.log('  Impact:    architecture-relevant changes detected');
    console.log('  Docs to refresh:');
    for (const doc of result.impactedDocs) {
      console.log(`    • ${doc}`);
    }
    console.log('');
    console.log('  Next:      invoke docatlas-skill-update in Cursor');
    console.log('             (or /docatlas if discovery never completed)');
  }

  console.log('');
  return result;
}
