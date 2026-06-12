---
title: Stack
description: Flexbox layout primitive with named gap/direction/align/justify scales and a polymorphic `as`
---

## Public imports

```tsx
import { Stack, StackItem } from '@primer/react'
```

## When to use

Pick `Stack` for ANY row/column layout. It is the only Primer-native layout primitive in this slate. For grid layouts, use a CSS grid in `style` — Stack does not cover grids. Reach for `<StackItem>` only when you need a child to opt into `grow` / `shrink` behavior individually.

## Key props (Stack)

- `as?: ElementType` — polymorphic; defaults to `'div'`. `node_modules/@primer/react/dist/Stack/Stack.d.ts:18-22` `dist/Stack/Stack.js:64`
- `gap?: 'none' | 'tight' | 'condensed' | 'cozy' | 'normal' | 'spacious'` — named scale (or responsive object). `dist/Stack/Stack.d.ts:25`
- `direction?: 'horizontal' | 'vertical'` — default `'vertical'`. `dist/Stack/Stack.d.ts:28-30`
- `align?: 'stretch' | 'start' | 'center' | 'end' | 'baseline'` — cross-axis; default `'stretch'`. `dist/Stack/Stack.d.ts:33-35`
- `wrap?: 'wrap' | 'nowrap'` — default `'nowrap'`. `dist/Stack/Stack.d.ts:38-40`
- `justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-evenly'` — main-axis; default `'start'`. `dist/Stack/Stack.d.ts:43-45`
- `padding?: 'none' | 'tight' | 'condensed' | 'cozy' | 'normal' | 'spacious'` — default `'none'`. `dist/Stack/Stack.d.ts:48-50`
- `paddingBlock?` / `paddingInline?` — axis-specific padding override. `dist/Stack/Stack.d.ts:55,60`
- `className?: string`. `dist/Stack/Stack.d.ts:61`

## Key props (StackItem)

- `as?: ElementType` — polymorphic. `dist/Stack/Stack.d.ts:67-71`
- `grow?: boolean` — default `false`. `dist/Stack/Stack.d.ts:71-73`
- `shrink?: boolean` — default `true`. `dist/Stack/Stack.d.ts:76-78`

## Accessibility

- Stack is a layout primitive — it carries no roles or ARIA. Use `as="ul"` or `as="section"` for semantic wrappers when the container has list/landmark meaning.

## Best Practices

- Direction is `'horizontal' | 'vertical'`, NOT `'row' | 'column'`. `dist/Stack/Stack.d.ts:30`
- The gap scale is `'none' | 'tight' | 'condensed' | 'cozy' | 'normal' | 'spacious'`. There is NO `'xs'`, `'sm'`, `'md'`, `'lg'`, or `'xl'`. `dist/Stack/Stack.d.ts:25`
- The justify scale is `'start' | 'center' | 'end' | 'space-between' | 'space-evenly'`. There is NO `'space-around'`. `dist/Stack/Stack.d.ts:45`
- **Do not rely on a horizontal Stack's `align="end"` (or `align="center"`) to line up two form controls when one has a caption and the other does not** — Stack aligns BOXES, not baselines, so the captioned control's label rides up while the caption-less control's input sits low. Align on `start` and equalize with an explicit spacer, or give both controls a caption slot ([FormControl](./form-control.md) carries the same rule — the trap is reachable from either side). `dist/Stack/Stack.d.ts:35`
- Use `gap="none"` for tight title/description pairs where the two lines should sit on adjacent baselines. `dist/Stack/Stack.d.ts:25`
- Use `gap="condensed"` for icon + text inline pairs. (matches `home.tsx` exemplar in this skill's references/examples.)
- Use `gap="spacious"` for top-level page sections.
- Stack supports responsive values (e.g. `gap={{ narrow: 'condensed', wide: 'normal' }}`); see `ResponsiveValue` in the d.ts. `dist/Stack/Stack.d.ts:3`

## Composition examples

```tsx
import { Stack } from '@primer/react'

export function RepoCardRow({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Stack direction="horizontal" gap="condensed" align="center">
      {icon}
      <Stack direction="vertical" gap="none">
        <strong>{title}</strong>
        <span style={{ color: 'var(--fgColor-muted)' }}>{description}</span>
      </Stack>
    </Stack>
  )
}
```

## Source references

- `node_modules/@primer/react/dist/Stack/Stack.d.ts:1-84` — `StackProps`, `StackItemProps`
- Upstream: `primer/react@main:packages/react/src/Stack/Stack.tsx`

## Common mistakes

- `<Stack direction="row">` — not a union member; use `direction="horizontal"`.
- `<Stack gap="xs">` — not a union member; the scale is the named one above.
- `<Stack justify="around">` or `<Stack justify="space-around">` — not a union member; use `space-evenly`.
- `<Stack align="middle">` — not a union member; use `align="center"`.
- `<Stack direction="horizontal" align="end">` over a captioned [FormControl](./form-control.md) beside a caption-less one — labels misalign because Stack aligns boxes, not baselines.

## Things to never invent

- Props not listed under "Key props".
- A `'row' | 'column'` direction — the union is `'horizontal' | 'vertical'`.
- A T-shirt gap scale (`xs/sm/md/lg/xl`) — the scale is the named one.
- `justify="space-around"` — does not exist; `space-evenly` is the closest member.
