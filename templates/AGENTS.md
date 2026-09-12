# AGENTS.md

Guidance for AI agents working in this repository.

This project uses [DocAtlas](https://github.com/JeeEko/DocAtlas) for documentation.

**Project:** __JOURNEY_NAME__

## Documentation map

| File | Purpose |
|------|---------|
| `doc-atlas/docs/START_HERE.md` | **Read first** — 2-minute orientation |
| `doc-atlas/docs/BUSINESS.md` | **Why** — problem, users, business rules |
| `doc-atlas/docs/JOURNEY-*.md` | Main user flow traced in code |
| `doc-atlas/docs/ARCHITECTURE.md` | System design and components |
| `doc-atlas/docs/ONBOARDING.md` | New developer setup guide |
| `doc-atlas/docs/RUNBOOK.md` | Run, deploy, troubleshoot |
| `doc-atlas/docs/GLOSSARY.md` | Terms and abbreviations |

## DocAtlas in Cursor (preferred)

User should install once: `npm install -g github:JeeEko/DocAtlas`

**One slash command** runs the full documentation journey:

| Slash command | What it does |
|---------------|--------------|
| **`/docatlas`** | Full cycle: init → refine → discovery → drift |

The command loads workflow skills in order (`.cursor/skills/docatlas-skill-*/SKILL.md`). Users should **not** invoke those skills directly.

Individual CLI steps (`docatlas init`, `docatlas refine`, `docatlas drift`) remain available in the terminal for automation and CI.

## DocAtlas workflow (always in order)

| Phase | What runs | Who |
|-------|-----------|-----|
| 1 Init | `docatlas init` | CLI (via skill workflow) |
| 2 Refine | `docatlas refine` | CLI — trace routes |
| 3 Discovery | Agent explores code | **Required** — fills accurate docs |
| 4 Drift | `docatlas drift` | CLI — verify complete |

Do **not** skip discovery. Auto-drafts and refine output are `[likely]` until discovery confirms them.

## Rules for agents

1. **Read before you change** — `doc-atlas/docs/START_HERE.md` first
2. **Follow the DocAtlas loop** — init → refine → **discovery** → drift (never skip discovery)
3. **Update docs in the same PR** — Code and docs stay in sync
4. **Use confidence tags** — `[verified]`, `[likely]`, `[uncertain]` (see `doc-atlas/GOVERNANCE/CONFIDENCE_TAGS.md`)
5. **Plain language** — Write for a smart developer new to this repo

## When to update which doc

| Change | Update |
|--------|--------|
| New feature or API | BUSINESS, ARCHITECTURE, RUNBOOK, JOURNEY |
| Business rule or policy | BUSINESS, GLOSSARY, JOURNEY |
| New env var or setup step | ONBOARDING, RUNBOOK |
| New domain term | GLOSSARY |
| User flow changed | JOURNEY doc |

## Do not

- Invent features not present in the codebase
- Mark docs `[verified]` without confirming against code or tests
- Tell users to run `npx github:JeeEko/DocAtlas` if `docatlas` is installed globally
- Tell users to invoke `docatlas-skill-*` directly — use **`/docatlas`**
