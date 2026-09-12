# Install DocAtlas (once per machine)

Install DocAtlas **once**. After that, use `docatlas` commands in any project — no `npx`.

Requires **Node.js 18+**.

---

## Global install (recommended)

```bash
npm install -g github:JeeEko/DocAtlas
```

Verify:

```bash
docatlas version
```

When published on npm:

```bash
npm install -g docatlas
```

### Windows (PowerShell or cmd)

```cmd
npm install -g github:JeeEko/DocAtlas
docatlas version
```

If `docatlas` is not found, close and reopen the terminal, or add npm global bin to PATH:

```
%AppData%\npm
```

---

## Per-project install (optional, for teams)

```bash
npm install --save-dev github:JeeEko/DocAtlas
```

Then use `npx docatlas ...` **only inside that repo**, or add to `package.json`:

```json
{
  "scripts": {
    "docs:init": "docatlas init",
    "docs:refine": "docatlas refine",
    "docs:drift": "docatlas drift"
  }
}
```

---

## After install — in any project

### First time in a project (terminal required)

Slash commands like `/docatlas-init` **do not exist until you run init once**. Cursor reads them from `.cursor/commands/`, which DocAtlas creates during init.

```bash
cd your-project
docatlas init --with-governance
docatlas refine
docatlas drift
```

Reload the Cursor window if slash commands do not appear immediately.

### After init (Cursor or terminal)

**Cursor slash commands** (in `.cursor/commands/` after init):

| Command | Action |
|---------|--------|
| `/docatlas-init` | Set up docs in this repo |
| `/docatlas-refine` | Trace user flow in code |
| `/docatlas-drift` | Check documentation |

The agent runs `docatlas` in your workspace terminal.

All DocAtlas files live under **`doc-atlas/`** in your project.

---

## Update DocAtlas

```bash
npm update -g github:JeeEko/DocAtlas
```
