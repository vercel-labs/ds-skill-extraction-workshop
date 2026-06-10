---
title: CounterLabel
description: Numeric counter badge for counts next to a heading or nav item.
---

## Public imports

`import { CounterLabel } from "@/ds/components/CounterLabel"` (project wrapper) — equivalent to `import { CounterLabel } from "@primer/react"`.

## When to use

Use `CounterLabel` to show a count (items, results, notifications) — it wraps the number. For a text status or qualifier pill, use [Label](./label.md). The two pair naturally: a `Label` for the qualifier text beside a `CounterLabel` for the count.

## Key props

- `children` — the numeric value to display. (used at `references/examples/dashboard.md`)

## Best Practices

No special rules — use the API as documented.

## Composition examples

```tsx
import { CounterLabel } from "@/ds/components/CounterLabel";

export function ResultCount({ count }: { count: number }) {
  return <CounterLabel>{count}</CounterLabel>;
}
```

## Source references

- `ds/components/CounterLabel.tsx:1-7` — wrapper re-export
- `@primer/react@38.26.0` — `CounterLabel` published types (verified via Phase 2 typecheck)

## Common mistakes

- Using `CounterLabel` for non-numeric text → use `Label`.

## Things to never invent

- A `variant` API unless confirmed in the `@primer/react` `CounterLabel` types.
