import fs from 'node:fs';
import path from 'node:path';
import { getLayout, isDocAtlasInitialized } from './layout.js';
import { getRequiredDocPaths } from './taxonomy.js';

const KIT_PATHS = [
  '.cursor/commands/docatlas.md',
  '.cursor/skills/docatlas-skill-init/SKILL.md',
  '.cursor/skills/docatlas-skill-refine/SKILL.md',
  '.cursor/skills/docatlas-skill-discovery/SKILL.md',
  '.cursor/skills/docatlas-skill-drift/SKILL.md',
  '.cursor/skills/docatlas-skill-update/SKILL.md',
  '.cursor/agents/docatlas-domain-analyzer.md',
  '.cursor/agents/docatlas-integration-analyzer.md',
  '.cursor/agents/docatlas-data-analyzer.md',
  '.cursor/agents/docatlas-system-analyzer.md',
  '.cursor/agents/docatlas-infra-analyzer.md',
  '.cursor/rules/docatlas-core.mdc',
  '.cursor/rules/docatlas-docs.mdc',
];

export function runDoctor(projectRoot) {
  const issues = [];
  const fixes = [];

  if (!isDocAtlasInitialized(projectRoot)) {
    issues.push('DocAtlas not initialized — run: docatlas init');
    return { ok: false, issues, fixes };
  }

  const layout = getLayout(projectRoot);
  for (const rel of KIT_PATHS) {
    const abs = path.join(projectRoot, rel);
    if (!fs.existsSync(abs)) {
      issues.push(`missing kit file: ${rel}`);
      fixes.push('docatlas init --force');
    }
  }

  const metaPath = layout.metaAbs;
  if (!fs.existsSync(metaPath)) {
    issues.push(`missing ${layout.metaRel}`);
  } else {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      for (const doc of getRequiredDocPaths(meta)) {
        const rel = layout.docRel(doc);
        if (!fs.existsSync(path.join(projectRoot, rel))) {
          issues.push(`missing required doc: ${rel}`);
        }
      }
    } catch {
      issues.push('invalid .docatlas.json');
    }
  }

  return { ok: issues.length === 0, issues, fixes: [...new Set(fixes)] };
}

export function runDoctorCommand(projectRoot) {
  const result = runDoctor(projectRoot);
  console.log('');
  console.log('  DocAtlas doctor — kit health check');
  console.log('');
  if (result.ok) {
    console.log('  Status:   OK');
  } else {
    console.log('  Status:   issues found');
    for (const i of result.issues) console.log(`    • ${i}`);
    if (result.fixes.length) {
      console.log('');
      console.log('  Try:');
      for (const f of result.fixes) console.log(`    ${f}`);
    }
  }
  console.log('');
  return result.ok ? 0 : 1;
}
