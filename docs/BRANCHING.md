# Branching and product lines

## `main` — canonical DocAtlas

- **Default install:** `npm install -g github:JeeEko/DocAtlas` (tracks `main`)
- **Version line:** semver releases tagged on `main` (e.g. `v5.0.0`)
- **Distribution:** standard toolkit — `docatlas init`, GitHub Action templates optional, multi-IDE `docatlas setup`, MCP, query, Explorer
- **Merge target:** all general-purpose features land here

## `cursor/cursor-native-95c0` — Cursor Platform line (long-lived)

- **Purpose:** Cursor-optimized distribution — marketplace plugin, Automations-first doc sync, Cloud Agent defaults
- **Branches from:** `main` at each release (rebased or re-cut from tagged `main`; never the other way)
- **Merge policy:** **do not merge into `main`**. This branch is a parallel product direction, not a feature branch waiting for integration.
- **Install:** `npm install -g github:JeeEko/DocAtlas#cursor/cursor-native-95c0`
- **Docs:** [docs/CURSOR_NATIVE.md](CURSOR_NATIVE.md) on that branch only

### Why two lines?

| | `main` | `cursor/cursor-native-95c0` |
|--|--------|------------------------------|
| CI / GitHub Actions | First-class workflow templates | Optional; Automations preferred |
| Cursor Marketplace plugin | Not shipped from `main` | Built from `packages/cursor-plugin/` |
| Init flag | `docatlas init` | `docatlas init --cursor-native` |
| Audience | Any editor, any CI | Teams standardized on Cursor Cloud |

Shared core (search, MCP, skills, parsers) should be **ported forward** from `main` into the Cursor line (rebase or cherry-pick), not merged back from Cursor-only UX into `main`.

## Other `cursor/*` branches

Historical agent work branches. Prefer **`main`** for releases unless explicitly documented otherwise.

## Release hygiene

- Tag releases only on **`main`**
- After each `main` release, maintainers refresh **`cursor/cursor-native-95c0`** from that tag and re-apply Cursor-only commits
