import fs from 'node:fs';
import path from 'node:path';

export const DOC_ATLAS_DIR = 'doc-atlas';

export function slug(name) {
  return String(name).replace(/[^\w]+/g, '');
}

/** @returns {'nested' | 'legacy'} */
export function resolveLayoutMode(projectRoot) {
  if (fs.existsSync(path.join(projectRoot, DOC_ATLAS_DIR, '.docatlas.json'))) {
    return 'nested';
  }
  if (fs.existsSync(path.join(projectRoot, '.docatlas.json'))) {
    return 'legacy';
  }
  return 'nested';
}

export function getLayout(projectRoot) {
  const mode = resolveLayoutMode(projectRoot);
  const base = mode === 'nested' ? path.join(projectRoot, DOC_ATLAS_DIR) : projectRoot;

  const rel = (suffix) =>
    (mode === 'nested' ? path.join(DOC_ATLAS_DIR, suffix) : suffix).replace(/\\/g, '/');

  return {
    mode,
    base,
    projectRoot,
    metaAbs: path.join(base, '.docatlas.json'),
    metaRel: rel('.docatlas.json'),
    agentsAbs: path.join(base, 'AGENTS.md'),
    agentsRel: rel('AGENTS.md'),
    docsDirAbs: path.join(base, 'docs'),
    docsDirRel: rel('docs'),
    governanceDirAbs: path.join(base, 'GOVERNANCE'),
    governanceDirRel: rel('GOVERNANCE'),
    docAbs: (file) => path.join(base, 'docs', file),
    docRel: (file) => rel(path.join('docs', file)),
    journeyAbs: (journeyName) => path.join(base, 'docs', `JOURNEY-${slug(journeyName)}.md`),
    journeyRel: (journeyName) => rel(path.join('docs', `JOURNEY-${slug(journeyName)}.md`)),
  };
}

export function isDocAtlasInitialized(projectRoot) {
  const layout = getLayout(projectRoot);
  return fs.existsSync(layout.metaAbs);
}

const ROOT_AGENTS_SECTION = `## DocAtlas

Project documentation lives in [\`doc-atlas/\`](doc-atlas/). **Read first:** [doc-atlas/docs/START_HERE.md](doc-atlas/docs/START_HERE.md).

| Cursor command | Action |
|----------------|--------|
| \`/docatlas\` | Full journey — init → refine → discovery → drift |

**Loop:** init → refine → **discovery** → drift

Full agent guidance: [doc-atlas/AGENTS.md](doc-atlas/AGENTS.md)`;

export function ensureRootAgentsPointer(projectRoot) {
  const rootAgents = path.join(projectRoot, 'AGENTS.md');

  if (fs.existsSync(rootAgents)) {
    let content = fs.readFileSync(rootAgents, 'utf8');
    if (content.includes('doc-atlas/docs/START_HERE.md')) return;
    if (content.includes('This project uses [DocAtlas]') && content.includes('## Documentation map')) {
      return;
    }
    fs.writeFileSync(rootAgents, `${content.trimEnd()}\n\n${ROOT_AGENTS_SECTION}\n`, 'utf8');
    return;
  }

  fs.mkdirSync(path.dirname(rootAgents), { recursive: true });
  fs.writeFileSync(
    rootAgents,
    `# AGENTS.md\n\n${ROOT_AGENTS_SECTION}\n`,
    'utf8'
  );
}
