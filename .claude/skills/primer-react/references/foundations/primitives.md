# Foundation: Primitives

Source URL: https://primer.style/product/primitives/ (fetched 2026-06-11, HTTP 200)

## What this covers

- Primer Primitives package — design tokens consumed as CSS variables, the available-themes ledger, and the three-attribute color-mode/theming contract (`data-color-mode`, `data-light-theme`, `data-dark-theme`).

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
