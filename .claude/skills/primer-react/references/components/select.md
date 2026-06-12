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

- `placeholder?: string` — adds a leading option AND doubles as the implicit default value (see Best Practices). `node_modules/@primer/react/dist/Select/Select.d.ts:4`
- `defaultValue?: string` (native passthrough) — uncontrolled initial value; DOES propagate to the native `<select>` (`defaultValue ?? placeholder ?? undefined` is forwarded). `dist/Select/Select.js:133,158`
- `required?: boolean` (native passthrough) — also gates whether the placeholder option is selectable (see Best Practices). `dist/Select/Select.js:135-141`
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

- **`placeholder` and `defaultValue` are a coupled pair, not independent props.** The implementation computes the native default as `defaultValue ?? placeholder ?? undefined` and forwards it onto the `<select>` — a `placeholder` alone IS the initial selection, and the placeholder `<option value="">` is only `disabled`/`hidden` when `required` is set. Without `required`, the user can re-select the empty placeholder option and submit `""`. An explicit `defaultValue` overrides the placeholder as the initial value. `dist/Select/Select.js:133,135-141,158`
- `defaultValue` propagation is CONFIRMED in the implementation, so uncontrolled Select is sound; still prefer controlled `value` + `onChange` whenever the selection drives other UI — a controlled Select keeps React state and the native element from diverging. `dist/Select/Select.js:133,158`
- Provide a `placeholder` for unselected initial state — it renders a leading option that reads as "Choose …"; pair it with `required` if the empty value must not be submittable. `dist/Select/Select.d.ts:4` + `dist/Select/Select.js:135-141`
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

Uncontrolled form — sound because `defaultValue` propagation is confirmed (`dist/Select/Select.js:133,158`); mind the placeholder/`required` interaction when you use it:

```tsx
import { FormControl, Select } from '@primer/react'

export function ThemePreference() {
  return (
    <FormControl>
      <FormControl.Label>Theme</FormControl.Label>
      {/* defaultValue overrides placeholder as the initial value
          (defaultValue ?? placeholder — dist/Select/Select.js:133,158) */}
      <Select block defaultValue="system">
        <Select.Option value="system">Sync with system</Select.Option>
        <Select.Option value="light">Light</Select.Option>
        <Select.Option value="dark">Dark</Select.Option>
      </Select>
    </FormControl>
  )
}
```

## Source references

- `node_modules/@primer/react/dist/Select/Select.d.ts:1-14` — `SelectProps`, `Select.Option`, `Select.OptGroup`
- `node_modules/@primer/react/dist/Select/Select.js:133,135-141,158` — `defaultValue ?? placeholder` computation, `required`-gated placeholder option, native forward
- `node_modules/@primer/react/dist/utils/types/FormValidationStatus.d.ts` — validation status union
- Upstream: `primer/react@main:packages/react/src/Select/Select.tsx`

## Common mistakes

- `<Select placeholder="Choose">` without `required`, expecting the placeholder to be non-selectable — the placeholder option is only `disabled`/`hidden` when `required` is set; otherwise the user can re-select it and submit `""`. `dist/Select/Select.js:135-141`
- `<Select multiple>` — explicitly omitted from `SelectProps` (`Omit<..., 'multiple'>`); use `SelectPanel` (not in this slate) for multi-select.
- `<Select variant="invisible">` — `variant` is omitted from Select's `StyledWrapperProps`; it's not part of the API.
- `<Select validationStatus="warning">` — not a union member.

## Things to never invent

- Props not listed under "Key props" — Select is a deliberately narrow surface (`Omit` is applied to multiple `StyledWrapperProps` fields).
- A `multiple` prop — explicitly omitted.
- A `variant` or `contrast` prop — explicitly omitted.
- A non-selectable placeholder without `required` — selectability is gated by `required`, not by the placeholder itself.
- Custom item rendering — for that, use `SelectPanel` (not in this skill's slate).
