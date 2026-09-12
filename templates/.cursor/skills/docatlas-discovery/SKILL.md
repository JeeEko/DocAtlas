---
name: docatlas-discovery
description: Required step after refine — explore codebase and fill in DocAtlas documentation. Use when the user runs /docatlas-discovery or before drift.
---

# DocAtlas discovery

Use this skill to learn the project and write documentation that stays useful.

Toolkit: https://github.com/JeeEko/DocAtlas

## When to use

- DocAtlas was just bootstrapped and docs are still templates
- A major feature changed architecture or setup steps
- Drift check reports missing or stale documentation
- A new team member needs accurate onboarding docs

## Workflow

### 1. Orient

Read in order:

1. `AGENTS.md` and `doc-atlas/AGENTS.md`
2. `doc-atlas/.docatlas.json`
3. Existing files in `doc-atlas/docs/`
4. README and package/config files

### 2. Explore the codebase

Find:

- Entry points and main modules
- Config and environment variables
- Test and CI commands
- Deploy configuration

### 3. Fill in docs

| File | Focus |
|------|-------|
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
- No invented features
- Small accurate updates beat large speculative rewrites
- Update `doc-atlas/AGENTS.md` if agent workflow conventions change

## Prompts

Copy-adapt prompts from https://github.com/JeeEko/DocAtlas/tree/main/prompts if you need structured discovery or maintenance passes.
