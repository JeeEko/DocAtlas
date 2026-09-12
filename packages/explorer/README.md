# DocAtlas Explorer

VS Code / Cursor extension to browse `doc-atlas/docs/`.

## Features (v1)

- Sidebar tree of documentation files
- Open markdown on click
- Refresh on file changes
- Empty state when DocAtlas not initialized

## Develop

```bash
cd packages/explorer
npm install
npm run compile
```

Press F5 in VS Code/Cursor with this folder open.

## Package

```bash
npm run package
```

Or from any project with DocAtlas CLI:

```bash
docatlas install-explorer
```
