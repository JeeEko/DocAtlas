# Prompt: Onboarding guide

Use this prompt to draft or update `docs/ONBOARDING.md`.

Source: https://github.com/JeeEko/DocAtlas

---

You are writing an onboarding guide for a project using DocAtlas (https://github.com/JeeEko/DocAtlas).

**Task:** Draft or update `docs/ONBOARDING.md` so a new developer can go from zero to running the app in one sitting.

**Include:**

1. **Welcome** — One paragraph on what the project is
2. **Prerequisites** — Tools, versions, accounts, access needed
3. **Setup steps** — Clone, install deps, configure env (with example env vars, redact secrets)
4. **Run the app** — Exact commands that work
5. **Run tests** — Exact test commands
6. **Project layout** — Where to find main code, docs, and config
7. **First tasks** — 2-3 good starter tasks for week one
8. **Getting help** — Team channels, doc links, who owns what

**Rules:**

- Every command should be copy-paste ready
- If a step might fail, note common fixes
- Use `[verified]` only for steps you ran or confirmed in CI config
- Mark unconfirmed steps `[uncertain]`

**Do not:**

- Assume knowledge of internal team history
- Skip env setup — that is where new people get stuck

Write the full markdown content for `docs/ONBOARDING.md`.
