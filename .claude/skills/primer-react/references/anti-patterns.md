# Anti-patterns — primer-react

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting — route copy rules to a sibling skill.

## Layer B — token-discipline + shell-invariant Bad/Good/Why

Token-discipline violations (literal value vs named token) and shell-wiring invariants. Code-fence the Bad and Good cells; the Why is one clause.

| Bad | Good | Why |
|---|---|---|
| `color: #1f2328` | `color: var(--fgColor-default)` | hex literal bypasses theming; switches break in dark mode (`token/hex-literal`) |
| `background: #ffffff` | `background: var(--bgColor-default)` | hex literal bypasses theming; the neutral scale inverts between modes (`token/hex-literal`) |
| `padding: 15px` | `padding: var(--base-size-16)` | off-grid spacing breaks vertical rhythm (`token/ad-hoc-spacing`) |
| `font-size: 14px` | `font: var(--text-body-shorthand-medium)` | ad-hoc size escapes the type scale and drops the grid-aligned line-height (`token/ad-hoc-font-size`) |
| `@import "@primer/primitives/dist/css/functional/themes/light.css";` alone in `globals.css` (no body paint) | same line + `body { background-color: var(--bgColor-default); color: var(--fgColor-default); }` | token-painted components float on the browser-default white surface because nothing paints the shell (`shell/unpainted-body`) |
| `<html data-color-mode="auto">` with only `light.css` imported | the attribute trio + `@import ".../themes/light.css"` AND `dark.css` so `var(--bgColor-default)` resolves per mode | the mode attribute sets the resolution context but the unimported theme leaves functional tokens at fallback values (`shell/mode-attribute-no-theme-import`) |
| `<ThemeProvider />` rendered as a sibling of `{children}` | `<ThemeProvider><BaseStyles>{children}</BaseStyles></ThemeProvider>` | provider context only reaches descendants; a sibling provider gives every component the default theme (`shell/provider-missing-content-wrap`) |

## Layer A — component-local slug registry

Each component rule fires inside its `references/components.md` section. The slugs are registered here so findings resolve.

- `component/button-variant-enum` — Never pass a Button `variant` outside `'default' | 'primary' | 'invisible' | 'danger' | 'link'` — the type rejects it. (Button/types.d.ts:4)
- `component/button-visual-component-ref` — Pass `leadingVisual` / `trailingVisual` an icon component reference (`leadingVisual={PlusIcon}`), not an inline element. (Button/types.d.ts:58)
- `component/iconbutton-requires-aria-label` — Never render an icon-only `IconButton` without `aria-label` — axe fails and the control is unnamed. (Button/types.d.ts:71)
- `component/textinput-requires-formcontrol` — Never render a `TextInput` outside a `FormControl` — label association breaks, axe fails. (FormControl/FormControl.d.ts:28)
- `component/textinput-visual-component-ref` — Pass `TextInput` `leadingVisual` an icon component reference, not an inline element. (TextInput/TextInput.d.ts:22)
- `component/formcontrol-required-on-wrapper` — Set `required` on the `FormControl`, not the inner input. (FormControl/FormControl.d.ts:16)
- `component/formcontrol-checkbox-first-child` — Render `<Checkbox />` as the first child of `FormControl`, before `FormControl.Label`. (FormControl/FormControl.d.ts:28)
- `component/pageheader-slots` — Place the page action in `PageHeader.Actions`, not floated above the content. (PageHeader/PageHeader.d.ts:45)

## Asset discipline

- `asset/raw-svg-instead-of-icon` — Never inline a raw `<svg>` path when an Octicon exists; import the component (`<RepoIcon size={16} />`) so it carries the size enum and inherits `currentColor`. See [icons](./foundations/icons.md).
