---
title: Textarea
description: Multi-line text input with resize control, validation styling, character limit, and native textarea passthrough.
---

# Textarea

- package: `@primer/react`
- version: `38.26.0`

## Public imports

`import { Textarea } from '@primer/react'`

## When to use

Use Textarea for multi-line text entry (descriptions, bios, comments). For single-line entry use [TextInput](./text-input.md). Always wrap in [FormControl](./form-control.md) for label association.

## Key props

- `resize` — `'none' | 'both' | 'horizontal' | 'vertical'`; default is `"both"` (`DEFAULT_TEXTAREA_RESIZE`, node_modules/@primer/react/dist/Textarea/Textarea.d.ts:7,24)
- `block` — fill the container horizontally (Textarea.d.ts:20)
- `contrast` — high-contrast background (Textarea.d.ts:28)
- `validationStatus` — `'error' | 'success'` (Textarea.d.ts:16; dist/utils/types/FormValidationStatus.d.ts:1)
- `characterLimit` — renders a character counter below the textarea; exceeding it applies validation styling (Textarea.d.ts:46-49)
- `minHeight` / `maxHeight` — pixel bounds (Textarea.d.ts:36,40)
- `rows` / `cols` — native passthrough; defaults are `rows=7`, `cols=30` (`DEFAULT_TEXTAREA_ROWS`/`DEFAULT_TEXTAREA_COLS`, Textarea.d.ts:5-6)
- All native `<textarea>` attributes pass through (Textarea.d.ts:50)

## Best Practices

- Constrain user resizing with `resize="vertical"` in form layouts so the textarea cannot break the card width — lifted from the new exemplar (`references/examples/new.md`).
- Never render a Textarea outside a [FormControl](./form-control.md) — label association breaks (references/examples/new.md pattern; dist/FormControl/FormControl.d.ts:10-12).

## Composition examples

Lifted from vercel-labs/primer-nextjs-template/app/new/page.tsx:

```tsx
import { FormControl, Textarea } from "@primer/react";

<FormControl>
  <FormControl.Label>Description</FormControl.Label>
  <Textarea block rows={3} placeholder="Optional description" resize="vertical" />
</FormControl>
```

## Source references

- `node_modules/@primer/react/dist/Textarea/Textarea.d.ts` — published prop types and defaults
- `primer/react` @ main: `packages/react/src/Textarea/Textarea.docs.json` + `Textarea.stories.tsx`

## Common mistakes

| Bad | Good | Why |
|---|---|---|
| `resize="diagonal"` | `resize="vertical"` | resize enum is `none \| both \| horizontal \| vertical` (Textarea.d.ts:24) |
| `validationStatus="warning"` | `validationStatus="error"` or `"success"` | two-value union (FormValidationStatus.d.ts:1) |

## Things to never invent

- Props not listed under "Key props".
- `resize` values outside `'none' | 'both' | 'horizontal' | 'vertical'`.
- `validationStatus` values outside `'error' | 'success'`.
- Sibling components not present in the in-scope set.
