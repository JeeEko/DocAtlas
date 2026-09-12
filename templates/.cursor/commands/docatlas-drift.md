# DocAtlas drift

Check whether documentation matches the project.

## Procedure

1. Confirm **`/docatlas-discovery` was already run** (docs should have `[verified]` sections, not only `[likely]` templates). If not, run `/docatlas-discovery` first.
2. Run in the **workspace root**:

```bash
docatlas drift
```

Use `docatlas drift --strict` if the user wants a failing exit on issues.

Report issues plainly. If problems exist, suggest `/docatlas-discovery` or `/docatlas-refine` — do not rewrite all docs unless asked.

## Expected outcome

- User knows if docs are complete
- List of any missing files or placeholders
- Ready to commit `doc-atlas/`
