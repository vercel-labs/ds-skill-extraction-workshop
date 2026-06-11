---
title: Button
description: Action trigger with variant/size/loading/inactive states, leading/trailing visual slots, and an optional count badge.
---

# Button

- package: `@primer/react`
- version: `38.26.0`

## Public imports

`import { Button } from '@primer/react'`

## When to use

Use Button for actions (submit, create, cancel, toggle). For icon-only actions use [IconButton](./icon-button.md) — a Button with only an icon child has no accessible name. For numeric badges next to a section heading use [CounterLabel](./counter-label.md), not Button's `count` prop (that prop is for counts inside the button itself).

## Key props

- `variant` — `'default' | 'primary' | 'invisible' | 'danger' | 'link'`; styles the button (node_modules/@primer/react/dist/Button/types.d.ts:4,18)
- `size` — `'small' | 'medium' | 'large'`; sizes button and font (types.d.ts:5,22)
- `disabled` — disables the button; the types warn: "Avoid disabling buttons because it will make them inaccessible to users who rely on keyboard navigation" (types.d.ts:24-27)
- `block` — fill the container horizontally (types.d.ts:31)
- `loading` — loading state; pairs with `loadingAnnouncement` for the screen-reader announcement (types.d.ts:35,39)
- `inactive` — inactive visual appearance, stays focusable (types.d.ts:40)
- `labelWrap` — allow the label to wrap to multiple lines (types.d.ts:44)
- `alignContent` — `'start' | 'center'` content alignment when visuals are present (types.d.ts:6,50)
- `leadingVisual` / `trailingVisual` — element rendered before/after the content; pass the octicon component reference, e.g. `leadingVisual={PlusIcon}` (types.d.ts:58,62)
- `trailingAction` — always the last element in the button (types.d.ts:67)
- `count` — `number | string` count rendered inside the button (types.d.ts:69)

## Best Practices

- Use `loading` for busy states, never a custom spinner in `children` — the prop announces the busy state via `loadingAnnouncement` (node_modules/@primer/react/dist/Button/types.d.ts:33-39).
- Prefer `inactive` over `disabled` when the action is temporarily unavailable — disabled buttons "cannot be clicked, selected, or navigated through" by keyboard users (types.d.ts:24-26).
- Pass visuals as component references (`leadingVisual={PlusIcon}`), not elements — lifted from the repos exemplar (`references/examples/repos.md`).
- Action footers order `variant="invisible"` Cancel before `variant="primary"` submit, right-aligned in a horizontal [Stack](./stack.md) `justify="end"` — lifted from the new exemplar (`references/examples/new.md`).

## Composition examples

Lifted from vercel-labs/primer-nextjs-template/app/new/page.tsx (form action footer):

```tsx
import { Button, Stack } from "@primer/react";

<Stack direction="horizontal" gap="condensed" justify="end">
  <Button variant="invisible">Cancel</Button>
  <Button variant="primary">Create repository</Button>
</Stack>
```

## Source references

- `node_modules/@primer/react/dist/Button/types.d.ts` — published prop types
- `primer/react` @ main: `packages/react/src/Button/Button.docs.json` — machine-readable prop table
- `primer/react` @ main: `packages/react/src/Button/Button.stories.tsx` — canonical stories

## Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<Button variant="secondary">` | `<Button variant="default">` | `secondary` is not in the variant enum (types.d.ts:4) |
| `<Button size="xs">` | `<Button size="small">` | size enum is `small \| medium \| large` only (types.d.ts:5) |
| `<Button disabled={isLoading}>` + custom spinner | `<Button loading={isLoading}>` | `loading` keeps focus and announces busy state (types.d.ts:33-39) |

## Things to never invent

- Props not listed under "Key props".
- `variant` values outside `'default' | 'primary' | 'invisible' | 'danger' | 'link'` — there is no `secondary`, `outline`, or `ghost`.
- `size` values outside `'small' | 'medium' | 'large'` — there is no `xs` or `xl`.
- Sibling components not present in the in-scope set.
