# Foundation: Responsive

## What this covers

- User-preference media features, minimum touch-target sizes, and viewport minimums the UI must honor.

Source page: https://primer.style/product/getting-started/foundations/responsive

### token/touch-target-minimum

Interactive targets need **24px** minimum (WCAG AA) and **44px** recommended (AAA) on mobile. The `medium` Button is 32px tall — on touch/mobile use the `large` Button size to reach the target rather than padding the hit area by hand.

**When it bites:** keeping the 32px `medium` button on a mobile touch surface leaves the tap target below the AA minimum.

| Bad | Good | Why |
|---|---|---|
| `<Button size="medium">` on mobile + manual padding | `<Button size="large">` on mobile | the docs prescribe the larger size token over hand-padded hit areas |

Source: https://primer.style/product/getting-started/foundations/responsive#minimum-target

### token/user-preference-media-features

UI MUST respect user-preference media features: `prefers-color-scheme`, `prefers-contrast`, `prefers-reduced-motion`, `forced-colors`, `inverted-colors`. The `auto` color mode (set via the root mode attribute) is what wires `prefers-color-scheme` into Primer's token resolution.

**When it bites:** ignoring `prefers-reduced-motion` ships unconditional animation to users who asked the OS to suppress it; ignoring `prefers-color-scheme` pins one theme regardless of OS setting.

| Bad | Good | Why |
|---|---|---|
| unconditional transitions; fixed light theme | honor `prefers-reduced-motion`; `data-color-mode="auto"` | these media features are the documented user-preference contract Primer expects UI to respect |

Source: https://primer.style/product/getting-started/foundations/responsive#responsive-to-the-user-preferences

### token/rem-zoom-units

Type and size tokens are authored in `rem` (relative to the browser's default 16px) so browser zoom up to 400% reflows correctly at the 320×256 minimum viewport. Do not override the root font size or convert tokens to `px`.

**When it bites:** hardcoding `px` font sizes breaks the 400% reflow requirement and the zoom-accessible experience the rem tokens provide.

| Bad | Good | Why |
|---|---|---|
| `font-size: 14px` | rem-based type tokens (e.g. `--text-body-size-medium`) | rem units preserve the zoom/reflow accessibility the DS is tuned for |

Source: https://primer.style/product/getting-started/foundations/responsive#browser-default-font-size

## Notes

- This page references breakpoint/viewport names only by link to the Layout page; the concrete breakpoint tokens are extracted in `layout.md` (`token/breakpoint-scale`), not duplicated here.
