# DocAtlas init

> **Slash command** — run **`/docatlas-init`** in Cursor chat. This file is the full procedure.

Set up DocAtlas documentation in **this workspace**.

## Procedure

1. Confirm `docatlas` is installed: run `docatlas version` in the project root.
   - If missing, tell the user to run once: `npm install -g github:JeeEko/DocAtlas`
2. Run in the **workspace root**:

```bash
docatlas init --with-governance
```

Use `--force` only if DocAtlas already exists and the user wants to reset.

Add `--journey-name "Name"` if the user provided one.

3. Tell the user the **DocAtlas loop**:

```
docatlas refine  →  /docatlas-discovery  →  docatlas drift
```

4. Point user to `doc-atlas/docs/START_HERE.md` and **`/docatlas-refine`** as next step (not drift yet).

## Do not

- Use `npx` if `docatlas` is installed globally
- Run drift at this stage

## Expected outcome

- `doc-atlas/` populated (docs, governance, config)
- `.cursor/commands/docatlas-*.md` copied for slash commands
- User knows next step: **`/docatlas-refine`**
