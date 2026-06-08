# Foundation: Layout

_Extracted from https://primer.style/product/getting-started/foundations/layout/ by /extract-ds-skill Phase 2._

## What this covers

- Viewport-range breakpoints, content max-width rules, pane positioning constraints, and the three named responsive layout patterns.

---

### token/layout-viewport-range

Primer defines six named viewport breakpoints: `xsmall` (320px), `small` (544px), `medium` (768px), `large` (1012px), `xlarge` (1280px), `xxlarge` (1400px). Use these names in responsive token APIs (e.g., `Stack direction={{ narrow: "vertical", regular: "horizontal" }}`), not raw pixel values in media queries.

**When it bites:** A raw `@media (min-width: 768px)` duplicates the `medium` breakpoint without the centralized update path — if the DS changes the medium threshold, the hardcoded query does not track it.

| Bad | Good | Why |
|---|---|---|
| `@media (min-width: 768px) { ... }` | Responsive prop API: `direction={{ narrow: "vertical", regular: "horizontal" }}` | Raw media queries are not token-tracked; responsive props resolve to DS breakpoint values automatically |

Source: https://primer.style/product/getting-started/foundations/layout/#viewport-ranges

---

### token/layout-content-maxwidth

Full-page layouts should cap content at `xlarge` (1280px) maximum width to prevent line lengths from exceeding readability thresholds. `PageLayout containerWidth="xlarge"` enforces this. Interstitial pages (modals, onboarding, empty states) cap at `xsmall` (320px) — use `containerWidth="medium"` as the practical equivalent.

**When it bites:** No max-width on a layout at `xxlarge` (≥1400px) produces paragraphs with 120+ characters per line, failing the ~80-character readability guideline.

| Bad | Good | Why |
|---|---|---|
| `<PageLayout>` with no `containerWidth` on a full content page | `<PageLayout containerWidth="xlarge">` | Unconstrained width renders unreadable paragraphs on large viewports |

Source: https://primer.style/product/getting-started/foundations/layout/#full-pages

---

### token/layout-pane-position

The pane in a split layout is always flushed to the start (left). Do not use `position="end"` (right-flushed pane) for navigation or content-filtering panes — a right-side pane's scrollbar conflicts with the browser's page scrollbar.

**When it bites:** A right-flushed pane with long content produces two simultaneous scrollbars (pane + page) on the same edge, making the viewport confusing to scroll on narrow screens.

| Bad | Good | Why |
|---|---|---|
| `<PageLayout.Pane position="end">` for a nav pane | `<PageLayout.Pane position="start">` | Right-flushed pane scrollbar conflicts with the page scrollbar on the same edge |

Source: https://primer.style/product/getting-started/foundations/layout/#split-pages
