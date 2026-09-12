# DocAtlas init

> **Slash command** — you run **`/docatlas-init`** in Cursor chat.  
> Pairs with agent skill **`docatlas-skill-init`** (`.cursor/skills/docatlas-skill-init/`).

Set up DocAtlas documentation in **this workspace**.

## Procedure

1. Confirm `docatlas` is installed: run `docatlas version` in the project root.
   - If missing, tell the user to run once: `npm install -g github:JeeEko/DocAtlas`
2. Follow skill **`docatlas-skill-init`** and run in the **workspace root**:

```bash
docatlas init --with-governance
```

Use `--force` only if DocAtlas already exists and the user wants to reset.

3. Tell the user the **DocAtlas loop** (do not run drift yet):

```
docatlas refine  →  /docatlas-discovery  →  docatlas drift
```

4. Tell the user to open `doc-atlas/docs/START_HERE.md` and run **`/docatlas-refine`** next.

## Arguments

Optional journey name from the user message → pass as:

```bash
docatlas init --journey-name "TheirFlowName" --with-governance
```

## Expected outcome

- `doc-atlas/` populated (docs, governance, config)
- User knows next step: **`/docatlas-refine`** (then discovery, then drift)

## Layout

| Location | Contents |
|----------|----------|
| `doc-atlas/` | All project docs, `.docatlas.json`, governance |
| `.cursor/commands/` | **Slash commands** (`/docatlas-*`) |
| `.cursor/skills/` | **Agent skills** (`docatlas-skill-*`) |
| `AGENTS.md` (root) | Short pointer to `doc-atlas/` |
