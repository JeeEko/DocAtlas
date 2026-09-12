---
name: docatlas-skill-init
description: DocAtlas init workflow — scaffold docs and Cursor integration. Invoked by /docatlas Phase 1. Do not invoke directly; run /docatlas instead.
---

# DocAtlas init workflow

**Phase 1 of the DocAtlas journey.** Loaded by `/docatlas` — not a user-facing entry point.

Set up DocAtlas documentation in **this workspace**.

## Procedure

1. Confirm `docatlas` is installed: run `docatlas version` in the project root.
   - If missing, tell the user: `npm install -g github:JeeEko/DocAtlas`
2. Run in the **workspace root**:

```bash
docatlas init --with-governance
```

Use `--force` only if DocAtlas already exists and the user wants to reset.

Add `--journey-name "Name"` if the user provided one.

3. Verify created:
   - `doc-atlas/.docatlas.json`
   - `doc-atlas/docs/START_HERE.md`, `BUSINESS.md`, etc.
   - `.cursor/commands/docatlas.md`
   - `.cursor/skills/docatlas-skill-*/SKILL.md`

## Do not

- Use `npx` if `docatlas` is installed globally
- Run drift at this stage

## Expected outcome

- `doc-atlas/` populated (docs, governance, config)
- Cursor command and skills copied
- Ready for Phase 2 — Refine
