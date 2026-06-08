---
name: extract-ds-skill
description: Test fixture — meta-skill self-mode, leaked hardcoded path in prescription text. The check should FAIL.
---

## Prescription text

Prescription text claims the canonical reference project lives at <https://github.com/vercel-labs/example-app>, leaking a GitHub URL outside any illustrative block. The check must catch this on the line above.

### Worked example — public-DS-shaped target (illustrative)

Inside the labeled block, hardcoded references are allowed:

- Reference project: <https://github.com/vercel-labs/example-app>
- Token package: `@example/tokens`
