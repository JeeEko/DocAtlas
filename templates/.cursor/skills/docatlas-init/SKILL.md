---
name: docatlas-init
description: Run docatlas init in the workspace to add and draft project documentation. Use when setting up DocAtlas on a repo or when the user runs /docatlas-init.
---

# DocAtlas init skill

Run the **installed** DocAtlas CLI in the project root. Do not use `npx` unless `docatlas` is not on PATH.

## Steps

1. Run `docatlas version`. If it fails, instruct user to install once:

   `npm install -g github:JeeEko/DocAtlas`

2. Run:

   ```bash
   docatlas init --with-governance
   ```

   Add `--force` only if user confirms reset. Add `--journey-name "Name"` if user provided one.

3. Run `docatlas drift` and report.

4. Point user to `doc-atlas/docs/START_HERE.md` and `/docatlas-refine` as next step.

## Output layout

Everything DocAtlas owns goes under `doc-atlas/`. Cursor hooks stay in `.cursor/`.
