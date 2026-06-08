# Foundation: Responsive

_Extracted from https://primer.style/product/getting-started/foundations/responsive/ by /extract-ds-skill Phase 2._

## What this covers

- Minimum viewport dimensions, touch target sizes, user-preference media feature requirements, and the prohibition on pointer-device queries.

---

### token/responsive-minimum-viewport

Pages must adapt to a minimum width of 320px and minimum height of 256px without loss of information or functionality. This supports up to 400% zoom on a 1280px-wide screen (400% × 320px = 1280px). Do not hide content or features below this threshold — provide scroll or reflow instead.

**When it bites:** A fixed-width container below 320px clips content when a user zooms to 400%, making the page unusable for low-vision users who rely on browser zoom.

| Bad | Good | Why |
|---|---|---|
| `min-width: 480px` on a layout container | Fluid layout with `min-width: 320px` | Blocking below 480px fails the 400% zoom requirement at 1280px baseline |

Source: https://primer.style/product/getting-started/foundations/responsive/#viewport-minimums

---

### token/responsive-touch-target

Interactive elements must have a minimum touch target of 24px × 24px (WCAG 2.2 AA) and ideally 44px × 44px (AAA). Use `--base-size-44` or `min-height`/`min-width` tokens for touch-target sizing; do not rely on the visible component size alone.

**When it bites:** A 12px icon-only button is tappable in a mouse interaction but misses taps on mobile — the touch target is smaller than a fingertip.

| Bad | Good | Why |
|---|---|---|
| `<IconButton size="small">` with no min-size override for mobile | `min-height: var(--base-size-44)` on mobile-only icon targets | Small buttons miss mobile tap targets; 44px is the WCAG AAA recommendation |

Source: https://primer.style/product/getting-started/foundations/responsive/#touch-targets

---

### token/responsive-user-preference-media

Respect `prefers-color-scheme`, `prefers-contrast`, `prefers-reduced-motion`, `forced-colors`, and `inverted-colors` media features. Do not override or ignore them. Primer's functional token system handles `prefers-color-scheme` via the `data-color-mode="auto"` attribute on `<html>` — the attribute value reads the system preference and applies the correct token theme.

**When it bites:** Ignoring `prefers-reduced-motion` causes animated transitions to run for users with vestibular disorders; the motion.css token file in globals.css provides reduced-motion-aware motion tokens that automatically suppress animation.

| Bad | Good | Why |
|---|---|---|
| Inline CSS animation with no `prefers-reduced-motion` check | Primer motion tokens from `functional/motion/motion.css` via globals.css @import | Motion tokens honor prefers-reduced-motion; inline CSS animation does not |

Source: https://primer.style/product/getting-started/foundations/responsive/#user-preference-media-features
