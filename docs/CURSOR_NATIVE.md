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

## vs `main`

| | `main` | This branch |
|--|--------|-------------|
| `docatlas init` | Standard + GitHub workflow templates | Use `--cursor-native` |
| Doc sync default | GitHub Actions + manual skills | Cursor Automations |
| Marketplace plugin | No | `packages/cursor-plugin/` |

## Maintainers

After each **`main` release tag**, rebase or re-cut this branch from that tag and re-apply Cursor-only commits. Port **shared** fixes from `main` via cherry-pick/rebase — never merge this branch into `main`.
