# DocAtlas refine

Trace the main user flow through the code and write journey documentation.

## Procedure

1. Confirm `docatlas init` was already run (`.docatlas.json` exists). If not, run `/docatlas-init` first.
2. Run in the **workspace root**:

```bash
docatlas refine
```

3. Run `docatlas drift`.
4. Open `docs/JOURNEY-*.md` and give the user a **short summary** (3–5 bullets) of the flow and key file paths.
5. Only edit docs manually if drift failed or paths are clearly wrong.

## Do not

- Replace this with a long manual codebase exploration unless `docatlas refine` failed
- Invent business rules not in the code

## Expected outcome

- Journey doc with catalog → … → confirmation steps (or project equivalent)
- Drift clean or user informed of remaining gaps
