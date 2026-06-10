# Foundations: Layout

## What this covers

- Viewport ranges, breakpoint scale, content/pane padding, container max-widths, and pane/content region composition rules.

### token/viewport-ranges

Layout adapts by named viewport range, not raw breakpoints: `narrow` (<768px, single column), `regular` (>=768px, up to 2 columns — "all desktop-friendly patterns start at this range"), `wide` (>=1400px, optional 3rd column). Breakpoint units are `xsmall` 320 / `small` 544 / `medium` 768 / `large` 1012 / `xlarge` 1280 / `xxlarge` 1400 px, and "breakpoints are no longer tied to a `min-width` mobile-first media query approach" — ranges drive layout, breakpoint values fine-tune. Breakpoint custom properties ship in `@primer/primitives/dist/css/functional/size/breakpoints.css` and viewport vars in `viewport.css` (both imported by the reference project's `globals.css`).

**When it bites:** a two-pane layout built mobile-first against a single `min-width` query collapses wrongly between 768–1400px where Primer expects the `regular` range behavior.

| Bad | Good | Why |
|---|---|---|
| hand-rolled `@media (min-width: 900px)` pane split | `PageLayout` with `containerWidth` + range-based behavior | the ranges, not arbitrary widths, are the layout contract |

Source: https://primer.style/product/getting-started/foundations/layout#viewport-ranges

### token/container-max-width

"Page layouts generally limit their maximum width to `xlarge` (1280px)" to prevent overly long line lengths; interstitial pages (sign-in style) cap at `xsmall` (320px). In `@primer/react` this is `PageLayout containerWidth="large"|"medium"|"xlarge"` as exercised by the reference project's pages.

**When it bites:** an uncapped content area on a wide monitor produces 200+-character line lengths that fail the readability contract.

| Bad | Good | Why |
|---|---|---|
| full-bleed content `div` | `<PageLayout containerWidth="large">` | Primer pages cap content width; full-bleed is reserved for data-dense surfaces |

Source: https://primer.style/product/getting-started/foundations/layout#page-types

### token/content-pane-padding

Content and pane areas carry their own padding — "applied directly to the content or pane area, not to its parent container": 16px content/pane padding up through the `large` breakpoint, 24px content (pane stays 16px) at `xlarge`/`xxlarge`. Use the spacing custom properties (`--base-size-16`, `--base-size-24`) rather than raw px.

**When it bites:** padding applied on a parent wrapper double-pads once PageLayout applies its own region padding; content edge alignment drifts from sibling Primer pages.

| Bad | Good | Why |
|---|---|---|
| `padding: 16px` on the page wrapper around PageLayout | `padding: var(--base-size-16, 1rem)` on the content surface itself | region padding belongs to the region, and the token keeps it on the 4px grid |

Source: https://primer.style/product/getting-started/foundations/layout#padding

### token/pane-position

"The pane region of a split page layout is always flushed to the left" — "don't use right-aligned flushed panes as their scrollbar may conflict with the page scrollbar". The content region caps its width and stays horizontally centered when there is space; long pane lists get an independent scrollable area. Region purposes: left pane = navigation/filtering/overview, right pane = item metadata and auxiliary detail only.

**When it bites:** a navigation pane flushed right collides its scrollbar with the page scrollbar and breaks the scan pattern every other Primer page establishes.

| Bad | Good | Why |
|---|---|---|
| `<PageLayout.Pane position="end">` for nav | `<PageLayout.Pane position="start">` for nav | nav panes are left-flushed; `end` panes are for auxiliary metadata |

Source: https://primer.style/product/getting-started/foundations/layout#split-pages

### token/narrow-single-column

"Narrow viewports support a single column when displaying page layouts." Pane+content layouts on narrow either split into separate drill-in pages (list-detail), present the pane as a bottom sheet via narrow-specific triggers, or stack the pane above content — but "avoid stacking a pane on top of the main content area if the pane has a lot of links".

**When it bites:** a settings page that keeps its 200px nav pane beside content on a 320px viewport leaves the content column unusably narrow.

| Bad | Good | Why |
|---|---|---|
| two columns forced at narrow | single column; pane stacks, sheets, or splits into its own page | narrow is one column by contract |

Source: https://primer.style/product/getting-started/foundations/layout#responsive-behavior
