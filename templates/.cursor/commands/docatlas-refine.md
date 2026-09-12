# DocAtlas refine

> **Slash command** — you run **`/docatlas-refine`** in Cursor chat.  
> Pairs with agent skill **`docatlas-skill-refine`** (`.cursor/skills/docatlas-skill-refine/`).

Trace routes through the code and write journey documentation.

## Procedure

1. Confirm `docatlas init` was already run (`doc-atlas/.docatlas.json` exists). If not, run **`/docatlas-init`** first.
2. Follow skill **`docatlas-skill-refine`** and run in the **workspace root**:

```bash
docatlas refine
```

3. Open `doc-atlas/docs/JOURNEY-*.md` and give the user a **short summary** (3–5 bullets) of areas traced and key file paths.
4. Tell the user the **required next step is `/docatlas-discovery`** — do not run drift yet unless discovery was already done.

## Do not

- Replace this with a long manual codebase exploration unless `docatlas refine` failed
- Skip discovery and go straight to drift
- Invent business rules not in the code

## Expected outcome

- Journey doc + route inventory in ARCHITECTURE
- User proceeds to **`/docatlas-discovery`**
