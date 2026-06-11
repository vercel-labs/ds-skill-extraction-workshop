---
title: Flash
description: Inline banner with a closed four-variant enum (default/warning/success/danger) and a full-width option.
---

# Flash

- package: `@primer/react`
- version: `38.26.0`

## Public imports

`import { Flash } from '@primer/react'`

## When to use

Use Flash for inline page-level or section-level context banners (notices, warnings, success confirmations). In form cards, the Flash sits as the first row inside the card, above the first field (lifted from `references/examples/new.md`). For per-field validation use `FormControl.Validation` via [FormControl](./form-control.md), not a Flash.

## Key props

- `variant` — `'default' | 'warning' | 'success' | 'danger'` (node_modules/@primer/react/dist/Flash/Flash.d.ts:5)
- `full` — full-width banner without rounded corners (Flash.d.ts:6)
- Native `<div>` props pass through (Flash.d.ts:3)

## Best Practices

- The variant enum is closed at four values — there is no `info`; informational banners use `variant="default"` (Flash.d.ts:5).
- Page-level context lives inside the surface it describes, above the first field (lifted from `references/examples/new.md`).

## Composition examples

Lifted from vercel-labs/primer-nextjs-template/app/new/page.tsx:

```tsx
import { Flash } from "@primer/react";

<Flash variant="default">
  You are creating this repository in your personal account.
</Flash>
```

## Source references

- `node_modules/@primer/react/dist/Flash/Flash.d.ts` — published prop types
- `primer/react` @ main: `packages/react/src/Flash/Flash.docs.json` + `Flash.stories.tsx`

## Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<Flash variant="info">` | `<Flash variant="default">` | `info` is not in the enum (Flash.d.ts:5) |
| Flash as a per-field error | `FormControl.Validation` | field-level validation belongs to the form wrapper (dist/FormControl/FormControl.d.ts:36) |

## Things to never invent

- Props not listed under "Key props".
- `variant` values outside `'default' | 'warning' | 'success' | 'danger'` — there is no `info` or `error`.
- A dismiss/close prop — Flash ships no built-in dismiss.
- Sibling components not present in the in-scope set.
