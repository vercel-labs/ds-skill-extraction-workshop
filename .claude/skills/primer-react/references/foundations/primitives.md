# Foundation: Primitives

Source URL: https://primer.style/product/primitives (fetched 2026-06-11, HTTP 200)

## What this covers

- Primer Primitives package — design tokens consumed as CSS variables, the base/functional split, and the three-attribute color-mode/theming contract.

### token/css-variable-consumption

Primer design tokens are consumed as CSS variables (`color: var(--fgColor-default)`); the legacy Primer React `theme` object resolves to the same CSS variables under the hood, so write `var(--X)` directly instead of going through the JS theme object — the new naming convention is not exposed as a JS object.

**When it bites:** styles written against the legacy `theme` object paths miss every token added under the CSS-variable naming convention; raw hex values bypass theming entirely and break in every non-default mode.

| Bad | Good | Why |
|---|---|---|
| `color: #1f2328` or `theme.colors.fg.default` | `color: var(--fgColor-default)` | hex ignores mode switching; the legacy JS object is a compatibility shim over the CSS variables |

Source: https://primer.style/product/primitives#css-variables
(grep-resolved: `--fgColor-default` in `node_modules/@primer/primitives/dist/css/functional/themes/light.css`)

### token/color-mode-auto

The color mode is selected by `data-color-mode` on `<body>` (or another high-level DOM element) with values `auto`, `light`, or `dark`; "When set to `auto`, the theme will automatically switch between light and dark based on the user's system preferences." The attribute only sets the resolution context — the matching theme CSS files must be imported (wiring lifted from the reference project; see Setup).

**When it bites:** a mode attribute without the matching theme `@import` leaves functional color tokens unresolved at paint time — the mode toggles but the values do not.

| Bad | Good | Why |
|---|---|---|
| `data-color-mode="auto"` with no theme CSS imported | `data-color-mode="auto"` + `@import .../functional/themes/light.css` + `dark.css` | the attribute selects which imported theme resolves; it does not load one |

Source: https://primer.style/product/primitives#color-mode

### token/theme-file-attribute-pairing

`data-light-theme` / `data-dark-theme` name which theme file resolves in each mode; the attribute value is the theme file name "replacing dashes `-` with underscore `_`" (e.g. the `dark-dimmed` file is selected by `data-dark-theme="dark_dimmed"`).

**When it bites:** a theme attribute value spelled with dashes (`dark-dimmed`) silently matches no theme file and the mode falls back to default values.

| Bad | Good | Why |
|---|---|---|
| `data-dark-theme="dark-dimmed"` | `data-dark-theme="dark_dimmed"` | attribute values use underscores; file names use dashes |

Source: https://primer.style/product/primitives#color-theme

### token/accessibility-theme-variants

Nine themes ship: `light`, `light_tritanopia`, `light_high_contrast`, `light_colorblind`, `dark`, `dark_colorblind`, `dark_dimmed`, `dark_high_contrast`, `dark_tritanopia` — the high-contrast/colorblind/tritanopia variants are the package's accessibility provision, and each resolves only if its theme CSS file is imported.

**When it bites:** declaring `data-dark-theme="dark_high_contrast"` without importing the high-contrast theme file renders the default dark values — the user asked for high contrast and silently did not get it.

| Bad | Good | Why |
|---|---|---|
| naming a theme variant whose CSS file is not imported | import every theme file the app's mode attributes can name | the attribute set and the import set must cover each other |

Source: https://primer.style/product/primitives#available-themes

### token/base-vs-functional

The package splits base primitives (`dist/css/base/size/size.css`, `dist/css/base/typography/typography.css`, base motion) from functional primitives (`dist/css/functional/` — border, breakpoints, radius, size, spacing, typography, motion, and `functional/themes/*` for color); color tokens live ONLY in the functional theme files, so importing base files alone yields no color variables.

**When it bites:** an app that imports only base primitives gets sizing/typography variables but every `var(--fgColor-*)` / `var(--bgColor-*)` is undefined — components paint with fallback or inherit values.

| Bad | Good | Why |
|---|---|---|
| `@import .../base/size/size.css` only | base + functional imports incl. `functional/themes/light.css` + `dark.css` | color is functional-only; base never defines `--bgColor-default` |

Source: https://primer.style/product/primitives#installation
(grep-resolved: `--base-size-16` in `dist/css/base/size/size.css`; `--bgColor-default` in `dist/css/functional/themes/*.css`)
