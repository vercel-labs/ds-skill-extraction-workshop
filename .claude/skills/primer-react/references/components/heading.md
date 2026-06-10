---
title: Heading
description: Section heading; pick the tag for the outline and the variant for the size, independently.
---

## Public imports

`import { Heading } from "@/ds/components/Heading"` (project wrapper) — equivalent to `import { Heading } from "@primer/react"`.

## When to use

Use `Heading` for page and section titles. Pick the semantic level with `as` (`h1`–`h6`) for the document outline, and the visual size with `variant` — keep the two independent so screen-reader navigation stays correct. For body copy, use [Text](./text.md). See [typography foundation](../foundations/typography.md) for the weight/size token rules.

## Key props

- `as` — the rendered element, `'h1' | 'h2' | ... | 'h6'`; drives the document outline. (used at `references/examples/dashboard.md`)
- `variant` — visual size, e.g. `'small' | 'medium' | 'large'`; independent of `as`. (used at `references/examples/home.md`)

## Best Practices

- Choose `as` for the outline and `variant` for the look; never reorder semantic levels (e.g. an `as="h2"` placed above the `h1`) to get a visual size. (`references/foundations/typography.md`) `component/heading-semantic-order`

## Composition examples

```tsx
import { Heading } from "@/ds/components/Heading";

export function PageTitle() {
  return <Heading as="h1" variant="large">Create a new repository</Heading>;
}
```

## Source references

- `ds/components/Heading.tsx:1-7` — wrapper re-export
- `references/foundations/typography.md` — semantic-order and weight/size token rules
- `@primer/react@38.26.0` — `Heading` published types (verified via Phase 2 typecheck)

## Common mistakes

- Using a big `variant` on an `h2` placed above the `h1` for layout → fix the level, keep the size token.

## Things to never invent

- `variant` sizes not present in the `@primer/react` `Heading` types.
- A raw `font-weight`/`font-size` style — use the variant and typography tokens.
