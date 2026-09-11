# Team setup guide

This guide walks your team through adopting DocAtlas. The toolkit lives at https://github.com/JeeEko/DocAtlas.

## 1. Install DocAtlas

Each developer can install the CLI locally:

```bash
git clone https://github.com/JeeEko/DocAtlas.git
cd DocAtlas
./install.sh
```

Or use the one-line installer:

```bash
curl -fsSL https://raw.githubusercontent.com/JeeEko/DocAtlas/main/scripts/install-toolkit.sh | bash
```

Verify the install:

```bash
docatlas version
```

## 2. Bootstrap your project

From your project root:

```bash
docatlas bootstrap --journey-name "Your Project Name"
```

Add governance files if your team wants shared rituals:

```bash
docatlas bootstrap --with-governance --force
```

## 3. Fill in the docs

After bootstrap, edit these files in your repo:

| File | Purpose |
|------|---------|
| `AGENTS.md` | How AI agents should work in this repo |
| `docs/ARCHITECTURE.md` | System design and key components |
| `docs/ONBOARDING.md` | First-day guide for new developers |
| `docs/RUNBOOK.md` | How to run, deploy, and troubleshoot |
| `docs/GLOSSARY.md` | Terms and abbreviations |

Use the prompts in https://github.com/JeeEko/DocAtlas/tree/main/prompts to speed up discovery.

## 4. Add drift checking to CI

Bootstrap copies `.github/workflows/docatlas-drift-report.yml` into your repo. Enable GitHub Actions so drift reports run on pull requests.

Run locally anytime:

```bash
docatlas drift
docatlas drift --strict   # fail on issues (good for CI)
```

## 5. Optional governance

If you bootstrapped with `--with-governance`, review:

- `GOVERNANCE/CONFIDENCE_TAGS.md` — tag doc accuracy levels
- `GOVERNANCE/PR_CHECKLIST.md` — doc updates on every PR
- `GOVERNANCE/WEEKLY_SYNC.md` — short weekly doc review ritual

See https://github.com/JeeEko/DocAtlas/tree/main/GOVERNANCE for the source templates.

## 6. Cloud agent setup

For Cursor Cloud Agents, copy task files from https://github.com/JeeEko/DocAtlas/tree/main/runners:

- `cloud-agent-task.md` — initial discovery pass
- `maintenance-agent-task.md` — ongoing doc maintenance

See [runners/CLOUD_AGENT.md](../runners/CLOUD_AGENT.md) for details.

## 7. Keep docs updated

- Update docs in the same PR as code changes
- Run `docatlas drift` before merging
- Hold a short weekly sync (see GOVERNANCE/WEEKLY_SYNC.md)
- Re-run discovery prompts when major features ship

## Getting help

- Issues: https://github.com/JeeEko/DocAtlas/issues
- Source: https://github.com/JeeEko/DocAtlas
