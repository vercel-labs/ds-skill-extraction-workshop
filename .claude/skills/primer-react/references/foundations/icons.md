# Foundations: Icons

## What this covers

- Octicon SVG accessibility contract (decorative vs contentful), icon-in-button naming, and the icon component prop surface (size, fill, verticalAlign).

### token/svg-decorative-fallback

By default an icon rendered as a raw `<svg>` is decorative: it "must set `aria-hidden="true"`" and "must set `focusable="false"`". `@primer/octicons-react` components emit these attributes; hand-rolled `<svg>` elements must add them.

**When it bites:** a decorative SVG without `aria-hidden` is announced by screen readers as unlabeled graphics noise on every row it decorates.

| Bad | Good | Why |
|---|---|---|
| `<svg>...</svg>` | `<svg aria-hidden="true" focusable="false">...</svg>` | decorative icons must be hidden from the accessibility tree |

Source: https://primer.style/product/getting-started/foundations/icons#decorative-by-default

### token/svg-contentful-fallback

When an icon conveys meaning, the `<svg>` "must set `role="img"`", "must set `focusable="false"`", and "a `<title>` element must be included within the `<svg>`" holding a short, concise description. Inside a button or link where the icon is the sole child, the icon is contentful by default and the accessible name is "optimally provided by a nested `title` element" rather than ARIA attributes.

**When it bites:** an icon-only button without a `<title>` (or `aria-label`) reads as "button" with no name — unusable by assistive technology.

| Bad | Good | Why |
|---|---|---|
| `<button><svg focusable="false">...</svg></button>` | `<button><svg focusable="false"><title>Add</title>...</svg></button>` | the sole-child icon carries the button's accessible name |

Source: https://primer.style/product/getting-started/foundations/icons#within-an-interactive-element-contentful-by-default

### token/icon-size-prop

Icon components must accept a `size` prop with values `'small' | 'medium' | 'large'` (standard octicon sizes; `@primer/octicons-react` also accepts numeric px as used throughout the reference project, e.g. `size={16}`). Color comes from the `fill` prop defaulting to `currentColor` — icons inherit the surrounding text color token rather than carrying their own. Vertical alignment uses `verticalAlign` (`'middle' | 'text-bottom' | 'text-top' | 'top'`). Icon components must NOT accept `tabIndex`.

**When it bites:** an icon given its own fill color drifts from the text it sits beside when the mode flips; `currentColor` keeps icon and text resolving from the same `--fgColor-*` token.

| Bad | Good | Why |
|---|---|---|
| `<RepoIcon fill="#57606a" />` | `<Text style={{ color: "var(--fgColor-muted)" }}><RepoIcon /> label</Text>` | `currentColor` inherits the token-resolved text color; hex does not flip with mode |

Source: https://primer.style/product/getting-started/foundations/icons#props
