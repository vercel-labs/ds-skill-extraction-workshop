# Tokens — ds

`ds` consumes tokens from `@primer/primitives@11.9.0`. The local `ds/tokens.json` is a deliberate stub (`ds/tokens.json:3`); the canonical source is the primitives CSS bundles below.

## Headline rule

> Never use raw values (hex/px). Use semantic tokens ONLY.

Verbatim from `@primer/primitives/dist/css/functional/themes/light.css:3`. This is the single most important rule in this file. If you reach for `#1f883d` or `8px`, you have skipped a token and lost the design-system contract.

The exception is when the token genuinely does not exist — call it out explicitly with a `[VERIFY]` marker and a one-line reason next to the value.

## Setup

Import the primitives CSS in the root layout once:

```tsx
// app/layout.tsx
import "@primer/primitives/dist/css/functional/themes/light.css";
import "@primer/primitives/dist/css/functional/size/size.css";
import "@primer/primitives/dist/css/functional/typography/typography.css";
```

After that, every token below is a CSS custom property — use it from your CSS or from inline styles via `var(--token-name)`.

## Color

Source: `@primer/primitives/dist/css/functional/themes/light.css` (and matching `dark*.css` files for theme variants).

The exhaustive list lives in that file (one variable per line, each with a comment explaining purpose). The naming convention is the rule, not any single token:

- `--bgColor-*` — background fills (`--bgColor-success-emphasis`, `--bgColor-danger-emphasis`, etc.). Use for surface fills.
- `--fgColor-*` — foreground text/icon colors (`--fgColor-danger`, `--fgColor-muted`). Use for text and icon strokes.
- `--button-<variant>-bgColor-<state>` — button surface tokens scoped per variant and per state (rest / hover / active / disabled). Example: `--button-primary-bgColor-hover` (`themes/light.css:11`). Do not reach for a generic `--bgColor-success-emphasis` to style a button hover when a `--button-*-hover` token exists.
- `--control-*` — form control tokens (`--control-checked-bgColor-active`). Use for checkbox / radio / toggle surfaces.

### Bad | Good | Why

| Bad | Good | Why |
|---|---|---|
| `style={{ background: "#1f883d" }}` | `style={{ background: "var(--bgColor-success-emphasis)" }}` | Raw hex bypasses theming; the same surface stays green in dark mode instead of switching. (rule slug: `token/never-raw-values`) |
| `--bgColor-success-emphasis` on a primary-button hover | `--button-primary-bgColor-hover` | A more specific token exists; using the generic one breaks if button-specific theming diverges from the generic success color. |

## Space

Source: `@primer/primitives/dist/css/functional/spacing/spacing.css` and `size/size*.css`.

Spacing tokens are exposed as CSS variables under `--base-size-*` (raw step values) and per-component density tokens (`--controlStack-medium-gap-auto` etc.). The size file branches on `@media (pointer: coarse)` to enlarge touch targets:

```css
/* @primer/primitives/dist/css/functional/size/size-coarse.css:1-7 */
@media (pointer: coarse) {
  :root {
    --control-minTarget-auto: 2.75rem;
    --controlStack-large-gap-auto: 0.75rem;
    --controlStack-medium-gap-auto: 0.75rem;
    --controlStack-small-gap-auto: 1rem;
  }
}
```

Prefer the `--controlStack-*-gap-auto` family for gaps between stacked controls — it picks up the touch-target adjustment automatically.

### Bad | Good | Why

| Bad | Good | Why |
|---|---|---|
| `gap: 8px` | `gap: var(--controlStack-medium-gap-auto)` | Raw px does not respond to coarse-pointer touch-target widening; users on touch devices get cramped layouts. (rule slug: `token/never-raw-values`) |

## Type

Source: `@primer/primitives/dist/css/functional/typography/typography.css`.

The typography file exposes `--text-*` and `--fontStack-*` variables. Pick by role (body, code, display) rather than by literal size — the size token can shift across themes without changing the call site.

### Bad | Good | Why

| Bad | Good | Why |
|---|---|---|
| `font: 400 14px/20px system-ui` | `font: var(--text-body-shorthand-medium)` | Raw shorthand bypasses theme adjustments and loses the canonical line-height pairing. (rule slug: `token/never-raw-values`) |

## Things to never invent

- A token name not present in `@primer/primitives/dist/css/functional/**`. Grep the source before citing.
- A raw hex value when a `--bgColor-*` or `--fgColor-*` token covers the case.
- A raw px value when a `--base-size-*` or `--controlStack-*-gap-auto` token covers the case.
- A theme-specific override at the call site. Use the semantic token and let the theme CSS swap the value.
