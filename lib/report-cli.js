import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { getLayout } from './layout.js';
import { buildReportSnapshot } from './report/snapshot.js';
import { renderReportHtml } from './report/render-html.js';

export function runReportCommand(projectRoot, options = {}) {
  const snapshot = buildReportSnapshot(projectRoot, {
    strictDrift: options.strictDrift,
    semanticDrift: options.semanticDrift ?? true,
  });

  if (!snapshot.ok) {
    if (options.json) {
      console.log(JSON.stringify(snapshot, null, 2));
    } else {
      console.error(`\n  ${snapshot.error}\n`);
    }
    return 1;
  }

  const layout = getLayout(projectRoot);
  const defaultOut = path.join(layout.base, 'report');
  const outDir = path.resolve(options.outDir ?? defaultOut);

  const result = renderReportHtml(snapshot, projectRoot, outDir);

  if (options.json) {
    console.log(JSON.stringify({ ...snapshot, output: result }, null, 2));
  } else {
    console.log('');
    console.log('  DocAtlas report generated');
    console.log('');
    console.log(`    • ${result.pageCount} HTML pages`);
    console.log(`    • ${outDir}`);
    console.log(`    • Open index.html in a browser`);
    console.log('');
  }

  if (options.open) {
    const index = path.join(outDir, 'index.html');
    tryOpen(index);
  }

  return snapshot.drift.exitCode && options.strictDrift ? snapshot.drift.exitCode : 0;
}

function tryOpen(filePath) {
  const platform = process.platform;
  try {
    if (platform === 'darwin') execFileSync('open', [filePath]);
    else if (platform === 'win32') execFileSync('cmd', ['/c', 'start', '', filePath]);
    else execFileSync('xdg-open', [filePath]);
  } catch {
    /* best-effort */
  }
}
