---
title: Textarea
description: Multi-line text input with resize control, character-limit counter, and validation states
---

## Public imports

```tsx
import { Textarea } from '@primer/react'
```

## When to use

Pick `Textarea` for multi-line text entry (issue body, description, comment). For single-line entry use [TextInput](./text-input.md). Wrap in [FormControl](./form-control.md) to associate a Label, Caption, and Validation message.

## Key props

- `resize?: 'none' | 'both' | 'horizontal' | 'vertical'` — default `'both'`. `node_modules/@primer/react/dist/Textarea/Textarea.d.ts:5,26`
- `validationStatus?: 'error' | 'success'` (`FormValidationStatus`). `dist/Textarea/Textarea.d.ts:14`
- `block?: boolean` — fills horizontally. `dist/Textarea/Textarea.d.ts:18`
- `disabled?: boolean`. `dist/Textarea/Textarea.d.ts:11`
- `contrast?: boolean` — higher-contrast surface. `dist/Textarea/Textarea.d.ts:30`
- `className?: string` — applied to the wrapper element. `dist/Textarea/Textarea.d.ts:34`
- `minHeight?: number` / `maxHeight?: number` — bound the auto-resize. `dist/Textarea/Textarea.d.ts:38,42`
- `style?: React.CSSProperties`. `dist/Textarea/Textarea.d.ts:46`
- `characterLimit?: number` — shows a counter; exceeding it applies validation styling. `dist/Textarea/Textarea.d.ts:51`
- Native passthrough: `TextareaHTMLAttributes<HTMLTextAreaElement>` (value, placeholder, onChange, rows, cols, …). `dist/Textarea/Textarea.d.ts:53`
- Defaults: `DEFAULT_TEXTAREA_ROWS = 7`, `DEFAULT_TEXTAREA_COLS = 30`, `DEFAULT_TEXTAREA_RESIZE = "both"`. `dist/Textarea/Textarea.d.ts:5-7`

## Accessibility

- Associate a label by wrapping in `<FormControl>` and rendering `<FormControl.Label>` — see [FormControl](./form-control.md).
- `validationStatus="error"` wires ARIA so a paired `<FormControl.Validation variant="error">` is announced.

## Best Practices

- `validationStatus` accepts `'error' | 'success'` only — there is NO `'warning'` value. For warnings, use a sibling [Flash](./flash.md) `variant="warning"`. `dist/utils/types/FormValidationStatus.d.ts`
- Use `characterLimit` to get the counter + over-limit validation styling automatically. `dist/Textarea/Textarea.d.ts:51`
- The default `resize='both'` allows user resizing in both directions; pass `resize='vertical'` for the typical issue-body pattern (height grows, width is layout-controlled). `dist/Textarea/Textarea.d.ts:26`
- `resize='auto'` DOES NOT EXIST. Use `'none' | 'both' | 'horizontal' | 'vertical'` only. `dist/Textarea/Textarea.d.ts:26`

## Composition examples

```tsx
import { FormControl, Textarea } from '@primer/react'

export function IssueBodyField({ value, onChange }: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <FormControl>
      <FormControl.Label>Description</FormControl.Label>
      <Textarea
        resize="vertical"
        characterLimit={2000}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        block
      />
    </FormControl>
  )
}
```

## Source references

- `node_modules/@primer/react/dist/Textarea/Textarea.d.ts:1-90` — `TextareaProps`
- `node_modules/@primer/react/dist/utils/types/FormValidationStatus.d.ts` — validation status union
- Upstream: `primer/react@main:packages/react/src/Textarea/Textarea.tsx`

## Common mistakes

- `<Textarea validationStatus="warning">` — not a union member; the only values are `'error' | 'success'`.
- `<Textarea resize="auto">` — not a union member; use `'none' | 'both' | 'horizontal' | 'vertical'`.

## Things to never invent

- Props not listed under "Key props".
- `validationStatus="warning"` — does not exist.
- A `resize="auto"` mode — pick `'vertical'` for the typical grow-on-content layout via `minHeight` and a user-resizable height.
