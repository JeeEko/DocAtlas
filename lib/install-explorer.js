import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { getToolkitRoot } from './paths.js';

export function runInstallExplorerCommand(options = {}) {
  const { skipBuild = false } = options;
  const toolkitRoot = getToolkitRoot();
  const explorerDir = path.join(toolkitRoot, 'packages/explorer');

  if (!fs.existsSync(explorerDir)) {
    throw new Error('Explorer package not found in toolkit');
  }

  console.log('');
  console.log('  DocAtlas install-explorer');
  console.log('');

  if (!skipBuild) {
    console.log('  Building extension...');
    try {
      execFileSync('npm', ['install'], { cwd: explorerDir, stdio: 'inherit' });
      execFileSync('npm', ['run', 'compile'], { cwd: explorerDir, stdio: 'inherit' });
      execFileSync('npm', ['run', 'package'], { cwd: explorerDir, stdio: 'inherit' });
    } catch (err) {
      throw new Error(`Explorer build failed: ${err.message}`);
    }
  }

  const vsix = fs.readdirSync(explorerDir).find((f) => f.endsWith('.vsix'));
  if (!vsix) {
    console.log('  No .vsix produced — compile packages/explorer manually');
    return { vsix: null };
  }

  console.log(`  Built:     packages/explorer/${vsix}`);
  for (const cmd of ['cursor', 'code']) {
    try {
      execFileSync(cmd, ['--install-extension', path.join(explorerDir, vsix), '--force'], {
        stdio: 'inherit',
      });
      console.log(`  Installed via ${cmd}`);
      break;
    } catch {
      // try next
    }
  }

  console.log('');
  return { vsix: path.join(explorerDir, vsix) };
}
