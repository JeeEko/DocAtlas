---
name: docatlas-skill-refine
description: DocAtlas refine workflow — trace routes with framework parsers. Invoked by /docatlas Phase 2. Do not invoke directly; run /docatlas instead.
---

# DocAtlas refine workflow

**Phase 2 of the DocAtlas journey.** Loaded by `/docatlas` — not a user-facing entry point.

Trace routes through the code and write journey documentation using automated parsers.

## Procedure

1. Confirm `doc-atlas/.docatlas.json` exists. If not, Phase 1 (init) must run first.
2. Run in the **workspace root**:

```bash
docatlas refine
```

3. Read output and inspect:
   - `doc-atlas/docs/JOURNEY-*.md` — traced user flows
   - Route inventory section in `doc-atlas/docs/ARCHITECTURE.md`
4. Summarize for the user:
   - Coverage percentage reported by CLI
   - Key pages and API paths found
   - Any gaps or unsupported frameworks

## Do not

- Replace this with manual route guessing unless `docatlas refine` failed — report the error instead
- Invent business rules not present in the code
- Run drift yet — discovery comes next

## Expected outcome

- Journey doc(s) and route inventory drafted (mostly `[likely]`)
- Ready for Phase 3 — Discovery
