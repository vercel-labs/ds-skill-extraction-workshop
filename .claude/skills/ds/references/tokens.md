# Tokens — ds

## Status

`ds/tokens.json` is a stub in v1. The project consumes design tokens directly from `@primer/primitives` (the Primer peer dep, pinned at `11.9.0` in `package.json`). No project-curated token subset is published yet.

The agent should:

- Use Primer's `sx` prop or `@primer/primitives` CSS variables for any colour / spacing / type value.
- Not hand-roll hex codes, raw px values, or one-off font sizes.
- Not invent token names. If the agent cannot find the right token in `@primer/primitives`, mark `[VERIFY]` inline and surface the gap.

## Color

`[VERIFY]` Token rules not extracted in v1. Source of truth: `node_modules/@primer/primitives/dist/css/functional/themes/light.css` and `.../dark.css`. Use Primer's semantic CSS custom properties (`--fgColor-default`, `--bgColor-accent-emphasis`, etc.).

## Space

`[VERIFY]` Token rules not extracted in v1. Source of truth: `node_modules/@primer/primitives/dist/css/functional/size/size.css`. Primer uses a 4px grid (`--base-size-4`, `--base-size-8`, ...).

## Type

`[VERIFY]` Token rules not extracted in v1. Source of truth: `node_modules/@primer/primitives/dist/css/functional/typography/typography.css`. Primer uses a functional scale (`--text-display-size`, `--text-title-size-large`, etc.).

## When to extract

Promote tokens out of `[VERIFY]` status when a recurring trap appears in generated UI — e.g. the agent reaches for `#0969da` instead of `--bgColor-accent-emphasis`. Add a `Bad | Good | Why` row per token family the next time it bites.
