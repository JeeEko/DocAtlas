# DocAtlas — full documentation journey

> **Slash command** — run **`/docatlas`** in Cursor chat. This is the **only** DocAtlas slash command users should run.

Run the complete DocAtlas loop in this workspace: **init → refine → discovery → drift**.

Do **not** skip phases. Do **not** invoke workflow skills directly — this command loads them in order.

## Before you start

1. Run `docatlas version` in the workspace root.
2. If missing, tell the user once: `npm install -g github:JeeEko/DocAtlas`

## Detect starting phase

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

Never skip this phase. Auto-drafts and refine output stay `[likely]` until discovery completes.

### Phase 4 — Drift

Read and follow: `.cursor/skills/docatlas-skill-drift/SKILL.md`

## Finish

Summarize for the user:

- Which phases ran
- Journey coverage (from refine) and drift result
- Remaining gaps or open questions
- Point to `doc-atlas/docs/START_HERE.md` for day-to-day use

## Do not

- Invoke `docatlas-skill-*` skills directly without running this full journey (unless user explicitly asks for a single phase in terminal)
- Skip discovery
- Mark docs `[verified]` without evidence
