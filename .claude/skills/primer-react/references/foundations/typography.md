# Foundation: Typography

## What this covers

- Typography tokens: weight/line-height binding, the shorthand `font` tokens, and the decoupling of visual style from semantic heading order.

Source page: https://primer.style/product/getting-started/foundations/typography

### token/font-weight-token-binding

Set `font-weight` from a typography weight token, never a raw numeric value. The DS ships weights inside the per-role tokens (e.g. `--text-body-weight`, `--text-subtitle-shorthand`); hardcoding `700` desyncs from the scale and from mode/zoom adjustments.

**When it bites:** a heading hardcoded to `font-weight: 700` ignores the role's tuned weight and drifts when the DS retunes the scale.

| Bad | Good | Why |
|---|---|---|
| `font-weight: 700` | `font: var(--text-subtitle-shorthand)` (or the role weight token) | the docs "Don't" example flags raw `700`; tokens keep weight aligned to the type scale |

Source: https://primer.style/product/getting-started/foundations/typography#readability

### token/text-shorthand-role

Each text role ships a single shorthand token bundling size + family + weight + line-height into one `font` declaration: `--text-body-shorthand-{small,medium,large}`, `--text-caption-shorthand`, `--text-subtitle-shorthand`, `--text-display-shorthand`, `--text-codeBlock-shorthand`, `--text-codeInline-shorthand`. Prefer the shorthand over assembling the four sub-tokens by hand.

**When it bites:** assembling size/weight/line-height separately drops the unitless line-height that aligns text to the 4px grid, breaking vertical rhythm.

| Bad | Good | Why |
|---|---|---|
| separate `font-size` + `font-weight` + `line-height` literals | `font: var(--text-body-shorthand-medium)` | shorthand bundles the grid-aligned line-height the docs require for "proper alignment" |

Source: https://primer.style/product/getting-started/foundations/typography#overview

### token/heading-semantic-order

Visual size and semantic heading level are decoupled: choose the `<h1>`–`<h6>` tag for document structure, then style with type tokens — do NOT reorder heading tags to achieve a visual look.

**When it bites:** an `<h2>` placed before `<h1>` to look right visually breaks the AT heading outline and document landmarks.

| Bad | Good | Why |
|---|---|---|
| `<h2>` before `<h1>` for visual sizing | correct `<h1>`/`<h2>` order + `variant` styling | the docs "Don't" example flags reordered tags; adjust style tokens, not tag order |

Source: https://primer.style/product/getting-started/foundations/typography#hierarchy

## Notes

- The docs page names a token `--test-subtitle-weight` in a screenshot caption; that string does NOT grep-resolve in `@primer/primitives@11.9.0` (it is a docs artifact). The real subtitle token is `--text-subtitle-shorthand`. [VERIFY: `--test-subtitle-weight` cited by docs caption but not present in installed package — treated as a docs typo, substituted the real `--text-subtitle-*` tokens]
