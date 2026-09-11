# Prompt: Architecture capture

Use this prompt to draft or update `docs/ARCHITECTURE.md`.

Source: https://github.com/JeeEko/DocAtlas

---

You are writing architecture documentation for a project using DocAtlas (https://github.com/JeeEko/DocAtlas).

**Task:** Draft or update `docs/ARCHITECTURE.md` based on the codebase.

**Include:**

1. **Overview** — What the system does in plain language (no jargon dump)
2. **Components** — Major modules/services and what each owns
3. **Data flow** — How a typical request or job moves through the system
4. **Dependencies** — Databases, queues, third-party APIs, file storage
5. **Key decisions** — Important tech choices and why (if evident from code or comments)
6. **Diagram** — Mermaid or ASCII diagram if it helps

**Rules:**

- Use confidence tags from DocAtlas governance: `[verified]`, `[likely]`, `[uncertain]`, `[planned]`
- Only mark `[verified]` for things you confirmed in code
- Link to source files for non-obvious claims
- Keep it readable — a new developer should understand the shape of the system in 10 minutes

**Do not:**

- List every file in the repo
- Invent components that do not exist
- Copy code verbatim — summarize behavior

Write the full markdown content for `docs/ARCHITECTURE.md`.
