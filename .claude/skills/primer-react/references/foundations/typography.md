# Foundations: Typography

## What this covers

- Rem-based type tokens, unitless line-heights on the 4px grid, weight-via-variable rule, and semantic heading-order rules.

### token/type-shorthand-tokens

"Typography design tokens use `rem` units for a more accessible browser zoom experience"; "line height values are unitless and vary per style, making them align to the 4px grid"; shorthand tokens "control size, family, weight, and line-height with a single `font` CSS declaration" (e.g. `--text-subtitle-shorthand`, shipped in `@primer/primitives/dist/css/functional/typography/typography.css` — 41 `--text-*` variables in the installed package).

**When it bites:** a hand-assembled font shorthand with px sizes and a unitless-mismatched line-height drifts off the 4px grid and ignores user zoom.

| Bad | Good | Why |
|---|---|---|
| `font: 600 20px/28px sans-serif` | `font: var(--text-subtitle-shorthand)` | the shorthand token carries size, family, weight, and line-height together, in rem |

Source: https://primer.style/product/getting-started/foundations/typography#overview

### token/weight-via-variable

"Use weight CSS variables to set font-weight"; "don't use arbitrary weight number values" (e.g. hardcoded `font-weight: 700`). The package-correct variable family is `--text-<style>-weight` (e.g. `--text-subtitle-weight`, grep-resolved in `@primer/primitives@11.9.0`). Note: the docs page's Do example image names `--test-subtitle-weight` — a docs typo; the installed package ships `--text-subtitle-weight`. In `@primer/react`, prefer the `Text weight="semibold"` prop over raw CSS.

**When it bites:** a hardcoded `font-weight: 700` diverges from the style's tuned weight when the type scale updates; the variable tracks it.

| Bad | Good | Why |
|---|---|---|
| `font-weight: 700` | `font-weight: var(--text-subtitle-weight)` (or `Text weight="semibold"`) | weights are tokens, not magic numbers |

Source: https://primer.style/product/getting-started/foundations/typography#hierarchy

### token/semantic-heading-order

"Use semantic title markup combined with styles"; "don't adjust semantic heading tag order to achieve a specific visual design". In `@primer/react`, `Heading as="h2" variant="large"` decouples the semantic level (`as`) from the visual size (`variant`) — pick `as` for document order, `variant` for appearance.

**When it bites:** an `h3` promoted to `h1` for its size breaks the heading outline screen-reader users navigate by.

| Bad | Good | Why |
|---|---|---|
| `<Heading as="h1">` for a mid-page section because it "looks right" | `<Heading as="h2" variant="large">` | `as` carries semantics, `variant` carries size — they are independent |

Source: https://primer.style/product/getting-started/foundations/typography#hierarchy

### token/readability-line-length

"Utilize line-height tokens for proper alignment"; "keep lines around 80 characters or less"; content is "typically left-aligned and ragged right" — justified, centered, and right-aligned body text is atypical of GitHub products. "Refrain from utilizing color as a primary method of emphasis" — use weight/size hierarchy instead.

**When it bites:** uncapped prose at full `wide` width blows past 80 characters; color-only emphasis disappears for color-blind users and in forced-colors mode.

| Bad | Good | Why |
|---|---|---|
| `text-align: justify` on body prose; accent color as the only emphasis | left-aligned ragged-right; `Text weight="semibold"` for emphasis | alignment and weight survive modes and a11y settings; color-only emphasis does not |

Source: https://primer.style/product/getting-started/foundations/typography#readability
