# Cloud agent task: DocAtlas maintenance

Use this task for ongoing documentation updates after code changes.

Toolkit reference: https://github.com/JeeEko/DocAtlas

## Goal

Keep documentation in sync with recent code changes. Fix drift, update stale sections, and preserve accuracy tags.

## Before you start

1. Read `.docatlas.json` and `AGENTS.md`
2. Run `docatlas drift` and note current issues
3. Review recent merged PRs or commits (last 1–2 weeks)

## Steps

### 1. Identify what changed

- List files changed in recent merges
- Classify changes: behavior, architecture, ops, or internal-only
- Skip internal-only refactors unless they affect how developers work

### 2. Update affected docs

| Change type | Update |
|-------------|--------|
| New feature or API | `docs/ARCHITECTURE.md`, `docs/RUNBOOK.md` |
| New env var or config | `docs/ONBOARDING.md`, `docs/RUNBOOK.md` |
| New term or domain concept | `docs/GLOSSARY.md` |
| Deploy or CI change | `docs/RUNBOOK.md` |
| Agent workflow change | `AGENTS.md` |

### 3. Refresh confidence tags

- Promote to `[verified]` if you tested the steps
- Mark `[uncertain]` if something needs human confirmation
- Remove `[planned]` for shipped features

### 4. Verify

```bash
docatlas drift
docatlas drift --strict
```

Fix all issues before finishing.

### 5. Commit

Use message format: `docs: sync docs with <brief description of change>`

## Output

- Updated doc files reflecting recent code
- Accurate confidence tags
- Clean drift check
- Short summary of what changed and why

## Do not

- Rewrite docs unrelated to recent changes
- Remove `[uncertain]` tags without verification
- Add speculative architecture
