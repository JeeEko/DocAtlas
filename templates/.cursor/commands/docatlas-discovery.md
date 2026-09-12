# DocAtlas discovery

> **Slash command** — run **`/docatlas-discovery`** in Cursor chat. This file is the full procedure.

**Required** loop step: init → refine → **discovery** → drift.

Deep exploration: read the codebase and fill in DocAtlas docs with verified detail. Use **after** `docatlas init` and **`/docatlas-refine`**.

## Procedure

1. Confirm `doc-atlas/.docatlas.json` exists. If not, run **`/docatlas-init`** first.
2. **Orient** — read in order:
   - `AGENTS.md`, `doc-atlas/AGENTS.md`
   - `doc-atlas/.docatlas.json`
   - `doc-atlas/docs/START_HERE.md`
   - README and package/config files
3. **Explore** the codebase:
   - Business context — README, validation rules, tests, domain models, user-facing copy
   - Entry points, env vars, CI, deploy config
4. **Update docs** (use confidence tags; `[verified]` only when confirmed):

| File | Focus |
|------|-------|
| `doc-atlas/docs/BUSINESS.md` | Problem, users, capabilities, business rules |
| `doc-atlas/docs/ARCHITECTURE.md` | Components, data flow |
| `doc-atlas/docs/ONBOARDING.md` | Setup, first tasks |
| `doc-atlas/docs/RUNBOOK.md` | Dev, build, deploy, troubleshoot |
| `doc-atlas/docs/GLOSSARY.md` | Domain terms |

5. Run `docatlas drift` and fix all issues.

## Do not

- Skip reading the code — this is the quality pass, not `docatlas refine`
- Invent features or business rules — cite README, tests, or code
- Mark `[verified]` without evidence

## Expected outcome

- Docs upgraded from `[likely]` to accurate guides
- User proceeds to **`/docatlas-drift`** or `docatlas drift`
