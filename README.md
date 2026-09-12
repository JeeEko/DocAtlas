# DocAtlas

**Learn the project. Write it down. Keep it updated.**

Repository: https://github.com/JeeEko/DocAtlas

---

## Design principles

DocAtlas works on **any project** — discovery comes from repo structure, not domain templates (no hardcoded e-commerce, auth, or shop flows). See [GOVERNANCE/DESIGN_PRINCIPLES.md](GOVERNANCE/DESIGN_PRINCIPLES.md).

---

## Install once (per machine)

```bash
npm install -g github:JeeEko/DocAtlas
docatlas version
```

See [docs/INSTALL.md](docs/INSTALL.md) for Windows PATH notes.

**Do not use `npx` for daily work** — only for install if you prefer not to install globally.

---

## In your project

DocAtlas writes everything under **`doc-atlas/`** in your repo. Cursor command, skills, and rules stay in `.cursor/` (required by Cursor).

### Terminal (individual steps)

```bash
cd your-project
docatlas init
docatlas refine
docatlas drift
```

### Cursor — one command for the full journey

**`/docatlas`** is copied into each project on `docatlas init`. It runs all four phases in order:

```
init → refine → discovery → drift
```

Workflow details live in `.cursor/skills/docatlas-skill-*/` — loaded by the command, not invoked directly by users.

Reload the Cursor window if `/docatlas` does not appear after init.

### What goes where

| Path | Purpose |
|------|---------|
| `doc-atlas/docs/` | START_HERE, **AI_CONTEXT**, **BUSINESS** (index), **business/contexts/**, JOURNEY, ARCHITECTURE |
| `doc-atlas/GOVERNANCE/` | PR checklist, confidence tags |
| `doc-atlas/.docatlas.json` | DocAtlas config |
| `.cursor/commands/docatlas.md` | **`/docatlas`** — full documentation journey |
| `.cursor/skills/docatlas-skill-*/` | Phase workflows (loaded by `/docatlas`) |
| `.cursor/rules/` | Agent rules for doc edits |
| `AGENTS.md` (root) | Short pointer to `doc-atlas/` |

---

## Full cycle

**In Cursor (recommended):**

```
npm install -g github:JeeEko/DocAtlas    ← once on your machine
/docatlas                                 ← init → refine → discovery → drift
```

**Terminal (step by step):**

```
docatlas init  →  docatlas refine  →  /docatlas (discovery phase)  →  docatlas drift
```

---

## Commands

See [docs/COMMANDS.md](docs/COMMANDS.md) for the full CLI vs slash command reference.

| **`/docatlas`** | Full journey — init, refine, discovery, drift |
| `docatlas query` | Search project docs at runtime |
| `docatlas setup` | Wire MCP for Cursor / Claude / VS Code |
| `docatlas update` | Git diff → impacted docs (then skill-update in Cursor) |
| `docatlas doctor --score` | Kit health + 0–100 doc quality score |
| `docatlas install-explorer` | IDE viewer for doc-atlas/ |
| `docatlas init --taxonomy enterprise` | Full architecture doc tree |
| `docatlas drift --semantic` | Route inventory + freshness checks |

---

## License

MIT
