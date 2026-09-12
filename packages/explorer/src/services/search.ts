import * as fs from 'fs';
import * as path from 'path';

export interface SearchChunk {
  path: string;
  heading: string;
  snippet: string;
  body: string;
  score: number;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function chunkMarkdown(content: string, relPath: string) {
  const lines = content.split('\n');
  const chunks: Array<{ path: string; heading: string; body: string; snippet: string }> = [];
  let currentHeading = '(intro)';
  let currentLines: string[] = [];

  const flush = () => {
    const body = currentLines.join('\n').trim();
    if (body.length < 20 && currentHeading === '(intro)') return;
    chunks.push({ path: relPath, heading: currentHeading, body, snippet: body.slice(0, 600) });
  };

  for (const line of lines) {
    const hm = line.match(/^(#{2,3})\s+(.+)$/);
    if (hm) {
      flush();
      currentHeading = hm[2].trim();
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }
  flush();

  if (!chunks.length && content.trim()) {
    chunks.push({
      path: relPath,
      heading: path.basename(relPath, '.md'),
      body: content.trim(),
      snippet: content.trim().slice(0, 600),
    });
  }

  return chunks;
}

function scoreChunk(
  chunk: { path: string; heading: string; body: string },
  queryTokens: string[]
): number {
  const haystack = `${chunk.path} ${chunk.heading} ${chunk.body}`.toLowerCase();
  let score = 0;
  for (const token of queryTokens) {
    if (chunk.path.toLowerCase().includes(token)) score += 8;
    if (chunk.heading.toLowerCase().includes(token)) score += 12;
    if (haystack.includes(token)) score += 4;
  }
  if (chunk.path.includes('AI_CONTEXT.md')) score += 5;
  return score;
}

export function listMarkdownFiles(docsDir: string, projectRoot: string): string[] {
  if (!fs.existsSync(docsDir)) return [];
  const out: string[] = [];

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.md')) {
        out.push(path.relative(projectRoot, full).replace(/\\/g, '/'));
      }
    }
  };

  walk(docsDir);
  return out;
}

export function searchDocs(docsDir: string, projectRoot: string, query: string, limit = 20): SearchChunk[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];

  const all: SearchChunk[] = [];
  for (const rel of listMarkdownFiles(docsDir, projectRoot)) {
    const abs = path.join(projectRoot, rel);
    const content = fs.readFileSync(abs, 'utf8');
    for (const chunk of chunkMarkdown(content, rel)) {
      const score = scoreChunk(chunk, tokens);
      if (score > 0) all.push({ ...chunk, score });
    }
  }

  all.sort((a, b) => b.score - a.score);
  return all.slice(0, limit);
}
