---
name: docatlas-skill-discovery
description: DocAtlas discovery workflow — explore codebase and fill in accurate docs. Invoked by /docatlas Phase 3. Do not invoke directly; run /docatlas instead.
---

# DocAtlas discovery workflow

**Phase 3 of the DocAtlas journey (required).** Loaded by `/docatlas` — not a user-facing entry point.

Deep exploration: read the codebase and fill in DocAtlas docs with verified detail. This is the quality pass — not automated tracing.

Toolkit: https://github.com/JeeEko/DocAtlas

## When this phase applies

- After init and refine (required loop step)
- Docs are still templates or mostly `[likely]`
- A major feature changed architecture or business rules

## Workflow

### 1. Orient

Read in order:

1. `AGENTS.md` and `doc-atlas/AGENTS.md`
2. `doc-atlas/.docatlas.json`
3. Existing files in `doc-atlas/docs/` (especially `START_HERE.md`, `JOURNEY-*.md`)
4. README and package/config files (`package.json`, env examples, CI config)

### 2. Explore the codebase

Find and read:

- **Business context** — README, product docs, validation rules, test names, domain models, user-facing copy, error messages
- **Entry points** — main modules, app bootstrap, server entry
- **Config** — environment variables, feature flags, secrets layout (names only)
- **Tests** — what behavior is asserted; test file names often reveal domain rules
- **Deploy** — Docker, CI/CD, cloud config, build scripts

Trace code paths for journeys already listed in `JOURNEY-*.md`. Confirm each step against real handlers, components, and API routes.

### 3. Fill in docs

| File | Focus |
|------|-------|
| `doc-atlas/docs/BUSINESS.md` | Problem, users, capabilities, business rules (from evidence) |
| `doc-atlas/docs/ARCHITECTURE.md` | Components, data flow, dependencies — align with route inventory |
| `doc-atlas/docs/ONBOARDING.md` | Prerequisites, setup, first tasks |
| `doc-atlas/docs/RUNBOOK.md` | Dev, build, deploy, troubleshooting |
| `doc-atlas/docs/GLOSSARY.md` | Domain terms found in code and UI |
| `doc-atlas/docs/JOURNEY-*.md` | Upgrade steps from `[likely]` to verified where confirmed |

Use confidence tags (`doc-atlas/GOVERNANCE/CONFIDENCE_TAGS.md`). Only use `[verified]` for confirmed facts.

### 4. Self-check before Phase 4

- No invented features or business rules — every rule cites README, tests, or code
- Plain English — explain like onboarding a smart new hire
- Small accurate updates beat large speculative rewrites

## Do not

- Skip reading the code — this is not `docatlas refine`
- Mark `[verified]` without evidence
- Run drift inside this skill without finishing doc updates first

## Expected outcome

- Docs upgraded from `[likely]` to accurate, evidence-backed guides
- Ready for Phase 4 — Drift
