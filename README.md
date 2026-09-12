# DocAtlas

**Learn the project. Write it down. Keep it updated.**

One npm package. One command. DocAtlas adds documentation to your repo and **drafts a first version** from your README and code layout.

Repository: https://github.com/JeeEko/DocAtlas

---

## Quick start (3 commands)

```bash
cd your-project
npx github:JeeEko/DocAtlas init
npx github:JeeEko/DocAtlas refine
npx github:JeeEko/DocAtlas drift
```

Works on **Windows, macOS, and Linux** (Node.js 18+). No Git Bash. No long prompts.

| Command | What it does |
|---------|----------------|
| `docatlas init` | Add docs + first draft from README/code |
| `docatlas refine` | Trace main user flow through the code |
| `docatlas drift` | Check docs are complete |

---

## What `docatlas init` does

1. **Adds** doc files, `AGENTS.md`, Cursor rules, optional PR checklist  
2. **Drafts** content from your README, `package.json`, and folder structure  

Then run **`docatlas refine`** to trace the main user flow (catalog → cart → checkout, etc.) and write `docs/JOURNEY-*.md`.

---

## Other commands

| Command | Purpose |
|---------|---------|
| `docatlas init` | Set up + auto-draft (step 1) |
| `docatlas refine` | Trace user flow in code (step 2) |
| `docatlas drift` | Find missing docs or placeholders |

---

## After init

1. Read `docs/START_HERE.md`  
2. Run your app; fix anything wrong in `docs/RUNBOOK.md`  
3. In Cursor: *“Refine docs for journey X using docatlas-discovery skill”*  
4. `docatlas drift` before you commit  

---

## License

MIT
