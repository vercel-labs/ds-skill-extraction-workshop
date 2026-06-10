# Foundation: Icons

## What this covers

- Octicons are decorative by default and require explicit ARIA wiring to become contentful; the `size` prop is named (`small`/`medium`/`large`), not raw pixels.
- Source: https://primer.style/product/getting-started/foundations/icons/

### token/icon-decorative-default

Icons are decorative by default: a decorative octicon's `<svg>` must carry `aria-hidden="true"` and `focusable="false"`. Most product icons sit beside a visible label and ARE decorative — do not give them an accessible name that duplicates the adjacent text.

**When it bites:** a decorative icon left without `aria-hidden` is announced by a screen reader, doubling the label ("Repositories, repo icon, Repositories").

| Bad | Good | Why |
|---|---|---|
| decorative `<svg>` with no ARIA | `aria-hidden="true" focusable="false"` | a decorative icon must be skipped by assistive tech, not announced |

Source: https://primer.style/product/getting-started/foundations/icons/#decorative-by-default

### token/icon-contentful-labeling

A contentful (standalone, meaning-bearing) icon must set `role="img"`, `focusable="false"`, and include a nested `<title>`. When the icon is the sole content of an interactive element, the element needs an accessible name (e.g. the `aria-label` Primer's `IconButton` requires) — see [IconButton](../components/iconbutton.md).

**When it bites:** an icon-only control with no label is announced as just "button" with no indication of what it does.

| Bad | Good | Why |
|---|---|---|
| icon-only button, icon `aria-hidden`, no label | `role="img"`+`<title>`, or `aria-label` on the control | a meaning-bearing icon needs a programmatic name |

Source: https://primer.style/product/getting-started/foundations/icons/#contentful

### token/icon-size-named

Set octicon size via the named `size` prop (`small` | `medium` | `large`) or a deliberate numeric `size` matched to context (16 inline, 32 for blankslate visuals), and use `verticalAlign` (`middle`/`text-bottom`/`text-top`/`top`) to align with adjacent text — do not nudge icons with margins.

**When it bites:** an icon sized by CSS `width` ignores the DS optical sizing and sits mis-aligned against its label.

| Bad | Good | Why |
|---|---|---|
| `<svg style={{ width: 18 }}>` + margin nudges | `<RepoIcon size={16} />` (+ `verticalAlign`) | the size prop carries DS optical sizing; manual width/margins fork from it |

Source: https://primer.style/product/getting-started/foundations/icons/#props

> Note: this page exposes no CSS custom-property tokens — icon rules are ARIA-attribute and prop contracts, not `var(--*)` tokens. Icon components come from `@primer/octicons-react` (repository `github.com/primer/octicons`).
