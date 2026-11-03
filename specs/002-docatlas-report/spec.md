# DocAtlas Report — Specification v1

Interactive HTML portal compiled from `doc-atlas/` markdown and existing DocAtlas metrics.

## Personas

| Persona | Need |
|---------|------|
| Human reader | Browse docs in a browser without opening the IDE |
| Tech lead | Dashboard KPIs, artifact completion, drift visibility |
| Agent / automation | `docatlas report --json` snapshot for tools and CI |

## Source of truth

- Markdown and config under `doc-atlas/` remain authoritative.
- `doc-atlas/report/` is a **generated artifact** (gitignored by default after init).

## MVP pages

1. **Summary dashboard** — health score, KPI cards, artifact grid by phase, DocAtlas workflow summary.
2. **Documentation** — required artifacts + navigable doc tree with rendered markdown.
3. **Workflow** — static description of init → refine → discovery → drift (aligned with `/docatlas` skills).

Layout and styling are owned by DocAtlas and may evolve; no requirement to match third-party modernization report UIs.

## Artifact status model

| Status | Meaning |
|--------|---------|
| `missing` | Expected file path does not exist |
| `draft` | File exists but drift reports unresolved placeholders (TODO, TBD, etc.) for that path |
| `stale` | Drift/freshness indicates doc may be out of date (semantic drift or stale analysis) |
| `ready` | File exists with no placeholder or stale issues tied to that path |

Phases (v1):

- **documentation** — required taxonomy paths, journeys, business contexts
- **kit** — Cursor skill/command/agent wiring (doctor kit checklist)

## KPIs (v1)

- Health score (0–100)
- Markdown file count
- Verified confidence ratio
- Placeholder count
- Route inventory coverage (when available)
- Drift issue count
- Kit files present vs missing

## CLI

```bash
docatlas report [projectRoot] [--json] [--out <dir>] [--strict-drift] [--open]
```

Default output directory: `{projectRoot}/doc-atlas/report/`.

Writes `snapshot.json` alongside HTML for Explorer and CI reuse.

## Non-goals (v1)

- Human approval gates or estimate sign-off workflows
- Translation / modernization execution phases
- Auto-retry evaluator contracts
- Heavy SPA frameworks or cloud-hosted report hosting
- Replacing DocAtlas Explorer (complements it; see `explorer-integration.md`)

## Explorer relationship

See [explorer-integration.md](./explorer-integration.md).

## Security

- Escape HTML when rendering user markdown.
- When embedding JSON in HTML, escape sequences that could break script boundaries (`</`, U+2028/U+2029).
