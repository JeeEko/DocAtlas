# Evidence citation format

Every business rule, journey step, and architecture claim should cite repository evidence when possible.

Source: https://github.com/JeeEko/DocAtlas

## Format

```
path/to/file.ext#L10
path/to/file.ext#L10-L20
```

- Paths are **repo-relative** (from project root)
- Line numbers use `#L` prefix (GitHub/Cursor compatible)
- Use a range when the claim spans multiple lines

## Good examples

```markdown
- Login validates email format — `src/auth/validate.ts#L12-L28` [OBSERVED]
- POST /api/orders creates order — `src/api/orders/route.ts#L45` [OBSERVED]
- Business rule: guest checkout disabled — `tests/checkout/guest.spec.ts#L8` [OBSERVED]
```

## In tables

```markdown
| Rule | Evidence | Epistemic | Confidence |
|------|----------|-----------|------------|
| Users must verify email | `src/auth/signup.ts#L34` | OBSERVED | [verified] |
```

## When evidence is missing

Use **UNKNOWN** epistemic label and `[uncertain]` confidence. Do not invent paths.

## CLI helper

DocAtlas provides `formatEvidence(path, startLine, endLine)` in generated drafts where line numbers are known.

## Do not

- Cite secrets, tokens, or credential values — cite the config **key name** only
- Mark `[verified]` without a real evidence path or explicit DECLARED source
