---
title: Stack
description: Flex layout primitive with a named gap/padding scale, responsive values, and a Stack.Item child for grow/shrink control.
---

# Stack

- package: `@primer/react`
- version: `38.26.0`

## Public imports

`import { Stack } from '@primer/react'`

## When to use

Use Stack for one-dimensional layout — vertical sections, horizontal rows, gaps between siblings. It replaces ad-hoc flex CSS. Every spacing decision goes through the named gap scale, never pixel margins between siblings.

## Key props

- `gap` — `'none' | 'tight' | 'condensed' | 'cozy' | 'normal' | 'spacious'`, or a responsive value (node_modules/@primer/react/dist/Stack/Stack.d.ts:5-6,25)
- `direction` — `'horizontal' | 'vertical'`; default `vertical` (Stack.d.ts:7-8,26-30)
- `align` — `'stretch' | 'start' | 'center' | 'end' | 'baseline'`; default `stretch`; cross-axis alignment (Stack.d.ts:9-10,31-35)
- `wrap` — `'wrap' | 'nowrap'`; default `nowrap` (Stack.d.ts:11-12,36-40)
- `justify` — `'start' | 'center' | 'end' | 'space-between' | 'space-evenly'`; default `start` (Stack.d.ts:13-14,41-45)
- `padding` / `paddingBlock` / `paddingInline` — same named scale as `gap`; default `none`; the axis-specific props override `padding` on their axis (Stack.d.ts:15-16,46-60)
- `as` — polymorphic element override (Stack.d.ts:21)
- `Stack.Item` — child wrapper with `grow` (default `false`) and `shrink` (default `true`) (Stack.d.ts:64-81)

## Best Practices

- Gap values come from the named scale — `gap="condensed"` for icon-beside-text rows, `gap="normal"` for form rows, `gap="spacious"` between page sections (lifted from `references/examples/home.md`, `references/examples/new.md`, `references/examples/dashboard.md`).
- Section headers are a horizontal Stack with `justify="space-between"`: heading left, badge cluster right (lifted from `references/examples/dashboard.md`).
- Responsive card rows combine `direction="horizontal"` + `wrap="wrap"` with flex-basis on children (lifted from `references/examples/dashboard.md`).
- Wrap semantic lists in `<ul>`/`<li>` with Stack handling spacing so the list reads as a list to assistive tech (lifted from `references/examples/home.md`).

## Composition examples

Lifted from vercel-labs/primer-nextjs-template/app/page.tsx (nested Stack pair):

```tsx
import { Stack, Heading, Text } from "@primer/react";

<Stack direction="horizontal" gap="condensed" align="center">
  <RouteIcon size={16} />
  <Stack direction="vertical" gap="none">
    <Heading as="h2" variant="small">{route.title}</Heading>
    <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
      {route.description}
    </Text>
  </Stack>
</Stack>
```

## Source references

- `node_modules/@primer/react/dist/Stack/Stack.d.ts` — published prop types + defaults
- `primer/react` @ main: `packages/react/src/Stack/Stack.docs.json` + `Stack.stories.tsx`

## Common mistakes

| Bad | Good | Why |
|---|---|---|
| `gap="large"` | `gap="spacious"` | the gap scale is named, not sized (Stack.d.ts:5) |
| `justify="space-around"` | `justify="space-between"` or `"space-evenly"` | `space-around` is not in the justify enum (Stack.d.ts:13) |
| `style={{ marginBottom: 16 }}` on each child | parent `<Stack gap="normal">` | the gap scale keeps rhythm; per-child margins drift off-grid |

## Things to never invent

- Props not listed under "Key props".
- `gap`/`padding` values outside the named scale — there is no `large`, `small`, or numeric gap.
- `justify` values outside the enum — there is no `space-around`.
- Sibling components not present in the in-scope set.
