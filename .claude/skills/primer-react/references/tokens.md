# Tokens — primer-react

Primer tokens are consumed as CSS variables (`var(--bgColor-default)`). The 12 tokens listed below are the ones the produced exemplars (Setup + the 6 composition exemplars under `references/examples/`) actually reach for, with `TOKEN_COVERAGE=PASS` against the lifted Companion CSS (every defining file appears as an `@import` line in `app/globals.css`).

For prose foundation rules (mode-aware pairing, attribute/file naming, base-vs-functional layer), see the `### token/*` subsections at the bottom of this file (lifted from `references/foundations/primitives.md` per the foundation rule contract).

## Consumed token ledger (12 distinct)

All grep-resolved against `node_modules/@primer/primitives@11.9.0/dist/css/`.

| Token | Family | Defining file (light theme) | Use-when |
|---|---|---|---|
| `--bgColor-default` | color | `functional/themes/light.css` | the page surface (body / BaseStyles) and primary card surfaces |
| `--fgColor-default` | color | `functional/themes/light.css` | the default text color on `body` |
| `--fgColor-muted` | color | `functional/themes/light.css` | secondary text (helper text, "updated N hours ago", descriptions) |
| `--borderColor-default` | color | `functional/themes/light.css` | card borders, divider lines between sections |
| `--borderColor-muted` | color | `functional/themes/light.css` | subtler dividers, form-section separators |
| `--shadow-resting-small` | shadow | `functional/themes/light.css` | resting stat cards (dashboard) |
| `--shadow-resting-medium` | shadow | `functional/themes/light.css` | resting form cards (new) |
| `--base-size-16` | space | `base/size/size.css` | inner padding (home, dashboard cards); divider top spacing (new) |
| `--base-size-24` | space | `base/size/size.css` | inner padding (new form card) |
| `--base-size-32` | space | `base/size/size.css` | top padding for empty-state surfaces |
| `--borderRadius-medium` | radius | `functional/size/radius.css` | card corners (home) |
| `--borderRadius-large` | radius | `functional/size/radius.css` | card corners (new, dashboard) |

## Token usage rules

| Bad | Good | Why |
|---|---|---|
| `background-color: #ffffff` | `background-color: var(--bgColor-default)` | raw hex ignores mode-switching; `--bgColor-default` flips between light.css and dark.css |
| `background-color: var(--base-color-gray-1)` | `background-color: var(--bgColor-default)` | base tokens are mode-invariant; functional tokens flip with theme |
| `color: theme.colors.fg.default` (legacy JS theme object) | `color: var(--fgColor-default)` | the legacy JS theme is a compat shim; new tokens are CSS-variable only |
| Card padding hard-coded as `padding: 16px` | `padding: var(--base-size-16, 1rem)` | inline fallback (`, 1rem`) keeps the surface painting when primitives CSS is missing |

## Color, space, type, radius — at a glance

- **Functional COLOR tokens** (mode-aware, defined per-theme): `--bgColor-default`, `--fgColor-default`, `--fgColor-muted`, `--borderColor-default`, `--borderColor-muted`. Defined in `functional/themes/light.css` AND `functional/themes/dark.css` with different values per mode.
- **Functional SHADOW tokens**: `--shadow-resting-small`, `--shadow-resting-medium`. Mode-aware; defined per theme.
- **Base SIZE tokens** (mode-invariant): `--base-size-16`, `--base-size-24`, `--base-size-32`. Defined in `base/size/size.css`. Exemplars use inline fallbacks (`var(--base-size-16, 1rem)`) so the layout still works when primitives imports are missing.
- **Functional RADIUS tokens**: `--borderRadius-medium`, `--borderRadius-large`. Defined in `functional/size/radius.css`. Exemplars use inline fallbacks (`var(--borderRadius-medium, 8px)`).
- **Functional TYPE** is not consumed by name in the produced exemplars — text styling rides on `<Heading variant>` and `<Text size weight>`. The typography token CSS files (`base/typography/typography.css`, `functional/typography/typography.css`) are still imported in `globals.css` so the underlying scales resolve.
- **Fallback discipline**: exemplars pass inline fallbacks for size/radius tokens (`var(--base-size-16, 1rem)`) but NOT for color tokens — color must come from the theme or not at all; a hex fallback would mask a broken theme import.

## Foundation rules (extracted from primer.style)

The five subsections below carry the prose rules from `https://primer.style/product/primitives/`. Lifted verbatim from `references/foundations/primitives.md` per the foundation rule contract (cross-file duplication is intentional — the trap is reachable from both files). See `references/foundations/primitives.md` for the per-URL source page (`What this covers`, citations).

### token/css-variable-consumption

Consume Primer tokens as CSS variables (`color: var(--fgColor-default)`), not via the legacy Primer React `theme` object — the legacy variables "all resolve to CSS variables under the hood" and the new naming scheme has no JS object equivalent; the docs recommend "switch to using CSS variables directly (recommended)". Reaching for the JS theme object produces names the current naming scheme no longer extends.

**When it bites:** styles written against the legacy JS theme object miss every token added under the new naming scheme; mixed consumption styles drift between components.

| Bad | Good | Why |
|---|---|---|
| `theme.colors.fg.default` (JS theme object) | `var(--fgColor-default)` | new-scheme tokens exist only as CSS variables; the JS object is legacy-resolution only |

`--fgColor-default` grep-resolves in `node_modules/@primer/primitives/dist/css/functional/themes/light.css` (and every other theme file).

Source: https://primer.style/product/primitives/#css-variables

### token/color-mode-auto

Set `data-color-mode` to `auto`, `light`, or `dark` on `<body>` "or other high level dom element"; with `auto` the theme follows the user's system preferences. The reference wiring sets it on `<html>` (lifted via the reference project, not from this prose).

**When it bites:** hardcoding `data-color-mode="light"` pins every user to light mode regardless of OS preference; omitting the attribute entirely leaves functional color tokens unresolved.

| Bad | Good | Why |
|---|---|---|
| no `data-color-mode` attribute | `data-color-mode="auto"` | without the attribute the theme selectors never match and functional color tokens don't resolve |

Source: https://primer.style/product/primitives/#color-mode

### token/theme-file-attribute-pairing

Theme attribute values use the theme file name with dashes converted to underscores: `data-light-theme="light_high_contrast"` pairs with the import of `functional/themes/light-high-contrast.css`. Declaring a theme attribute without importing the matching theme CSS file leaves that mode's tokens at fallback values.

**When it bites:** the mode attribute switches but the values do not — the page claims `light_high_contrast` while rendering default-light colors.

| Bad | Good | Why |
|---|---|---|
| `data-dark-theme="dark"` with only `light.css` imported | `data-dark-theme="dark"` + `@import "@primer/primitives/dist/css/functional/themes/dark.css"` | the attribute selects the resolution context; the import supplies the values |

Both `light.css` and `dark.css` grep-resolve in `node_modules/@primer/primitives/dist/css/functional/themes/`.

Source: https://primer.style/product/primitives/#color-theme

### token/accessibility-theme-variants

Primer ships accessibility theme variants per mode family — light: `light`, `light_tritanopia`, `light_high_contrast`, `light_colorblind`; dark: `dark`, `dark_colorblind`, `dark_dimmed`, `dark_high_contrast`, `dark_tritanopia`. These are first-class theme values for `data-light-theme`/`data-dark-theme`, not separate stylesheets to hand-roll.

**When it bites:** re-implementing a high-contrast mode with custom CSS overrides instead of pointing the theme attribute at the shipped variant produces drift from the maintained palette.

| Bad | Good | Why |
|---|---|---|
| custom `filter: contrast(1.5)` override | `data-light-theme="light_high_contrast"` | the shipped variant file is a maintained, token-complete palette |

All nine variant files grep-resolve under `node_modules/@primer/primitives/dist/css/functional/themes/` (dash-named on disk: e.g. `light-high-contrast.css`, `dark-dimmed.css`).

Source: https://primer.style/product/primitives/#available-themes

### token/base-vs-functional

Primer primitives are two-tier: base tokens (`dist/css/base/{size,typography,motion}/`) are raw scales; functional tokens (`dist/css/functional/{size,spacing,typography,motion,themes}/`) are role-named and mode-aware. Consume functional tokens in product code; base tokens exist to define the functional layer.

**When it bites:** styling against base scale steps skips the semantic layer — values stop tracking role changes (e.g. a density pass re-mapping functional spacing) and color never tracks mode at all.

| Bad | Good | Why |
|---|---|---|
| raw base step for a border radius | `var(--borderRadius-medium)` (functional) | functional names carry role + mode awareness; base steps are scale plumbing |

Both tiers grep-resolve as directories: `node_modules/@primer/primitives/dist/css/base/` and `node_modules/@primer/primitives/dist/css/functional/`.

Source: https://primer.style/product/primitives/#usage
