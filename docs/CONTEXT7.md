# DocAtlas + Context7 (dual MCP setup)

DocAtlas and [Context7](https://context7.com) solve different problems. Use **both** in Cursor so agents reach the right source on the first try.

| Source | Use for | Examples |
|--------|---------|----------|
| **DocAtlas** | **This repository** — architecture, business rules, journeys, runbooks, internal APIs | “How does billing work here?”, “What is the auth journey?” |
| **Context7** | **External libraries** — upstream docs and API references | “Next.js App Router middleware”, “Prisma relation filters” |

DocAtlas indexes `doc-atlas/docs/` in your project. Context7 fetches version-aware docs for public packages. Neither replaces the other.

---

## When to use which

- **Onboarding, drift, `/docatlas` workflow** → DocAtlas only.
- **“Where is X implemented in our codebase?”** → DocAtlas (`docatlas query`, MCP `query_project_docs`, or Explorer).
- **“How do I call library Y’s API?”** → Context7 (or similar), not DocAtlas.

The Cursor rule written by `docatlas setup --cursor --project` already nudges agents toward this split.

---

## Example: Cursor project MCP (`.cursor/mcp.json`)

After `docatlas setup --cursor --project`, add Context7 alongside DocAtlas:

```json
{
  "mcpServers": {
    "docatlas": {
      "command": "node",
      "args": ["/absolute/path/to/DocAtlas/packages/mcp/src/index.js"],
      "env": {
        "DOCATLAS_PROJECT_ROOT": "${workspaceFolder}"
      }
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

Adjust paths:

- **`docatlas` args** — path to `packages/mcp/src/index.js` in your DocAtlas clone (or npm-linked install).
- **`DOCATLAS_PROJECT_ROOT`** — Cursor expands `${workspaceFolder}` to the repo you are editing.

Run `npm install --prefix packages/mcp` once in the DocAtlas toolkit (or let `docatlas setup` install MCP deps automatically).

Reload the Cursor window after editing MCP config.

---

## Agent behavior (recommended)

1. **Internal / product questions** → DocAtlas MCP tools: `query_project_docs`, `get_ai_context`, `get_business_context`, `get_journey`.
2. **Third-party library questions** → Context7 MCP tools.
3. If unsure, read `doc-atlas/docs/AI_CONTEXT.md` first (DocAtlas), then Context7 for library details.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| DocAtlas MCP tools missing | `docatlas setup --cursor --project`, reload window |
| MCP server fails on start | `npm install --prefix /path/to/DocAtlas/packages/mcp` |
| Agent cites generic library docs for internal logic | Strengthen `.cursor/rules/docatlas-query.mdc`; remind team to use Context7 only for externals |
| Context7 not listed | Install Context7 MCP per their docs; merge into `mcpServers` without removing `docatlas` |

---

## Related

- [COMMANDS.md](COMMANDS.md) — CLI and MCP overview
- [TEAM_SETUP.md](TEAM_SETUP.md) — team rollout
- `docatlas doctor --score` — documentation health in this repo
