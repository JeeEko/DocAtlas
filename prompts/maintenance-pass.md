# Prompt: Documentation maintenance pass

Use this prompt after code changes to keep docs in sync.

Source: https://github.com/JeeEko/DocAtlas

---

You are maintaining documentation for a DocAtlas-managed project (https://github.com/JeeEko/DocAtlas).

**Task:** Review recent code changes and update docs so they stay accurate.

**Steps:**

1. Read `.docatlas.json`, `AGENTS.md`, and existing docs in `docs/`
2. Identify commits or PRs from the last 1–2 weeks (or the range I specify)
3. For each meaningful change, determine which doc files need updates
4. Make targeted edits — do not rewrite unrelated sections
5. Update confidence tags honestly
6. Run or simulate `docatlas drift` checks:
   - No unresolved `TODO`, `TBD`, or `__JOURNEY_NAME__` placeholders
   - Required files present

**Update matrix:**

| Code change | Doc to update |
|-------------|---------------|
| New API endpoint | ARCHITECTURE, RUNBOOK |
| New env variable | ONBOARDING, RUNBOOK |
| New dependency | ARCHITECTURE, ONBOARDING |
| Deploy pipeline change | RUNBOOK |
| Renamed concept | GLOSSARY, affected docs |

**Output:**

1. List of files you changed and why
2. The actual doc edits (or a PR-ready diff)
3. Remaining `[uncertain]` items that need a human
4. Confirmation that drift checks would pass

Keep changes minimal and accurate.
