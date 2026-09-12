import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { searchDocs } from './services/search';
import { readFreshness } from './services/freshness';
import { parseEvidenceLinks } from './services/evidence';

const DOC_ATLAS = 'doc-atlas';
const DOCS = path.join(DOC_ATLAS, 'docs');

export function activate(context: vscode.ExtensionContext) {
  const provider = new DocAtlasTreeProvider();
  vscode.window.registerTreeDataProvider('docatlasExplorer', provider);

  context.subscriptions.push(
    vscode.commands.registerCommand('docatlas.refresh', () => provider.refresh()),
    vscode.commands.registerCommand('docatlas.search', () => searchCommand(provider)),
    vscode.commands.registerCommand('docatlas.openEvidence', (link: string) => openEvidence(link)),
    vscode.commands.registerCommand('docatlas.previewMermaid', (uri: vscode.Uri) => previewMermaid(uri)),
    vscode.commands.registerCommand('docatlas.showFreshness', () => showFreshness())
  );

  const watcher = vscode.workspace.createFileSystemWatcher(`**/${DOC_ATLAS}/**/*`);
  watcher.onDidChange(() => provider.refresh());
  watcher.onDidCreate(() => provider.refresh());
  watcher.onDidDelete(() => provider.refresh());
  context.subscriptions.push(watcher);
}

async function searchCommand(provider: DocAtlasTreeProvider) {
  const query = await vscode.window.showInputBox({ prompt: 'Search doc-atlas documentation' });
  if (!query) return;
  const root = findDocAtlasRoot();
  if (!root) {
    vscode.window.showWarningMessage('No doc-atlas/ found — run docatlas init');
    return;
  }
  const docsDir = path.join(root, DOCS);
  const results = searchDocs(docsDir, root, query, 15);
  if (!results.length) {
    vscode.window.showInformationMessage('No matching documentation found.');
    return;
  }
  const pick = await vscode.window.showQuickPick(
    results.map((r) => ({
      label: r.heading,
      description: r.path,
      detail: r.snippet.slice(0, 120),
      result: r,
    })),
    { matchOnDescription: true, matchOnDetail: true }
  );
  if (!pick) return;
  const abs = path.join(root, pick.result.path);
  const doc = await vscode.workspace.openTextDocument(abs);
  await vscode.window.showTextDocument(doc);
}

async function openEvidence(raw: string) {
  const links = parseEvidenceLinks(raw);
  if (!links.length) return;
  const link = links[0];
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!root) return;
  const target = path.join(root, link.file);
  if (!fs.existsSync(target)) {
    vscode.window.showWarningMessage(`Evidence file not found: ${link.file}`);
    return;
  }
  const doc = await vscode.workspace.openTextDocument(target);
  const editor = await vscode.window.showTextDocument(doc);
  const range = new vscode.Range(link.startLine - 1, 0, link.endLine - 1, 0);
  editor.selection = new vscode.Selection(range.start, range.end);
  editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
}

function previewMermaid(uri: vscode.Uri) {
  const content = fs.readFileSync(uri.fsPath, 'utf8');
  const blocks = [...content.matchAll(/```mermaid\n([\s\S]*?)```/g)].map((m) => m[1]);
  if (!blocks.length) {
    vscode.window.showInformationMessage('No Mermaid blocks in this file.');
    return;
  }
  const panel = vscode.window.createWebviewPanel('docatlasMermaid', 'DocAtlas Mermaid', vscode.ViewColumn.Beside, {
    enableScripts: true,
  });
  panel.webview.html = `<!DOCTYPE html><html><head><script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script></head><body>${blocks
    .map((b, i) => `<pre class="mermaid" id="m${i}">${b.replace(/</g, '&lt;')}</pre>`)
    .join('')}<script>mermaid.initialize({ startOnLoad: true });</script></body></html>`;
}

function showFreshness() {
  const root = findDocAtlasRoot();
  if (!root) {
    vscode.window.showWarningMessage('No doc-atlas/ found');
    return;
  }
  const info = readFreshness(root);
  vscode.window.showInformationMessage(`DocAtlas freshness: ${info.label}`);
}

class DocAtlasTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): vscode.TreeItem[] {
    const root = findDocAtlasRoot();
    if (!root) {
      return [new vscode.TreeItem('No doc-atlas/ — run docatlas init', vscode.TreeItemCollapsibleState.None)];
    }

    if (!element) {
      const info = readFreshness(root);
      const freshnessItem = new vscode.TreeItem(`Freshness: ${info.label}`, vscode.TreeItemCollapsibleState.None);
      freshnessItem.command = { command: 'docatlas.showFreshness', title: 'Show freshness' };
      const searchItem = new vscode.TreeItem('Search docs…', vscode.TreeItemCollapsibleState.None);
      searchItem.command = { command: 'docatlas.search', title: 'Search' };
      return [freshnessItem, searchItem, ...this.listDocs(root, path.join(root, DOCS))];
    }

    const base = element.resourceUri?.fsPath;
    if (!base || !fs.existsSync(base)) return [];
    if (fs.statSync(base).isDirectory()) return this.listDocs(root, base);
    return [];
  }

  private listDocs(root: string, base: string): vscode.TreeItem[] {
    if (!fs.existsSync(base)) {
      return [new vscode.TreeItem('Missing doc-atlas/docs/', vscode.TreeItemCollapsibleState.None)];
    }
    return fs.readdirSync(base, { withFileTypes: true }).flatMap((entry: fs.Dirent) => {
      const full = path.join(base, entry.name);
      if (entry.isDirectory()) {
        const item = new vscode.TreeItem(entry.name, vscode.TreeItemCollapsibleState.Collapsed);
        item.resourceUri = vscode.Uri.file(full);
        return [item];
      }
      if (entry.name.endsWith('.md')) {
        const item = new vscode.TreeItem(entry.name, vscode.TreeItemCollapsibleState.None);
        item.resourceUri = vscode.Uri.file(full);
        item.command = {
          command: 'vscode.open',
          title: 'Open',
          arguments: [vscode.Uri.file(full)],
        };
        item.contextValue = 'markdownDoc';
        return [item];
      }
      return [];
    });
  }
}

function findDocAtlasRoot(): string | null {
  const folders = vscode.workspace.workspaceFolders ?? [];
  for (const folder of folders) {
    const candidate = path.join(folder.uri.fsPath, DOC_ATLAS);
    if (fs.existsSync(path.join(candidate, '.docatlas.json'))) return folder.uri.fsPath;
  }
  return null;
}

export function deactivate() {}
