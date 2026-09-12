# AGENTS.md

Guidance for AI agents working in this repository.

This project uses [DocAtlas](https://github.com/JeeEko/DocAtlas) for documentation.

**Project:** __JOURNEY_NAME__

## Documentation map

| File | Purpose |
|------|---------|
| `doc-atlas/docs/START_HERE.md` | **Read first** — 2-minute orientation |
| `doc-atlas/docs/JOURNEY-*.md` | Main user flow traced in code |
| `doc-atlas/docs/ARCHITECTURE.md` | System design and components |
| `doc-atlas/docs/ONBOARDING.md` | New developer setup guide |
| `doc-atlas/docs/RUNBOOK.md` | Run, deploy, troubleshoot |
| `doc-atlas/docs/GLOSSARY.md` | Terms and abbreviations |

## DocAtlas in Cursor (preferred)

User should install once: `npm install -g github:JeeEko/DocAtlas`

Then use **slash commands** in this repo:

| Command | Runs |
|---------|------|
| `/docatlas-init` | `docatlas init` |
| `/docatlas-refine` | `docatlas refine` |
| `/docatlas-discovery` | Agent deep-dive — fill in docs from code |
| `/docatlas-drift` | `docatlas drift` |

Agents: follow `.cursor/commands/docatlas-*.md` or matching skills under `.cursor/skills/`.

## DocAtlas workflow (always in order)

| Step | Command | Who |
|------|---------|-----|
| 1 | `docatlas init` | CLI — once per project |
| 2 | `docatlas refine` | CLI — trace routes |
| 3 | **`/docatlas-discovery`** | **Agent — required quality pass** |
| 4 | `docatlas drift` | CLI — verify docs complete |

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
| New feature or API | ARCHITECTURE, RUNBOOK, JOURNEY |
| New env var or setup step | ONBOARDING, RUNBOOK |
| New domain term | GLOSSARY |
| User flow changed | JOURNEY doc |

## Do not

- Invent features not present in the codebase
- Mark docs `[verified]` without confirming against code or tests
- Tell users to run `npx github:JeeEko/DocAtlas` if `docatlas` is installed globally
