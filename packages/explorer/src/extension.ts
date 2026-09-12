import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const DOC_ATLAS = 'doc-atlas';
const DOCS = path.join(DOC_ATLAS, 'docs');

export function activate(context: vscode.ExtensionContext) {
  const provider = new DocAtlasTreeProvider();
  vscode.window.registerTreeDataProvider('docatlasExplorer', provider);
  context.subscriptions.push(
    vscode.commands.registerCommand('docatlas.refresh', () => provider.refresh())
  );
  const watcher = vscode.workspace.createFileSystemWatcher(`**/${DOC_ATLAS}/**/*`);
  watcher.onDidChange(() => provider.refresh());
  watcher.onDidCreate(() => provider.refresh());
  watcher.onDidDelete(() => provider.refresh());
  context.subscriptions.push(watcher);
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
    const base = element?.resourceUri?.fsPath ?? path.join(root, DOCS);
    if (!fs.existsSync(base)) {
      return [new vscode.TreeItem('Missing doc-atlas/docs/', vscode.TreeItemCollapsibleState.None)];
    }
    return fs.readdirSync(base, { withFileTypes: true }).flatMap((entry) => {
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
