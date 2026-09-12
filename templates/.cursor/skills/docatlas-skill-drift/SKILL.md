---
name: docatlas-skill-drift
description: Agent skill for docatlas drift — not a slash command. Use when executing /docatlas-drift or checking doc completeness after discovery.
---

# DocAtlas drift (agent skill)

**Not a slash command.** The user runs **`/docatlas-drift`**. This skill guides the agent.

## Steps

1. Confirm `/docatlas-discovery` was run (docs filled in, not just auto-drafts). If unsure, tell user to run **`/docatlas-discovery`** first.

2. Run in project root:

   ```bash
   docatlas drift
   ```

3. Report results. If issues, suggest **`/docatlas-discovery`** or **`/docatlas-refine`**.
