import { runDocAtlasJson } from './docatlas-cli';

export interface SearchChunk {
  path: string;
  heading: string;
  snippet: string;
  body: string;
  score: number;
}

interface QueryJson {
  query: string;
  results: SearchChunk[];
}

/** Search via `docatlas query --json` (same ranking as lib/search.js). */
export function searchDocs(projectRoot: string, query: string, limit = 20): SearchChunk[] {
  const parsed = runDocAtlasJson<QueryJson>(projectRoot, [
    'query',
    query,
    '--json',
    '--limit',
    String(limit),
  ]);
  return parsed?.results ?? [];
}
