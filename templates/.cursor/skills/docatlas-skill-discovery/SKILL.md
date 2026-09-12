---
name: docatlas-skill-discovery
description: Agent skill for doc discovery — not a slash command. Use when executing /docatlas-discovery or filling business and technical docs from code.
---

# DocAtlas discovery (agent skill)

**Not a slash command.** The user runs **`/docatlas-discovery`**. This skill guides the agent.

Use this skill to learn the project and write documentation that stays useful.

Toolkit: https://github.com/JeeEko/DocAtlas

## When to use

- After `docatlas refine` (required loop step)
- Docs are still templates or mostly `[likely]`
- A major feature changed architecture or business rules
- Drift check reports missing or stale documentation

## Workflow

### 1. Orient

Read in order:

1. `AGENTS.md` and `doc-atlas/AGENTS.md`
2. `doc-atlas/.docatlas.json`
3. Existing files in `doc-atlas/docs/`
4. README and package/config files

### 2. Explore the codebase

Find:

- **Business context** — README, product docs, validation rules, test names, domain models, user-facing copy
- Entry points and main modules
- Config and environment variables
- Test and CI commands
- Deploy configuration

### 3. Fill in docs

| File | Focus |
|------|-------|
| `doc-atlas/docs/BUSINESS.md` | Problem, users, capabilities, business rules (from evidence) |
| `doc-atlas/docs/ARCHITECTURE.md` | Components, data flow, dependencies |
| `doc-atlas/docs/ONBOARDING.md` | Prerequisites, setup, first tasks |
| `doc-atlas/docs/RUNBOOK.md` | Dev, build, deploy, troubleshooting |
| `doc-atlas/docs/GLOSSARY.md` | Domain terms |

Use confidence tags. Only use `[verified]` for confirmed facts.

### 4. Verify

```bash
docatlas drift
docatlas drift --strict
```

Fix all reported issues before finishing.

## Rules

- Plain English — explain like onboarding a smart new hire
- No invented features or **business rules** — cite README, tests, or code
- Small accurate updates beat large speculative rewrites
