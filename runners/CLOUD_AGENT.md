# Cloud agent setup

Run DocAtlas discovery and maintenance with Cursor Cloud Agents.

Toolkit: https://github.com/JeeEko/DocAtlas

## Prerequisites

- DocAtlas bootstrapped in your target repository
- Cursor Cloud Agent access to that repository
- GitHub Actions enabled (optional, for drift reports)

## Initial discovery run

1. Open Cursor Cloud Agents for your repository
2. Start a new agent run
3. Paste the contents of [cloud-agent-task.md](cloud-agent-task.md) as the task prompt
4. Let the agent explore the codebase and fill in docs
5. Review the PR — check facts, run commands in the runbook, fix errors

## Maintenance runs

Schedule or trigger maintenance after significant merges:

1. Paste [maintenance-agent-task.md](maintenance-agent-task.md) as the task
2. The agent compares recent code changes to existing docs
3. Review updates before merging

## Tips for good results

- Set `--journey-name` during bootstrap so docs use your project name
- Include `AGENTS.md` in the repo so agents follow your conventions
- Enable the drift workflow (`.github/workflows/docatlas-drift-report.yml`) for CI feedback
- Use confidence tags from `GOVERNANCE/CONFIDENCE_TAGS.md` in generated docs

## Prompt library

For manual or semi-automated runs, use prompts from:

https://github.com/JeeEko/DocAtlas/tree/main/prompts

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Agent skips docs | Ensure `AGENTS.md` mentions DocAtlas doc paths |
| Drift check fails in CI | Run `docatlas drift` locally and fix placeholders |
| Wrong project name | Re-bootstrap with `--journey-name "Name" --force` |

Report issues: https://github.com/JeeEko/DocAtlas/issues
