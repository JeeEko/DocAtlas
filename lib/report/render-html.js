import fs from 'node:fs';
import path from 'node:path';
import { markdownToHtml } from './markdown-lite.js';
import { slugify } from './snapshot.js';

const CSS = `
:root {
  --bg: #f8fafc;
  --card: #fff;
  --text: #0f172a;
  --muted: #64748b;
  --border: #e2e8f0;
  --accent: #2563eb;
  --ok: #16a34a;
  --warn: #d97706;
  --bad: #dc2626;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
}
.layout { display: flex; min-height: 100vh; max-width: 1200px; margin: 0 auto; }
nav.sidebar {
  width: 260px;
  padding: 1rem;
  background: var(--card);
  border-right: 1px solid var(--border);
  overflow-y: auto;
}
main { flex: 1; padding: 1.5rem 2rem; overflow-x: auto; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
h1 { margin-top: 0; }
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
}
.kpi {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.75rem 1rem;
}
.kpi .val { font-size: 1.5rem; font-weight: 700; }
.kpi .lbl { font-size: 0.8rem; color: var(--muted); }
.badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-weight: 600;
}
.badge.ready { background: #dcfce7; color: var(--ok); }
.badge.draft { background: #fef3c7; color: var(--warn); }
.badge.stale { background: #ffedd5; color: var(--warn); }
.badge.missing { background: #fee2e2; color: var(--bad); }
table.artifacts { width: 100%; border-collapse: collapse; margin: 1rem 0; }
table.artifacts th, table.artifacts td {
  border: 1px solid var(--border);
  padding: 0.5rem 0.75rem;
  text-align: left;
}
nav.sidebar ul { list-style: none; padding-left: 0.75rem; margin: 0.25rem 0; }
nav.sidebar > ul { padding-left: 0; }
nav.sidebar li { margin: 0.2rem 0; font-size: 0.9rem; }
.nav-title { font-weight: 600; margin: 0.75rem 0 0.25rem; font-size: 0.85rem; color: var(--muted); text-transform: uppercase; }
.doc-content pre { background: #1e293b; color: #f1f5f9; padding: 1rem; overflow-x: auto; border-radius: 6px; }
.doc-content code { font-family: ui-monospace, monospace; font-size: 0.9em; }
.footer { margin-top: 2rem; font-size: 0.85rem; color: var(--muted); }
`;

function statusBadge(status) {
  return `<span class="badge ${status}">${status}</span>`;
}

function renderNavTree(nodes, depth = 0) {
  if (!nodes?.length) return '';
  let html = depth === 0 ? '<ul>' : '<ul>';
  for (const n of nodes) {
    if (n.type === 'dir') {
      html += `<li><strong>${escapeHtml(n.name)}</strong>${renderNavTree(n.children, depth + 1)}</li>`;
    } else {
      html += `<li><a href="docs/${n.slug}.html">${escapeHtml(n.name)}</a></li>`;
    }
  }
  html += '</ul>';
  return html;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pathExistsInTree(nodes, relPath) {
  const norm = relPath.replace(/\\/g, '/');
  for (const n of nodes) {
    if (n.type === 'file' && n.path.replace(/\\/g, '/') === norm) return n;
    if (n.children) {
      const found = pathExistsInTree(n.children, relPath);
      if (found) return found;
    }
  }
  return null;
}

function pageShell(title, snapshot, bodyHtml, active = 'dashboard') {
  const nav = `
    <div class="nav-title">Report</div>
    <ul><li><a href="index.html"${active === 'dashboard' ? ' aria-current="page"' : ''}>Dashboard</a></li>
    <li><a href="workflow.html"${active === 'workflow' ? ' aria-current="page"' : ''}>Workflow</a></li></ul>
    <div class="nav-title">Documentation</div>
    ${renderNavTree(snapshot.docTree)}
  `;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(title)} — DocAtlas Report</title>
  <style>${CSS}</style>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
</head>
<body>
  <div class="layout">
    <nav class="sidebar">${nav}</nav>
    <main>${bodyHtml}</main>
  </div>
  <script>mermaid.initialize({ startOnLoad: true, theme: 'neutral' });</script>
</body>
</html>`;
}

function renderDashboard(snapshot) {
  const m = snapshot.health.metrics;
  const kpis = [
    ['Health', `${snapshot.health.score}/100`],
    ['Markdown files', String(m.mdFiles)],
    ['Verified ratio', `${m.verifiedRatio}%`],
    ['Placeholders', String(m.placeholders)],
    ['Drift issues', String(snapshot.drift.count)],
    ['Kit files', `${snapshot.kit.present}/${snapshot.kit.total}`],
  ];
  if (m.routeCoverage != null) kpis.push(['Route coverage', `${m.routeCoverage}%`]);

  const kpiHtml = kpis
    .map(
      ([lbl, val]) =>
        `<div class="kpi"><div class="val">${escapeHtml(val)}</div><div class="lbl">${escapeHtml(lbl)}</div></div>`
    )
    .join('');

  const docArtifacts = snapshot.artifacts.filter((a) => a.phase === 'documentation');
  const rows = docArtifacts
    .map((a) => {
      const slug = slugify(a.path);
      const docFile = pathExistsInTree(snapshot.docTree, a.path);
      const link =
        a.status !== 'missing' && docFile
          ? `<a href="docs/${docFile.slug}.html">${escapeHtml(a.label)}</a>`
          : escapeHtml(a.label);
      return `<tr><td>${link}</td><td>${statusBadge(a.status)}</td><td><code>${escapeHtml(a.path)}</code></td></tr>`;
    })
    .join('');

  const phasePct = (phase) => {
    const items = snapshot.artifacts.filter((a) => a.phase === phase);
    if (!items.length) return 0;
    const ready = items.filter((a) => a.status === 'ready').length;
    return Math.round((ready / items.length) * 100);
  };

  return `
    <h1>${escapeHtml(snapshot.projectName)}</h1>
    <p>DocAtlas report snapshot · ${escapeHtml(snapshot.generatedAt)} · taxonomy: ${escapeHtml(snapshot.taxonomy)}</p>
    <div class="kpi-grid">${kpiHtml}</div>
    <h2>Documentation artifacts</h2>
    <table class="artifacts"><thead><tr><th>Artifact</th><th>Status</th><th>Path</th></tr></thead><tbody>${rows}</tbody></table>
    <h2>Phase completion</h2>
    <p>Documentation: ${phasePct('documentation')}% ready · Kit: ${phasePct('kit')}% ready</p>
    <p class="footer">Regenerate with <code>docatlas report</code>. Source markdown remains under doc-atlas/docs/.</p>
  `;
}

function renderWorkflow(snapshot) {
  const steps = snapshot.workflow
    .map(
      (p) => `<li><strong>${escapeHtml(p.title)}</strong> — ${escapeHtml(p.summary)}</li>`
    )
    .join('');
  return `
    <h1>DocAtlas workflow</h1>
    <p>Aligned with the <code>/docatlas</code> command and Cursor skills.</p>
    <ol>${steps}</ol>
    <p class="footer">After drift is clean, run <code>docatlas report</code> to refresh this portal.</p>
  `;
}

function collectDocFiles(nodes, list = []) {
  for (const n of nodes) {
    if (n.type === 'file') list.push(n);
    if (n.children) collectDocFiles(n.children, list);
  }
  return list;
}

export function renderReportHtml(snapshot, projectRoot, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const docsOut = path.join(outDir, 'docs');
  fs.mkdirSync(docsOut, { recursive: true });

  fs.writeFileSync(path.join(outDir, 'snapshot.json'), `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');

  fs.writeFileSync(
    path.join(outDir, 'index.html'),
    pageShell('Dashboard', snapshot, renderDashboard(snapshot), 'dashboard'),
    'utf8'
  );

  fs.writeFileSync(
    path.join(outDir, 'workflow.html'),
    pageShell('Workflow', snapshot, renderWorkflow(snapshot), 'workflow'),
    'utf8'
  );

  const layoutDocs = collectDocFiles(snapshot.docTree);
  for (const node of layoutDocs) {
    const relFromProject = node.path;
    const abs = path.join(projectRoot, relFromProject);
    if (!fs.existsSync(abs)) continue;
    const md = fs.readFileSync(abs, 'utf8');
    const content = `<article class="doc-content"><h1>${escapeHtml(node.name.replace(/\.md$/, ''))}</h1>${markdownToHtml(md)}<p class="footer">Source: <code>${escapeHtml(relFromProject)}</code></p></article>`;
    fs.writeFileSync(
      path.join(docsOut, `${node.slug}.html`),
      pageShell(node.name, snapshot, content, 'doc'),
      'utf8'
    );
  }

  return { outDir, pageCount: layoutDocs.length + 2 };
}
