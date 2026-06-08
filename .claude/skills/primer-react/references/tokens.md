# Tokens — primer-react

Token families grep-resolved against `@primer/primitives@11.9.0` (`node_modules/@primer/primitives/dist/css/`). Per-rule guidance lives in the foundation files and is linked, not duplicated.

## Source of truth

Tokens are CSS custom properties shipped by `@primer/primitives`. Functional + theme tokens auto-switch by color mode; **base tokens (`--base-color-*`, raw scales) must never be used directly** — use functional tokens. The wiring that imports these token files is in the produced `SKILL.md` Setup section (lifted verbatim); this file documents which tokens to USE, not how to import them.

## Color (functional) — see [colors](./foundations/colors.md)

Grep-resolved in `functional/themes/light.css` + `dark.css` (both imported by the reference wiring):

- Surfaces: `--bgColor-default`, `--bgColor-muted`, `--bgColor-{role}-emphasis` (accent/success/attention/danger/open/closed/done/sponsors)
- Foregrounds: `--fgColor-default`, `--fgColor-muted`, `--fgColor-onEmphasis`, `--fgColor-{role}`
- Borders: `--borderColor-default`, `--borderColor-muted`, `--borderColor-{role}-emphasis`
- Controls/focus: `--control-borderColor-danger`, `--focus-outlineColor`
- Elevation: `--shadow-resting-small`, `--shadow-resting-medium`

Rules (emphasis↔onEmphasis pairing, neutral-scale mode inversion, border step-8 contrast minimum, semantic-foreground-surface) live in [colors](./foundations/colors.md).

## Spacing & size — see [spacing-layout](./foundations/spacing-layout.md)

Grep-resolved in `base/size/size.css`, `functional/spacing/space.css`, `functional/size/radius.css`, `functional/size/breakpoints.css`:

- Base scale: `--base-size-{2,4,8,12,16,20,24,28,32,36,…,128}`
- Named spacing: `--space-{xxs,xs,sm,md,lg,xl}`
- Radius: `--borderRadius-{small,medium,large,full}` (`--borderRadius-medium`, `--borderRadius-large` consumed by exemplars)
- Breakpoints: `--breakpoint-{xsmall:320,small:544,medium:768,large:1012,xlarge:1280,xxlarge:1400}`

## Typography — see [typography](./foundations/typography.md)

Grep-resolved in `functional/typography/typography.css` + `base/typography/typography.css`:

- Shorthand: `--text-{body,caption,subtitle,display,codeBlock,codeInline}-shorthand[-{small,medium,large}]`
- Sub-tokens: `--text-body-size-{small,medium,large}`, `--text-body-weight`, `--text-body-lineHeight-{small,medium,large}`, `--text-caption-{size,weight,lineHeight}`

Prefer the shorthand `font` token over assembling sub-tokens.

## Icon sizing — see [icons](./foundations/icons.md)

Octicons accept `size: 'small' | 'medium' | 'large'` (or number); `fill` defaults to `currentColor`. No separate CSS size token is consumed by the exemplars.

## Consumed-token coverage

The 12 vars consumed across wiring + exemplars — each defined in a file the reference `globals.css` `@import`s: `--bgColor-default`, `--fgColor-default`, `--fgColor-muted`, `--borderColor-default`, `--borderColor-muted`, `--base-size-16`, `--base-size-24`, `--base-size-32`, `--borderRadius-medium`, `--borderRadius-large`, `--shadow-resting-small`, `--shadow-resting-medium`.
