---
title: CounterLabel
description: Numeric count badge; use variant — scheme is deprecated in its favor.
---

# CounterLabel

- package: `@primer/react`
- version: `38.26.0`

## Public imports

`import { CounterLabel } from '@primer/react'`

## When to use

Use CounterLabel for numeric counts beside headings, tabs, or section titles (issue counts, item totals). For non-numeric metadata badges use [Label](./label.md); for lifecycle states use [StateLabel](./state-label.md).

## Key props

- `variant` — `'primary' | 'secondary'` (node_modules/@primer/react/dist/CounterLabel/CounterLabel.d.ts:6)
- `scheme` — DEPRECATED: "use variant instead" (CounterLabel.d.ts:4-5)
- children — the count value, e.g. `<CounterLabel>{items.length}</CounterLabel>` (CounterLabel.d.ts:3)

## Best Practices

- Use `variant`, never the deprecated `scheme` (CounterLabel.d.ts:4-6).
- Pair CounterLabel with a [Label](./label.md) in section-header badge clusters — metadata badge plus count, right-aligned in a horizontal [Stack](./stack.md) (lifted from `references/examples/dashboard.md`).

## Composition examples

Lifted from vercel-labs/primer-nextjs-template/app/dashboard/page.tsx:

```tsx
import { CounterLabel, Label, Stack } from "@primer/react";

<Stack direction="horizontal" gap="condensed" align="center">
  <Label variant="accent">Last 7 days</Label>
  <CounterLabel>{ACTIVITY.length}</CounterLabel>
</Stack>
```

## Source references

- `node_modules/@primer/react/dist/CounterLabel/CounterLabel.d.ts` — published prop types
- `primer/react` @ main: `packages/react/src/CounterLabel/CounterLabel.docs.json` + `CounterLabel.stories.tsx`

## Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<CounterLabel scheme="secondary">` | `<CounterLabel variant="secondary">` | `scheme` is deprecated (CounterLabel.d.ts:4-5) |
| `<CounterLabel variant="accent">` | `<CounterLabel variant="primary">` or `"secondary"` | the enum is two values; `accent` belongs to Label (CounterLabel.d.ts:6) |

## Things to never invent

- Props not listed under "Key props".
- `variant` values outside `'primary' | 'secondary'` — Label's richer enum does not transfer.
- Sibling components not present in the in-scope set.
