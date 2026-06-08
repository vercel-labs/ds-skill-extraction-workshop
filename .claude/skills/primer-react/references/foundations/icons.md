# Foundation: Icons

_Extracted from https://primer.style/product/getting-started/foundations/icons/ by /extract-ds-skill Phase 2._

## What this covers

- Decorative vs contentful icon accessibility contracts, currentColor fill inheritance, and the prohibition on `tabIndex` on icon elements.

---

### token/icon-decorative-aria

Decorative icons (those that accompany visible text conveying the same meaning) must have `aria-hidden="true"` and `focusable="false"` on the `<svg>` element. Without `aria-hidden`, screen readers announce the icon as a redundant item alongside the text; without `focusable="false"`, IE/legacy browsers place the SVG in the focus order.

**When it bites:** A `<RepoIcon />` next to a visible "Repositories" label is announced twice by VoiceOver ("Repositories, image, Repositories") without `aria-hidden`.

| Bad | Good | Why |
|---|---|---|
| `<RepoIcon />` next to visible text (no aria attrs) | `<RepoIcon aria-hidden="true" focusable="false" />` next to visible text | Screen reader reads the icon label redundantly; SVG in focus order confuses keyboard users |

Source: https://primer.style/product/getting-started/foundations/icons/#decorative-icons

Note: `@primer/octicons-react` components accept these as standard SVG props. In the reference project's composition exemplars, icons inside `<Stack>` with adjacent text pass these props directly.

---

### token/icon-contentful-title

Standalone icons (not adjacent to visible text) require `role="img"` and a child `<title>` element that names the icon's purpose. Do not use `aria-label` on the `<svg>` element; `<title>` is the spec-preferred method and enables text-selection tools on the title text.

**When it bites:** An icon-only button without `role="img"` and `<title>` has no accessible name — screen readers announce it as "image" with no label.

| Bad | Good | Why |
|---|---|---|
| `<SearchIcon />` alone (no label) | `<SearchIcon role="img"><title>Search</title></SearchIcon>` | No accessible name; screen reader announces "image" without a label |

Source: https://primer.style/product/getting-started/foundations/icons/#contentful-icons

---

### token/icon-currentcolor-fill

Primer octicons default `fill` to `currentColor`, inheriting the CSS `color` property of the surrounding element. Do not set a literal fill color (`fill="#000"` or `fill="red"`) on an octicon — the icon will not adapt to dark mode or to the contextual foreground token.

**When it bites:** A hardcoded `fill="#24292f"` appears as dark text on a dark background in dark mode — the icon becomes invisible.

| Bad | Good | Why |
|---|---|---|
| `<RepoIcon fill="#24292f" />` | `<RepoIcon />` (inherits `currentColor`) | Hardcoded fill bypasses token-based color modes; currentColor inherits from the surrounding `fgColor-*` token |

Source: https://primer.style/product/getting-started/foundations/icons/#color-tokens
