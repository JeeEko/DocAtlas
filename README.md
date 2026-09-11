# DocAtlas

**Learn the project. Write it down. Keep it updated.**

DocAtlas is a documentation toolkit for software teams. It helps you capture how a project really works, keep docs in sync with the code, and onboard new people faster.

Repository: https://github.com/JeeEko/DocAtlas

## What DocAtlas does

- **Bootstrap** — Scaffolds documentation structure in your repo
- **Drift check** — Finds gaps between code and docs
- **Governance** — Optional team rituals (PR checklists, weekly syncs, confidence tags)
- **Cloud agents** — Ready-made tasks for Cursor Cloud Agents

## Quick start

```bash
# Clone DocAtlas
git clone https://github.com/JeeEko/DocAtlas.git
cd DocAtlas

# Install the CLI
./install.sh

# Bootstrap docs into your project
docatlas bootstrap --journey-name "My Project"
```

Or run bootstrap directly without installing:

```bash
curl -fsSL https://raw.githubusercontent.com/JeeEko/DocAtlas/main/bootstrap.sh | bash -s -- --journey-name "My Project"
```

## CLI commands

| Command | Description |
|---------|-------------|
| `docatlas bootstrap` | Copy templates into your project |
| `docatlas drift` | Check for documentation drift |
| `docatlas version` | Show toolkit version |
| `docatlas help` | Show usage |

## Bootstrap flags

| Flag | Description |
|------|-------------|
| `--minimal` | Only core docs, skip extras |
| `--with-governance` | Include GOVERNANCE files |
| `--force` | Overwrite existing DocAtlas files |
| `--journey-name NAME` | Set the project name in generated docs |

## Project layout

```
DocAtlas/
├── bin/docatlas          # CLI entry point
├── bootstrap.sh          # One-shot bootstrap script
├── install.sh            # Install CLI to your PATH
├── templates/            # Files copied into target repos
├── scripts/              # Drift check and install helpers
├── prompts/              # AI prompts for discovery and maintenance
├── runners/              # Cloud agent task definitions
├── GOVERNANCE/           # Optional team process docs
└── docs/                 # Toolkit documentation
```

## Documentation

- [Team setup guide](docs/TEAM_SETUP.md)
- [Governance overview](GOVERNANCE/README.md)
- [Cloud agent runner](runners/CLOUD_AGENT.md)

## License

MIT
