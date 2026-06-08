# Foundation: Layout

## What this covers

- Spacing scale tokens, the page-region model (header/content/pane/footer), and breakpoint/viewport-range identifiers.

Source page: https://primer.style/product/getting-started/foundations/layout

### token/spacing-scale-tokens

Use the spacing scale tokens for gaps and padding, not raw pixels: the base step scale `--base-size-{2,4,8,12,16,20,24,28,32,…}` and the named functional spacing `--space-{xxs,xs,sm,md,lg,xl}`. `Stack`'s `gap` prop (`condensed`/`normal`/`spacious`) resolves to these under the hood.

**When it bites:** ad-hoc pixel padding drifts from the 4px grid and from the rhythm the DS components assume, so hand-built sections never line up with DS components.

| Bad | Good | Why |
|---|---|---|
| `padding: 15px` | `padding: var(--base-size-16)` / `Stack gap="normal"` | scale tokens keep spacing on the grid the components are built against |

Source: https://primer.style/product/getting-started/foundations/layout#padding

### token/page-region-roles

Full pages compose from named regions, each with a role: **header** (title + optional actions/summary/local-nav), **content** (the main subject), **left pane** (navigation/filtering/entity overview), **right pane** (metadata/auxiliary detail), **footer** (references/links). `PageLayout` (`.Header` / `.Content` / `.Pane`) is the component that maps to these roles.

**When it bites:** putting navigation in Content or primary subject matter in a Pane breaks the responsive collapse order and the landmark structure.

| Bad | Good | Why |
|---|---|---|
| nav rendered inside `PageLayout.Content` | nav in `PageLayout.Pane position="start"` | the pane region is the documented home for navigation/filtering; regions drive the responsive collapse |

Source: https://primer.style/product/getting-started/foundations/layout#layout-regions

### token/breakpoint-scale

Breakpoints are named tokens `--breakpoint-{xsmall:320, small:544, medium:768, large:1012, xlarge:1280, xxlarge:1400}` and viewport ranges are `narrow` (<768), `regular` (≥768), `wide` (≥1400). Breakpoints are decoupled from a `min-width` mobile-first assumption — do not hardcode pixel media queries when a breakpoint token exists.

**When it bites:** a hardcoded `@media (min-width: 800px)` lands between Primer's `medium` (768) and `large` (1012) breakpoints, so layout shifts at a point no DS component shifts at.

| Bad | Good | Why |
|---|---|---|
| `@media (min-width: 800px)` | `var(--breakpoint-large)` / `PageLayout` responsive props | breakpoint tokens keep custom layout shifts aligned with DS component shifts |

Source: https://primer.style/product/getting-started/foundations/layout#breakpoints
