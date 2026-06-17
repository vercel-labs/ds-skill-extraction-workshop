---
title: Text
description: Inline text primitive with size + weight props; renders `<span>` by default
---

## Public imports

```tsx
import { Text } from '@primer/react'
```

## When to use

Pick `Text` for inline text needing a size or weight that differs from the surrounding context (helper text, secondary labels, captions). For semantic headings, use [Heading](./heading.md). For PR/issue lifecycle pills use [StateLabel](./state-label.md); for metadata badges use [Label](./label.md).

## Key props

- `as?: ElementType` — default `'span'`; polymorphic. `node_modules/@primer/react/dist/Text/Text.d.ts:3,17`
- `size?: 'large' | 'medium' | 'small'`. `dist/Text/Text.d.ts:4`
- `weight?: 'light' | 'normal' | 'medium' | 'semibold'`. `dist/Text/Text.d.ts:5`
- `className?: string`. `dist/Text/Text.d.ts:6`
- Native passthrough: props for the chosen `as` element. `dist/Text/Text.d.ts:8`

## Accessibility

- Default render is `<span>`. Use `as="p"` for block paragraph semantics; `as="strong"` for strong-emphasis semantics (SR pitch change). `dist/Text/Text.d.ts:3`

## Best Practices

- Text has NO semantic foreground variant — there is no `color="muted"` or `variant="muted"`. To muted-color a Text, pass `style={{ color: 'var(--fgColor-muted)' }}`. `dist/Text/Text.d.ts:1-20`
- `weight` accepts `'light' | 'normal' | 'medium' | 'semibold'` only — there is NO `'bold'`. `dist/Text/Text.d.ts:5`
- `size` accepts `'large' | 'medium' | 'small'` only — there is NO `'xs'` or `'xl'`. `dist/Text/Text.d.ts:4`

## Composition examples

```tsx
import { Heading, Stack, Text } from '@primer/react'

export function CardSummary() {
  return (
    <Stack direction="vertical" gap="none">
      <Heading as="h3" variant="small">Project Phoenix</Heading>
      <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
        Updated 2 hours ago by @octocat
      </Text>
    </Stack>
  )
}
```

## Source references

- `node_modules/@primer/react/dist/Text/Text.d.ts:1-20` — `TextProps`
- Upstream: `primer/react@main:packages/react/src/Text/Text.tsx`

## Common mistakes

- `<Text variant="muted">` — there is no `variant` prop on Text. Use `style={{ color: 'var(--fgColor-muted)' }}` instead.
- `<Text weight="bold">` — not a union member; use `weight="semibold"`.
- `<Text size="xs">` — not a union member; use `size="small"`.

## Things to never invent

- Props not listed under "Key props".
- A `variant` prop (Text has none).
- `weight="bold"` — does not exist; the heaviest value is `'semibold'`.
- `size="xs"` or `size="xl"` — do not exist.
