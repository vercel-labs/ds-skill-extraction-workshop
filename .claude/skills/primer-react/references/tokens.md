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

## Foundation rules (extracted from primer.style)

The five subsections below carry the prose rules from `https://primer.style/product/primitives/`. Lifted verbatim from `references/foundations/primitives.md` per the foundation rule contract. See `references/foundations/primitives.md` for the full per-URL source page (`What this covers`, citations).

### token/css-variable-consumption

Primer design tokens are consumed as CSS variables (`color: var(--fgColor-default)`); the legacy Primer React `theme` object resolves to the same CSS variables under the hood, so write `var(--X)` directly instead of going through the JS theme object — the new naming convention is not exposed as a JS object.

**When it bites:** styles written against the legacy `theme` object paths miss every token added under the CSS-variable naming convention; raw hex values bypass theming entirely and break in every non-default mode.

| Bad | Good | Why |
|---|---|---|
| `color: #1f2328` or `theme.colors.fg.default` | `color: var(--fgColor-default)` | hex ignores mode switching; the legacy JS object is a compatibility shim over the CSS variables |

Source: https://primer.style/product/primitives/#css-variables
(grep-resolved: `--fgColor-default` in `node_modules/@primer/primitives/dist/css/functional/themes/light.css`)

### token/color-mode-auto

The color mode is selected by `data-color-mode` on `<body>` (or another high-level DOM element) with values `auto`, `light`, or `dark`; "When set to `auto`, the theme will automatically switch between light and dark based on the user's system preferences." The attribute only sets the resolution context — the matching theme CSS files must be imported (wiring lifted from the reference project; see Setup).

**When it bites:** a mode attribute without the matching theme `@import` leaves functional color tokens unresolved at paint time — the mode toggles but the values do not.

| Bad | Good | Why |
|---|---|---|
| `data-color-mode="auto"` with no theme CSS imported | `data-color-mode="auto"` + `@import .../functional/themes/light.css` + `dark.css` | the attribute selects which imported theme resolves; it does not load one |

Source: https://primer.style/product/primitives/#color-mode

### token/theme-file-attribute-pairing

`data-light-theme` / `data-dark-theme` name which theme file resolves in each mode; the attribute value is the theme file name "replacing dashes `-` with underscore `_`" (e.g. the `dark-dimmed` file is selected by `data-dark-theme="dark_dimmed"`).

**When it bites:** a theme attribute value spelled with dashes (`dark-dimmed`) silently matches no theme file and the mode falls back to default values.

| Bad | Good | Why |
|---|---|---|
| `data-dark-theme="dark-dimmed"` | `data-dark-theme="dark_dimmed"` | attribute values use underscores; file names use dashes |

Source: https://primer.style/product/primitives/#color-theme

### token/accessibility-theme-variants

Nine themes ship: `light`, `light_tritanopia`, `light_high_contrast`, `light_colorblind`, `dark`, `dark_colorblind`, `dark_dimmed`, `dark_high_contrast`, `dark_tritanopia` — the high-contrast/colorblind/tritanopia variants are the package's accessibility provision, and each resolves only if its theme CSS file is imported.

**When it bites:** declaring `data-dark-theme="dark_high_contrast"` without importing the high-contrast theme file renders the default dark values — the user asked for high contrast and silently did not get it.

| Bad | Good | Why |
|---|---|---|
| `data-dark-theme="dark_high_contrast"` with only `dark.css` imported | import the matching `dark-high-contrast.css` from `@primer/primitives/dist/css/functional/themes/` | each accessibility theme is a separate CSS file; declaring it does not load it |

Source: https://primer.style/product/primitives/#available-themes
(grep-resolved: `dark-high-contrast.css`, `light-colorblind.css`, `dark-tritanopia.css` all present in `node_modules/@primer/primitives/dist/css/functional/themes/`)

### token/base-vs-functional

Primer Primitives ships two layers: **base** (raw primitives — `--base-size-*`, `--base-color-blue-*`) and **functional** (semantic tokens that re-export base values per theme — `--bgColor-default`, `--fgColor-muted`, `--shadow-resting-medium`). Compose UI against functional tokens; reach for base only when no functional token covers the use case (rare).

**When it bites:** building a card surface with `--base-color-gray-1` instead of `--bgColor-default` produces a surface that does not respond to dark mode — base color tokens are mode-invariant by design; only functional tokens flip per theme.

| Bad | Good | Why |
|---|---|---|
| `background-color: var(--base-color-gray-1)` | `background-color: var(--bgColor-default)` | base values are mode-invariant; functional tokens are the layer that flips |

Source: https://primer.style/product/primitives/#usage
(grep-resolved: `--bgColor-default` appears in `functional/themes/light.css` AND `functional/themes/dark.css` with different values; `--base-color-gray-1` appears only in `base/color/...` once)
