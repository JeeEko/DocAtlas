# DocAtlas commands

Two ways to run DocAtlas: **terminal CLI** and **Cursor slash commands**. They map to the same workflow — use whichever fits the step.

## The loop

```
docatlas init  →  docatlas refine  →  /docatlas-discovery  →  docatlas drift
```

Discovery has no CLI equivalent — it is an agent deep-dive in Cursor.

---

## Terminal CLI

Run from your project root after [installing DocAtlas](INSTALL.md).

| Command | Purpose |
|---------|---------|
| `docatlas init` | Scaffold `doc-atlas/` and copy Cursor slash commands into `.cursor/commands/` |
| `docatlas refine` | Trace routes with framework parsers; draft journeys and architecture |
| `docatlas drift` | Check required docs exist and flag gaps |
| `docatlas version` | Show installed toolkit version |
| `docatlas help` | Show CLI usage |

**First time in a repo:** run `docatlas init` in the terminal. Slash commands do not exist until init copies them.

---

## Cursor slash commands

Type these in Cursor chat. Procedures live in `.cursor/commands/docatlas-*.md`.

| Slash command | Purpose | CLI equivalent |
|---------------|---------|----------------|
| `/docatlas-init` | Set up DocAtlas in this repo | `docatlas init` |
| `/docatlas-refine` | Trace routes in code | `docatlas refine` |
| `/docatlas-discovery` | **Required** — explore codebase and fill in docs | *(none — agent only)* |
| `/docatlas-drift` | Verify documentation completeness | `docatlas drift` |

There are **no separate DocAtlas skills** to invoke. Each slash command file contains the full procedure the agent follows.

Reload the Cursor window if slash commands do not appear after init.

---

## When to use which

| Situation | Use |
|-----------|-----|
| First setup in a project | Terminal: `docatlas init` |
| Automated route tracing | Terminal: `docatlas refine` or `/docatlas-refine` |
| Fill in business rules, onboarding, accurate architecture | **`/docatlas-discovery`** (required before drift) |
| Quick completeness check | Terminal: `docatlas drift` or `/docatlas-drift` |
| CI / pre-merge | `docatlas drift` (see `.github/workflows/docatlas-drift-report.yml`) |

---

## Related files

| Path | Role |
|------|------|
| `.cursor/commands/docatlas-*.md` | Slash command procedures |
| `.cursor/rules/docatlas-*.mdc` | Agent rules for doc edits |
| `doc-atlas/docs/START_HERE.md` | Onboarding inside the project |
| `doc-atlas/AGENTS.md` | Agent pointer and loop summary |
