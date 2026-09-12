# AGENTS.md

Guidance for AI agents working in this repository.

This project uses [DocAtlas](https://github.com/JeeEko/DocAtlas) for documentation.

**Project:** __JOURNEY_NAME__

## Documentation map

| File | Purpose |
|------|---------|
| `docs/START_HERE.md` | **Read first** — 2-minute orientation |
| `docs/JOURNEY-*.md` | Main user flow traced in code |
| `docs/ARCHITECTURE.md` | System design and components |
| `docs/ONBOARDING.md` | New developer setup guide |
| `docs/RUNBOOK.md` | Run, deploy, troubleshoot |
| `docs/GLOSSARY.md` | Terms and abbreviations |

## DocAtlas in Cursor (preferred)

User should install once: `npm install -g github:JeeEko/DocAtlas`

Then use **slash commands** in this repo:

| Command | Runs |
|---------|------|
| `/docatlas-init` | `docatlas init` |
| `/docatlas-refine` | `docatlas refine` |
| `/docatlas-drift` | `docatlas drift` |

Agents: follow `.cursor/commands/docatlas-*.md` or matching skills under `.cursor/skills/`.

## Rules for agents

1. **Read before you change** — `docs/START_HERE.md` first
2. **Prefer DocAtlas CLI** — run `docatlas refine` / `docatlas drift` instead of reinventing long discovery prompts
3. **Update docs in the same PR** — Code and docs stay in sync
4. **Use confidence tags** — `[verified]`, `[likely]`, `[uncertain]` (see `GOVERNANCE/CONFIDENCE_TAGS.md`)
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
