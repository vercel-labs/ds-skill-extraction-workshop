# Tokens — primer-react

Tokens are CSS custom properties from `@primer/primitives@11.9.0`. Consume them as `var(--token-name)`. Values shown are the resolved light-theme primitives; the dark theme re-resolves the same functional names. Never inline a raw hex/px when a token exists.

- color/functional source: `@primer/primitives/dist/css/functional/themes/light.css`
- size/base source: `@primer/primitives/dist/css/base/size/size.css`, `functional/size/radius.css`, `functional/size/border.css`
- type source: `@primer/primitives/dist/css/functional/typography/typography.css`, `base/typography/typography.css`

For prose foundation rules (emphasis pairing, contrast minimums, base-color prohibition, semantic roles, mode-aware inversion), see `references/foundations/`.

## Color

| Token | Value | use-when |
|---|---|---|
| `--bgColor-default` | `#ffffff` | default background for pages and main content areas |
| `--fgColor-default` | `#1f2328` | default text for primary content and headings |
| `--fgColor-muted` | `#59636e` | secondary / less-important text |
| `--borderColor-default` | `#d1d9e0` | default border for most UI elements |
| `--bgColor-emphasis` | `#25292e` | high-emphasis dark surface for strong contrast |
| `--fgColor-onEmphasis` | `#ffffff` | text on an emphasis background |
| `--bgColor-accent-emphasis` | `#0969da` | strong accent surface for active / focused states |

| Bad | Good | Why |
|---|---|---|
| `color: #1f2328` | `color: var(--fgColor-default)` | raw hex bypasses theming; the token re-resolves in dark mode, the literal does not |
| text on `--bgColor-emphasis` using `--fgColor-default` | text on `--bgColor-emphasis` using `--fgColor-onEmphasis` | `onEmphasis` foreground is the only token paired for contrast against emphasis surfaces (see foundations/colors.md `token/emphasis-on-emphasis-pairing`) |

## Size

| Token | Value | use-when |
|---|---|---|
| `--base-size-24` | `1.5rem` | standard card / section padding step from the base size scale |
| `--borderRadius-large` | `0.75rem` (12px) | larger surfaces or softer container treatments (cards) |
| `--borderWidth-thin` | `0.0625rem` (1px) | default 1px borders |
| `--shadow-resting-medium` | `0 1px 1px 0 #25292e1a, 0 3px 6px 0 #25292e1f` | resting elevation for cards and elevated surfaces |

| Bad | Good | Why |
|---|---|---|
| `padding: 24px` | `padding: var(--base-size-24)` | the rem-based size token scales with the type/zoom baseline; a px literal does not |
| `border-radius: 12px` | `border-radius: var(--borderRadius-large)` | radius scale stays consistent across surfaces and themes |

## Type

| Token | Value | use-when |
|---|---|---|
| `--text-body-size-medium` | `var(--base-text-size-sm)` | default body text size |
| `--text-title-size-large` | `var(--base-text-size-xl)` | large page/section titles |
| `--base-text-weight-semibold` | `600` | emphasized text / headings weight (use the token, not a raw `600`) |

| Bad | Good | Why |
|---|---|---|
| `font-weight: 600` | `font-weight: var(--base-text-weight-semibold)` | weight tokens keep emphasis consistent and themeable (see foundations/typography.md `token/typography-weight-tokens`) |
