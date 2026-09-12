# DocAtlas drift

> **Slash command** — you run **`/docatlas-drift`** in Cursor chat.  
> Pairs with agent skill **`docatlas-skill-drift`** (`.cursor/skills/docatlas-skill-drift/`).

Check whether documentation matches the project.

## Procedure

1. Confirm **`/docatlas-discovery` was already run** (docs should have `[verified]` sections, not only `[likely]` templates). If not, run **`/docatlas-discovery`** first.
2. Follow skill **`docatlas-skill-drift`** and run in the **workspace root**:

```bash
docatlas drift
```

Use `docatlas drift --strict` if the user wants a failing exit on issues.

Report issues plainly. If problems exist, suggest **`/docatlas-discovery`** or **`/docatlas-refine`**.

## Expected outcome

- User knows if docs are complete
- List of any missing files or placeholders
