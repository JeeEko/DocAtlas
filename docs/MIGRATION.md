# Migrating DocAtlas

Guide for upgrading projects between major DocAtlas versions.

## v2.1 → v3.0

**New:** epistemic labels, evidence citations, `AI_CONTEXT.md`, freshness metadata, `docatlas update`, `docatlas-skill-update`.

```bash
npm install -g github:JeeEko/DocAtlas
docatlas init --force
```

Then in Cursor: run **`/docatlas`** discovery once to fill `AI_CONTEXT.md` and set `lastAnalyzedCommit`.

Or manually:

1. Copy new templates from the toolkit if you avoid `--force`
2. Add `doc-atlas/docs/AI_CONTEXT.md`
3. Add `.cursor/skills/docatlas-skill-update/`
4. Extend business rule tables with **Epistemic** and **Evidence** columns

## v3.0 → v3.1

**New:** specialist agents, enterprise doc taxonomy, semantic drift, `docatlas doctor`.

Standard (default):

```bash
docatlas init --force
```

Enterprise monorepo:

```bash
docatlas init --force --taxonomy enterprise
```

Adds `system/`, `integrations/`, `data/`, `decisions/`, `risks/` under `doc-atlas/docs/`.

Verify kit:

```bash
docatlas doctor
```

## v3.1 → v4.0

**New:** DocAtlas Explorer extension, hybrid refine seeding, npm install path.

```bash
npm install -g docatlas
docatlas install-explorer   # optional IDE viewer
docatlas refine             # seeds integrations/ and system/ docs
```

## Freshness

After any upgrade, run discovery or update once to set:

- `lastAnalyzedCommit`
- `lastAnalyzedAt`
- `lastAnalyzedBranch`

in `doc-atlas/.docatlas.json`.
