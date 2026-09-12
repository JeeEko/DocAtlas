---
name: docatlas-skill-update
description: Incrementally refresh DocAtlas docs after code changes. Use after features, refactors, or when docs may be stale. Run docatlas update first for impacted doc list.
---

# DocAtlas incremental update workflow

**Targeted refresh** after code changes — not a full `/docatlas` journey unless discovery never completed.

Toolkit: https://github.com/JeeEko/DocAtlas

## When to use

- After material code changes (APIs, domains, data, infra, flows)
- When `docatlas update` reports architecture impact
- When `AI_CONTEXT.md` freshness shows commits behind HEAD

## Do not use when

- DocAtlas never initialized — run `/docatlas` instead
- Discovery never completed (docs mostly TODO) — run `/docatlas` Phase 3 first
- `docatlas update` reports no architecture impact

## Workflow

### 1. Establish baseline

Read:

- `doc-atlas/docs/AI_CONTEXT.md`
- `doc-atlas/.docatlas.json` (`lastAnalyzedCommit`, `businessContexts`)
- `doc-atlas/docs/business/CONTEXT-MAP.md`

Run in terminal (optional):

```bash
docatlas update
```

Use its **impacted docs** list to focus work.

### 2. Determine changes

Use Git:

- Diff from `lastAnalyzedCommit` to HEAD
- Categorize: domain, API, data, integration, infra, config, docs-only

**Architecture impact gate:** skip if only trivial internal changes or docs-only edits with no code drift concern.

### 3. Update impacted docs only

For each impacted file:

- Upgrade content from code/tests/README evidence
- Use epistemic labels (OBSERVED, DECLARED, INFERRED, UNKNOWN) + confidence tags
- Cite evidence: `path/to/file.ext#L10`
- Do not rewrite unrelated sections

Typical mapping:

| Change type | Update |
|-------------|--------|
| Domain/business logic | `business/contexts/*.md`, GLOSSARY |
| API/routes | JOURNEY-*.md, ARCHITECTURE route inventory |
| Data/persistence | ARCHITECTURE, context docs |
| Infra/deploy | RUNBOOK, ARCHITECTURE |
| Config/env | ONBOARDING, RUNBOOK |

### 4. Refresh orientation files

Update:

- `doc-atlas/docs/AI_CONTEXT.md` — purpose, context links, journey links
- `doc-atlas/docs/BUSINESS.md` — index links only (not full rule dumps)

### 5. Record freshness

After updates, set in `doc-atlas/.docatlas.json`:

- `lastAnalyzedCommit` — current HEAD
- `lastAnalyzedAt` — ISO timestamp
- `lastAnalyzedBranch` — current branch

Update freshness table in `AI_CONTEXT.md`.

### 6. Verify

```bash
docatlas drift
```

Fix any reported issues.

## Do not

- Modify application source code
- Invent business rules without evidence
- Run full re-init unless user confirms `--force`

## Expected outcome

- Impacted docs refreshed with evidence citations
- Freshness metadata current
- `docatlas drift` passes (or clear remaining gaps listed)
