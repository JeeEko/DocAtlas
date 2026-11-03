# DocAtlas + Cursor Automations

Cursor Platform projects use **Automations** as the primary doc sync path. See [Cursor Automations docs](https://cursor.com/docs/cloud-agent/automations).

## Setup

1. [cursor.com/automations](https://cursor.com/automations) → this repository
2. Triggers: PR merged, push to `main`, CI completed, or weekly schedule
3. Enable **Open pull request**
4. Prompt: copy `doc-atlas/cursor/prompts/post-merge-sync.md`

## Toolkit branch

Install CLI from **`cursor/cursor-native-95c0`** — not `main`. See `doc-atlas/.docatlas.json` → `toolkitBranch`.
