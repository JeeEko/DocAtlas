# Cloud agent task: DocAtlas discovery

Use this task for a Cursor Cloud Agent run on a repository that needs initial documentation.

Toolkit reference: https://github.com/JeeEko/DocAtlas

## Goal

Learn how this project works, write it down in the DocAtlas doc structure, and leave the repo ready for a new developer to onboard.

## Before you start

1. Confirm DocAtlas is bootstrapped (look for `.docatlas.json` and `AGENTS.md`)
2. If not bootstrapped, run `docatlas bootstrap --journey-name "<project name>"` from the repo root
3. Read `AGENTS.md` and any existing docs

## Steps

### 1. Explore the codebase

- Identify entry points (main app, CLI, API routes)
- Map major directories and their roles
- Find config files, env vars, and deployment setup
- Note test commands and CI configuration

### 2. Fill in docs/ARCHITECTURE.md

- System overview in plain language
- Component diagram or bullet list of major parts
- Data flow for the main user journeys
- External dependencies and integrations
- Use confidence tags: `[verified]` only for what you confirmed in code

### 3. Fill in docs/ONBOARDING.md

- Prerequisites (tools, accounts, env vars)
- Clone, install, and run steps — run them if possible
- How to run tests
- Where to ask for help
- First tasks suggestion for a new developer

### 4. Fill in docs/RUNBOOK.md

- Local development commands
- Build and deploy steps
- Common errors and fixes
- Monitoring and logs (if applicable)

### 5. Fill in docs/GLOSSARY.md

- Project-specific terms, abbreviations, and domain language

### 6. Update AGENTS.md

- Add project-specific rules agents should follow
- Point to doc locations and confidence tag conventions

### 7. Verify

- Run `docatlas drift` and fix reported issues
- Replace all `TODO`, `TBD`, and `__JOURNEY_NAME__` placeholders
- Commit with message: `docs: initial DocAtlas discovery pass`

## Output

- All DocAtlas doc files filled in with accurate content
- No unresolved placeholders
- `docatlas drift` passes (or only `[uncertain]` items with owners noted)

## Do not

- Invent features that are not in the code
- Delete existing team docs without reason
- Mark sections `[verified]` unless you confirmed them
