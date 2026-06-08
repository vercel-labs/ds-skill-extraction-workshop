# Foundation: Icons

## What this covers

- Icon source package, the `size` enum, and the decorative-vs-contentful accessibility contract for octicons.

Source page: https://primer.style/product/getting-started/foundations/icons

### token/icon-size-enum

Icons come from **Octicons** (`@primer/octicons-react`) and render as `<svg>`. The React components accept `size` as `'small' | 'medium' | 'large'` (or a number); `fill` defaults to `currentColor`, so an octicon inherits the surrounding `fgColor-*` foreground unless overridden.

**When it bites:** hand-inlining an SVG path instead of importing the octicon loses the size enum and the `currentColor` inheritance, so the glyph won't track the text color or the DS sizing.

| Bad | Good | Why |
|---|---|---|
| inline `<svg>…</svg>` | `<RepoIcon size={16} />` from `@primer/octicons-react` | octicon components carry the standard size enum and inherit `currentColor` from the foreground token |

Source: https://primer.style/product/getting-started/foundations/icons#usage

### token/icon-decorative-default

A decorative icon (the common case — it sits beside a text label) MUST be hidden from assistive tech: `aria-hidden="true"` + `focusable="false"`. Octicons rendered without an accessible name are treated as decorative by Primer.

**When it bites:** a decorative icon left exposed to AT announces a redundant or meaningless label next to the text it decorates.

| Bad | Good | Why |
|---|---|---|
| `<AlertIcon />` exposed as content beside a label | decorative octicon (no accessible name → `aria-hidden`) | most icons are decorative; exposing them duplicates the adjacent text for screen readers |

Source: https://primer.style/product/getting-started/foundations/icons#decorative-by-default

### token/icon-only-interactive-name

An icon inside an interactive element (icon-only button) is **contentful** and MUST carry an accessible name — Primer prefers a nested `<title>`/accessible label so the name lives on the page. In `@primer/react` this is enforced by `IconButton`, whose types require `aria-label` (or `aria-labelledby`).

**When it bites:** an icon-only button with no label is an unlabeled control — screen-reader users hear "button" with no purpose; axe fails.

| Bad | Good | Why |
|---|---|---|
| `<IconButton icon={SearchIcon} />` | `<IconButton icon={SearchIcon} aria-label="Search" />` | `IconButtonProps` requires `aria-label`/`aria-labelledby`; an icon-only control needs an accessible name |

Source: https://primer.style/product/getting-started/foundations/icons#within-an-interactive-element-contentful-by-default

## Notes

- The icon-only-interactive rule is **joint-confirmed by code**: `@primer/react@38.26.0` `dist/Button/types.d.ts` defines `IconButtonProps` as `ButtonA11yProps & …` where `ButtonA11yProps` requires exactly one of `aria-label` / `aria-labelledby`. Docs + types agree.
