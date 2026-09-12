# DocAtlas refine

> **Slash command** — run **`/docatlas-refine`** in Cursor chat. This file is the full procedure.

Trace routes through the code and write journey documentation.

## Procedure

1. Confirm `doc-atlas/.docatlas.json` exists. If not, run **`/docatlas-init`** first.
2. Run in the **workspace root**:

```bash
docatlas refine
```

3. Read `doc-atlas/docs/JOURNEY-*.md` and summarize for the user (coverage %, key paths).
4. Tell user **`/docatlas-discovery` is required next** — do not run drift yet.

## Do not

- Replace this with manual exploration unless `docatlas refine` failed
- Skip discovery and go straight to drift
- Invent business rules not in the code

## Expected outcome

- Journey doc + route inventory in ARCHITECTURE
- User proceeds to **`/docatlas-discovery`**
