# DocAtlas roadmap (`main`)

Living plan for the **canonical** toolkit on `main`. Cursor Platform work lives on **`cursor/cursor-native-95c0`** ([branching policy](BRANCHING.md)).

## Shipped on `main` — v5.0.0

Agent retrieval (`query`, MCP), multi-IDE `setup`, doctor `--score`, Explorer v1, owner config, tRPC parser, version baselines.

## v5.1 — Polish and distribution

| ID | Item |
|----|------|
| 5.1.1 | npm publish + `v5.0.0` tag on GitHub (when not already) |
| 5.1.2 | ~~`docatlas setup` auto-installs MCP package deps~~ (5.1.0) |
| 5.1.3 | ~~Context7 co-install guide~~ (5.1.0) |
| 5.1.4 | ~~Explorer health score in sidebar~~ (5.1.0) |
| 5.1.5 | ~~Explorer shares `lib/search.js` ranking~~ (5.1.0) |

## v5.2+ 

Semantic index, GraphQL parser, enterprise import, headless discovery — see issues and prior plan artifacts.

## Cursor Platform line (separate branch)

Marketplace plugin, `--cursor-native`, Automations prompts — tracked on **`cursor/cursor-native-95c0` only**; port **core** fixes from `main`, never merge the branch into `main`.
