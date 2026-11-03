import fs from 'node:fs';
import { getLayout } from './layout.js';

export const DISTRIBUTION_STANDARD = 'standard';
export const DISTRIBUTION_CURSOR = 'cursor';

export const SYNC_GITHUB_ACTIONS = 'github-actions';
export const SYNC_CURSOR_AUTOMATION = 'cursor-automation';

export function readDocAtlasMeta(projectRoot) {
  const layout = getLayout(projectRoot);
  if (!fs.existsSync(layout.metaAbs)) return null;
  try {
    return JSON.parse(fs.readFileSync(layout.metaAbs, 'utf8'));
  } catch {
    return null;
  }
}

export function isCursorNativeProject(projectRoot) {
  const meta = readDocAtlasMeta(projectRoot);
  return meta?.distribution === DISTRIBUTION_CURSOR;
}

export function resolveBootstrapOptions(options = {}) {
  const cursorNative = Boolean(options.cursorNative ?? options.distribution === DISTRIBUTION_CURSOR);
  return {
    ...options,
    distribution: cursorNative ? DISTRIBUTION_CURSOR : DISTRIBUTION_STANDARD,
    syncEngine: cursorNative ? SYNC_CURSOR_AUTOMATION : SYNC_GITHUB_ACTIONS,
    includeGitHubActions: cursorNative ? Boolean(options.includeGitHubActions) : true,
  };
}
