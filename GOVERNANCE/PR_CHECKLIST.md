# Pull request checklist

Copy this into your PR description or use the bootstrapped `.github/pull_request_template.md`.

Source: https://github.com/JeeEko/DocAtlas

## Documentation

- [ ] I updated docs affected by this change
- [ ] I ran `docatlas drift` locally (or CI passed)
- [ ] New terms are added to `docs/GLOSSARY.md`
- [ ] Architecture changes are reflected in `docs/ARCHITECTURE.md`
- [ ] Runbook steps still work (or runbook was updated)

## Confidence

- [ ] Confidence tags are accurate (`[verified]`, `[likely]`, `[uncertain]`, `[planned]`)
- [ ] Any `[uncertain]` sections have an owner or linked issue

## For reviewers

- [ ] Code and docs tell the same story
- [ ] Onboarding doc still makes sense for a new developer
- [ ] No unresolved `TODO` or `TBD` placeholders left without explanation

## When docs are not needed

If this PR truly does not affect behavior, architecture, or operations, say why in the PR description. Examples: typo in a comment, internal refactor with no external effect.
