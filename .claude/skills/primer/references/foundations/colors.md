# Foundation: color-usage

## What this covers

- Primer's three-tier color token system (base → functional → component- and pattern-level), surface/foreground pairing rules, mode-aware token swaps, and contrast minimums against `--bgColor-muted`.

Source URL fetched: https://primer.style/foundations/color/overview (the path `/product/getting-started/foundations/color-usage` from Phase 1 redirects here on the current docs site).

### token/emphasis-onEmphasis-pairing

Pair `--bgColor-{role}-emphasis` surfaces with `--fgColor-onEmphasis` for text and icons; using a semantic `--fgColor-{role}` on an emphasis background breaks the intended contrast pairing.

**When it bites:** A primary button painted with `--bgColor-accent-emphasis` and text in `--fgColor-accent` reads with washed-out, low-contrast text — the semantic accent foreground is tuned for muted/default surfaces, not for the saturated emphasis surface.

| Bad | Good | Why |
|---|---|---|
| `color: var(--fgColor-accent)` on `--bgColor-accent-emphasis` | `color: var(--fgColor-onEmphasis)` on `--bgColor-accent-emphasis` | The on-emphasis foreground is the only foreground tuned for emphasis surfaces; semantic foregrounds are tuned for default/muted surfaces. |

Source: https://primer.style/foundations/color/overview#emphasis

### token/muted-semantic-pairing

Pair `--bgColor-{role}-muted` and `--bgColor-default` surfaces with `--fgColor-{role}` for text and icons; semantic foregrounds are tuned for these surfaces, not for emphasis surfaces.

**When it bites:** A success Flash painted with `--bgColor-success-muted` and `--fgColor-onEmphasis` text reads as washed-out white on pale green — the on-emphasis foreground assumes a saturated background.

| Bad | Good | Why |
|---|---|---|
| `color: var(--fgColor-onEmphasis)` on `--bgColor-success-muted` | `color: var(--fgColor-success)` on `--bgColor-success-muted` | Semantic foregrounds (success, accent, attention, danger) are contrast-tuned against muted + default surfaces; on-emphasis fails contrast on muted surfaces. |

Source: https://primer.style/foundations/color/overview#semantic-foreground

### token/default-mode-aware

Functional tokens auto-swap by mode; do not hardcode hex values or base scale tokens. Light and dark neutral scales are inverted so functional tokens share names across modes.

**When it bites:** A card painted with `#ffffff` reads correctly in light mode and white-on-black-bug in dark mode; reading the value of `--bgColor-default` is what makes the surface mode-aware via the `data-color-mode` / `data-light-theme` / `data-dark-theme` cascade on `<html>`.

| Bad | Good | Why |
|---|---|---|
| `background-color: #ffffff` | `background-color: var(--bgColor-default)` | Functional tokens read the data-*-theme cascade; raw hex never swaps and breaks dark mode. |
| `background-color: var(--color-scale-gray-0)` | `background-color: var(--bgColor-default)` | Base scale tokens are mode-blind — Primer states they "should never be used directly in code or design." |

Source: https://primer.style/foundations/color/overview#design-token-categories

### token/text-icon-contrast-minimum

All Primer text and border contrast values are calculated against `--bgColor-muted`, not `--bgColor-default`, to guarantee the ratio holds on both surfaces. Interactive control borders require neutral step 8 minimum; text on neutral steps 0–4 requires step 9 minimum; text on steps 5–6 requires step 10 minimum.

**When it bites:** A border painted at step 6 against `--bgColor-muted` disappears; muted body text against `--bgColor-emphasis` fails axe.

| Bad | Good | Why |
|---|---|---|
| `border-color: var(--borderColor-muted)` for an interactive control on `--bgColor-muted` | `border-color: var(--borderColor-default)` for an interactive control on `--bgColor-muted` | Interactive borders need step 8 minimum against `bgColor-muted`; step 7 (muted) disappears on the muted surface. |

Source: https://primer.style/foundations/color/overview#adjusting-contrast

### token/role-semantic-foreground

Use `--fgColor-{accent,success,attention,danger,open,closed,done,sponsors}` to mark semantic role (links, success states, warnings, errors, lifecycle states). Pair with the matching `--bgColor-{role}-muted` or `--bgColor-default`; switch to `--fgColor-onEmphasis` when the surface is `--bgColor-{role}-emphasis`.

**When it bites:** A danger button labelled in `--fgColor-danger` against `--bgColor-danger-emphasis` reads as red-on-red.

| Bad | Good | Why |
|---|---|---|
| `<Button variant="danger">` text painted with `--fgColor-danger` | `<Button variant="danger">` text painted with `--fgColor-onEmphasis` | Variant=danger sets the surface to `--bgColor-danger-emphasis`; only the on-emphasis foreground meets contrast on that surface. |

Source: https://primer.style/foundations/color/overview#color-roles
