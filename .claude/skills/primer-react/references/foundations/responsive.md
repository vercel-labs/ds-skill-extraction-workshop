# Foundations: Responsive

## What this covers

- Minimum viewport/zoom support, touch-target minimums, hover-independence, user-preference media features, and the rem-based token contract.

### token/minimum-target-contrast-minimum

Interactive targets need "a minimum target size of `24px`" (WCAG AA baseline); aim for 44px on mobile to reach AAA. The `medium` Button is "visually only 32px in height" — prefer `Button size="large"` on touch-first surfaces rather than padding the hit area by hand.

**When it bites:** a row of `size="medium"` icon buttons on a phone yields 32px targets that miss the AAA touch budget and frustrate fat-finger taps.

| Bad | Good | Why |
|---|---|---|
| `Button size="medium"` for touch-primary UI | `Button size="large"` | medium is 32px visual height; large reaches the mobile touch-target recommendation |

Source: https://primer.style/product/getting-started/foundations/responsive#minimum-target

### token/user-preference-modes

"By default, GitHub must respect these preferences": `prefers-color-scheme`, `prefers-contrast`, `prefers-reduced-motion`, `forced-colors`, `inverted-colors`. With Primer this is mode-aware: `data-color-mode="auto"` + `ThemeProvider colorMode="auto"` (wiring lifted from the reference project) is what honors `prefers-color-scheme`; motion tokens from `functional/motion/motion.css` carry the reduced-motion behavior.

**When it bites:** hardcoding `data-color-mode="light"` ignores the OS dark-mode preference; users who set dark get a white flash-bang page.

| Bad | Good | Why |
|---|---|---|
| `data-color-mode="light"` fixed | `data-color-mode="auto"` (+ both theme CSS imports) | auto defers to `prefers-color-scheme` as the foundations require |

Source: https://primer.style/product/getting-started/foundations/responsive#responsive-to-the-user-preferences

### token/rem-units

"Primer design tokens are designed to support `rem` units, which are relative to the browser's default font size" — use the provided tokens (sizes, spacing, type) instead of px literals so browser zoom (up to 400% reflow at 1280px, minimum supported viewport 320×256) and user font-size overrides scale the UI. The reference project's exemplars model this as `var(--base-size-16, 1rem)`-style fallbacks.

**When it bites:** px-literal spacing stays fixed when a low-vision user raises the default font size; the layout misaligns from the rem-scaled Primer components around it.

| Bad | Good | Why |
|---|---|---|
| `padding: 16px` | `padding: var(--base-size-16, 1rem)` | the token tracks the user's root font size; the literal does not |

Source: https://primer.style/product/getting-started/foundations/responsive#browser-default-font-size

### token/hover-independence

Browsers report hover capability via "the `hover` media feature", but hover-dependent features (tooltips, hovercards) must remain "accessible through other means, such as a direct link to a page". Likewise, "pointing device media queries such as `coarse` or `fine` are unreliable" — do not conditionally change UI on them.

**When it bites:** information available only in a hovercard is unreachable on touch devices and for keyboard-only users.

| Bad | Good | Why |
|---|---|---|
| critical detail only in a tooltip | tooltip plus an inline link/visible affordance | hover is an enhancement, never the only path |

Source: https://primer.style/product/getting-started/foundations/responsive#hover-support
