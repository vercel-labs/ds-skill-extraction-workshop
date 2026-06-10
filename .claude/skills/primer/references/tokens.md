# Tokens — primer

Primer ships tokens as CSS custom properties from `@primer/primitives@11.x`. This file is the index; per-rule subsections live in `references/foundations/*.md` (one per foundation page extracted from the docs).

## Token sources

All token files import from `@primer/primitives/dist/css/`. The full `@import` set the consumer needs is enumerated in `SKILL.md` Setup → Companion CSS — `app/globals.css`. Highlights:

- **Color** — `functional/themes/light.css` + `functional/themes/dark.css` (theme files). Functional color tokens (`var(--bgColor-*)`, `var(--fgColor-*)`, `var(--borderColor-*)`) live in these files and are mode-aware via the `data-color-mode` cascade on `<html>`. Base scale tokens (`var(--color-scale-gray-*)`) are mode-blind and must never be used directly.
- **Space** — `functional/spacing/space.css` (named `var(--base-size-*)` / `var(--stack-padding-*)` tokens). Per-token-name tables are not enumerated on the foundation page; see `references/foundations/spacing-layout.md` and `[VERIFY]` markers below.
- **Size + border + radius** — `functional/size/border.css`, `radius.css`, `size.css`, `size-coarse.css`, `size-fine.css`, `viewport.css`, `breakpoints.css`.
- **Typography** — `functional/typography/typography.css`. `var(--text-*-size)` / `var(--text-*-lineHeight)` per scale tier. Per-tier name tables not enumerated on the foundation page; see `references/foundations/typography.md`.
- **Motion** — `functional/motion/motion.css` (durations, easings).

## Three-tier system (Primer's convention)

Primer organizes tokens in three tiers: **base** → **functional** → **component or pattern**. Always consume the highest tier available for your context:

- Default to **functional** tokens (`var(--bgColor-default)`, `var(--fgColor-accent)`). They auto-swap by mode and carry the semantic intent.
- Reach for **component- or pattern-level** tokens only when wiring a Primer-internal pattern (rare for app consumers).
- **Never use base-scale tokens directly** (`var(--color-scale-gray-0)`). They are mode-blind and break dark mode. Primer's docs state they "should never be used directly in code or design."

See `references/foundations/colors.md` for the full set of color rules (mode-aware swaps, emphasis vs muted vs onEmphasis pairing, contrast minimums).

## Common token surfaces (consumer-facing)

The following functional tokens appear across the reference-project exemplars and are grep-resolvable in `node_modules/@primer/primitives/dist/css/`:

| Token | Family | Use-when |
|---|---|---|
| `var(--bgColor-default)` | color/surface | Default page and card surface; mode-aware. |
| `var(--bgColor-muted)` | color/surface | Secondary surface (subtle cards, alternating rows). |
| `var(--fgColor-default)` | color/foreground | Default body text on `--bgColor-default` or `--bgColor-muted`. |
| `var(--fgColor-muted)` | color/foreground | Secondary/caption text. |
| `var(--fgColor-accent)` | color/foreground | Links and accent text on default/muted surfaces. |
| `var(--fgColor-onEmphasis)` | color/foreground | Text on `--bgColor-{role}-emphasis` surfaces (primary buttons, danger buttons). |
| `var(--borderColor-default)` | color/border | Default border on default/muted surfaces. |
| `var(--base-size-16)` | space | 1rem-equivalent spacing token (common card padding). |
| `var(--base-size-24)` | space | 1.5rem-equivalent (heavier card padding). |
| `var(--borderRadius-medium)` | size | Default rounded-corner radius for cards and inputs. |

`[VERIFY]` — `var(--base-size-*)` and `var(--stack-padding-*)` token-name tables are not enumerated on Primer's layout foundation page; the names ARE imported and grep-resolve in `@primer/primitives`, but named-rule documentation is thin. See `references/foundations/spacing-layout.md`.

`[VERIFY]` — `var(--text-*-size)` / `var(--text-*-lineHeight)` token tables and the `<Heading variant>` → scale mapping are not enumerated on Primer's typography foundation page. The variant prop IS in the `@primer/react` types and tsc-passes; only the precise scale-pairing documentation is thin. See `references/foundations/typography.md`.
