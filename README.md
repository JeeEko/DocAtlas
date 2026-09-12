# DocAtlas

**Learn the project. Write it down. Keep it updated.**

One npm package. One command. DocAtlas adds documentation to your repo and **drafts a first version** from your README and code layout.

Repository: https://github.com/JeeEko/DocAtlas

---

## Quick start (recommended)

```bash
cd your-project
npx github:JeeEko/DocAtlas init
```

When published to npm:

```bash
npx docatlas init
```

That’s it. Open **`docs/START_HERE.md`** when it finishes.

### Install globally (optional)

```bash
npm install -g docatlas
cd your-project
docatlas init
```

Works on **Windows, macOS, and Linux** (Node.js 18+). No Git Bash required.

---

## What `docatlas init` does

1. **Adds** doc files, `AGENTS.md`, Cursor rules, optional PR checklist  
2. **Drafts** content from your README, `package.json`, and folder structure  
3. **Guesses** a main user flow name (e.g. checkout) — you can refine later in Cursor  

Guessed content is marked **`[likely]`**. After you run the app, upgrade to **`[verified]`**.

---

## Other commands

| Command | Purpose |
|---------|---------|
| `docatlas init` | Set up + auto-draft (start here) |
| `docatlas drift` | Find missing docs or leftover placeholders |
| `docatlas init --force` | Re-run on a project that already has DocAtlas |
| `docatlas init --journey-name "Checkout"` | Pick the main flow name yourself |

---

## After init

1. Read `docs/START_HERE.md`  
2. Run your app; fix anything wrong in `docs/RUNBOOK.md`  
3. In Cursor: *“Refine docs for journey X using docatlas-discovery skill”*  
4. `docatlas drift` before you commit  

---

## License

MIT
