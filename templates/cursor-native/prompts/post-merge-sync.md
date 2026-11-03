# DocAtlas post-merge documentation sync

Maintain DocAtlas docs in this repository (Cursor Platform distribution).

1. Read `doc-atlas/.docatlas.json`, `doc-atlas/AGENTS.md`, `doc-atlas/docs/AI_CONTEXT.md`.
2. Run `docatlas update` and `docatlas drift`.
3. If no impact and drift passes, stop without opening a PR.
4. Else follow `.cursor/skills/docatlas-skill-update/SKILL.md`, edit only impacted paths under `doc-atlas/docs/`, run `docatlas drift --strict`.
5. Open PR `docs: DocAtlas sync after merge` if files changed.

Use confidence tags from `doc-atlas/GOVERNANCE/CONFIDENCE_TAGS.md`. Do not invent business rules.
