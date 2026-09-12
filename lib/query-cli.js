import { isDocAtlasInitialized } from './layout.js';
import {
  formatSearchResults,
  getAiContextContent,
  getBusinessContextContent,
  getJourneyContent,
  queryContextShortcut,
  rankChunks,
} from './search.js';

export function runQueryCommand(projectRoot, query, options = {}) {
  if (!isDocAtlasInitialized(projectRoot)) {
    console.error('\n  Error: DocAtlas not initialized — run: docatlas init\n');
    return 1;
  }

  const limit = options.limit ?? 5;
  const json = options.json ?? false;

  if (options.contextTopic) {
    const out = queryContextShortcut(projectRoot, options.contextTopic);
    if (json) console.log(JSON.stringify({ topic: options.contextTopic, content: out }, null, 2));
    else console.log(out);
    return 0;
  }

  if (options.aiContext) {
    const content = getAiContextContent(projectRoot);
    if (!content) {
      console.error('\n  Error: AI_CONTEXT.md not found\n');
      return 1;
    }
    if (json) console.log(JSON.stringify({ path: 'doc-atlas/docs/AI_CONTEXT.md', content }, null, 2));
    else console.log(content);
    return 0;
  }

  if (options.businessSlug) {
    const result = getBusinessContextContent(projectRoot, options.businessSlug);
    if (!result) {
      console.error(`\n  Error: business context not found: ${options.businessSlug}\n`);
      return 1;
    }
    if (json) console.log(JSON.stringify(result, null, 2));
    else console.log(`# ${result.path}\n\n${result.content}`);
    return 0;
  }

  if (options.journey) {
    const journeys = getJourneyContent(projectRoot, options.journey);
    if (!journeys.length) {
      console.error(`\n  Error: no journey matching: ${options.journey}\n`);
      return 1;
    }
    if (json) console.log(JSON.stringify(journeys, null, 2));
    else {
      for (const j of journeys) console.log(`# ${j.path}\n\n${j.content}\n`);
    }
    return 0;
  }

  if (!query?.trim()) {
    console.error('\n  Usage: docatlas query "<question>" [--limit N] [--json]\n');
    return 1;
  }

  const results = rankChunks(projectRoot, query, { limit });
  if (json) {
    console.log(JSON.stringify({ query, results }, null, 2));
  } else {
    console.log('');
    console.log(`  DocAtlas query — "${query}"`);
    console.log('');
    if (!results.length) console.log('  No matching documentation found.');
    else console.log(formatSearchResults(results));
    console.log('');
  }
  return 0;
}
