# Epistemic labels

Use epistemic labels on **factual claims** in DocAtlas documentation, alongside confidence tags.

Source: https://github.com/JeeEko/DocAtlas

## Labels

| Label | Meaning | When to use |
|-------|---------|-------------|
| **OBSERVED** | Directly evidenced in source code, tests, or config | Confirmed by reading the repo |
| **DECLARED** | Explicit in README, ADRs, product docs, or config comments | Documented intent, not yet verified in code |
| **INFERRED** | Supported by multiple signals but not explicit | Include confidence: High, Medium, or Low |
| **UNKNOWN** | Cannot be established from repository evidence | Preserve — do not invent to fill gaps |

## Mapping to confidence tags

| Confidence tag | Typical epistemic label |
|----------------|-------------------------|
| `[verified]` | OBSERVED or DECLARED |
| `[likely]` | INFERRED (Medium) |
| `[uncertain]` | UNKNOWN or INFERRED (Low) |
| `[planned]` | DECLARED (future behavior) |

Use **both** on business rules and architecture claims when possible.

## Rules

- Do not promote INFERRED or UNKNOWN to OBSERVED without new evidence
- INFERRED claims must state confidence (High / Medium / Low)
- UNKNOWN is valuable — list open questions rather than guessing
- Source code wins when documentation conflicts with code

## Example

```markdown
| Rule | Source | Epistemic | Confidence |
|------|--------|-----------|------------|
| Orders cannot be cancelled after shipment | `tests/orders/cancel.spec.ts` | OBSERVED | [verified] |
| Max 100 items per cart | README pricing section | DECLARED | [likely] |
| Refunds within 30 days | TODO | UNKNOWN | [uncertain] |
```

See also [EVIDENCE_FORMAT.md](EVIDENCE_FORMAT.md) and [CONFIDENCE_TAGS.md](CONFIDENCE_TAGS.md).
