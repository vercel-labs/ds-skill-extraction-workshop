---
title: Heading
description: Semantic heading with `as` (h1–h6) and visual `variant` (small/medium/large)
---

## Public imports

```tsx
import { Heading } from '@primer/react'
```

## When to use

Pick `Heading` for any semantic page heading. Always pair `as` (semantic level — `h1` ... `h6`) with `variant` (visual size). One `<Heading as="h1">` per page. For inline text, see [Text](./text.md).

## Key props

- `as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'` — semantic level. `node_modules/@primer/react/dist/Heading/Heading.d.ts:3,5`
- `variant?: 'large' | 'medium' | 'small'` — visual size; default `'large'`. `dist/Heading/Heading.d.ts:6`
- Native passthrough: heading-element props for the chosen `as`. `dist/Heading/Heading.d.ts:7`

## Accessibility

- `as` determines the rendered tag (`<h1>`–`<h6>`). Pick the right LEVEL for the document outline, then size visually with `variant` — never use a smaller `as` for visual reasons.
- One `<h1>` per page; subsequent sections start at `<h2>`. SR users navigate by heading level.

## Best Practices

- Pair `as` (semantic) with `variant` (visual) independently — they decouple meaning from appearance. `dist/Heading/Heading.d.ts:5-6`
- `variant` accepts `'large' | 'medium' | 'small'` only — there is NO `'display'` or `'xlarge'`. `dist/Heading/Heading.d.ts:6`
- `as` accepts `'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'` only — `as="div"` and `as="span"` do not exist on Heading. `dist/Heading/Heading.d.ts:3`

## Composition examples

```tsx
import { Heading, Stack, Text } from '@primer/react'

export function SectionHeader() {
  return (
    <Stack direction="vertical" gap="condensed">
      <Heading as="h2" variant="medium">Recent activity</Heading>
      <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
        Last 30 days
      </Text>
    </Stack>
  )
}
```

## Source references

- `node_modules/@primer/react/dist/Heading/Heading.d.ts:1-11` — `HeadingProps`, `HeadingLevels`
- Upstream: `primer/react@main:packages/react/src/Heading/Heading.tsx`

## Common mistakes

- `<Heading as="div">` — not a union member; the union is `'h1' | 'h2' | ... | 'h6'`.
- `<Heading variant="display">` — not a union member; values are `'large' | 'medium' | 'small'`.
- Picking `as="h3"` because it "looks the right size" — use `variant` for size; `as` is semantic.

## Things to never invent

- Props not listed under "Key props".
- `as` values outside the six heading levels.
- `variant` values outside `'large' | 'medium' | 'small'`.
