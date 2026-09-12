# DocAtlas init

Set up DocAtlas documentation in **this workspace**.

## Procedure

1. Confirm `docatlas` is installed: run `docatlas version` in the project root.
   - If missing, tell the user to run once: `npm install -g github:JeeEko/DocAtlas`
2. Run in the **workspace root**:

```bash
docatlas init --with-governance
```

Use `--force` only if DocAtlas already exists and the user wants to reset.

3. Tell the user the **DocAtlas loop** (do not run drift yet):

```
docatlas refine  →  /docatlas-discovery  →  docatlas drift
```

4. Tell the user to open `doc-atlas/docs/START_HERE.md` and run `/docatlas-refine` next.

## Arguments

Optional journey name from the user message → pass as:

```bash
docatlas init --journey-name "TheirFlowName" --with-governance
```

## Expected outcome

- `doc-atlas/` populated (docs, governance, config)
- `.cursor/commands` and `.cursor/skills` for slash commands
- User knows next step: `/docatlas-refine` (then **discovery**, then drift)

## Layout

| Location | Contents |
|----------|----------|
| `doc-atlas/` | All project docs, `.docatlas.json`, governance |
| `.cursor/commands/` | Slash commands (required by Cursor) |
| `.cursor/skills/` | Agent skills (required by Cursor) |
| `AGENTS.md` (root) | Short pointer to `doc-atlas/` |
