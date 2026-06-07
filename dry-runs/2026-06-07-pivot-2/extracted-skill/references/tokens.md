# tokens — `ds` (Primer functional tokens + foundation rules)

The `ds` skill consumes Primer's functional token layer (`@primer/primitives@11.9.0`). The CSS variables ship in `node_modules/@primer/primitives/dist/css/functional/themes/{light,dark}.css`. The local wrapper does not introduce any tokens of its own — it inherits the entire functional inventory.

Token-family scope: **color only** for this skill. Primer also ships space, type, and motion families via `@primer/primitives`, but no per-project rules surfaced for those families during this extraction; reach into `node_modules/@primer/primitives/dist/` directly if a component needs them.

Six rules extracted from https://primer.style/product/getting-started/foundations/color-usage/ — four shapes covered (token-pairing × 2, mode-aware × 2, contrast-minimum × 2). Every cited functional CSS variable grep-resolves in `light.css`; one base-scale variable cited as a docs example is intentionally absent (the absence reinforces the rule).

---

### token/functional-mode-binding

Use functional tokens (`--bgColor-*`, `--fgColor-*`, `--borderColor-*`); never reference base-scale tokens (`--color-scale-pink-5`, etc.) directly in code or CSS — base tokens do not respect color mode and the published `@primer/primitives@11.9.0` package does not even expose them as CSS variables.

**When it bites:** a hardcoded base hex or `var(--color-scale-*)` reference reads "fine" in light mode and either breaks contrast in dark mode or fails to resolve at all (the variable is not shipped, so the browser falls back to the cascaded default).

| Bad | Good | Why |
|---|---|---|
| `color: #DD7B0E;` | `color: var(--fgColor-attention);` | A hex never inverts in dark mode; the functional token reads the mode-correct value. |
| `var(--color-scale-pink-5)` | `var(--bgColor-attention-muted)` (or another functional role) | Base-scale variables are not exported from `@primer/primitives@11.9.0`; the reference resolves to nothing at runtime. |

Source: https://primer.style/product/getting-started/foundations/color-usage/#design-token-categories

---

### token/neutral-scale-inversion

The neutral scale is inverted between light and dark themes — step 0 is the lightest in light mode and the darkest in dark mode. Functional tokens (`--bgColor-default`, `--bgColor-muted`, etc.) abstract this inversion; reference them by role, never by scale step.

**When it bites:** an inline `var(--base-color-neutral-1)` reads as near-white in light mode and near-black in dark mode for the same DOM node, so the visual hierarchy flips between themes.

| Bad | Good | Why |
|---|---|---|
| `background: var(--base-color-neutral-1);` | `background: var(--bgColor-muted);` | Scale-step references behave opposite in dark mode; the functional token preserves the muted-surface intent across both modes. |

Source: https://primer.style/product/getting-started/foundations/color-usage/#neutral-colors

---

### token/emphasis-onemphasis-pairing

When a surface uses an emphasis background (`--bgColor-{role}-emphasis`), the foreground content on that surface MUST use `--fgColor-onEmphasis`. The on-emphasis foreground is tuned to read on every emphasis role (`accent`, `success`, `attention`, `severe`, `danger`, `open`, `closed`, `done`, `sponsors`).

**When it bites:** `var(--fgColor-default)` on `var(--bgColor-accent-emphasis)` collapses to a low-contrast pairing in dark mode — the default foreground is tuned for the default surface, not for the emphasis one, so the message disappears against the colored background.

| Bad | Good | Why |
|---|---|---|
| `background: var(--bgColor-danger-emphasis); color: var(--fgColor-default);` | `background: var(--bgColor-danger-emphasis); color: var(--fgColor-onEmphasis);` | Default foreground fails contrast against emphasis backgrounds; the on-emphasis foreground is designed for the pair. |
| `background: var(--bgColor-success-emphasis); color: var(--fgColor-success);` | `background: var(--bgColor-success-emphasis); color: var(--fgColor-onEmphasis);` | Semantic-role foregrounds belong on muted / default surfaces, not on the matching emphasis surface — tone-on-tone makes the foreground vanish. |

Source: https://primer.style/product/getting-started/foundations/color-usage/#emphasis

---

### token/semantic-foreground-surface

Semantic foreground tokens (`--fgColor-{role}` — `accent`, `success`, `attention`, `severe`, `danger`, `open`, `closed`, `done`, `sponsors`) are valid only on the default surface (`--bgColor-default`) or on the muted surface (`--bgColor-muted`). They are NOT valid on the matching emphasis surface — use `--fgColor-onEmphasis` instead (see the token/emphasis-onemphasis-pairing rule above).

**When it bites:** `var(--fgColor-success)` on `var(--bgColor-success-emphasis)` reads as the same hue tone-on-tone; the message disappears even though the contrast checker may report a passing ratio for pure RGB.

| Bad | Good | Why |
|---|---|---|
| `color: var(--fgColor-accent);` over `background: var(--bgColor-accent-emphasis);` | `color: var(--fgColor-onEmphasis);` over `background: var(--bgColor-accent-emphasis);` | Semantic-role foregrounds are tuned for muted / default surfaces; on the emphasis surface, they collapse to tone-on-tone. |
| `color: var(--fgColor-danger);` over `background: var(--bgColor-default);` | (this is correct — leave it) | The default surface is one of the two valid hosts for semantic-role foregrounds. |

Source: https://primer.style/product/getting-started/foundations/color-usage/#semantic-foreground

---

### token/border-step8-on-muted

Interactive-control borders on the `--bgColor-muted` surface need at least the equivalent of neutral scale step 8 of contrast. Using a lighter step (5 or 6, which work as separators against `--bgColor-default`) disappears against the muted background.

**When it bites:** a form input rendered on a panel with `background: var(--bgColor-muted)` shows no visible outline; the field reads as floating text and the user cannot tell it is focusable.

| Bad | Good | Why |
|---|---|---|
| Borders tuned for `--bgColor-default` (step 5-6) re-used on a muted panel | Re-tune to the step-8 minimum (use `--borderColor-default` or stronger) | Step 5-6 separators vanish against `--bgColor-muted`. |

Source: https://primer.style/product/getting-started/foundations/color-usage/#borders-and-dividers

---

### token/text-step9-step10-thresholds

Text and icons on light-neutral backgrounds (scale steps 0-4) require the step-9 minimum. Text and icons on darker-neutral backgrounds (scale steps 5-6) require the step-10 minimum. Functional foreground tokens (`--fgColor-default`, `--fgColor-muted`) target these thresholds — picking a softer foreground for "subtle" text drops below the contrast floor.

**When it bites:** body copy rendered with `var(--fgColor-muted)` against a step-5 surface reads as washed-out; axe flags it as insufficient contrast and screen-readers' high-contrast modes leave the user unable to read it at all.

| Bad | Good | Why |
|---|---|---|
| `color: var(--fgColor-muted);` on a step-5 background (a `--bgColor-muted` panel) | `color: var(--fgColor-default);` | Step-10 minimum is required on steps 5-6; the muted foreground falls below it. |

Source: https://primer.style/product/getting-started/foundations/color-usage/#text-and-icons

---

## Grep-resolve ledger

Every functional CSS variable cited above was grep-resolved against `node_modules/@primer/primitives@11.9.0/dist/css/functional/themes/light.css` during Phase 2 validation.

| Variable family | Count | Result |
|---|---|---|
| `--bgColor-default`, `--bgColor-muted` | 2 | OK |
| `--fgColor-default`, `--fgColor-onEmphasis` | 2 | OK |
| `--bgColor-{accent,success,attention,severe,danger,open,closed,done,sponsors}-emphasis` | 9 | OK |
| `--fgColor-{accent,success,attention,severe,danger,open,closed,done,sponsors}` | 9 | OK |
| `--borderColor-default` | 1 | OK |
| `--focus-outlineColor` | 1 | OK |
| `--control-borderColor-danger` | 1 | OK |
| `--color-scale-pink-5` | 1 | MISS — illustrative-only example in the docs; the package does NOT expose base-scale variables as CSS. Absence REINFORCES the token/functional-mode-binding rule. Not a defect. |

When in doubt about a variable, grep `node_modules/@primer/primitives/dist/css/functional/themes/light.css` for the name before using it. If it does not appear in `light.css` (and the matching `dark.css`), it is not shipped — drop it and pick a functional token that is.
