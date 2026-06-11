---
title: Select
description: Styled native single-select with Option/OptGroup subcomponents and a placeholder shim.
---

# Select

- package: `@primer/react`
- version: `38.26.0`

## Public imports

`import { Select } from '@primer/react'`

## When to use

Use Select for short fixed option lists where the native select UX fits (visibility pickers, theme pickers). Options are `Select.Option` children, never bare `<option>` arrays passed via props. Always wrap in [FormControl](./form-control.md) for label association. Note: `multiple` is explicitly omitted from the props — Select is single-select only (node_modules/@primer/react/dist/Select/Select.d.ts:4).

## Key props

- `placeholder` — renders as a disabled placeholder option (Select.d.ts:5)
- `block` / `disabled` / `size` (wrapper) / `validationStatus` — wrapper styling passthrough; `contrast` and `variant` are explicitly Omitted (Select.d.ts:4)
- `Select.Option` — requires `value: string` (Select.d.ts:9-11)
- `Select.OptGroup` — native optgroup passthrough (Select.d.ts:12)
- Native `<select>` attributes pass through, except `size` (HTML row-count) and `multiple` (Select.d.ts:4)

## Best Practices

- Never pass `contrast` to Select — unlike [TextInput](./text-input.md) and [Textarea](./textarea.md), the prop is Omitted from `SelectProps` (Select.d.ts:4).
- Every `Select.Option` carries an explicit `value` — it is required by the subcomponent type (Select.d.ts:9-11).

## Composition examples

Lifted from vercel-labs/primer-nextjs-template/app/new/page.tsx:

```tsx
import { FormControl, Select } from "@primer/react";

<FormControl>
  <FormControl.Label>Visibility</FormControl.Label>
  <Select block>
    <Select.Option value="public">Public</Select.Option>
    <Select.Option value="private">Private</Select.Option>
    <Select.Option value="internal">Internal</Select.Option>
  </Select>
  <FormControl.Caption>
    Anyone on the internet can see this repository when set to Public.
  </FormControl.Caption>
</FormControl>
```

## Source references

- `node_modules/@primer/react/dist/Select/Select.d.ts` — published prop types
- `primer/react` @ main: `packages/react/src/Select/Select.docs.json` + `Select.stories.tsx`

## Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<Select contrast>` | `<Select>` | `contrast` is Omitted from SelectProps (Select.d.ts:4) |
| `<Select multiple>` | a multi-select panel component outside this slate | `multiple` is Omitted — Select is single-select (Select.d.ts:4) |
| `<option value="x">` children | `<Select.Option value="x">` | the styled subcomponent is the contract (Select.d.ts:9-11) |

## Things to never invent

- Props not listed under "Key props".
- `contrast`, `variant`, `multiple`, or leading/trailing visual props — all explicitly Omitted (Select.d.ts:4).
- Sibling components not present in the in-scope set.
