# DocAtlas Cursor Platform (`cursor/cursor-native-95c0`)

This branch is a **separate product line**. It is **branched from `main`** after each release and **must not be merged back into `main`**. See [BRANCHING.md](BRANCHING.md).

## Install

```bash
npm install -g github:JeeEko/DocAtlas#cursor/cursor-native-95c0
docatlas version
```

## Initialize a project

```bash
docatlas init --cursor-native
docatlas setup --cursor --project
```

This copies Cursor Platform assets under `doc-atlas/cursor/`, including automation prompts and [AUTOMATION_SETUP.md](../templates/cursor-native/AUTOMATION_SETUP.md) (installed as `doc-atlas/cursor/AUTOMATION_SETUP.md`).

## Cursor Automations (sample)

Use [Cursor Automations](https://cursor.com/docs/cloud-agent/automations) as the default doc-sync path instead of GitHub Actions.

1. Open [cursor.com/automations](https://cursor.com/automations) and attach this repository.
2. Triggers: PR merged to `main`, push to `main`, CI completed, or a weekly schedule.
3. Enable **Open pull request** when the agent should propose doc updates.
4. **Prompt:** paste the contents of **`doc-atlas/cursor/prompts/post-merge-sync.md`** from the target repo (created by `docatlas init --cursor-native`). Do not point Automations at the toolkit repo unless you are dogfooding DocAtlas itself.

See also `doc-atlas/cursor/prompts/maintenance-automation.md` for scheduled maintenance wording.

## Marketplace plugin (build and local test)

From this branch at repo root:

```bash
node scripts/build-cursor-plugin.mjs
node scripts/test-cursor-native.mjs
```

The build copies `templates/.cursor/{rules,skills,agents,commands}` into `packages/cursor-plugin/`, bundles MCP under `packages/cursor-plugin/server/`, and syncs `plugin.json` version from [VERSION](../VERSION).

**Local install** (reload Cursor after copy):

```bash
mkdir -p ~/.cursor/plugins/local/docatlas
cp -a packages/cursor-plugin/. ~/.cursor/plugins/local/docatlas/
```

Expected layout:

| Path | Purpose |
|------|---------|
| `.cursor-plugin/plugin.json` | Plugin manifest |
| `.cursor-plugin/marketplace.json` | Marketplace listing metadata |
| `mcp.json` | DocAtlas MCP server wiring |
| `rules/`, `skills/`, `agents/`, `commands/` | Copied from project templates |
| `server/src/index.js` | MCP server entry |

### Marketplace publish (CN.3 — human credentials required)

Manifests are ready under `packages/cursor-plugin/.cursor-plugin/`. Publishing to the Cursor plugin marketplace is **not automated in CI**; a maintainer with marketplace access must:

1. Run `node scripts/build-cursor-plugin.mjs` on **`cursor/cursor-native-95c0`** (or a release tag cut from it).
2. Confirm `plugin.json` `version` matches [VERSION](../VERSION) and `homepage` points at this branch’s `docs/CURSOR_NATIVE.md`.
3. Confirm `marketplace.json` lists `source.repo` `JeeEko/DocAtlas`, `ref` `cursor/cursor-native-95c0`, `path` `packages/cursor-plugin`.
4. Follow Cursor’s current marketplace submission flow (team dashboard / publisher tooling — credentials not stored in this repo).
5. After publish, smoke-test: install from marketplace, run `/docatlas` and MCP `query_project_docs` in a `--cursor-native` project.

**Blockers without maintainer access:** marketplace publisher account, OAuth/API token for upload, and post-publish verification in a real Cursor client.

## vs `main`

| | `main` | This branch |
|--|--------|-------------|
| `docatlas init` | Standard + GitHub workflow templates | Use `--cursor-native` |
| Doc sync default | GitHub Actions + manual skills | Cursor Automations |
| Marketplace plugin | No | `packages/cursor-plugin/` |

## Maintainers

After each **`main` release tag**, rebase or re-cut this branch from that tag and re-apply Cursor-only commits. Port **shared** fixes from `main` via cherry-pick/rebase — never merge this branch into `main`.
