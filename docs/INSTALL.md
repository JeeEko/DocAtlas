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

### First time in a project

**`/docatlas`** and workflow skills are copied on init. You can run the full journey in Cursor, or use the terminal:

```bash
cd your-project
docatlas init --with-governance
docatlas refine
# discovery — run /docatlas in Cursor (Phase 3), or re-run /docatlas for the full cycle
docatlas drift
```

Reload the Cursor window if `/docatlas` does not appear after init.

### In Cursor

**One slash command** runs the full documentation journey:

| Command | Action |
|---------|--------|
| **`/docatlas`** | init → refine → discovery → drift |

Phase workflows live in `.cursor/skills/docatlas-skill-*/` — loaded by the command, not invoked directly.

See [COMMANDS.md](COMMANDS.md) for the full CLI vs slash command reference.

All DocAtlas files live under **`doc-atlas/`** in your project.

---

## Update DocAtlas

GitHub installs **do not support** `npm update`. Re-install to pull the latest:

```bash
npm install -g github:JeeEko/DocAtlas
docatlas version
```

Install a specific release:

```bash
npm install -g github:JeeEko/DocAtlas#v1.7.0
docatlas version
```

If you see `npm error EUPDATEARGS` or `npm update undefined`, you ran `npm update` — use `npm install -g` above instead.

### Windows (cmd or PowerShell)

```cmd
npm install -g github:JeeEko/DocAtlas
docatlas version
```

Expected: `1.7.0` (or newer). Close and reopen the terminal if `docatlas` is not found.
