---
name: docatlas-refine
description: Run docatlas refine in the workspace to trace the main user flow in code. Use after init or when the user runs /docatlas-refine.
---

# DocAtlas refine skill

Prefer the CLI over manual exploration.

## Steps

1. Ensure `doc-atlas/.docatlas.json` exists; if not, run docatlas-init skill first.

2. Run in project root:

   ```bash
   docatlas refine
   ```

3. Run `docatlas drift`.

4. Read `doc-atlas/docs/JOURNEY-*.md` and summarize for the user in plain language with a few file paths.

5. Fix doc issues only if drift failed or user asked.

Do not require a long custom prompt from the user — this skill replaces that.
