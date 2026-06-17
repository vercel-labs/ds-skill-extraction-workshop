# Foundation: Primitives

Source URL: https://primer.style/product/primitives/ (fetched 2026-06-12, HTTP 200)

## What this covers

- How Primer delivers design tokens as CSS variables — consumption syntax, color-mode data attributes, theme-file pairing, accessibility theme variants, and the base-vs-functional tier split.

Rules extracted: 5

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
