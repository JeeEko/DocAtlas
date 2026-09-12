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

3. Run `docatlas drift` and report the result.
4. Tell the user to open `docs/START_HERE.md`.

## Arguments

Optional journey name from the user message → pass as:

```bash
docatlas init --journey-name "TheirFlowName" --with-governance
```

## Expected outcome

- `docs/` populated, `.docatlas.json` created
- User knows next step: `/docatlas-refine` or `docatlas refine`
