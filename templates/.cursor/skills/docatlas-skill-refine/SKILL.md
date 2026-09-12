---
name: docatlas-skill-refine
description: Agent skill for docatlas refine — not a slash command. Use when executing /docatlas-refine or tracing routes in code.
---

# DocAtlas refine (agent skill)

**Not a slash command.** The user runs **`/docatlas-refine`**. This skill guides the agent.

Prefer the CLI over manual exploration.

## Steps

1. Ensure `doc-atlas/.docatlas.json` exists; if not, follow **docatlas-skill-init** first.

2. Run in project root:

   ```bash
   docatlas refine
   ```

3. Read `doc-atlas/docs/JOURNEY-*.md` and summarize for the user (routes traced, coverage %).

4. Tell user **`/docatlas-discovery` is required next** — do not run drift until discovery completes.
