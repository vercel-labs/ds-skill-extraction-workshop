# Foundation: Color Usage

_Extracted from https://primer.style/product/getting-started/foundations/color-usage/ by /extract-ds-skill Phase 2._

## What this covers

- Functional token categories (bg, fg, border), emphasis-surface pairing rules, contrast minimums, semantic role assignments, and base-token prohibition for product code.

---

### token/emphasis-on-emphasis-pairing

Use `--bgColor-{role}-emphasis` paired with `--fgColor-onEmphasis` for text and icons on emphasis surfaces. Using any other foreground token on an emphasis background (`--fgColor-default`, `--fgColor-muted`) fails the contrast minimum because those foregrounds are tuned for the default/muted background, not the dark emphasis surface.

**When it bites:** White text on an accent-emphasis button becomes unreadable; screen readers also pick up the wrong color-scheme mapping in forced-colors mode.

| Bad | Good | Why |
|---|---|---|
| `--fgColor-default` on `--bgColor-accent-emphasis` | `--fgColor-onEmphasis` on `--bgColor-accent-emphasis` | Default foreground is calibrated for the default surface, not the emphasis surface — contrast fails in dark mode |

Source: https://primer.style/product/getting-started/foundations/color-usage/#emphasis (grep-resolved: `--bgColor-accent-emphasis` ✓ light.css, `--fgColor-onEmphasis` ✓ light.css)

---

### token/base-color-prohibition

Never use base color scale tokens directly in product code; always use functional tokens (`--bgColor-*`, `--fgColor-*`, `--borderColor-*`). Base tokens do not respect color modes — their values are static and flip no colors when the mode attribute changes on `<html>`.

**When it bites:** A component using `--color-scale-blue-5` directly renders the same hex in both light and dark mode; functional `--bgColor-accent-emphasis` correctly inverts.

| Bad | Good | Why |
|---|---|---|
| `--color-scale-blue-5` (base) | `--bgColor-accent-emphasis` (functional) | Base tokens bypass mode-switching; functional tokens re-resolve when `data-color-mode` changes |

Source: https://primer.style/product/getting-started/foundations/color-usage/#design-token-categories (grep-resolved: `@primer/primitives@11.9.0/dist/css` ships NO base color directory — base color scale tokens are not exposed as CSS custom properties at all, only functional `--bgColor-*`/`--fgColor-*`/`--borderColor-*` tokens are. This strengthens the prohibition: in CSS there is no base color var to misuse. The `--color-scale-*` name is illustrative of the SCSS/JS base layer, not a CSS custom property.)

---

### token/border-contrast-minimum

Interactive control borders require a minimum of step 8 contrast against `--bgColor-muted`; separator lines (non-interactive) may use step 7. Text and icons against steps 0–4 require step 9 minimum; against steps 5–6, use step 10. Target 7:1 for most interactive elements.

**When it bites:** A border at step 6 on a muted background is invisible in dark mode because the inverted scale compresses the contrast at those mid-scale values.

| Bad | Good | Why |
|---|---|---|
| `--borderColor-muted` on `--bgColor-muted` for an input | `--borderColor-default` on `--bgColor-muted` for an input | Muted border on muted background falls below step 8 minimum for interactive controls |

Source: https://primer.style/product/getting-started/foundations/color-usage/#borders-and-dividers (grep-resolved: `--borderColor-muted` ✓ light.css, `--borderColor-default` ✓ light.css)

---

### token/semantic-role-foreground

Semantic foreground tokens (`--fgColor-accent`, `--fgColor-success`, `--fgColor-attention`, `--fgColor-danger`) provide contrast against `--bgColor-muted` and `--bgColor-default` only — do not pair them with emphasis backgrounds. On emphasis surfaces, always use `--fgColor-onEmphasis`.

**When it bites:** Using `--fgColor-danger` on `--bgColor-danger-emphasis` yields near-zero contrast; the danger foreground is tuned for the default/muted surface, not the emphasis surface.

| Bad | Good | Why |
|---|---|---|
| `--fgColor-danger` on `--bgColor-danger-emphasis` | `--fgColor-onEmphasis` on `--bgColor-danger-emphasis` | Semantic role foregrounds are contrast-tested against the default surface, not the emphasis surface |

Source: https://primer.style/product/getting-started/foundations/color-usage/#semantic-foreground (grep-resolved: `--fgColor-danger` ✓ functional/themes/light.css, `--fgColor-onEmphasis` ✓ light.css)

---

### token/mode-aware-inversion

Primer's functional tokens automatically re-resolve when `data-color-mode` changes on `<html>`. The neutral scale inverts between light and dark — light starts at white (step 0), dark starts at black (step 0) — so the same functional token reads the correct value in both modes without any JS.

**When it bites:** Hardcoding a hex value for a background that "looks right" in light mode silently breaks dark mode — there is no build-time error, only a visual regression detectable by toggling `data-color-mode="dark"` on `<html>`.

| Bad | Good | Why |
|---|---|---|
| `backgroundColor: "#f6f8fa"` | `backgroundColor: "var(--bgColor-muted)"` | Hardcoded hex bypasses mode-switching; functional token re-resolves in both modes |

Source: https://primer.style/product/getting-started/foundations/color-usage/#color-design-tokens (grep-resolved: `--bgColor-muted` ✓ light.css)
