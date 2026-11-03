import fs from 'node:fs';
import path from 'node:path';

const MARKER = '# DocAtlas generated report';
const ENTRY = 'doc-atlas/report/';

export function ensureReportGitignore(projectRoot) {
  const gitignorePath = path.join(projectRoot, '.gitignore');
  let content = '';
  if (fs.existsSync(gitignorePath)) {
    content = fs.readFileSync(gitignorePath, 'utf8');
    if (content.includes(ENTRY) || content.includes('doc-atlas/report')) {
      return false;
    }
  }
  const block = content.endsWith('\n') || content === '' ? '' : '\n';
  fs.writeFileSync(
    gitignorePath,
    `${content}${block}\n${MARKER}\n${ENTRY}\n`,
    'utf8'
  );
  return true;
}
