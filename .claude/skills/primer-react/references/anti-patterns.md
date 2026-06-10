# Anti-patterns — primer-react

Two layers. Component-local traps live inline in each `references/components/<name>.md` under `## Best Practices` (Layer A). Cross-cutting token-discipline and shell-wiring traps collapse into the columnar table below (Layer B).

## Layer A — component-local (inline)

The shape: a `Never X — <why>.` bullet under `## Best Practices` in the component file, with a `file:line` citation and a `component/<slug>`. Real instances live in the component files; examples:

- `Never use inactive to express a busy submit state — screen readers still announce the button as actionable.` (`references/components/button.md`, `component/button-inactive-vs-disabled`)
- `Never render a TextInput outside a FormControl with a FormControl.Label — label association breaks, axe fails.` (`references/components/textinput.md`, `component/input-requires-formcontrol`)
- `Never substitute experimental Banner for a simple inline note — Flash is the right choice here.` (`references/components/flash.md`, `component/flash-not-banner`)

## Layer B — cross-cutting Bad / Good / Why

Token-discipline rows first (color, space, type, radius, shadow), then shell-wiring rows. Code-fence the Bad/Good cells; the Why is one clause.

| Bad | Good | Why |
|---|---|---|
| `color: #1f2328` | `color: var(--fgColor-default)` | hex literal bypasses theming; switches break in dark mode |
| `background: #ffffff` | `background: var(--bgColor-default)` | hex literal bypasses theming; switches break in dark mode |
| `var(--color-scale-gray-1)` | `var(--bgColor-default)` | base scale tokens ignore color mode; functional tokens re-resolve per theme |
| `padding: 16px` | `padding: var(--base-size-16)` | off-grid spacing breaks vertical rhythm |
| `margin: 6px` on children | `gap="condensed"` on the `Stack` | named gaps keep spacing on the grid |
| `font-weight: 700` | `font-weight: var(--text-title-weight)` | ad-hoc weight escapes the type scale |
| `border-radius: 6px` | `border-radius: var(--borderRadius-medium)` | off-scale radius forks from the DS radius scale |
| `box-shadow: 0 1px 2px #0001` | `box-shadow: var(--shadow-resting-small)` | ad-hoc shadow breaks elevation coherence |

### Shell wiring rows (promoted from Phase 2 shell-invariant extraction)

| Bad | Good | Why | Slug |
|---|---|---|---|
| `@import "@primer/primitives/.../themes/light.css";` alone in `globals.css` (no body paint) | same imports + `body { background-color: var(--bgColor-default); color: var(--fgColor-default); }` | token-painted components float on the browser-default surface because nothing paints the shell — the canonical "card painted, body unpainted" mode-mismatch bug | `shell/unpainted-body` |
| `<html data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">` with only `themes/light.css` imported | import both `themes/light.css` and `themes/dark.css` alongside the attributes | the mode attributes set the token-resolution context, but unimported theme files leave functional tokens (`var(--bgColor-default)`) at their fallback values | `shell/mode-attribute-no-theme-import` |
| `<ThemeProvider />` rendered as a sibling of `{children}` | `<ThemeProvider><BaseStyles>{children}</BaseStyles></ThemeProvider>` | provider context only reaches descendants, so a sibling provider gives every component the DS default theme regardless of the configured mode | `shell/provider-missing-content-wrap` |

Each shell slug is also stated as a Hard rule in `SKILL.md` (`## Hard rules`) and re-confirmed in `## Final checks` — re-check all three after any edit to the root layout, providers, or `globals.css`.
