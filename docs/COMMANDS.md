# DocAtlas commands

DocAtlas has a **terminal CLI**, **MCP server**, and **one Cursor slash command** that runs the full documentation journey.

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

## Runtime doc retrieval (v4.1+)

| Command / tool | Purpose |
|----------------|---------|
| `docatlas query "<question>"` | Search `doc-atlas/docs/` for relevant sections |
| `docatlas query --context auth` | AI_CONTEXT + related sections |
| `docatlas query --ai-context` | Print AI_CONTEXT.md |
| MCP `query_project_docs` | Same search via MCP (see `docatlas setup`) |
| **`docatlas-docs-lookup`** agent | Lightweight internal doc fetch without polluting main context |

Setup MCP once per project:

```bash
docatlas setup --cursor --claude --vscode --project
```

---

## Cursor (recommended)

Type **`/docatlas`** in Cursor chat after the first terminal init (or let Phase 1 run init for you).

| What | Where |
|------|-------|
| User entry point | `.cursor/commands/docatlas.md` → **`/docatlas`** |
| Workflow procedures | `.cursor/skills/docatlas-skill-init/` … `docatlas-skill-drift/` |
| Internal doc lookup | `.cursor/agents/docatlas-docs-lookup.md` |

The command detects which phase to start from, then loads each skill in order. **Do not invoke skills directly** — run `/docatlas`.

Reload the Cursor window if `/docatlas` does not appear after init.

---

## Terminal CLI

Run from your project root after [installing DocAtlas](INSTALL.md).

| Command | Purpose |
|---------|---------|
| `docatlas init` | Scaffold `doc-atlas/` and copy `/docatlas` + workflow skills |
| `docatlas refine` | Trace routes with framework parsers; draft journeys |
| `docatlas map-contexts` | Detect business areas and scaffold context docs |
| `docatlas update` | Git diff analysis — list docs needing refresh (no LLM) |
| `docatlas query` | Search project docs at runtime |
| `docatlas setup` | Wire MCP + rules for Cursor / Claude / VS Code |
| `docatlas doctor` | Verify kit health; `--score` for 0–100 health metric |
| `docatlas drift` | Check required docs exist and flag gaps |
| `docatlas install-explorer` | Build and install Explorer VSIX |
| `docatlas version` | Show installed toolkit version |
| `docatlas help` | Show CLI usage |

Use CLI steps individually for CI, scripts, or when you only need one automated phase.

---

## When to use which

| Situation | Use |
|-----------|-----|
| First documentation pass in a project | **`/docatlas`** in Cursor |
| Re-run full journey after major changes | **`/docatlas`** |
| Answer question about this repo's architecture | `docatlas query` or MCP |
| External library API docs | Context7 (not DocAtlas) |
| Automated route tracing only | `docatlas refine` |
| CI / pre-merge check | `docatlas drift` |
| CI doc quality badge | `docatlas doctor --score` |
| Bootstrap without Cursor | `docatlas init` then CLI steps |

---

## Workflow skills (agent-only)

| Skill | Phase | Purpose |
|-------|-------|---------|
| `docatlas-skill-init` | 1 | Scaffold docs and Cursor files |
| `docatlas-skill-refine` | 2 | Run parsers, draft journeys |
| `docatlas-skill-discovery` | 3 | Explore code, fill accurate docs |
| `docatlas-skill-drift` | 4 | Verify completeness |
| `docatlas-skill-update` | — | Incremental refresh after code changes |

These are loaded by `/docatlas` or invoked for targeted updates — not typed by users as slash commands.

---

## Related files

| Path | Role |
|------|------|
| `.cursor/commands/docatlas.md` | **`/docatlas`** orchestrator |
| `.cursor/skills/docatlas-skill-*/SKILL.md` | Phase workflows |
| `.cursor/agents/docatlas-docs-lookup.md` | Internal doc retrieval agent |
| `.cursor/rules/docatlas-*.mdc` | Agent rules for doc edits |
| `packages/mcp/` | Local MCP server |
| `doc-atlas/docs/START_HERE.md` | Onboarding inside the project |
