---
name: docatlas-refine
description: Run docatlas refine in the workspace to trace routes in code. Use after init or when the user runs /docatlas-refine.
---

# DocAtlas refine skill

Prefer the CLI over manual exploration.

## Steps

1. Ensure `doc-atlas/.docatlas.json` exists; if not, run docatlas-init skill first.

2. Run in project root:

   ```bash
   docatlas refine
   ```

3. Read `doc-atlas/docs/JOURNEY-*.md` and summarize for the user (routes traced, coverage %).

4. Tell user **`/docatlas-discovery` is required next** — do not run drift until discovery completes.

Do not require a long custom prompt from the user — this skill replaces manual route tracing.
