import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export interface FreshnessInfo {
  lastCommit: string | null;
  headCommit: string | null;
  commitsBehind: number | null;
  label: string;
}

export function readFreshness(projectRoot: string): FreshnessInfo {
  const metaPath = path.join(projectRoot, 'doc-atlas', '.docatlas.json');
  if (!fs.existsSync(metaPath)) {
    return { lastCommit: null, headCommit: null, commitsBehind: null, label: 'Not initialized' };
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const lastCommit = meta.lastAnalyzedCommit ?? null;

  let headCommit: string | null = null;
  let commitsBehind: number | null = null;
  try {
    headCommit = execSync('git rev-parse HEAD', { cwd: projectRoot, encoding: 'utf8' }).trim();
    if (lastCommit) {
      commitsBehind = Number(
        execSync(`git rev-list --count ${lastCommit}..HEAD`, { cwd: projectRoot, encoding: 'utf8' }).trim()
      );
    }
  } catch {
    // git unavailable
  }

  let label = 'Never analyzed';
  if (lastCommit && commitsBehind === 0) label = 'Up to date';
  else if (lastCommit && commitsBehind != null) label = `${commitsBehind} commits behind`;

  return { lastCommit, headCommit, commitsBehind, label };
}
