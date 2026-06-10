# Foundation: Typography

## What this covers

- Use typography weight/size tokens (`--text-*-weight`, `--text-*-size-*`) instead of raw numeric values, and keep semantic heading order intact when styling native text elements.
- Source: https://primer.style/product/getting-started/foundations/typography/

### token/font-weight-variable

Set `font-weight` from a weight token (`--text-body-weight`, `--text-title-weight`, `--text-subtitle-weight`, `--text-caption-weight`) — never a raw numeric like `700`. A raw weight drifts from the type scale and ignores any future weight retune the DS ships.

**When it bites:** a hardcoded `font-weight: 700` stays bold even after the DS softens its title weight, so the heading reads heavier than every Primer-rendered heading around it.

| Bad | Good | Why |
|---|---|---|
| `font-weight: 700` | `font-weight: var(--text-title-weight)` | weight tokens track the type scale; raw numerics fork from it |

Source: https://primer.style/product/getting-started/foundations/typography/#best-practices

### token/heading-semantic-order

When styling native heading elements, do not reorder semantic heading tags to achieve a visual size — an `<h2>` must not precede an `<h1>` for layout reasons. Pick the tag for the document outline and the size token (`--text-title-size-large`, etc.) for the appearance, independently.

**When it bites:** a visually-driven `<h2>`-before-`<h1>` breaks screen-reader heading navigation and the page outline reads scrambled.

| Bad | Good | Why |
|---|---|---|
| `<h2>` styled large, placed above the `<h1>` | `<h1>` for outline + size token for appearance | heading level is the document outline; size token is the look — keep them separate |

Source: https://primer.style/product/getting-started/foundations/typography/#hierarchy

### token/rem-units-for-zoom

Typography tokens are authored in `rem` so text scales with the browser's default font size for accessible zoom. Do not override token-driven sizes with fixed `px` values, which opt out of user zoom.

**When it bites:** a `font-size: 14px` override ignores a user who raised their browser default to 20px, leaving that text stuck small while token-driven text scales.

| Bad | Good | Why |
|---|---|---|
| `font-size: 14px` | `font-size: var(--text-body-size-medium)` | rem-based tokens honor the browser default; fixed px breaks zoom |

Source: https://primer.style/product/getting-started/foundations/typography/#readability

> Note: concrete numeric values for each size/weight token live on the Primer **Typography primitives** page, not this foundation page. The token names above grep-resolve in `@primer/primitives/dist/css/functional/typography/typography.css`; their pixel/rem values are defined there.
