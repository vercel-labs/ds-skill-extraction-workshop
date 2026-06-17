---
title: Flash
description: Inline banner alert with 4-value variant (default/warning/success/danger) and a full-width option
---

## Public imports

```tsx
import { Flash } from '@primer/react'
```

## When to use

Pick `Flash` for inline status messages tied to a section (a successful save, a warning above a destructive form, a danger alert at the top of a page). For per-input validation use [FormControl](./form-control.md) `<FormControl.Validation>`. For lifecycle state badges, use [StateLabel](./state-label.md).

## Key props

- `variant?: 'default' | 'warning' | 'success' | 'danger'` — default `'default'`. `dist/Flash/Flash.d.ts:5` `dist/Flash/Flash.js:36`
- `full?: boolean` — edge-to-edge (no rounded border-radius), for page-top banners. `dist/Flash/Flash.d.ts:6`
- `className?: string`. `dist/Flash/Flash.d.ts:4`
- Polymorphic on `<div>` (default). `dist/Flash/Flash.d.ts:8`
- Native passthrough: `React.ComponentPropsWithoutRef<'div'>`. `dist/Flash/Flash.d.ts:3`

## Accessibility

- Flash is a visual container — it has no built-in ARIA role. For SR-announced alerts (errors, warnings the user MUST notice), wrap in a `role="alert"` or `aria-live="polite"` region as appropriate to the urgency.

## Best Practices

- `variant` accepts `'default' | 'warning' | 'success' | 'danger'` only — there is NO `'info'` or `'error'`. For info, use `variant="default"`. For error contexts inside forms, use `<FormControl.Validation variant="error">`. `dist/Flash/Flash.d.ts:5`
- `full` is for edge-to-edge banners at the top of a page or section; omit it for inline contained alerts. `dist/Flash/Flash.d.ts:6`

## Composition examples

```tsx
import { Flash } from '@primer/react'
import { AlertIcon } from '@primer/octicons-react'

export function SecurityNotice() {
  return (
    <Flash variant="warning">
      <AlertIcon size={16} /> A security advisory affects this repository.
    </Flash>
  )
}
```

## Source references

- `node_modules/@primer/react/dist/Flash/Flash.d.ts:1-7` — `FlashProps`
- Upstream: `primer/react@main:packages/react/src/Flash/Flash.tsx`

## Common mistakes

- `<Flash variant="info">` — not a union member; use `variant="default"`.
- `<Flash variant="error">` — not a union member; use `variant="danger"`.

## Things to never invent

- Props not listed under "Key props".
- Variant values outside `'default' | 'warning' | 'success' | 'danger'`.
- A `dismissible` prop — Flash itself doesn't ship dismissal; wrap with your own close [IconButton](./icon-button.md) if needed.
