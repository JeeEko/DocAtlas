# DocAtlas Explorer — Specification v1

Viewer-only VS Code / Cursor extension for browsing `doc-atlas/docs/`.

## Scope

- Tree view of `doc-atlas/docs/`
- Markdown preview with local Mermaid
- Fuzzy search across markdown files
- Evidence link navigation (`path/file.ts#L10-L20`)
- Freshness badge from `.docatlas.json` `lastAnalyzedCommit`
- Live reload on file changes

## Non-goals (v1)

- Documentation generation
- LLM integration
- Cloud sync
- Automatic agent triggers

## Configuration

- Docs root: `{workspace}/doc-atlas/docs/`
- Meta: `{workspace}/doc-atlas/.docatlas.json`

## Functional requirements

| ID | Requirement |
|----|-------------|
| FR-01 | Activity bar view listing doc-atlas markdown hierarchy |
| FR-02 | Open markdown in preview panel |
| FR-03 | Render Mermaid blocks locally |
| FR-04 | Search filenames, headings, body text |
| FR-05 | Click evidence paths to open source at line |
| FR-06 | Show freshness badge vs HEAD commit |
| FR-07 | Refresh on doc-atlas file changes |
| FR-08 | Empty state when doc-atlas missing with init instructions |

## Architecture

```
packages/explorer/
  src/extension.ts       — activation, commands
  src/services/          — tree, index, freshness, evidence
  package.json           — VS Code extension manifest
```

See [packages/explorer/README.md](../../packages/explorer/README.md) for development.
