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

DocAtlas writes everything under **`doc-atlas/`** in your repo. Cursor slash commands and rules stay in `.cursor/` (required by Cursor).

### Terminal

```bash
cd your-project
docatlas init
docatlas refine
docatlas drift
```

### Cursor (after first terminal init)

Slash commands (`/docatlas-init`, etc.) are **not global** — they are copied into each project on `docatlas init`. Run `docatlas init` in the terminal once first, then use:

| Slash command | What runs |
|---------------|-----------|
| `/docatlas-init` | Set up docs in this repo |
| `/docatlas-refine` | Trace routes in code (automated) |
| `/docatlas-discovery` | Deep-dive — fill in docs from code |
| `/docatlas-drift` | Check docs are complete |

The agent runs `docatlas` in your workspace — no long prompts, no `npx`.

### What goes where

| Path | Purpose |
|------|---------|
| `doc-atlas/docs/` | START_HERE, **BUSINESS**, JOURNEY, ARCHITECTURE, etc. |
| `doc-atlas/GOVERNANCE/` | PR checklist, confidence tags |
| `doc-atlas/.docatlas.json` | DocAtlas config |
| `.cursor/commands/` | **Slash commands only** — `/docatlas-init`, etc. |
| `.cursor/rules/` | Agent rules for doc edits |
| `AGENTS.md` (root) | Short pointer to `doc-atlas/` |

---

## Full cycle

```
1. npm install -g github:JeeEko/DocAtlas     ← once on your machine
2. docatlas init                             ← scaffold
3. docatlas refine                           ← trace routes (automated)
4. /docatlas-discovery                       ← required — fill in docs from code
5. docatlas drift                            ← verify docs complete
```

Cursor equivalents: `/docatlas-init` → `/docatlas-refine` → **`/docatlas-discovery`** → `/docatlas-drift`

---

## Commands

See [docs/COMMANDS.md](docs/COMMANDS.md) for the full CLI vs slash command reference.

| Command | Step |
|---------|------|
| `docatlas init` | Add docs + first draft |
| `docatlas refine` | Trace routes with framework parsers (target ≥90% coverage) |
| **`/docatlas-discovery`** | **Required** — agent fills in accurate docs from code |
| `docatlas drift` | Verify docs complete |

---

## License

MIT
