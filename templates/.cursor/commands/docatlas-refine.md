# DocAtlas refine

Trace user-facing areas through the code and write journey documentation.

## Procedure

1. Confirm `docatlas init` was already run (`doc-atlas/.docatlas.json` exists). If not, run `/docatlas-init` first.
2. Run in the **workspace root**:

```bash
docatlas refine
```

3. Run `docatlas drift`.
4. Open `doc-atlas/docs/JOURNEY-*.md` and give the user a **short summary** (3–5 bullets) of the areas traced and key file paths.
5. Only edit docs manually if drift failed or paths are clearly wrong.

## Do not

- Replace this with a long manual codebase exploration unless `docatlas refine` failed
- Invent business rules not in the code
- Assume a specific domain (e-commerce, auth-only app, etc.) — DocAtlas discovers from repo structure

## Expected outcome

- Journey doc listing **pages and API groups found in this repo**
- Route inventory appended to `ARCHITECTURE.md`
- Drift clean or user informed of remaining gaps
