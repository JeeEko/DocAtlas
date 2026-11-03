import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface DocAtlasCli {
  command: string;
  prefixArgs: string[];
}

/** Resolve docatlas CLI: local node_modules, repo bin, or PATH. */
export function resolveDocAtlasCli(projectRoot: string): DocAtlasCli {
  const localBin = path.join(projectRoot, 'node_modules', 'docatlas', 'bin', 'docatlas.js');
  if (fs.existsSync(localBin)) {
    return { command: process.execPath, prefixArgs: [localBin] };
  }

  const repoBin = path.join(projectRoot, 'bin', 'docatlas.js');
  if (fs.existsSync(repoBin)) {
    return { command: process.execPath, prefixArgs: [repoBin] };
  }

  return { command: 'docatlas', prefixArgs: [] };
}

export function runDocAtlasJson<T>(
  projectRoot: string,
  args: string[],
  options: { timeoutMs?: number } = {}
): T | null {
  const cli = resolveDocAtlasCli(projectRoot);
  const timeout = options.timeoutMs ?? 60_000;
  try {
    const stdout = execFileSync(cli.command, [...cli.prefixArgs, ...args], {
      cwd: projectRoot,
      encoding: 'utf8',
      timeout,
      maxBuffer: 12 * 1024 * 1024,
    });
    const trimmed = stdout.trim();
    if (!trimmed) return null;
    return JSON.parse(trimmed) as T;
  } catch {
    return null;
  }
}

const HEALTH_SCORE_RE = /Health Score:\s*(\d+)\/100/;

export function readHealthScoreLabel(projectRoot: string): string {
  const cli = resolveDocAtlasCli(projectRoot);
  try {
    const stdout = execFileSync(cli.command, [...cli.prefixArgs, 'doctor', '--score'], {
      cwd: projectRoot,
      encoding: 'utf8',
      timeout: 90_000,
      maxBuffer: 4 * 1024 * 1024,
    });
    const match = stdout.match(HEALTH_SCORE_RE);
    if (match) return `Health: ${match[1]}/100`;
  } catch {
    // fall through
  }
  return 'Health: n/a (docatlas doctor --score)';
}
