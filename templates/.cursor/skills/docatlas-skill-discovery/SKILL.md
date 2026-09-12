---
name: docatlas-skill-discovery
description: DocAtlas discovery orchestrator — specialist agents map contexts and fill accurate docs. Invoked by /docatlas Phase 3. Do not invoke directly; run /docatlas instead.
---

# DocAtlas discovery workflow

**Phase 3 of the DocAtlas journey (required).** Loaded by `/docatlas` — not a user-facing entry point.

Orchestrate specialist agents to investigate the project, validate business contexts, and fill documentation with verified detail.

Toolkit: https://github.com/JeeEko/DocAtlas

## Workflow

### 1. Orient

Read:

1. `AGENTS.md`, `doc-atlas/AGENTS.md`, `doc-atlas/docs/AI_CONTEXT.md`
2. `doc-atlas/.docatlas.json` (`businessContexts`, `docTaxonomy`)
3. `doc-atlas/docs/business/CONTEXT-MAP.md`
4. `JOURNEY-*.md`, `ARCHITECTURE.md`
5. README, package files, CI config

If CONTEXT-MAP is stale: `docatlas map-contexts --force`

### 2. Launch specialist agents (parallel where possible)

Use `.cursor/agents/`:

| Agent | Output |
|-------|--------|
| `docatlas-domain-analyzer` | `business/contexts/*.md`, CONTEXT-MAP, GLOSSARY |
| `docatlas-integration-analyzer` | `integrations/*.md`, ARCHITECTURE APIs |
| `docatlas-data-analyzer` | `data/*.md` |
| `docatlas-system-analyzer` | `system/*.md`, ARCHITECTURE |
| `docatlas-infra-analyzer` | `system/deployment.md`, RUNBOOK |

Each agent: read-only, evidence paths required, epistemic labels on claims.

### 3. Reconcile

- Resolve contradictions between specialists
- Merge/split/rename contexts in CONTEXT-MAP with evidence
- Update `businessContexts` in `.docatlas.json`
- Keep `BUSINESS.md` as short index only

### 4. Fill remaining docs

| File | Focus |
|------|--------|
| `ONBOARDING.md` | Setup, first tasks |
| `JOURNEY-*.md` | Upgrade steps with evidence citations |
| `decisions/*.md`, `risks/*.md` | Observed decisions and risks (do not fabricate ADRs) |

### 5. Write AI_CONTEXT.md

Compact orientation: purpose, context links, journeys, integrations/data summary, constraints, freshness placeholder.

### 6. Record freshness

Set in `.docatlas.json`:

- `lastAnalyzedCommit` — `git rev-parse HEAD`
- `lastAnalyzedAt` — ISO timestamp
- `lastAnalyzedBranch` — current branch

Update freshness table in `AI_CONTEXT.md`.

### 7. Self-check

- Evidence paths on business rules
- No INFERRED/UNKNOWN promoted to OBSERVED without evidence
- Run `docatlas drift` mentally — fix before Phase 4

## Do not

- Put all rules in one `BUSINESS.md`
- Invent domains or ADRs
- Modify application source code

## Expected outcome

- Validated context map + per-context docs
- `AI_CONTEXT.md` complete
- Freshness metadata set
- Ready for Phase 4 — Drift
