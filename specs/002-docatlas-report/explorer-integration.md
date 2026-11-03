# DocAtlas Report — Explorer integration

Follow-up to [spec.md](./spec.md). Not required for report MVP.

## Goals

- Command **DocAtlas: Open HTML Report** when `doc-atlas/report/index.html` exists.
- Optionally run `docatlas report` first if snapshot is missing or stale (user prompt).

## Behavior

1. Resolve workspace `doc-atlas/` root (same as Explorer tree).
2. If `doc-atlas/report/index.html` exists, open with system default browser (`vscode.env.openExternal` / `open` pattern).
3. If missing, offer to run `docatlas report` via integrated terminal, then open.

## Shared snapshot

`docatlas report` writes `doc-atlas/report/snapshot.json`. Explorer may later read KPIs without spawning CLI on every tree refresh.

## Non-goals

- Embed full report webview inside VS Code (browser remains primary for v1).
