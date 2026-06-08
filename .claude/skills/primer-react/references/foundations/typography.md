# Foundation: Typography

_Extracted from https://primer.style/product/getting-started/foundations/typography/ by /extract-ds-skill Phase 2._

## What this covers

- rem-unit token requirement, font-weight token usage (no raw numerics), semantic heading order, and line-height token usage.

---

### token/typography-rem-units

Typography design tokens use `rem` units for browser-zoom accessibility. Never substitute `px` values for font-size or line-height when applying Primer typography tokens — `rem` allows up to 400% zoom at 1280px without loss of information.

**When it bites:** A `px` font-size ignores the user's browser default font size and breaks zoom layouts; `rem` tokens remain proportional.

| Bad | Good | Why |
|---|---|---|
| `font-size: 14px` | `font-size: var(--text-body-size-medium)` | px bypasses the user's base font preference and breaks accessibility at high zoom levels |

Source: https://primer.style/product/getting-started/foundations/typography/ (grep-resolved: `--text-body-size-medium` ✓ functional/typography/typography.css — imported by globals.css)

---

### token/typography-weight-tokens

Use font-weight CSS variable tokens rather than raw numeric values (e.g., `700`). Primer's weight tokens align with the type scale and can be updated centrally without hunting for hardcoded values.

**When it bites:** A hardcoded `font-weight: 700` produces the correct weight today but drifts when the DS updates its weight ramp; a token reference updates automatically.

| Bad | Good | Why |
|---|---|---|
| `font-weight: 700` | `font-weight: var(--base-text-weight-semibold)` | Numeric weight is hardcoded; token weight tracks the DS's semantic weight definitions |

Source: https://primer.style/product/getting-started/foundations/typography/ (grep-resolved: `--base-text-weight-semibold` ✓ base/typography/typography.css — imported by globals.css)

---

### token/typography-semantic-heading-order

Use semantic heading tag order regardless of desired visual size. `<h1>` must precede `<h2>` in document order; do not skip or reorder heading levels to achieve a visual design. Apply visual scale via `variant` prop on `<Heading>`, not by swapping tags.

**When it bites:** An `<h3>` immediately after an `<h1>` (skipping `<h2>`) breaks screen-reader navigation and fails automated heading-order audits.

| Bad | Good | Why |
|---|---|---|
| `<Heading as="h3" variant="large">` as the first heading on a page | `<Heading as="h1" variant="large">` | Heading level must reflect document hierarchy; `variant` controls visual scale independently |

Source: https://primer.style/product/getting-started/foundations/typography/#semantic-markup
