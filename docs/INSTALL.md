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

**Terminal:**

```bash
cd your-project
docatlas init
docatlas refine
docatlas drift
```

**Cursor (in the opened project):**

Use slash commands (copied into the project on `docatlas init`):

| Command | Action |
|---------|--------|
| `/docatlas-init` | Set up docs in this repo |
| `/docatlas-refine` | Trace user flow in code |
| `/docatlas-drift` | Check documentation |

The agent runs `docatlas` in your workspace terminal.

---

## Update DocAtlas

```bash
npm update -g github:JeeEko/DocAtlas
```
