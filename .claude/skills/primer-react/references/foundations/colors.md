# Foundation: Color usage

## What this covers

- How Primer's functional color tokens pair, invert across light/dark mode, and meet contrast minimums — use functional tokens (`bgColor-*`, `fgColor-*`, `borderColor-*`), never base scale tokens (`color-scale-*`) directly.
- Source: https://primer.style/product/getting-started/foundations/color-usage/

### token/functional-over-base

Use functional tokens (`--bgColor-default`, `--fgColor-muted`, `--borderColor-default`) and never base scale tokens (`--color-scale-*`) directly. Base tokens are raw reference values that do NOT respond to color mode; using one hardcodes a single mode's value and breaks the other mode.

**When it bites:** a `--color-scale-gray-9` background stays the same dark value in light mode, so the page renders an inverted patch that ignores the user's theme.

| Bad | Good | Why |
|---|---|---|
| `background: var(--color-scale-gray-1)` | `background: var(--bgColor-default)` | base tokens ignore color mode; functional tokens re-resolve per theme |

Source: https://primer.style/product/getting-started/foundations/color-usage/#design-token-categories

### token/emphasis-on-emphasis-pairing

Any emphasis background (`--bgColor-{role}-emphasis`) MUST carry `--fgColor-onEmphasis` for its text and icons. The default body foreground (`--fgColor-default`) on an emphasis surface fails contrast — `fgColor-onEmphasis` is the foreground tuned for emphasis surfaces.

**When it bites:** white-on-blue reads fine until dark mode flips the default foreground dark, and the button label disappears into the emphasis background.

| Bad | Good | Why |
|---|---|---|
| `bg: --bgColor-accent-emphasis; color: --fgColor-default` | `bg: --bgColor-accent-emphasis; color: --fgColor-onEmphasis` | the on-emphasis foreground is the only one tuned for emphasis surfaces across both modes |

Source: https://primer.style/product/getting-started/foundations/color-usage/#emphasis

### token/muted-surface-pairing

Pair `--bgColor-muted` with `--borderColor-muted` for subtle, low-emphasis regions (section dividers, secondary cards). Mixing a muted background with a default-emphasis border over-weights a region that is meant to recede.

**When it bites:** a muted card with a `--borderColor-default` border reads as a primary card and competes with real primary content.

| Bad | Good | Why |
|---|---|---|
| `bg: --bgColor-muted; border: --borderColor-default` | `bg: --bgColor-muted; border: --borderColor-muted` | muted bg + muted border are calibrated together for subtle emphasis |

Source: https://primer.style/product/getting-started/foundations/color-usage/#muted

### token/neutral-scale-mode-inversion

The neutral scale inverts between modes — light runs white→black, dark runs black→white — which is precisely why functional tokens work without per-mode overrides. Never hardcode a neutral scale step for a surface or border; use the functional token so the inversion is automatic.

**When it bites:** a hardcoded light-mode neutral step produces a near-invisible border in dark mode (the step that was dark-on-light becomes dark-on-dark).

| Bad | Good | Why |
|---|---|---|
| `border: var(--color-scale-gray-7)` | `border: var(--borderColor-default)` | functional tokens absorb the light↔dark scale inversion; raw steps do not |

Source: https://primer.style/product/getting-started/foundations/color-usage/#neutral-colors

### token/border-contrast-minimum

Borders and dividers use neutral steps 7–8; step 8 is the minimum contrast for interactive control borders, measured against `--bgColor-muted`. The functional border tokens already encode this — `--borderColor-default` for surfaces, and avoid lighter steps for any border a user must perceive to operate a control.

**When it bites:** a too-light input border disappears against a muted form surface and the field reads as plain text.

| Bad | Good | Why |
|---|---|---|
| a step 5–6 neutral as a control border | `--borderColor-default` (step 7–8 class) | step 8 is the documented minimum for interactive control borders against `--bgColor-muted` |

Source: https://primer.style/product/getting-started/foundations/color-usage/#borders-and-dividers

### token/semantic-foreground-surface

Semantic foregrounds (`--fgColor-accent`, `--fgColor-success`, `--fgColor-danger`, `--fgColor-attention`) are tuned for muted/default surfaces — use them for text and icons on those surfaces. For emphasis treatments, switch to the role's emphasis background (`--bgColor-{role}-emphasis`) with `--fgColor-onEmphasis`, not the semantic foreground on an emphasis surface.

**When it bites:** `--fgColor-danger` text placed on `--bgColor-danger-emphasis` fails contrast — both are "danger" but one is a foreground-on-default token, the other an emphasis surface.

| Bad | Good | Why |
|---|---|---|
| `bg: --bgColor-danger-emphasis; color: --fgColor-danger` | `bg: --bgColor-danger-emphasis; color: --fgColor-onEmphasis` | semantic foregrounds target default/muted surfaces; emphasis surfaces require the on-emphasis foreground |

Source: https://primer.style/product/getting-started/foundations/color-usage/#semantic-foreground
