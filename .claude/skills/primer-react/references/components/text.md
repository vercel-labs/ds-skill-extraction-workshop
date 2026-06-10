---
title: Text
description: Body text primitive with size/weight props; use the muted foreground token for secondary text.
---

## Public imports

`import { Text } from "@/ds/components/Text"` (project wrapper) — equivalent to `import { Text } from "@primer/react"`.

## When to use

Use `Text` for body and secondary copy, captions, and meta lines. For titles use [Heading](./heading.md). To de-emphasize secondary text, set the muted foreground token rather than a custom gray (see [colors foundation](../foundations/colors.md)).

## Key props

- `size` — `'small' | 'medium' | 'large'`; `small` for meta/secondary lines. (used at `references/examples/dashboard.md`)
- `weight` — e.g. `'normal' | 'medium' | 'semibold' | 'bold'`. (used at `references/examples/dashboard.md`)

## Best Practices

- De-emphasize secondary text with the muted foreground token (`color: var(--fgColor-muted)`), not a hand-picked gray — it stays correct across light/dark mode. (`references/foundations/colors.md`) `component/text-muted-foreground`

## Composition examples

```tsx
import { Text } from "@/ds/components/Text";

export function MetaLine({ children }: { children: React.ReactNode }) {
  return <Text size="small">{children}</Text>;
}
```

## Source references

- `ds/components/Text.tsx:1-7` — wrapper re-export
- `references/foundations/colors.md` — muted foreground / functional-token rule
- `@primer/react@38.26.0` — `Text` published types (verified via Phase 2 typecheck)

## Common mistakes

- Hardcoding a gray hex for secondary text → use `var(--fgColor-muted)`.

## Things to never invent

- `size` / `weight` values not present in the `@primer/react` `Text` types.
