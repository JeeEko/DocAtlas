# DocAtlas commands

DocAtlas has a **terminal CLI** and **one Cursor slash command** that runs the full documentation journey.

## The loop

```
/docatlas  →  init → refine → discovery → drift
```

Or step-by-step in the terminal (for CI or scripting):

```
docatlas init  →  docatlas refine  →  (discovery in Cursor)  →  docatlas drift
```

Discovery has no CLI equivalent — it is an agent deep-dive loaded as Phase 3 of `/docatlas`.

---

## Cursor (recommended)

Type **`/docatlas`** in Cursor chat after the first terminal init (or let Phase 1 run init for you).

| What | Where |
|------|-------|
| User entry point | `.cursor/commands/docatlas.md` → **`/docatlas`** |
| Workflow procedures | `.cursor/skills/docatlas-skill-init/` … `docatlas-skill-drift/` |

The command detects which phase to start from, then loads each skill in order. **Do not invoke skills directly** — run `/docatlas`.

Reload the Cursor window if `/docatlas` does not appear after init.

---

## Terminal CLI

Run from your project root after [installing DocAtlas](INSTALL.md).

| Command | Purpose |
|---------|---------|
| `docatlas init` | Scaffold `doc-atlas/` and copy `/docatlas` + workflow skills |
| `docatlas refine` | Trace routes with framework parsers; draft journeys |
| `docatlas drift` | Check required docs exist and flag gaps |
| `docatlas version` | Show installed toolkit version |
| `docatlas help` | Show CLI usage |

Use CLI steps individually for CI, scripts, or when you only need one automated phase.

---

## When to use which

| Situation | Use |
|-----------|-----|
| First documentation pass in a project | **`/docatlas`** in Cursor |
| Re-run full journey after major changes | **`/docatlas`** |
| Automated route tracing only | `docatlas refine` |
| CI / pre-merge check | `docatlas drift` |
| Bootstrap without Cursor | `docatlas init` then CLI steps |

---

## Workflow skills (agent-only)

| Skill | Phase | Purpose |
|-------|-------|---------|
| `docatlas-skill-init` | 1 | Scaffold docs and Cursor files |
| `docatlas-skill-refine` | 2 | Run parsers, draft journeys |
| `docatlas-skill-discovery` | 3 | Explore code, fill accurate docs |
| `docatlas-skill-drift` | 4 | Verify completeness |

These are loaded by `/docatlas`, not typed by users.

---

## Related files

| Path | Role |
|------|------|
| `.cursor/commands/docatlas.md` | **`/docatlas`** orchestrator |
| `.cursor/skills/docatlas-skill-*/SKILL.md` | Phase workflows |
| `.cursor/rules/docatlas-*.mdc` | Agent rules for doc edits |
| `doc-atlas/docs/START_HERE.md` | Onboarding inside the project |
