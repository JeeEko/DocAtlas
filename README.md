# DocAtlas

**Learn the project. Write it down. Keep it updated.**

Repository: https://github.com/JeeEko/DocAtlas

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

DocAtlas writes everything under **`doc-atlas/`** in your repo. Cursor slash commands and skills stay in `.cursor/` (required by Cursor).

### Terminal

```bash
cd your-project
docatlas init
docatlas refine
docatlas drift
```

### Cursor (recommended)

Open the project in Cursor. After `docatlas init`, use slash commands:

| Slash command | What runs |
|---------------|-----------|
| `/docatlas-init` | Set up docs in this repo |
| `/docatlas-refine` | Trace user flow in code |
| `/docatlas-drift` | Check docs are complete |

The agent runs `docatlas` in your workspace — no long prompts, no `npx`.

### What goes where

| Path | Purpose |
|------|---------|
| `doc-atlas/docs/` | START_HERE, JOURNEY, ARCHITECTURE, etc. |
| `doc-atlas/GOVERNANCE/` | PR checklist, confidence tags |
| `doc-atlas/.docatlas.json` | DocAtlas config |
| `.cursor/commands/` | Slash commands |
| `.cursor/skills/` | Agent skills |
| `AGENTS.md` (root) | Short pointer to `doc-atlas/` |

---

## Full cycle

```
1. npm install -g github:JeeEko/DocAtlas     ← once on your machine
2. docatlas init                             ← or /docatlas-init in Cursor
3. docatlas refine                           ← or /docatlas-refine
4. docatlas drift                            ← or /docatlas-drift
5. commit docs
```

---

## Commands

| Command | Step |
|---------|------|
| `docatlas init` | Add docs + first draft |
| `docatlas refine` | Trace user flow → `doc-atlas/docs/JOURNEY-*.md` |
| `docatlas drift` | Verify docs complete |

---

## License

MIT
