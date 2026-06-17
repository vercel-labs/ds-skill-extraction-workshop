---
title: Button
description: Action trigger with variant/size/loading/inactive states and leading/trailing visual slots
---

## Public imports

```tsx
import { Button } from '@primer/react'
```

## When to use

Pick `Button` for any action a user takes (submit, save, navigate, dismiss). For icon-only triggers, switch to [IconButton](./icon-button.md) — Button always renders visible text. Buttons that need a count badge use the `count` prop; do not append a sibling `<CounterLabel />`.

## Key props

- `variant?: 'default' | 'primary' | 'invisible' | 'danger' | 'link'` — visual emphasis; default `'default'`. `node_modules/@primer/react/dist/Button/types.d.ts:4,18` `dist/Button/ButtonBase.js:36`
- `size?: 'small' | 'medium' | 'large'` — default `'medium'`. `dist/Button/types.d.ts:5,22` `dist/Button/ButtonBase.js:37`
- `loading?: boolean` — busy state; renders a spinner and keeps the button focusable. `dist/Button/types.d.ts:35`
- `loadingAnnouncement?: string` — text screen readers announce when `loading` is true. `dist/Button/types.d.ts:39`
- `inactive?: boolean` — visually-disabled-looking but focusable (preferred over `disabled` for keyboard a11y). `dist/Button/types.d.ts:40`
- `disabled?: boolean` — native disabled. Prefer `inactive` when the goal is "looks inactive". `dist/Button/types.d.ts:27`
- `block?: boolean` — fills container horizontally. `dist/Button/types.d.ts:31`
- `leadingVisual?: ElementType | ReactElement | null` — icon before text. `dist/Button/types.d.ts:58`
- `trailingVisual?: ElementType | ReactElement | null` — icon after text. `dist/Button/types.d.ts:62`
- `count?: number | string` — appended count badge (e.g. `42`). `dist/Button/types.d.ts:69`
- `alignContent?: 'start' | 'center'` — content alignment when visuals are present. `dist/Button/types.d.ts:50`
- Native passthrough: `React.ButtonHTMLAttributes<HTMLButtonElement>` (`onClick`, `type`, `name`, …). `dist/Button/types.d.ts:45`

## Accessibility

- Buttons rendering visible children get their accessible name from the text node; do NOT also pass `aria-label` (duplicate announcement).
- When `loading={true}`, set `loadingAnnouncement` to text screen readers announce as the busy state — keeps the user informed without a polite-region toast. `dist/Button/types.d.ts:39`
- `inactive` is the keyboard-accessible "disabled-look" — the button stays in tab order and can be focused. Reach for `disabled` only when the action truly cannot be performed by anyone right now (form-level invalid state, missing permission). `dist/Button/types.d.ts:27,40`

## Best Practices

- Use `loading={true}` instead of replacing children with a spinner — Button keeps focus and announces the busy state via `loadingAnnouncement`. `dist/Button/types.d.ts:35,39`
- Prefer `inactive` over `disabled` when the button should "look disabled" but stay reachable by keyboard. `dist/Button/types.d.ts:27,40`
- Use `leadingVisual` / `trailingVisual` (as `ElementType` like `PlusIcon`) instead of placing icons inside `children` — the visual slots reserve consistent inline space. `dist/Button/types.d.ts:58,62`
- For a count badge inside the Button surface, set `count={N}` — do not append `<CounterLabel />` as a sibling. `dist/Button/types.d.ts:69`
- `variant="danger"` exists; `variant="secondary"` and `variant="warning"` DO NOT — the union is `default | primary | invisible | danger | link`. `dist/Button/types.d.ts:4`

## Composition examples

```tsx
import { Button } from '@primer/react'
import { PlusIcon } from '@primer/octicons-react'

export function SaveButton({ onSave, busy }: { onSave: () => void; busy: boolean }) {
  return (
    <Button
      variant="primary"
      leadingVisual={PlusIcon}
      loading={busy}
      loadingAnnouncement="Saving repository"
      onClick={onSave}
    >
      Create repository
    </Button>
  )
}
```

## Source references

- `node_modules/@primer/react/dist/Button/types.d.ts:4-72` — `VariantType`, `Size`, `ButtonBaseProps`, `ButtonProps`
- `node_modules/@primer/react/dist/Button/Button.d.ts` — forwarded ref component
- Upstream: `primer/react@main:packages/react/src/Button/Button.tsx`

## Common mistakes

- `<Button variant="warning">` — not a union member; use [Flash](./flash.md) `variant="warning"` for a banner instead.
- `<Button size="xs">` — not a union member; the d.ts exports `small | medium | large`.
- `<Button>{busy ? <Spinner /> : 'Save'}</Button>` — use `loading={busy}` so screen readers announce the busy state and focus stays on the button.
- `<Button aria-label="Save" >Save</Button>` — duplicate accessible name; remove `aria-label` when visible text exists.

## Things to never invent

- Props not listed under "Key props".
- Variant values outside `'default' | 'primary' | 'invisible' | 'danger' | 'link'`.
- A `size="xs"` (or `xl`) variant.
- A `variant="secondary"` — Primer Button does not ship one. Use `variant="default"` for low-emphasis actions and `variant="invisible"` for chrome-less buttons.
