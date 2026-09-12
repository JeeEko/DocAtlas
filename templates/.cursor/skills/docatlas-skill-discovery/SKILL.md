---
name: docatlas-skill-discovery
description: DocAtlas discovery workflow — map business contexts, explore codebase, fill accurate docs. Invoked by /docatlas Phase 3. Do not invoke directly; run /docatlas instead.
---

# DocAtlas discovery workflow

**Phase 3 of the DocAtlas journey (required).** Loaded by `/docatlas` — not a user-facing entry point.

Deep exploration: investigate the project as a whole, validate business context boundaries, and fill documentation with verified detail.

Toolkit: https://github.com/JeeEko/DocAtlas

## When this phase applies

- After init and refine (required loop step)
- Docs are still templates or mostly `[likely]`
- A major feature changed architecture or business rules

## Workflow

### 1. Orient

Read in order:

1. `AGENTS.md` and `doc-atlas/AGENTS.md`
2. `doc-atlas/.docatlas.json` (note `businessContexts`)
3. `doc-atlas/docs/business/CONTEXT-MAP.md`
4. `doc-atlas/docs/BUSINESS.md` (index only — detail lives in context docs)
5. Existing `doc-atlas/docs/JOURNEY-*.md`, `ARCHITECTURE.md`
6. README and package/config files

### 2. Investigate the project holistically

Explore the **whole codebase** to understand business areas:

- Monorepo packages / workspaces — what each area owns
- `src/domains`, `modules`, `features` folders if present
- API route prefixes and OpenAPI tags
- Test suite layout — `tests/billing`, `*.spec.ts` naming
- README, ADRs, product docs, validation rules, domain models
- User-facing copy and error messages

**Goal:** confirm, merge, split, or rename contexts in the map. Do not invent domains without evidence.

If the map is stale (e.g. after major refactor), run:

```bash
docatlas map-contexts --force
```

Then edit `CONTEXT-MAP.md` to reflect what you verified.

### 3. Update the context map

Edit `doc-atlas/docs/business/CONTEXT-MAP.md`:

- Fix context names and boundaries
- Document relationships between contexts
- List open questions where evidence is weak
- Update `doc-atlas/.docatlas.json` `businessContexts` if you add/remove contexts (keep `doc` paths accurate)

When adding a context manually, copy `business/contexts/_TEMPLATE.md` to `business/contexts/<slug>.md`.

### 4. Fill per-context business docs

For **each** context in the map, update `doc-atlas/docs/business/contexts/<slug>.md`:

| Section | Source |
|---------|--------|
| Scope | What this area owns / excludes |
| Actors | README, auth roles, user types |
| Capabilities | User-visible outcomes in this area |
| Business rules | Tests, validation, domain code — cite source |
| Related journeys | Links to `JOURNEY-*.md` steps |
| Related technical | Pointers into `ARCHITECTURE.md` |

Then update `doc-atlas/docs/BUSINESS.md` (short index + links only — no long rule tables).

### 5. Fill technical and journey docs

| File | Focus |
|------|-------|
| `doc-atlas/docs/ARCHITECTURE.md` | Components, data flow — align with contexts |
| `doc-atlas/docs/ONBOARDING.md` | Setup, first tasks |
| `doc-atlas/docs/RUNBOOK.md` | Dev, build, deploy, troubleshoot |
| `doc-atlas/docs/GLOSSARY.md` | Domain terms (cross-link to context docs) |
| `doc-atlas/docs/JOURNEY-*.md` | Upgrade steps from `[likely]` to verified |

Use confidence tags (`doc-atlas/GOVERNANCE/CONFIDENCE_TAGS.md`). Only use `[verified]` with evidence.

### 6. Self-check before Phase 4

- Every mapped context has a filled doc (no empty TODO sections where evidence exists)
- No invented business rules — cite README, tests, or code
- `BUSINESS.md` stays a short index, not a monolith

## Do not

- Put all business rules in one giant `BUSINESS.md`
- Skip context mapping — enterprise docs scale by area
- Mark `[verified]` without evidence

## Expected outcome

- Validated `CONTEXT-MAP.md` and per-context docs
- Technical docs aligned with contexts
- Ready for Phase 4 — Drift
