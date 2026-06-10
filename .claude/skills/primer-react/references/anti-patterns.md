# Anti-patterns — primer-react

Cross-cutting token-discipline and shell-wiring traps. Component-local traps live inline in `references/components.md` under each component's Best Practices. Slugs are greppable identifiers — a finding cites `token/hex-literal fired at <file>:<line>`.

## Token discipline (Bad / Good / Why)

| Bad | Good | Why |
|---|---|---|
| `color: #1f2328` | `color: var(--fgColor-default)` | Hex literal bypasses theming; switches break in dark mode. (`token/hex-literal`) |
| `background: #ffffff` | `background-color: var(--bgColor-default)` | Hex literal bypasses theming; switches break in dark mode. (`token/hex-literal`) |
| `padding: 13px` | `padding: var(--base-size-16, 1rem)` | Off-grid spacing breaks vertical rhythm. (`token/ad-hoc-spacing`) |
| `font-size: 15px` | `font: var(--text-body-shorthand-medium)` | Ad-hoc size escapes the type scale. (`token/ad-hoc-font-size`) |
| `box-shadow: 0 2px 5px rgba(0,0,0,.2)` | `box-shadow: var(--shadow-resting-medium)` | Ad-hoc shadow escapes the elevation scale. (`token/ad-hoc-shadow`) |

No motion row: the extraction surfaced no motion-token consumption in the proposing set; per the omission rule, a row whose Good cell cannot cite a verified token is dropped, not invented.

## Shell wiring (Bad / Good / Why)

Promoted from the reference-project wiring lift (`vercel-labs/primer-nextjs-template @ app/layout.tsx` + `app/globals.css`). Each row is also a Hard Rule in `SKILL.md`.

| Bad | Good | Why |
|---|---|---|
| Theme imports in `globals.css` with no body rule and no `BaseStyles` style prop | `body { background-color: var(--bgColor-default); color: var(--fgColor-default); }` AND `<BaseStyles style={{ backgroundColor: "var(--bgColor-default)", height: "100vh" }}>` | Token-painted components float on the browser-default surface because nothing paints the shell — "card painted, body unpainted", most visible in dark mode. (`shell/unpainted-body`) |
| `<html data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">` with theme CSS files not imported | `@import "@primer/primitives/dist/css/functional/themes/light.css";` + `@import "@primer/primitives/dist/css/functional/themes/dark.css";` alongside the attributes | The mode attribute sets the token-resolution context but unimported theme files leave functional tokens at their fallback values — the mode toggles, the colors do not. (`shell/mode-attr-without-theme-import`) |
| Theme CSS imported but no `data-*` mode attributes on `<html>` | `data-color-mode="auto" data-light-theme="light" data-dark-theme="dark"` on `<html>`, with `ThemeProvider colorMode="auto"` agreeing | The theme files load but the resolution context never switches; the default mode renders regardless of OS preference — `prefers-color-scheme` ignored, violating `token/user-preference-modes`. (`shell/theme-import-without-mode-attr`) |
| `<ThemeProvider colorMode="auto" />` rendered as a sibling of `{children}` | `<ThemeProvider colorMode="auto"><BaseStyles>{children}</BaseStyles></ThemeProvider>` | Provider context only reaches descendants; a sibling provider gives every descendant the Primer default theme regardless of the configured color mode. (`shell/provider-not-wrapping`) |
| `<BaseStyles />` self-closed next to page content | `<BaseStyles style={{ backgroundColor: "var(--bgColor-default)", height: "100vh" }}>{children}</BaseStyles>` | Content outside BaseStyles renders without Primer's base text/color resets; typography and foreground defaults silently fall back to browser styles. (`shell/basestyles-missing-children`) |
