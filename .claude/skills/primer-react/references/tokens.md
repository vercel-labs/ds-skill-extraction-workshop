# Tokens — primer-react

Tokens come from `@primer/primitives@11.9.0` as CSS custom properties, imported by `app/globals.css` (see SKILL.md Setup). Color/shadow values re-resolve per color mode; the values below are the **light-theme** resolved values (grep-resolved from `functional/themes/light.css`). Dark mode supplies its own values for the same names — that is the whole point of functional tokens.

## Rule: always tokens, never raw values

Every color, space, size, radius, border, and type value comes from a Primer Primitives CSS variable. Raw hex (`#0969da`), raw px for spacing/radius, and raw font weights are out of contract — they ignore color mode and the type scale. Use **functional** tokens (`--bgColor-*`, `--fgColor-*`, `--borderColor-*`), never **base** scale tokens (`--color-scale-*`) directly. See `references/foundations/colors.md` for the functional-vs-base rule.

## Color (functional, mode-resolved)

| Token | Value (light) | Use when |
|---|---|---|
| `--bgColor-default` | `#ffffff` | default page / card / surface background |
| `--fgColor-default` | `#1f2328` | primary text and headings |
| `--fgColor-muted` | `#59636e` | secondary / meta text, de-emphasized content |
| `--borderColor-default` | `#d1d9e0` | default border for cards and controls |
| `--borderColor-muted` | `#d1d9e0b3` | subtle dividers and secondary separators |

Emphasis surfaces (`--bgColor-{role}-emphasis`) and their `--fgColor-onEmphasis` foreground, semantic foregrounds (`--fgColor-accent|success|danger|attention`), and contrast minimums are documented in `references/foundations/colors.md`.

Defining files: `functional/themes/light.css`, `dark.css` (+ 12 contrast/colorblind variants).

## Size, radius, border, breakpoints

| Token | Value | Family | Use when |
|---|---|---|---|
| `--base-size-16` | `1rem` | size | base 16px spacing/padding step |
| `--base-size-24` | `1.5rem` | size | card padding step |
| `--base-size-32` | `2rem` | size | section / blankslate spacing |
| `--borderRadius-medium` | `0.375rem` (6px) | radius | default card/control radius |
| `--borderRadius-large` | `0.75rem` (12px) | radius | larger surfaces, softer containers |
| `--shadow-resting-small` | `0 1px 1px 0 #1f23280a, 0 1px 2px 0 #1f232808` | shadow | buttons, interactive elements |
| `--shadow-resting-medium` | `0 1px 1px 0 #25292e1a, 0 3px 6px 0 #25292e1f` | shadow | cards and elevated surfaces |

Defining files: `base/size/size.css`, `functional/size/{radius,border,breakpoints}.css`. Breakpoints (`--breakpoint-xsmall` … `--breakpoint-xxlarge`) and their pixel values are in `references/foundations/spacing-layout.md`.

## Type

Typography weight/size tokens (`--text-*-weight`, `--text-*-size-*`) live in `functional/typography/typography.css`. Set `font-weight`/`font-size` from these tokens, never raw numerics. The weight/size/heading-order rules are in `references/foundations/typography.md`.

## Stack gaps (named, not pixels)

`Stack` exposes a named gap scale (`none | condensed | normal | spacious`) backed by the space scale (`functional/spacing/space.css`). Use the named prop value, not a pixel margin — see `references/components/stack.md`.

## Mode wiring (token resolution context)

Color/shadow tokens re-resolve per theme. The `<html data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">` attributes (SKILL.md Setup) select which theme file's values apply; `globals.css` imports `themes/light.css` + `themes/dark.css` to define them. Attributes without the matching theme import leave functional tokens at fallback — see `references/foundations/colors.md`.

## Bad / Good

| Bad | Good | Why |
|---|---|---|
| `background: #ffffff` | `background: var(--bgColor-default)` | hex literal bypasses theming; breaks in dark mode |
| `color: #59636e` | `color: var(--fgColor-muted)` | hardcoded gray ignores mode inversion |
| `border-radius: 6px` | `border-radius: var(--borderRadius-medium)` | off-scale radius forks from the DS radius scale |
| `padding: 16px` | `padding: var(--base-size-16)` | off-grid spacing breaks vertical rhythm |
| `var(--color-scale-gray-1)` | `var(--bgColor-default)` | base scale tokens ignore color mode; functional tokens re-resolve |
