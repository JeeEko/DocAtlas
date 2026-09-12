# Changelog

## 1.4.0 — 2026-09-12

- **All project docs live under `doc-atlas/`** — docs, governance, `.docatlas.json`, agent guidance
- Cursor slash commands/skills stay in `.cursor/` (required by Cursor)
- Root `AGENTS.md` gets a short pointer; full guidance in `doc-atlas/AGENTS.md`
- Legacy layout (`docs/` at repo root) still supported for drift/refine

## 1.3.0 — 2026-09-12

- Cursor slash commands: `/docatlas-init`, `/docatlas-refine`, `/docatlas-drift`
- Skills run installed `docatlas` CLI (no npx for daily use)
- [docs/INSTALL.md](docs/INSTALL.md) — install once globally

## 1.2.0 — 2026-09-12

- **New:** `docatlas refine` — trace user flow in code, write `docs/JOURNEY-*.md` (no Cursor prompt)

## 1.1.0 — 2026-09-12

- **New:** `docatlas init` — one command setup + auto-draft (Node.js, works on Windows)
- Cross-platform CLI (`bin/docatlas.js`) — no Git Bash or PATH hacks
- Auto-generates `docs/START_HERE.md`, fills docs from README and code layout

## 1.0.0 — 2026-08-28

- Initial DocAtlas toolkit (bash bootstrap, templates, drift check, governance)
