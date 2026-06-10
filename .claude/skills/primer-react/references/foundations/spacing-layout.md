# Foundation: Layout

## What this covers

- Named breakpoints (`--breakpoint-*`) and their pixel values, page width caps, and the content/pane padding scale that keep pages responsive and consistent.
- Source: https://primer.style/product/getting-started/foundations/layout/

### token/breakpoint-scale

Drive responsive behavior from the named breakpoint tokens (`--breakpoint-xsmall` 320px, `--breakpoint-small` 544px, `--breakpoint-medium` 768px, `--breakpoint-large` 1012px, `--breakpoint-xlarge` 1280px, `--breakpoint-xxlarge` 1400px), not ad-hoc media-query pixel values. Hand-picked breakpoints fragment the layout grid across screens.

**When it bites:** a custom `@media (max-width: 800px)` fires between Primer's `medium` (768) and `large` (1012) breakpoints, so a panel reflows out of step with the rest of the page.

| Bad | Good | Why |
|---|---|---|
| `@media (min-width: 800px)` | a query keyed to `--breakpoint-medium` (768px) | named breakpoints keep all components reflowing on the same grid |

Source: https://primer.style/product/getting-started/foundations/layout/#breakpoints

### token/page-width-cap

Cap full pages at the `xlarge` breakpoint (1280px); interstitial/focused pages cap at `xsmall` (320px) max width. At `xlarge` the 1280px includes 24px padding, so the effective content width is 1232px — size content regions to that, not to the raw viewport.

**When it bites:** an uncapped full-width page stretches a form to 2000px on a wide monitor and the line length becomes unreadable.

| Bad | Good | Why |
|---|---|---|
| `max-width: 100vw` content | `max-width` keyed to `--breakpoint-xlarge` (1280px) | the documented full-page cap keeps measure readable on wide screens |

Source: https://primer.style/product/getting-started/foundations/layout/#full-pages

### token/region-padding-scale

Layout regions pad at 16px from `xsmall` through `large`, stepping the Content region to 24px at `xlarge`/`xxlarge` (the Pane region stays 16px). Padding is applied to the content/pane area itself, not the parent container.

**When it bites:** padding applied to the outer container double-pads nested regions and the content drifts off the intended grid.

| Bad | Good | Why |
|---|---|---|
| padding on the page wrapper | padding on the Content/Pane region directly | regions own their padding so nested layouts stay aligned |

Source: https://primer.style/product/getting-started/foundations/layout/#padding
