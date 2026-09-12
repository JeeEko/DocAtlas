import fs from 'node:fs';
import path from 'node:path';

export const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '.turbo',
  'vendor',
  '.cache',
]);

export function walkFiles(dir, onFile, depth = 0, maxDepth = 12) {
  if (depth > maxDepth || !fs.existsSync(dir)) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, onFile, depth + 1, maxDepth);
    else onFile(full);
  }
}

export function relPath(root, file) {
  return path.relative(root, file).replace(/\\/g, '/');
}

export function joinRoutePaths(base, sub) {
  const b = base ? (base.startsWith('/') ? base : `/${base}`) : '';
  if (!sub && sub !== '') return b || '/';
  const s = sub.startsWith('/') ? sub : `/${sub}`;
  const joined = `${b}${s}`.replace(/\/+/g, '/');
  return joined.replace(/\/$/, '') || '/';
}
