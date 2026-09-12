# Changelog

## 1.9.0 — 2026-09-12

- **Commands-only Cursor UX** — removed DocAtlas agent skills; slash commands are the sole Cursor entry points
- Each `.cursor/commands/docatlas-*.md` file is a self-contained procedure (no skill pairing)
- Added [docs/COMMANDS.md](docs/COMMANDS.md) — CLI vs slash command reference
- Design principle: one entry point per step, no duplicate skill names

## 1.8.1 — 2026-09-12

- Rename agent skills to **`docatlas-skill-*`** (distinct from slash commands `/docatlas-*`)
- Commands and skills document their pairing in file headers
- *(Superseded in 1.9.0 — skills removed.)*

## 1.8.0 — 2026-09-12

- **New:** `doc-atlas/docs/BUSINESS.md` — problem, users, capabilities, business rules
- Init auto-drafts from README; discovery fills rules from evidence (not invented)
- Drift and discovery updated to include BUSINESS

## 1.7.1 — 2026-09-12

- **Discovery is a required loop step:** init → refine → **discovery** → drift
- Updated CLI output, START_HERE, AGENTS, and all Cursor commands/skills

## 1.7.0 — 2026-09-12

- **Framework parsers** for Next.js (pages + route handlers), NestJS, Express/Hono/Fastify/Koa, React Router, Vue Router, OpenAPI
- **90% trace coverage target** — refine maps all detected routes to journey steps; reports coverage %
- Route inventory lists parser source and confidence per route
- `docatlas refine --min-coverage 90` (default)

## 1.6.0 — 2026-09-12

- **Project-agnostic refine** — removed e-commerce, auth, and shop-specific flow templates
- Journey discovery uses **route structure only** (pages + API path groups)
- Journey names derived from **project name**, not domain keywords
- Added [GOVERNANCE/DESIGN_PRINCIPLES.md](GOVERNANCE/DESIGN_PRINCIPLES.md)
- Removed shoplite-specific scan paths (`shop-api`, `MockCheckout`, etc.)

## 1.5.0 — 2026-09-12

- **`docatlas refine` scans the whole project**, not just e-commerce or login
- Detects auth-app, e-commerce, or full route discovery modes
- Adds **Route inventory** to ARCHITECTURE (web pages + API routes)
- Merges glossary terms instead of replacing the whole file
- Broader API/page detection (Express router, Pages router)

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
