# Governance

Optional team rituals to keep documentation accurate and useful.

DocAtlas works without governance files. Add them when your team wants shared habits around doc quality.

Source: https://github.com/JeeEko/DocAtlas

## Files in this pack

| File | Purpose |
|------|---------|
| [CONFIDENCE_TAGS.md](CONFIDENCE_TAGS.md) | Label how trustworthy each doc section is |
| [PR_CHECKLIST.md](PR_CHECKLIST.md) | Doc checks on every pull request |
| [WEEKLY_SYNC.md](WEEKLY_SYNC.md) | 15-minute weekly doc review |

## How to adopt

Bootstrap with the governance flag:

```bash
docatlas bootstrap --with-governance
```

Or copy these files into your project's `GOVERNANCE/` folder manually from https://github.com/JeeEko/DocAtlas/tree/main/GOVERNANCE.

## Principles

1. Docs should change with code — not weeks later
2. Say what you know and what you don't (confidence tags)
3. Small, frequent updates beat big quarterly rewrites
