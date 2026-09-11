# Confidence tags

Use confidence tags in documentation so readers know how much to trust each section.

Source: https://github.com/JeeEko/DocAtlas

## Tags

| Tag | Meaning | When to use |
|-----|---------|-------------|
| `[verified]` | Checked against running code recently | Default for reviewed docs |
| `[likely]` | Based on code reading, not recently tested | New sections pending review |
| `[uncertain]` | May be outdated or incomplete | Needs owner follow-up |
| `[planned]` | Describes future behavior, not shipped yet | Roadmap or design docs |

## How to apply

Add the tag at the start of a section heading or the first line of a paragraph:

```markdown
## Deployment [verified]

We deploy to production via GitHub Actions on merge to main.
```

```markdown
## Cache layer [uncertain]

We believe Redis is used for session storage — needs confirmation.
```

## Review rules

- `[uncertain]` sections must have an owner named in the doc or a linked issue
- Promote `[likely]` to `[verified]` after someone runs the steps and confirms
- Remove `[planned]` tags once the feature ships and docs are updated

## In pull requests

When you touch a doc section, update its confidence tag honestly. Do not mark `[verified]` unless you checked it.
