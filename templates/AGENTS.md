# AGENTS.md

Guidance for AI agents working in this repository.

This project uses [DocAtlas](https://github.com/JeeEko/DocAtlas) for documentation.

**Project:** __JOURNEY_NAME__

## Documentation map

| File | Purpose |
|------|---------|
| `docs/ARCHITECTURE.md` | System design and components |
| `docs/ONBOARDING.md` | New developer setup guide |
| `docs/RUNBOOK.md` | Run, deploy, troubleshoot |
| `docs/GLOSSARY.md` | Terms and abbreviations |

## Rules for agents

1. **Read before you change** — Check existing docs before editing code that affects behavior
2. **Update docs in the same PR** — Code and docs should stay in sync
3. **Use confidence tags** — `[verified]`, `[likely]`, `[uncertain]`, `[planned]` (see `GOVERNANCE/CONFIDENCE_TAGS.md` if present)
4. **Run drift check** — Execute `docatlas drift` before finishing doc work
5. **Plain language** — Write for a smart developer who is new to this repo

## When to update which doc

| Change | Update |
|--------|--------|
| New feature or API | ARCHITECTURE, RUNBOOK |
| New env var or setup step | ONBOARDING, RUNBOOK |
| New domain term | GLOSSARY |
| CI or deploy change | RUNBOOK |

## Do not

- Invent features not present in the codebase
- Mark docs `[verified]` without confirming against code or tests
- Remove existing team documentation without reason

## Toolkit

- DocAtlas: https://github.com/JeeEko/DocAtlas
- Drift check: `docatlas drift`
- Bootstrap: `docatlas bootstrap --journey-name "__JOURNEY_NAME__"`
