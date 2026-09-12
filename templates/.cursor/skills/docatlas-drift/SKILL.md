---
name: docatlas-drift
description: Run docatlas drift to check documentation completeness. Use after discovery or when the user runs /docatlas-drift.
---

# DocAtlas drift skill

## Steps

1. Confirm `/docatlas-discovery` was run (docs filled in, not just auto-drafts). If unsure, run discovery first.

2. Run in project root:

   ```bash
   docatlas drift
   ```

3. Report results. If issues, suggest `/docatlas-discovery` or `/docatlas-refine`.
