## Anti-patterns — Bad / Good / Why

Token-discipline violations that span all components. Use semantic tokens from `@primer/primitives` instead of raw values.

| Bad | Good | Why |
|---|---|---|
| `color: #1f2328` | `color: var(--fgColor-default)` | Hex literal bypasses theming; switches break in dark mode. |
| `color: #d1242f` | `color: var(--fgColor-danger)` | Hex literal bypasses theming; switches break in dark mode. |
| `background: #ffffff` | `background: var(--bgColor-default)` | Hex literal bypasses theming; switches break in dark mode. |
| `background: #f6f8fa` | `background: var(--bgColor-muted)` | Hex literal bypasses theming; switches break in dark mode. |
| `padding: 13px` | `padding: var(--space-md)` | Off-grid spacing breaks vertical rhythm. |
| `margin: 7px` | `margin: var(--space-xs)` | Off-grid spacing breaks vertical rhythm. |
| `font-size: 15px` | `font: var(--text-body-shorthand-medium)` | Ad-hoc size escapes the type scale. |
| `transition: 200ms ease` | `transition: var(--motion-transition-hover)` | Ad-hoc duration breaks motion coherence. |

### Slug registry

- `token/hex-literal` — raw hex color instead of semantic color token
- `token/ad-hoc-spacing` — raw px spacing instead of `--space-*` token
- `token/ad-hoc-font-size` — raw px font size instead of `--text-*` shorthand
- `token/ad-hoc-duration` — raw ms duration instead of `--motion-*` token
- `component/button-inactive-vs-disabled` — using `inactive` when `disabled` is intended
- `component/button-no-aria-label-with-text` — passing `aria-label` to a Button with visible text
- `component/button-loading-not-spinner` — swapping children for a spinner instead of using `loading` prop
- `component/formcontrol-bare-input` — rendering an input outside FormControl
- `component/iconbutton-missing-aria-label` — IconButton without `aria-label`
