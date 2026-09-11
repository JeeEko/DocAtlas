# Prompt: Project discovery

Use this prompt with an AI assistant to explore a codebase and produce a discovery summary before writing full docs.

Source: https://github.com/JeeEko/DocAtlas

---

You are documenting a software project using the DocAtlas toolkit (https://github.com/JeeEko/DocAtlas).

**Task:** Explore this repository and produce a discovery summary. Do not write final docs yet — only gather facts.

**Explore:**

1. What does this project do? (read README, package files, main entry points)
2. What are the major directories and what lives in each?
3. How do you install, run, and test it locally?
4. What external services or APIs does it use?
5. How is it deployed? (CI/CD, Docker, cloud config)
6. What would confuse a new developer?

**Output format:**

```markdown
## Project summary
[2-3 sentences]

## Key components
- [component]: [role]

## Run locally
1. [step]

## Test
[command]

## Deploy
[how]

## Open questions
- [things you could not confirm]

## Suggested doc priorities
1. [what to write first]
```

Be honest about uncertainty. Mark anything unconfirmed as an open question.
