---
title: CounterLabel
description: Numeric count badge for use next to a label or in a tab — `primary` or `secondary` color schemes
---

## Public imports

```tsx
import { CounterLabel } from '@primer/react'
```

## When to use

Pick `CounterLabel` for a numeric count next to a label, tab, or button (e.g. "Issues 14", "Pull requests 3"). For a count inside a [Button](./button.md) surface, use the Button's `count` prop instead — do not append a sibling CounterLabel. For a non-numeric metadata badge, use [Label](./label.md). For PR/issue lifecycle pills, use [StateLabel](./state-label.md).

## Key props

- `variant?: 'primary' | 'secondary'` — color scheme. `node_modules/@primer/react/dist/CounterLabel/CounterLabel.d.ts:6`
- `scheme?: 'primary' | 'secondary'` — **DEPRECATED**, use `variant`. `dist/CounterLabel/CounterLabel.d.ts:4`
- `className?: string`. `dist/CounterLabel/CounterLabel.d.ts:7`
- Native passthrough: `HTMLAttributes<HTMLSpanElement>` (renders a `<span>`). `dist/CounterLabel/CounterLabel.d.ts:3`

## Accessibility

- The count is rendered as text inside the `<span>` — SRs announce it like any other inline text. Pair with the labelled element (tab, button) so the SR reads label + count.

## Best Practices

- Use `variant`, NOT the deprecated `scheme`. `dist/CounterLabel/CounterLabel.d.ts:4-5`
- `variant` accepts `'primary' | 'secondary'` only — no `'danger'`, `'success'`, or other semantic colors. `dist/CounterLabel/CounterLabel.d.ts:6`
- For a count INSIDE a Button, use the Button's `count` prop — do NOT append a CounterLabel as a sibling. See [Button](./button.md). `dist/Button/types.d.ts:69`

## Composition examples

```tsx
import { CounterLabel } from '@primer/react'

export function TabLabel({ label, count }: { label: string; count: number }) {
  return (
    <span>
      {label} <CounterLabel variant="primary">{count}</CounterLabel>
    </span>
  )
}
```

## Source references

- `node_modules/@primer/react/dist/CounterLabel/CounterLabel.d.ts:1-20` — `CounterLabelProps`
- Upstream: `primer/react@main:packages/react/src/CounterLabel/CounterLabel.tsx`

## Common mistakes

- `<CounterLabel variant="danger">` — not a union member; values are `'primary' | 'secondary'`.
- `<CounterLabel scheme="primary">` — deprecated; use `variant`.

## Things to never invent

- Props not listed under "Key props".
- Variant values outside `'primary' | 'secondary'`.
- A `size` prop — CounterLabel doesn't ship one.
