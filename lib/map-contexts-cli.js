import { mapBusinessContexts } from './business-contexts.js';
import { isDocAtlasInitialized } from './layout.js';

export function runMapContextsCommand(projectRoot, options = {}) {
  if (!isDocAtlasInitialized(projectRoot)) {
    throw new Error('Run docatlas init first.');
  }

  console.log('');
  console.log('  DocAtlas map-contexts — detecting business areas...');
  console.log('');

  const result = mapBusinessContexts(projectRoot, options);

  console.log(`  Contexts:  ${result.count}`);
  for (const ctx of result.contexts) {
    console.log(`    • ${ctx.label} (${ctx.slug}) [${ctx.confidence}]`);
    console.log(`      doc-atlas/${ctx.doc}`);
  }

  console.log('');
  console.log('  Wrote:     doc-atlas/docs/business/CONTEXT-MAP.md');
  console.log('  Next:      /docatlas (discovery phase fills each context doc)');
  console.log('');
}
