# Anti-patterns — primer-react

Cross-cutting Bad/Good/Why rows. Component-local traps live inline in each `references/components/<name>.md` under `## Best Practices`; token prose rules live as `### token/<slug>` subsections in `references/foundations/primitives.md`; this file carries the cross-cutting table and the shell rows.

## Token discipline

| Bad | Good | Why |
|---|---|---|
| `color: #1f2328` | `color: var(--fgColor-default)` | Hex literal bypasses theming; switches break in dark mode. (token/hex-literal) |
| `background: #ffffff` | `background: var(--bgColor-default)` | Hex literal bypasses theming; switches break in dark mode. (token/hex-literal) |
| `padding: 13px` | `padding: var(--base-size-16)` | Off-grid spacing breaks vertical rhythm. (token/ad-hoc-spacing) |
| `border-radius: 7px` | `border-radius: var(--borderRadius-medium)` | Ad-hoc radius escapes the shape scale. (token/ad-hoc-radius) |
| `box-shadow: 0 1px 3px rgba(0,0,0,.12)` | `box-shadow: var(--shadow-resting-small)` | Ad-hoc shadow escapes the elevation scale and ignores mode switching. (token/ad-hoc-shadow) |

## Shell wiring

| Bad | Good | Why |
|---|---|---|
| `globals.css` with token imports but no body rule | same imports + `body { background-color: var(--bgColor-default); color: var(--fgColor-default); }` (and/or the `<BaseStyles style={{ backgroundColor: "var(--bgColor-default)" }}>` prop in the root layout) | Token-painted components float on the browser-default surface because nothing paints the shell. (shell/unpainted-body) |
| `<html data-color-mode="auto" data-dark-theme="dark">` with only `functional/themes/light.css` imported | import every theme the attributes can name: `@import ".../functional/themes/light.css"; @import ".../functional/themes/dark.css";` | The mode attribute sets the token-resolution context but unimported theme files leave functional tokens (e.g. `var(--bgColor-default)`) at fallback values — the mode toggles, the values do not. (shell/mode-attribute-no-theme-import) |
| `<ThemeProvider colorMode="auto" />` rendered as a sibling of `{children}` | `<ThemeProvider colorMode="auto"><BaseStyles style={{ backgroundColor: "var(--bgColor-default)" }}>{children}</BaseStyles></ThemeProvider>` | Provider context only reaches descendants; a sibling provider gives every descendant the Primer default theme, and without BaseStyles the base typography/color resets never apply. (shell/provider-missing-content-wrap) |

Lifted from: vercel-labs/primer-nextjs-template @ app/layout.tsx (provider mount, mode attributes, BaseStyles paint) + app/globals.css (theme imports, body rule). See SKILL.md `## Hard rules` for the MUST-rule phrasing of each row.

## Asset rules (pointer)

The octicons anti-patterns are defined as rule subsections in `references/foundations/octicons.md`:

- `asset/octicon-size-buckets` — pick the size bucket the catalog ships; never scale a 16px icon up.
- `asset/octicon-name-size-suffix` — derive React exports from the catalog naming convention; verify against `node_modules/@primer/octicons-react/dist/icons.d.ts`, never guess.

See also `references/assets.md` for the consumed-icon inventory contract (asset/raw-svg-instead-of-icon: never inline a raw `<svg>` when an octicon export exists).
