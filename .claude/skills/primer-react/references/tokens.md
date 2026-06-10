# Tokens — primer-react

Source: `@primer/primitives@11.9.0`, `dist/css/`. All 37 tokens below were grep-resolved against the package during extraction (0 misses). Values shown are the light-theme resolution from `dist/css/functional/themes/light.css` (color/shadow) or the base files (size/type); dark mode re-resolves them via the `data-*` mode attributes — never hardcode the resolved value.

Foundation-derived usage rules (`### token/<slug>` subsections) live in `references/foundations/*.md`, one file per docs page. This file is the per-token ledger.

## Color (24) — family: color

Defined in `dist/css/functional/themes/light.css` + `dark.css`.

| Token | Light value | Use when |
|---|---|---|
| `--bgColor-default` | `#ffffff` | the page/canvas surface and card backgrounds |
| `--bgColor-muted` | `#f6f8fa` | inset/secondary surfaces (stat tiles, code wells) |
| `--fgColor-default` | `#1f2328` | body text on default surfaces |
| `--fgColor-muted` | `#59636e` | secondary text, captions, descriptions |
| `--fgColor-onEmphasis` | `#ffffff` | text/icons sitting on any `*-emphasis` background |
| `--fgColor-accent` | `#0969da` | links and interactive accents |
| `--fgColor-success` | `#1a7f37` | positive status text/icons |
| `--fgColor-danger` | `#d1242f` | destructive/error text/icons |
| `--fgColor-attention` | `#9a6700` | warning text/icons |
| `--fgColor-sponsors` | `#bf3989` | sponsors-themed text/icons |
| `--fgColor-open` | `var(--fgColor-success)` | open-state items (issues/PRs) |
| `--fgColor-closed` | `var(--fgColor-danger)` | closed-state items |
| `--fgColor-done` | `#8250df` | done/merged-state items |
| `--bgColor-accent-emphasis` | `#0969da` | primary/emphasis fills; pair text with `--fgColor-onEmphasis` |
| `--bgColor-danger-emphasis` | `#cf222e` | destructive emphasis fills |
| `--bgColor-success-emphasis` | `#1f883d` | success emphasis fills |
| `--bgColor-attention-emphasis` | `#9a6700` | warning emphasis fills |
| `--bgColor-accent-muted` | `#ddf4ff` | accent-tinted surfaces (info banners); keep default fg |
| `--bgColor-danger-muted` | `#ffebe9` | danger-tinted surfaces |
| `--bgColor-success-muted` | `#dafbe1` | success-tinted surfaces |
| `--bgColor-attention-muted` | `#fff8c5` | warning-tinted surfaces |
| `--borderColor-accent-muted` | `#54aeff66` | borders on accent-muted surfaces |
| `--borderColor-danger-emphasis` | `#cf222e` | borders signalling destructive state |
| `--borderColor-accent-emphasis` | `#0969da` | borders signalling selected/active accent state |

| Bad | Good | Why |
|---|---|---|
| `color: var(--fgColor-onEmphasis)` on a `*-muted` background | `color: var(--fgColor-default)` (muted surfaces keep default fg) | onEmphasis is white — invisible on light muted tints; it pairs only with `*-emphasis` fills |

## Border / control / focus (5) — family: color

| Token | Light value | Use when |
|---|---|---|
| `--borderColor-default` | `#d1d9e0` | standard 1px borders on cards and dividers |
| `--borderColor-muted` | `#d1d9e0b3` | low-emphasis section dividers |
| `--borderColor-sponsors-emphasis` | `#bf3989` | sponsors-themed emphasis borders |
| `--control-borderColor-danger` | `var(--borderColor-danger-emphasis)` | invalid form-control borders |
| `--focus-outlineColor` | `var(--focus-outline-color)` → `var(--borderColor-accent-emphasis)` | focus rings on custom interactive elements |

| Bad | Good | Why |
|---|---|---|
| `border: 1px solid var(--borderColor-default)` for an error field | `border-color: var(--control-borderColor-danger)` | the control-scoped token tracks validation theming; the generic border does not signal state |

## Size / space / radius / shadow (7) — families: space, elevation

Defined in `dist/css/base/size/size.css`, `functional/size/radius.css`, and the theme files (shadows).

| Token | Value | Use when |
|---|---|---|
| `--base-size-16` | `1rem` | standard inner padding (card link rows) |
| `--base-size-24` | `1.5rem` | roomier card padding (form cards) |
| `--base-size-32` | `2rem` | page-level padding |
| `--borderRadius-medium` | `0.375rem` | default card/control rounding |
| `--borderRadius-large` | `0.75rem` | large surfaces (form cards, modals) |
| `--shadow-resting-small` | `0 1px 1px 0 #1f23280a, 0 1px 2px 0 #1f232808` | subtle elevation on resting cards |
| `--shadow-resting-medium` | `0 1px 1px 0 #25292e1a, 0 3px 6px 0 #25292e1f` | raised cards (form card in `references/examples/new.md`) |

| Bad | Good | Why |
|---|---|---|
| `border-radius: 8px` | `border-radius: var(--borderRadius-medium)` | ad-hoc radius drifts from the shape scale across components |

## Type (1 + family) — family: type

Defined in `dist/css/base/typography/typography.css` and `functional/typography/typography.css`.

| Token | Value | Use when |
|---|---|---|
| `--fontStack-system` | `"Mona Sans VF", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"` | any custom element that needs the Primer type stack (BaseStyles applies it inside the shell) |

The `--text-*` functional family ships 41 variables in `functional/typography/typography.css` — per-role `size` / `weight` / `lineHeight` / `shorthand` sets (e.g. `--text-subtitle-size`, `--text-subtitle-weight`, resolved value `var(--base-text-weight-normal)`). Use the role shorthands (`font: var(--text-subtitle-shorthand)`) for custom text outside `Heading`/`Text`. Known docs divergence: the typography foundations page's Do-example names `--test-subtitle-weight`; the package ships `--text-subtitle-weight` — docs typo, package wins.

| Bad | Good | Why |
|---|---|---|
| `font-size: 15px` | `font: var(--text-body-shorthand-medium)` (or `Text size="medium"`) | ad-hoc size escapes the type scale |
