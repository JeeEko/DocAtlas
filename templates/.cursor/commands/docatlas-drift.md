# DocAtlas drift

> **Slash command** — run **`/docatlas-drift`** in Cursor chat. This file is the full procedure.

Check whether documentation is complete.

## Procedure

1. Confirm **`/docatlas-discovery` was already run**. If docs are still mostly templates, run **`/docatlas-discovery`** first.
2. Run in the **workspace root**:

```bash
docatlas drift
```

Use `--strict` if the user wants a failing exit on issues.

3. Report issues plainly. If problems exist, suggest **`/docatlas-discovery`** or **`/docatlas-refine`**.

## Expected outcome

- User knows if docs are complete
- List of any missing files or placeholders
