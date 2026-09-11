# Prompt: Drift review

Use this prompt to interpret drift check results and plan fixes.

Source: https://github.com/JeeEko/DocAtlas

---

You are reviewing documentation drift for a DocAtlas-managed project (https://github.com/JeeEko/DocAtlas).

**Context:** DocAtlas drift checking finds gaps between code and docs — missing files, stale content, unresolved placeholders, and config issues.

**Task:** I will paste the output of `docatlas drift`. Analyze it and produce a fix plan.

**For each issue, provide:**

1. **Severity** — blocking / should-fix / nice-to-have
2. **Root cause** — why this drift exists
3. **Fix** — exact file and change needed
4. **Owner suggestion** — who likely knows the answer (role, not name, if unknown)

**Output format:**

```markdown
## Summary
[N issues found, estimated effort]

## Fix plan

### 1. [issue title]
- Severity: ...
- Fix: ...
- ...

## Quick wins
[fixes under 5 minutes]

## Needs human input
[items marked uncertain]
```

**Rules:**

- Prefer small, mergeable fixes over big rewrites
- Suggest confidence tags for updated sections
- If drift is caused by missing bootstrap, say to run `docatlas bootstrap`

After the plan, offer to implement the quick wins if I ask.
