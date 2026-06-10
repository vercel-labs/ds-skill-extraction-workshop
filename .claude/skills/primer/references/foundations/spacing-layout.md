# Foundation: layout

## What this covers

- Primer's page-type taxonomy (Full, Split, Interstitial), viewport ranges (narrow/regular/wide), responsive breakpoints (xsmall through xxlarge), and Content/Pane padding rules.

Source URL fetched: https://primer.style/foundations/layout (the path `/product/getting-started/foundations/layout` from Phase 1 redirects here).

### token/viewport-ranges

Primer defines three viewport ranges that govern column count: `narrow` (<768px, 1 column), `regular` (≥768px, up to 2 columns), `wide` (≥1400px, up to 3 columns). Designing a 3-column layout that the viewport range does not support produces a horizontal-scroll bug on narrower viewports.

**When it bites:** A dashboard built with 3 fixed columns at the narrow range causes horizontal overflow; the third column never has room to render.

| Bad | Good | Why |
|---|---|---|
| `<Stack direction="horizontal" wrap="nowrap">` with 3 fixed-width columns | `<Stack direction="horizontal" wrap="wrap" gap="normal">` with `flex: "1 1 200px"` minimums | Wrap-wrap + a flex-basis lets columns reflow when the viewport range cannot support N columns. |

Source: https://primer.style/foundations/layout#viewport-ranges

### token/breakpoint-scale

Primer's breakpoint scale: `xsmall` 320px, `small` 544px, `medium` 768px, `large` 1012px, `xlarge` 1280px, `xxlarge` 1400px. Use these via the breakpoint CSS variables shipped by `@primer/primitives/dist/css/functional/size/breakpoints.css`; hardcoding pixel values divorces the layout from the rest of the DS.

**When it bites:** A custom `@media (min-width: 750px)` rule fires between the `small` and `medium` ranges, producing a layout that mismatches every Primer component's responsive behavior at that width.

| Bad | Good | Why |
|---|---|---|
| `@media (min-width: 750px)` | `@media (min-width: var(--breakpoint-medium))` | Token-driven breakpoints stay aligned to Primer's component responsive behavior. |

Source: https://primer.style/foundations/layout#viewport-ranges

### token/content-pane-padding

Page Content and Pane regions in `<PageLayout>` paint with `16px` padding at xsmall–large and `24px` padding at xlarge–xxlarge for Content (Pane stays at `16px` across the range). The `xlarge` content max-width of 1280px **includes** the 24px padding — effective inner content width is 1232px, not 1280px.

**When it bites:** Sizing an inner element to 1280px at xlarge causes horizontal overflow because the parent's 1280px max-width is reduced to 1232px by padding.

| Bad | Good | Why |
|---|---|---|
| `max-width: 1280px` on an inner element at xlarge | `max-width: 1232px` or rely on `<PageLayout containerWidth="large">` to size | The `xlarge` cap includes Content's 24px padding; double-counting overflows. |

Source: https://primer.style/foundations/layout#padding

### token/split-pane-position-start

For split page layouts, panes are always flushed to the start (left in LTR). Right-aligned flushed panes conflict with the page scrollbar and break the scroll affordance.

**When it bites:** A right-flushed pane's scrollbar overlaps the page scrollbar, producing an unpredictable scroll target.

| Bad | Good | Why |
|---|---|---|
| `<PageLayout.Pane position="end">` (when "end" is right in LTR) | `<PageLayout.Pane position="start">` | Primer's layout assumes start-flush; end-flush conflicts with the page scrollbar. |

Source: https://primer.style/foundations/layout#split-pages

[VERIFY: This page documents page-frame philosophy and viewport ranges but does NOT enumerate `--base-size-*` or `--stack-padding-*` token names. Those rules live under the Primitives → Size documentation; they are partially covered by the `app/globals.css` import set lifted by the reference-project step (size.css, space.css, breakpoints.css, viewport.css).]
