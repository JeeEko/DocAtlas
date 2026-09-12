# DocAtlas discovery

**Required step** in the DocAtlas loop: init → refine → **discovery** → drift.

Deep exploration pass: read the codebase and **fill in** DocAtlas docs with verified detail.

Use this **after** `docatlas init` and usually **after** `docatlas refine` — when auto-drafts and route traces need human-quality prose.

## Procedure

1. Confirm `doc-atlas/` exists (`.docatlas.json`). If not, run `/docatlas-init` first.
2. Read the **docatlas-discovery** skill: `.cursor/skills/docatlas-discovery/SKILL.md` — follow it fully.
3. Orient: `doc-atlas/docs/START_HERE.md`, `doc-atlas/.docatlas.json`, README, package files.
4. Explore the codebase (entry points, env vars, CI, deploy config).
5. Update docs with confidence tags:
   - `doc-atlas/docs/ARCHITECTURE.md` — components, data flow
   - `doc-atlas/docs/ONBOARDING.md` — setup, first tasks
   - `doc-atlas/docs/RUNBOOK.md` — dev, build, deploy, troubleshoot
   - `doc-atlas/docs/GLOSSARY.md` — domain terms
6. Run `docatlas drift` and fix all issues.

## Do not

- Skip reading the code — discovery is manual/agent depth, not `docatlas refine`
- Mark `[verified]` without confirming against code or tests
- Invent features not in the repo

## Expected outcome

- Docs upgraded from `[likely]` templates to accurate, readable guides
- Drift clean
- User knows remaining gaps (if any) as `[uncertain]` with owner or issue link
