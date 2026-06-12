---
title: Select
description: Styled native `<select>` with placeholder, validation, and block-width control
---

## Public imports

```tsx
import { Select } from '@primer/react'
```

## When to use

Pick `Select` for short, fixed lists where the user picks ONE option. Primer Select is a styled native `<select>` — for multi-select, command-palette filtering, or custom item rendering, use `SelectPanel` (NOT in this skill's slate) or `ActionMenu` + `ActionList`. The native select is the right tier when the picker is short and a system-rendered dropdown is acceptable.

## Key props

- `placeholder?: string` — adds a non-selectable first option. `node_modules/@primer/react/dist/Select/Select.d.ts:4`
- `size?: 'small' | 'medium' | 'large'` (via `StyledWrapperProps`). `dist/Select/Select.d.ts:4`
- `block?: boolean` — fills horizontally. `dist/Select/Select.d.ts:4`
- `disabled?: boolean`. `dist/Select/Select.d.ts:4`
- `validationStatus?: 'error' | 'success'` (`FormValidationStatus`). `dist/Select/Select.d.ts:4`
- Native passthrough: `React.ComponentProps<'select'>` minus `size` (Primer reuses for visual size), `multiple`, `hasLeadingVisual`, `hasTrailingVisual`, `as` (`Omit<...>`). `dist/Select/Select.d.ts:4`
- Children: `<Select.Option value="x">…</Select.Option>` (HTMLOptionElement with `value: string`) and `<Select.OptGroup>` (HTMLOptGroupElement). `dist/Select/Select.d.ts:7-10`

## Accessibility

- The Select is a native `<select>` — the browser provides keyboard handling, focus ring, and SR semantics.
- Associate a label by wrapping in `<FormControl>` and rendering `<FormControl.Label>` — see [FormControl](./form-control.md).
- `validationStatus="error"` wires ARIA so a paired `<FormControl.Validation variant="error">` is announced.

## Best Practices

- Provide a `placeholder` for unselected initial state — it renders a leading, non-selectable option that reads as "Choose …". `dist/Select/Select.d.ts:4`
- `validationStatus` accepts `'error' | 'success'` only — no `'warning'`. For warnings, use a sibling [Flash](./flash.md). `dist/utils/types/FormValidationStatus.d.ts`
- `multiple` is explicitly OMITTED from the type — for multi-select use `SelectPanel` (not in this skill). `dist/Select/Select.d.ts:4`
- The `variant` and `contrast` props from `StyledWrapperProps` are explicitly OMITTED for Select — they exist on TextInput/Textarea but not here. `dist/Select/Select.d.ts:4`

## Composition examples

```tsx
import { FormControl, Select } from '@primer/react'

export function VisibilityPicker({ value, onChange }: {
  value: 'public' | 'private' | 'internal'
  onChange: (v: 'public' | 'private' | 'internal') => void
}) {
  return (
    <FormControl>
      <FormControl.Label>Repository visibility</FormControl.Label>
      <Select
        value={value}
        onChange={(e) =>
          onChange(e.target.value as 'public' | 'private' | 'internal')
        }
        placeholder="Choose visibility"
        block
      >
        <Select.Option value="public">Public</Select.Option>
        <Select.Option value="private">Private</Select.Option>
        <Select.Option value="internal">Internal</Select.Option>
      </Select>
    </FormControl>
  )
}
```

## Source references

- `node_modules/@primer/react/dist/Select/Select.d.ts:1-14` — `SelectProps`, `Select.Option`, `Select.OptGroup`
- `node_modules/@primer/react/dist/utils/types/FormValidationStatus.d.ts` — validation status union
- Upstream: `primer/react@main:packages/react/src/Select/Select.tsx`

## Common mistakes

- `<Select multiple>` — explicitly omitted from `SelectProps` (`Omit<..., 'multiple'>`); use `SelectPanel` (not in this slate) for multi-select.
- `<Select variant="invisible">` — `variant` is omitted from Select's `StyledWrapperProps`; it's not part of the API.
- `<Select validationStatus="warning">` — not a union member.

## Things to never invent

- Props not listed under "Key props" — Select is a deliberately narrow surface (`Omit` is applied to multiple `StyledWrapperProps` fields).
- A `multiple` prop — explicitly omitted.
- A `variant` or `contrast` prop — explicitly omitted.
- Custom item rendering — for that, use `SelectPanel` (not in this skill's slate).
