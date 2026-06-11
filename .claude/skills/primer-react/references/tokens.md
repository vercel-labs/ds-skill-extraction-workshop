# Tokens — primer-react

Primer design tokens are consumed as CSS variables — `color: var(--fgColor-default)` — never as raw values and never through the legacy JS theme object (see `references/foundations/primitives.md` `token/css-variable-consumption`). The source of truth is `node_modules/@primer/primitives/dist/css/`; grep there to verify any token name before use. Theme-dependent values below are the `light` theme values; the same variable resolves per-mode through the imported theme files (`functional/themes/light.css` + `dark.css` — see SKILL.md Setup).

The ledger below covers every token consumed by the lifted wiring and composition exemplars (12/12 grep-resolved against `@primer/primitives@11.9.0`).

## Color

- `--fgColor-default` — `#1f2328` (light) — color (functional theme) — default foreground for body text. Defined in `functional/themes/light.css` + `dark.css`.
- `--fgColor-muted` — `#59636e` (light) — color (functional theme) — secondary/descriptive text; pair with `Text size="small"` for metadata lines. Defined in `functional/themes/*.css`.
- `--bgColor-default` — `#ffffff` (light) — color (functional theme) — the page/canvas surface; paints `body` and card backgrounds. Defined in `functional/themes/*.css`.
- `--borderColor-default` — `#d1d9e0` (light) — color (functional theme) — standard card/control borders. Defined in `functional/themes/*.css`.
- `--borderColor-muted` — `#d1d9e0b3` (light) — color (functional theme) — low-emphasis dividers and section footers. Defined in `functional/themes/*.css`.

| Bad | Good | Why |
|---|---|---|
| `color: var(--fgColor-default)` for descriptions | `color: var(--fgColor-muted)` | default vs muted is the text hierarchy; using default everywhere flattens it |
| `border: 1px solid var(--borderColor-muted)` on cards | `var(--borderColor-default)` on cards, `muted` on dividers | muted is for low-emphasis separators, not container outlines |

## Size / radius

- `--borderRadius-medium` — `0.375rem` — size (functional) — radius for list cards and inline surfaces. Defined in `functional/size/radius.css`.
- `--borderRadius-large` — `0.75rem` — size (functional) — radius for prominent cards (stat cards, form cards). Defined in `functional/size/radius.css`.
- `--base-size-16` — `1rem` — size (base) — standard card padding and footer padding. Defined in `base/size/size.css`.
- `--base-size-24` — `1.5rem` — size (base) — generous form-card padding. Defined in `base/size/size.css`.
- `--base-size-32` — `2rem` — size (base) — page-level top padding (e.g. above an empty state). Defined in `base/size/size.css`.

| Bad | Good | Why |
|---|---|---|
| `padding: 13px` | `padding: var(--base-size-16, 1rem)` | off-grid spacing breaks vertical rhythm |

## Shadow

- `--shadow-resting-small` — `0 1px 1px 0 #1f23280a, 0 1px 2px 0 #1f232808` (light) — shadow (functional theme) — resting elevation for stat cards. Defined in `functional/themes/*.css` (shadow tokens are mode-dependent and live in the THEME files, not a standalone shadow file — covered by the `light.css`/`dark.css` imports in Setup).
- `--shadow-resting-medium` — `0 1px 1px 0 #25292e1a, 0 3px 6px 0 #25292e1f` (light) — shadow (functional theme) — resting elevation for form cards. Defined in `functional/themes/*.css`.

| Bad | Good | Why |
|---|---|---|
| `box-shadow: 0 1px 3px rgba(0,0,0,.12)` | `box-shadow: var(--shadow-resting-small)` | ad-hoc shadows escape the elevation scale and ignore mode switching |

## Usage notes

- Exemplars use numeric fallbacks in the `var()` second slot (`var(--borderRadius-medium, 8px)`) — belt-and-braces only; every variable resolves through the Setup imports.
- Prose rules for mode/theming/token consumption (`token/css-variable-consumption`, `token/color-mode-auto`, `token/theme-file-attribute-pairing`, `token/accessibility-theme-variants`, `token/base-vs-functional`) live in `references/foundations/primitives.md` with their citations.
