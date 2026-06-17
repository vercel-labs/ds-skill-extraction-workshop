---
title: TextInput
description: Single-line text input with leading/trailing visual slots, loading indicator, and validation states
---

## Public imports

```tsx
import { TextInput } from '@primer/react'
```

## When to use

Pick `TextInput` for single-line text entry (search, repo name, email). For multi-line input use [Textarea](./textarea.md). For boolean input use [Checkbox](./checkbox.md). Wrap in [FormControl](./form-control.md) to associate a Label, Caption, and Validation message.

## Key props

- `loading?: boolean` — renders a spinner inside the input. `node_modules/@primer/react/dist/TextInput/TextInput.d.ts:9`
- `loaderPosition?: 'auto' | 'leading' | 'trailing'` — default `'auto'` (trailing unless a `leadingVisual` is present). `dist/TextInput/TextInput.d.ts:16` `dist/TextInput/TextInput.d.ts:12`
- `loaderText?: string` — SR-announced loading text. `dist/TextInput/TextInput.d.ts:18`
- `leadingVisual?: ElementType | ReactNode` — icon or node before the typing area. `dist/TextInput/TextInput.d.ts:22`
- `trailingVisual?: ElementType | ReactNode` — icon or node after the typing area. `dist/TextInput/TextInput.d.ts:26`
- `trailingAction?: ReactElement<HTMLProps<HTMLButtonElement>>` — clickable trailing affordance (e.g. clear). `dist/TextInput/TextInput.d.ts:30`
- `characterLimit?: number` — shows a counter; exceeding it applies validation styling. `dist/TextInput/TextInput.d.ts:35`
- `block?: boolean` — fills horizontally. `dist/TextInput/TextInput.d.ts:36` (via `StyledWrapperProps`)
- `monospace?: boolean` — monospace font. `dist/TextInput/TextInput.d.ts:36`
- `size?: 'small' | 'medium' | 'large'` — default `'medium'` — `size` has no explicit default; omitting it renders the base wrapper (the medium scale). `dist/TextInput/TextInput.d.ts:36` + `dist/internal/components/TextInputWrapper.js:135`
- `validationStatus?: 'error' | 'success'` (`FormValidationStatus`) — visual + ARIA validation state. `dist/utils/types/FormValidationStatus.d.ts`
- `contrast?: boolean` — higher-contrast surface. `dist/TextInput/TextInput.d.ts:36`
- `disabled?: boolean` — native disabled. `dist/TextInput/TextInput.d.ts:36`
- Native passthrough: `React.ComponentPropsWithoutRef<'input'>` (value, placeholder, onChange, type, name, …). `dist/TextInput/TextInput.d.ts:37`
- `icon?: ElementType` — **DEPRECATED**, use `leadingVisual` or `trailingVisual`. `dist/TextInput/TextInput.d.ts:6-7`

## Accessibility

- Associate a label by wrapping in `<FormControl>` and rendering `<FormControl.Label>` — see [FormControl](./form-control.md).
- `validationStatus="error"` applies error styling AND wires ARIA so a paired `<FormControl.Validation variant="error">` is announced as the error message. `dist/utils/types/FormValidationStatus.d.ts`
- Set `loaderText` when `loading={true}` so the busy state is announced. `dist/TextInput/TextInput.d.ts:18`

## Best Practices

- Use `leadingVisual` / `trailingVisual`, NOT the deprecated `icon` prop. `dist/TextInput/TextInput.d.ts:6-7,22,26`
- `loaderPosition='auto'` is the right default — it puts the spinner opposite the visual to avoid overlap. `dist/TextInput/TextInput.d.ts:16`
- `validationStatus` accepts `'error' | 'success'` only — there is NO `'warning'` value. For warnings, use a sibling [Flash](./flash.md) `variant="warning"`. `dist/utils/types/FormValidationStatus.d.ts`
- `characterLimit` automatically renders the counter and the over-limit validation state. Do not roll your own counter. `dist/TextInput/TextInput.d.ts:35`
- For a clear button inside the input, use `trailingAction` (a `<button>` element), not a `trailingVisual` icon — visuals are decorative; actions are interactive. `dist/TextInput/TextInput.d.ts:26,30`

## Composition examples

```tsx
import { FormControl, TextInput } from '@primer/react'
import { SearchIcon } from '@primer/octicons-react'

export function SearchField({ value, onChange, busy }: {
  value: string
  onChange: (v: string) => void
  busy: boolean
}) {
  return (
    <FormControl>
      <FormControl.Label>Search repositories</FormControl.Label>
      <TextInput
        leadingVisual={SearchIcon}
        loading={busy}
        loaderText="Searching"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="owner/repo"
        block
      />
    </FormControl>
  )
}
```

## Source references

- `node_modules/@primer/react/dist/TextInput/TextInput.d.ts:1-37` — `TextInputNonPassthroughProps`, `TextInputProps`
- `node_modules/@primer/react/dist/utils/types/FormValidationStatus.d.ts` — validation status union
- Upstream: `primer/react@main:packages/react/src/TextInput/TextInput.tsx`

## Common mistakes

- `<TextInput validationStatus="warning">` — not a union member; the only values are `'error' | 'success'`.
- `<TextInput icon={SearchIcon}>` — deprecated. Use `leadingVisual={SearchIcon}`.
- `<TextInput><MyClearButton /></TextInput>` — TextInput does not render children. Pass the clear button via `trailingAction`.
- `<TextInput loaderPosition="middle">` — not a union member; allowed values are `'auto' | 'leading' | 'trailing'`.

## Things to never invent

- Props not listed under "Key props".
- `validationStatus="warning"` — does not exist; the union is `'error' | 'success'`.
- A `multiline` prop — for multi-line input use [Textarea](./textarea.md).
- A `value`/`onChange` "controlled" layer beyond the native passthrough — TextInput is a native-input wrapper.
