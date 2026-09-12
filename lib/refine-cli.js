import fs from 'node:fs';
import path from 'node:path';
import { runRefine } from './refine.js';

export function runRefineCommand(projectRoot, options = {}) {
  if (!fs.existsSync(path.join(projectRoot, '.docatlas.json'))) {
    throw new Error('Run docatlas init first.');
  }

  console.log('');
  console.log('  DocAtlas refine — tracing user flow in code...');
  console.log('');

  const result = runRefine(projectRoot, options);

  console.log(`  Journey:  ${options.journeyName || 'from .docatlas.json'}`);
  console.log(`  Wrote:    ${result.journeyRel}`);
  console.log(`  Steps:    ${result.steps}`);
  console.log(`  Terms:    ${result.terms} in GLOSSARY.md`);
  console.log('');
  console.log('  Next:  docatlas drift');
  console.log('         npm run dev  (confirm the flow, then mark [verified])');
  console.log('');
}
