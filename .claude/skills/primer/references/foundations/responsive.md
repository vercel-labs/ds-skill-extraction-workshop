# Foundation: responsive

## What this covers

- Minimum viewport dimensions, user-preference media features Primer respects (`prefers-color-scheme`, `prefers-contrast`, `prefers-reduced-motion`, `forced-colors`, `inverted-colors`), AA target-size minimum, and rem-based sizing.

Source URL fetched: https://primer.style/foundations/responsive (the path `/product/getting-started/foundations/responsive` from Phase 1 redirects here).

### token/min-viewport-size

Primer-built UI assumes a minimum viewport of 320px wide and 256px tall. Smaller viewports are not supported; layouts that work at 200px do so by accident.

**When it bites:** Testing at 240px reveals layouts that the DS never validated against; reports of "broken on small phones" tend to surface at this width.

| Bad | Good | Why |
|---|---|---|
| Designing for a 240px breakpoint | Targeting 320px as the minimum supported | 320px is Primer's documented floor; widths below produce unspecified behavior. |

Source: https://primer.style/foundations/responsive#viewport-size

### token/user-preference-media

Honor `prefers-color-scheme`, `prefers-contrast`, `prefers-reduced-motion`, `forced-colors`, and `inverted-colors` rather than asserting a single appearance. Primer's `data-color-mode="auto"` is the wiring that surfaces `prefers-color-scheme`; the other features require explicit CSS handling.

**When it bites:** A modal that animates open ignoring `prefers-reduced-motion: reduce` causes vestibular-disorder regressions; a control that hardcodes color ignoring `forced-colors: active` becomes invisible in Windows High Contrast mode.

| Bad | Good | Why |
|---|---|---|
| `transition: transform 200ms` unconditionally | Wrap in `@media (prefers-reduced-motion: no-preference) { transition: ... }` | Reduced-motion users get a static transition that respects their preference. |
| Hardcoded `color: #000` for a control border | `border-color: var(--borderColor-default)` (auto-honors forced-colors) | Functional tokens degrade correctly under `forced-colors: active`. |

Source: https://primer.style/foundations/responsive#responsive-to-the-user-preferences

### token/min-target-size

Interactive elements must meet WCAG AA 24px minimum target size. Primer's `medium` button is 32px tall; on mobile surfaces, switch to the `large` button variant rather than padding the hit area artificially.

**When it bites:** A 24px-tall icon button looks tappable on desktop but fails AA on touch; padding it visually expands the box while keeping the hit-target small.

| Bad | Good | Why |
|---|---|---|
| `<IconButton size="small">` on a mobile-primary surface | `<IconButton size="large">` on a mobile-primary surface | The size prop drives both the visual + hit target; padding only the visual leaves the hit target too small. |

Source: https://primer.style/foundations/responsive#minimum-target

### token/pointer-media-unreliable

`@media (pointer: coarse)` and `@media (pointer: fine)` are unreliable signals — many devices accept multiple input modes simultaneously (a phone with a Bluetooth mouse, a touch laptop), and browsers may not detect augmented input. Do not gate UI behavior on pointer media queries.

**When it bites:** Disabling hover affordances on `(pointer: coarse)` removes useful UI from touch+keyboard hybrid devices.

| Bad | Good | Why |
|---|---|---|
| `@media (hover: none) { .tooltip { display: none } }` | Always provide an alternative non-hover path to the tooltip's information (a direct link, a tap target) | Pointer/hover detection is heuristic; the alternative path is always available. |

Source: https://primer.style/foundations/responsive#pointing-device

### token/rem-sizing-baseline

Primer's size tokens (`--base-size-*`, `--text-*-size`, `--stack-padding-*`) are built on `rem` units so they honor the browser's default font-size preference. Hardcoding `px` divorces sizing from the user's accessibility preference.

**When it bites:** A user who sets browser default font-size to 20px (large-text accommodation) gets a Primer-painted page sized correctly except for hand-rolled `px` rules — those stay at the developer's assumed 16px baseline.

| Bad | Good | Why |
|---|---|---|
| `padding: 16px` (hardcoded) | `padding: var(--base-size-16, 1rem)` | The token reads `rem`, honoring the user's browser default; hardcoded `px` ignores it. |

Source: https://primer.style/foundations/responsive#browser-default-font-size
