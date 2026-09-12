# DocAtlas design principles

DocAtlas must work on **any** software project. These rules guide toolkit changes.

## 1. Project-agnostic discovery

- Infer structure from **files, routes, and package layout** in the repo.
- **Never** assume e-commerce, auth, SaaS, or any other domain.
- **Never** hardcode journey names like "MockCheckout" or flow steps like "cart → checkout".

## 2. Structure over semantics

- Rank pages by **route depth, entry points, and file patterns** — not keywords like "login" or "dashboard".
- Group APIs by **path prefix** (e.g. `/api/users`) — not by guessed business meaning.
- Journey labels come from **route segments** in the code (e.g. `/settings` → "Settings").

## 3. Honest confidence

- Auto-generated content is `[likely]` until a human or test confirms it.
- When detection is weak, say so (`[uncertain]`) instead of inventing flows.

## 4. Human + agent finish the job

- DocAtlas **scaffolds and traces** technical structure; **discovery** fills business context and verified rules.
- Do not invent business rules in automated steps — extract from README, tests, validation code, and stakeholders.

## 5. Business vs technical docs

| Doc | Purpose |
|-----|---------|
| `BUSINESS.md` | Why the product exists, who uses it, rules and capabilities |
| `ARCHITECTURE.md` | How it is built |
| `JOURNEY-*.md` | Where flows live in code |

## 6. Minimal assumptions about stack

- Detect stack from `package.json` and apply **framework parsers** (Next.js, NestJS, Express/Hono/Fastify, React Router, OpenAPI, etc.).
- Parsers extract routes from code — they do not assume business domain.
- Target **≥90% trace coverage** of detected pages and API routes; report gaps explicitly.
- When a framework is unsupported, document what was found and leave gaps explicit.

## 6. Accuracy over brevity

- `docatlas refine` maps detected routes to journey steps until coverage meets the target (default 90%).
- Full route inventory lives in `ARCHITECTURE.md`; journey groups related UI + API paths.

---

When adding features, ask: *"Would this break or mislead on a CLI tool, mobile backend, or internal admin app?"* If yes, keep it generic or optional.
