---
name: docatlas-skill-drift
description: DocAtlas drift workflow — verify documentation completeness. Invoked by /docatlas Phase 4. Do not invoke directly; run /docatlas instead.
---

# DocAtlas drift workflow

**Phase 4 of the DocAtlas journey.** Loaded by `/docatlas` — not a user-facing entry point.

Verify documentation is complete and consistent after discovery.

## Procedure

1. Confirm Phase 3 (discovery) completed — docs should not be empty templates.
   - If mostly `[likely]` with no evidence, return to discovery workflow first.
2. Run in the **workspace root**:

```bash
docatlas drift
```

Optionally for stricter checks:

```bash
docatlas drift --strict
```

3. Report results plainly:
   - Missing required files
   - Placeholders (`TODO`, `TBD`) remaining
   - Stale or empty sections
4. Fix all reported issues in doc files, then re-run `docatlas drift` until clean (or list unresolved items with reason).

## Do not

- Run drift before discovery on a fresh project
- Ignore drift failures — fix docs or explain blockers

## Expected outcome

- `docatlas drift` passes (or user has a clear list of remaining gaps)
- Documentation journey complete
