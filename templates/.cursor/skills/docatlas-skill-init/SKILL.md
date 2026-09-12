---
name: docatlas-skill-init
description: Agent skill for docatlas init — not a slash command. Use when executing /docatlas-init or when the user asks to set up DocAtlas.
---

# DocAtlas init (agent skill)

**Not a slash command.** The user runs **`/docatlas-init`**. This skill guides the agent.

Run the **installed** DocAtlas CLI in the project root. Do not use `npx` unless `docatlas` is not on PATH.

## Steps

1. Run `docatlas version`. If it fails, instruct user to install once:

   `npm install -g github:JeeEko/DocAtlas`

2. Run:

   ```bash
   docatlas init --with-governance
   ```

   Add `--force` only if user confirms reset. Add `--journey-name "Name"` if user provided one.

3. Tell user the full loop:

   **refine → discovery → drift**

4. Point user to `doc-atlas/docs/START_HERE.md` and **`/docatlas-refine`** as next step (not drift yet).

## Output layout

Everything DocAtlas owns goes under `doc-atlas/`. Cursor hooks stay in `.cursor/`.
