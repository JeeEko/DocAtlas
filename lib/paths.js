import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getToolkitRoot() {
  return path.resolve(__dirname, '..');
}

export function readVersion(toolkitRoot) {
  try {
    return fs.readFileSync(path.join(toolkitRoot, 'VERSION'), 'utf8').trim();
  } catch {
    return 'unknown';
  }
}

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function copyFile(src, dest, { force = false } = {}) {
  if (fs.existsSync(dest) && !force) {
    return { copied: false, reason: 'exists' };
  }
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  return { copied: true };
}

export function copyDir(src, dest, { force = false, filter = () => true } = {}) {
  if (!fs.existsSync(src)) return [];
  const copied = [];
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (!filter(srcPath, entry)) continue;
    if (entry.isDirectory()) {
      copied.push(...copyDir(srcPath, destPath, { force, filter }));
    } else if (entry.isFile()) {
      const result = copyFile(srcPath, destPath, { force });
      if (result.copied) copied.push(destPath);
    }
  }
  return copied;
}

export function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

export function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

export function writeText(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

/** Format repo-relative evidence citation for docs. */
export function formatEvidence(filePath, startLine, endLine) {
  const normalized = String(filePath).replace(/\\/g, '/');
  if (startLine == null) return `\`${normalized}\``;
  if (endLine != null && endLine !== startLine) {
    return `\`${normalized}#L${startLine}-L${endLine}\``;
  }
  return `\`${normalized}#L${startLine}\``;
}
