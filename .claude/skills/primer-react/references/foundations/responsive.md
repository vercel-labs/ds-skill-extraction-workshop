# Foundation: Responsive

## What this covers

- Minimum touch-target sizing, the supported viewport floor, and the user-preference media features a Primer UI must honor.
- Source: https://primer.style/product/getting-started/foundations/responsive/

### token/minimum-target-size

Interactive targets meet a 24px minimum (WCAG AA); on touch, raise to 44px (AAA) by choosing the `large` control size rather than padding a `medium` one. The `medium` button is only ~32px tall, below the AAA touch target.

**When it bites:** a `medium` button on a phone is a 32px tap target; users miss-tap because it is under the 44px AAA recommendation.

| Bad | Good | Why |
|---|---|---|
| pad a `medium` button up to 44px | use the `large` control size | size variants keep internal spacing/typography correct; manual padding distorts them |

Source: https://primer.style/product/getting-started/foundations/responsive/#minimum-target

### token/viewport-floor

Support a viewport floor of 320px wide × 256px tall and browser zoom up to 400% on a 1280px screen. Layouts must not break or clip below these bounds.

**When it bites:** a fixed-width 360px component overflows horizontally at the 320px viewport floor and triggers a body scrollbar.

| Bad | Good | Why |
|---|---|---|
| `min-width: 360px` on a page region | fluid width down to the 320px floor | 320×256 is the supported minimum; fixed widths above it clip |

Source: https://primer.style/product/getting-started/foundations/responsive/#viewport-size

### token/user-preference-media-features

Honor the user-preference media features the DS calls out — `prefers-color-scheme`, `prefers-contrast`, `prefers-reduced-motion`, `forced-colors`, `inverted-colors` — rather than detecting `pointer: coarse`/`fine`, which the DS flags as unreliable.

**When it bites:** an animation with no `prefers-reduced-motion` guard keeps moving for a user who asked the OS to reduce motion.

| Bad | Good | Why |
|---|---|---|
| branch UI on `@media (pointer: coarse)` | branch on `prefers-*` user-preference features | pointer media queries are unreliable; preference features are the supported signal |

Source: https://primer.style/product/getting-started/foundations/responsive/#responsive-to-the-user-preferences
