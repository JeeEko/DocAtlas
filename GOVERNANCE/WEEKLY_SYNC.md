# Weekly doc sync

A 15-minute ritual to keep documentation from drifting.

Source: https://github.com/JeeEko/DocAtlas

## Schedule

- **When:** Same day each week (pick one that works for your team)
- **Duration:** 15 minutes
- **Who:** Rotating facilitator; anyone who merged code that week joins

## Agenda

### 1. Drift report (3 min)

Run or review the latest drift check:

```bash
docatlas drift
```

Or open the most recent GitHub Actions drift report from your repo.

### 2. Merged PRs without doc updates (5 min)

Scan PRs merged since last sync. Flag any that changed behavior but skipped docs.

Assign one small fix per flagged PR (can be a follow-up issue).

### 3. Uncertain sections (5 min)

Search docs for `[uncertain]` tags. Pick one to resolve or downgrade:

- Verify and promote to `[verified]`
- Fix and promote to `[likely]`
- Create an issue if it needs more work

### 4. One improvement (2 min)

Each sync, merge at least one small doc improvement:

- Clarify a confusing sentence
- Add a missing glossary term
- Fix a broken command in the runbook

## Output

Post a short note in your team channel:

```
Doc sync YYYY-MM-DD
- Drift issues: N (link)
- Fixed: [what changed]
- Still uncertain: [list or "none"]
- Next facilitator: @name
```

## Tips

- Keep it short — this is maintenance, not a rewrite session
- Prefer fixing one section over debating doc structure
- Use prompts from https://github.com/JeeEko/DocAtlas/tree/main/prompts for bigger gaps
