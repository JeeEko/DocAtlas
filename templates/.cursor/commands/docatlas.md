# DocAtlas — full documentation journey

> **Slash command** — run **`/docatlas`** in Cursor chat. This is the **only** DocAtlas slash command users should run.

Run the complete DocAtlas loop in this workspace: **init → refine → discovery → drift**.

Do **not** skip phases. Do **not** invoke workflow skills directly — this command loads them in order.

## Before you start

1. Run `docatlas version` in the workspace root.
2. If missing, tell the user once: `npm install -g github:JeeEko/DocAtlas`

## Choose full journey vs incremental update

| Situation | Action |
|-----------|--------|
| Fresh project or discovery never done | Full journey below (Phases 1–4) |
| Docs filled in, code changed since `lastAnalyzedCommit` | Run `docatlas update` in terminal, then **`.cursor/skills/docatlas-skill-update/SKILL.md`** |
| User asks for targeted refresh only | Update skill only — skip full journey |

Check `doc-atlas/.docatlas.json` for `lastAnalyzedCommit` and `doc-atlas/docs/AI_CONTEXT.md` freshness table.

## Targeted internal doc lookups

For questions about **this repository** during discovery or update (not external libraries):

- Use **`docatlas-docs-lookup`** subagent, or
- MCP: `query_project_docs` / `get_business_context` / `get_journey`, or
- CLI: `docatlas query "<question>"`

Run `docatlas setup --cursor --project` once to wire MCP if tools are unavailable.

## Detect starting phase (full journey)

| State | Start at |
|-------|----------|
| No `doc-atlas/.docatlas.json` | Phase 1 — Init |
| Init done, no `doc-atlas/docs/JOURNEY-*.md` or refine not run | Phase 2 — Refine |
| Refined, docs mostly `[likely]` / templates | Phase 3 — Discovery |
| Discovery complete | Phase 4 — Drift |

If the user asks to re-run everything, start at Phase 1 with `--force` only when they confirm.

## Execute phases in order

For **each** applicable phase below: read the skill file **in full**, follow every step, report a short summary to the user, then continue to the next phase.

### Phase 1 — Init

Read and follow: `.cursor/skills/docatlas-skill-init/SKILL.md`

### Phase 2 — Refine

Read and follow: `.cursor/skills/docatlas-skill-refine/SKILL.md`

### Phase 3 — Discovery (required)

Read and follow: `.cursor/skills/docatlas-skill-discovery/SKILL.md`

Never skip this phase on first run. Auto-drafts and refine output stay `[likely]` until discovery completes.

At end of discovery: set `lastAnalyzedCommit`, `lastAnalyzedAt`, `lastAnalyzedBranch` in `.docatlas.json` and refresh `AI_CONTEXT.md` freshness table.

### Phase 4 — Drift

Read and follow: `.cursor/skills/docatlas-skill-drift/SKILL.md`

## Finish

Summarize for the user:

- Which phases ran
- Journey coverage (from refine) and drift result
- Freshness metadata (commit, date)
- Remaining gaps or open questions
- Point to `doc-atlas/docs/AI_CONTEXT.md` and `START_HERE.md`

## Do not

- Invoke `docatlas-skill-*` skills directly without running this full journey (unless user explicitly asks for update-only or a single CLI phase)
- Skip discovery on first documentation pass
- Mark docs `[verified]` without evidence paths
