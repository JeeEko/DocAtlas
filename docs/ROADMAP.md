# DocAtlas roadmap (`main`)

Living plan for the **canonical** toolkit on `main`. Cursor Platform work lives on **`cursor/cursor-native-95c0`** ([branching policy](BRANCHING.md)).

## Shipped on `main` — v5.1.0

MCP setup deps, Context7 guide, Explorer health + query-backed search.

## Shipped on `main` — v5.2.0

Interactive **HTML report** — `docatlas report`, snapshot JSON, dashboard + rendered docs ([specs/002-docatlas-report/spec.md](../specs/002-docatlas-report/spec.md)).

## v5.1 — Polish and distribution

| ID | Item |
|----|------|
| 5.1.1 | npm publish + `v5.0.0` tag on GitHub (when not already) |
| 5.1.2 | ~~`docatlas setup` auto-installs MCP package deps~~ (5.1.0) |
| 5.1.3 | ~~Context7 co-install guide~~ (5.1.0) |
| 5.1.4 | ~~Explorer health score in sidebar~~ (5.1.0) |
| 5.1.5 | ~~Explorer shares `lib/search.js` ranking~~ (5.1.0) |

## v5.3+ 

Semantic index, GraphQL parser, enterprise import, headless discovery — see issues and prior plan artifacts.

## Report enhancements (backlog)

Chart.js phase completion, client full-text search, MCP `generate_report` tool.

## Cursor Platform line (separate branch)

Marketplace plugin, `--cursor-native`, Automations prompts — tracked on **`cursor/cursor-native-95c0` only**; port **core** fixes from `main`, never merge the branch into `main`.
