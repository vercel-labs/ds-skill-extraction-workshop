# Foundations: Color usage

## What this covers

- Functional color-token hierarchy, mode-aware token resolution, neutral-scale contrast steps, and semantic role/emphasis pairing rules for Primer.

### token/functional-over-base

Use functional tokens (`--bgColor-default`, `--fgColor-default`, `--borderColor-*`) in code, never base scale tokens (`color-scale-pink-5` and friends) — base tokens "don't respect color modes and must never appear directly in code or design".

**When it bites:** a base-scale color hardcoded into a component stays fixed when the user switches to dark mode; everything around it inverts and the element reads as a stuck patch of the wrong palette.

| Bad | Good | Why |
|---|---|---|
| `color: var(--color-scale-pink-5)` | `color: var(--fgColor-default)` | base tokens do not respond to `data-color-mode`; functional tokens resolve per mode |

Source: https://primer.style/product/getting-started/foundations/color-usage#design-token-categories

### token/mode-aware-resolution

Functional tokens like `--bgColor-default` and `--fgColor-default` resolve to different values per color mode — "the value of that token will automatically change depending on the color mode". Never hardcode a hex for either mode; the light and dark neutral scales run in inverted directions so both modes share the same functional token names. Mode is selected by the `data-color-mode` / `data-light-theme` / `data-dark-theme` attributes on `<html>` (wiring lifted from the reference project, not from this rule).

**When it bites:** a hex value tuned for light mode renders unreadable on the dark surface the moment `data-color-mode` flips; the token would have flipped with it.

| Bad | Good | Why |
|---|---|---|
| `background-color: #ffffff` | `background-color: var(--bgColor-default)` | hex breaks one of the two modes; the token resolves per `data-*` mode |

Source: https://primer.style/product/getting-started/foundations/color-usage#color-design-tokens

### token/neutral-scale-contrast-minimum

Neutral-scale roles are band-limited: steps 0–6 are backgrounds (most common: `--bgColor-default`, `--bgColor-muted`), steps 7–8 are borders — step 8 is "the minimum contrast value for interactive control borders against `bgColor-muted`" — and steps 9–10 are text/icons (step 9 is minimum text contrast against backgrounds 0–4, step 10 against 5–6). All text/border contrast is computed against `--bgColor-muted` so it also passes on `--bgColor-default`.

**When it bites:** a border drawn with a background-band step disappears against `--bgColor-muted`; text drawn below step 9 reads washed-out and fails contrast checks.

| Bad | Good | Why |
|---|---|---|
| border from a step 0–6 neutral | `border-color: var(--borderColor-default)` | border tokens map to steps 7–8, the minimum visible against muted backgrounds |

Source: https://primer.style/product/getting-started/foundations/color-usage#adjusting-contrast

### token/emphasis-foreground-pairing

Emphasis backgrounds (`--bgColor-{role}-emphasis`, e.g. `--bgColor-danger-emphasis`) are "always combined with `fgColor-onEmphasis` tokens for text and icons". Pairing an emphasis background with `--fgColor-default` or the role's own `--fgColor-{role}` fails contrast — those foregrounds are tuned for default/muted surfaces.

**When it bites:** danger-button text set with `--fgColor-danger` on `--bgColor-danger-emphasis` renders red-on-red and fails contrast in both modes.

| Bad | Good | Why |
|---|---|---|
| `var(--fgColor-danger)` on `var(--bgColor-danger-emphasis)` | `var(--fgColor-onEmphasis)` on `var(--bgColor-danger-emphasis)` | onEmphasis is the only foreground tuned for emphasis surfaces |

Source: https://primer.style/product/getting-started/foundations/color-usage#emphasis

### token/semantic-foreground-surface

Semantic foreground tokens (`--fgColor-accent`, `--fgColor-success`, `--fgColor-attention`, `--fgColor-danger`, `--fgColor-open`, `--fgColor-closed`, `--fgColor-done`, `--fgColor-sponsors`) are for text/icons against muted and default backgrounds only — not against emphasis surfaces (use `--fgColor-onEmphasis` there, per the pairing rule above). For subtle emphasis, pair the role's muted background with its muted border (`--bgColor-{role}-muted` + `--borderColor-{role}-muted`).

**When it bites:** a status label using `--fgColor-success` on `--bgColor-success-emphasis` fails 3:1; the same foreground on `--bgColor-success-muted` is the intended pairing.

| Bad | Good | Why |
|---|---|---|
| `var(--fgColor-accent)` on an emphasis surface | `var(--fgColor-accent)` on `var(--bgColor-default)` or `var(--bgColor-accent-muted)` | semantic foregrounds are tuned for default/muted surfaces only |

Source: https://primer.style/product/getting-started/foundations/color-usage#semantic-foreground

### token/role-selection

Pick the semantic role by meaning, not by hue: `accent` for links and selected/active/focus states and neutral info; `success` for primary buttons and positive states; `attention` for warnings and in-progress; `danger` for destructive buttons and errors; `open`/`closed`/`done` for task/PR/workflow lifecycle states; `sponsors` only for GitHub Sponsors text and icons.

**When it bites:** a primary CTA painted with `accent` instead of `success` (or a warning painted `danger`) breaks the product-wide color grammar users rely on to scan state.

| Bad | Good | Why |
|---|---|---|
| `var(--bgColor-accent-emphasis)` for a primary submit button | `var(--bgColor-success-emphasis)` (what `Button variant="primary"` uses) | success is the primary-button role; accent is selection/links |

Source: https://primer.style/product/getting-started/foundations/color-usage#color-roles
