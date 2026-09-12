import fs from 'node:fs';
import path from 'node:path';
import { readBusinessContexts } from './business-contexts.js';
import { getLayout, isDocAtlasInitialized } from './layout.js';
import { readJson } from './paths.js';
import { walkFiles } from './walk.js';

const HEADING_RE = /^(#{1,6})\s+(.+)$/gm;

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function readMeta(projectRoot) {
  const layout = getLayout(projectRoot);
  return readJson(layout.metaAbs) ?? {};
}

function shouldIncludeDoc(relPath, meta) {
  const exclude = meta.excludePaths ?? [];
  for (const p of exclude) {
    if (relPath.includes(p.replace(/\\/g, '/'))) return false;
  }
  const include = meta.includePaths ?? [];
  if (!include.length) return true;
  return include.some((p) => relPath.includes(p.replace(/\\/g, '/')));
}

export function listMarkdownDocs(projectRoot) {
  if (!isDocAtlasInitialized(projectRoot)) return [];
  const layout = getLayout(projectRoot);
  const meta = readMeta(projectRoot);
  const docsDir = layout.docsDirAbs;
  if (!fs.existsSync(docsDir)) return [];

  const files = [];
  walkFiles(docsDir, (abs) => {
    if (!abs.endsWith('.md')) return;
    const rel = path.relative(projectRoot, abs).replace(/\\/g, '/');
    if (shouldIncludeDoc(rel, meta)) files.push({ abs, rel });
  });
  return files.sort((a, b) => a.rel.localeCompare(b.rel));
}

export function chunkMarkdown(content, relPath) {
  const lines = content.split('\n');
  const chunks = [];
  let currentHeading = '(intro)';
  let currentLines = [];

  const flush = () => {
    const body = currentLines.join('\n').trim();
    if (body.length < 20 && currentHeading === '(intro)') return;
    chunks.push({
      path: relPath,
      heading: currentHeading,
      body,
      snippet: body.slice(0, 600),
    });
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

function scoreChunk(chunk, queryTokens, options = {}) {
  const haystack = `${chunk.path} ${chunk.heading} ${chunk.body}`.toLowerCase();
  let score = 0;

  for (const token of queryTokens) {
    if (chunk.path.toLowerCase().includes(token)) score += 8;
    if (chunk.heading.toLowerCase().includes(token)) score += 12;
    if (haystack.includes(token)) score += 4;
  }

  if (chunk.path.includes('AI_CONTEXT.md')) score += options.contextBoost ? 15 : 5;
  if (chunk.path.includes('business/contexts/')) score += options.contextBoost ? 10 : 3;
  if (chunk.path.includes('JOURNEY-')) score += 3;
  if (chunk.path.includes('ARCHITECTURE.md')) score += 2;

  return score;
}

export function rankChunks(projectRoot, query, options = {}) {
  const limit = options.limit ?? 5;
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return [];

  const all = [];
  for (const { abs, rel } of listMarkdownDocs(projectRoot)) {
    const content = fs.readFileSync(abs, 'utf8');
    for (const chunk of chunkMarkdown(content, rel)) {
      const score = scoreChunk(chunk, queryTokens, options);
      if (score > 0) {
        all.push({ ...chunk, score });
      }
    }
  }

  all.sort((a, b) => b.score - a.score);
  return all.slice(0, limit);
}

export function formatSearchResults(results) {
  if (!results.length) return 'No matching documentation found.';
  return results
    .map(
      (r, i) =>
        `### ${i + 1}. ${r.heading}\n**File:** \`${r.path}\`\n**Score:** ${r.score}\n\n${r.snippet}${r.body.length > 600 ? '…' : ''}`
    )
    .join('\n\n---\n\n');
}

export function getAiContextContent(projectRoot) {
  const layout = getLayout(projectRoot);
  const aiPath = layout.docAbs('AI_CONTEXT.md');
  if (!fs.existsSync(aiPath)) return null;
  return fs.readFileSync(aiPath, 'utf8');
}

export function getBusinessContextContent(projectRoot, slug) {
  const layout = getLayout(projectRoot);
  const normalized = String(slug).toLowerCase().replace(/[^\w-]+/g, '-');
  const direct = layout.docAbs(`business/contexts/${normalized}.md`);
  if (fs.existsSync(direct)) {
    return { path: layout.docRel(`business/contexts/${normalized}.md`), content: fs.readFileSync(direct, 'utf8') };
  }

  const contexts = readBusinessContexts(getLayout(projectRoot));
  const match = contexts.find((c) => c.slug === normalized || c.label?.toLowerCase().includes(normalized));
  if (match?.slug) {
    const p = layout.docAbs(`business/contexts/${match.slug}.md`);
    if (fs.existsSync(p)) {
      return { path: layout.docRel(`business/contexts/${match.slug}.md`), content: fs.readFileSync(p, 'utf8') };
    }
  }
  return null;
}

export function getJourneyContent(projectRoot, query = '') {
  const layout = getLayout(projectRoot);
  const docsDir = layout.docsDirAbs;
  if (!fs.existsSync(docsDir)) return [];

  const journeys = fs
    .readdirSync(docsDir)
    .filter((f) => f.startsWith('JOURNEY-') && f.endsWith('.md'))
    .map((f) => {
      const abs = path.join(docsDir, f);
      const content = fs.readFileSync(abs, 'utf8');
      const rel = layout.docRel(f);
      return { file: f, path: rel, content };
    });

  if (!query) return journeys;

  const q = query.toLowerCase();
  return journeys.filter(
    (j) =>
      j.file.toLowerCase().includes(q) ||
      j.content.toLowerCase().includes(q) ||
      j.path.toLowerCase().includes(q)
  );
}

export function queryContextShortcut(projectRoot, topic) {
  const ai = getAiContextContent(projectRoot);
  const ranked = rankChunks(projectRoot, topic, { limit: 3, contextBoost: true });
  const parts = [];
  if (ai) parts.push(`## AI_CONTEXT.md\n\n${ai}`);
  if (ranked.length) parts.push(`## Related sections\n\n${formatSearchResults(ranked)}`);
  return parts.join('\n\n---\n\n') || 'No context found.';
}
