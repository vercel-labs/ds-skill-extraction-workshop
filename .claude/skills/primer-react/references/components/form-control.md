---
title: FormControl
description: Input wrapper that associates Label, Caption, and Validation with the input; the a11y backbone of every form row.
---

# FormControl

- package: `@primer/react`
- version: `38.26.0`

## Public imports

`import { FormControl } from '@primer/react'`

## When to use

Wrap EVERY form input — [TextInput](./text-input.md), [Textarea](./textarea.md), [Select](./select.md), [Checkbox](./checkbox.md) — in a FormControl. It generates and wires the `id` that associates the label, validation text, and caption text (node_modules/@primer/react/dist/FormControl/FormControl.d.ts:10-12). A bare input next to a bare `<label>` has no association and fails axe.

## Key props

- `required` — the user must specify a value before the owning form can be submitted; also renders the required indicator on the label (FormControl.d.ts:13-16)
- `disabled` — whether the control allows user input (FormControl.d.ts:5-8)
- `layout` — `'horizontal' | 'vertical'`; "Vertical layout is used by default, and horizontal layout is used for checkbox and radio inputs" (FormControl.d.ts:17-21)
- `id` — explicit identifier override for the association (FormControl.d.ts:10-12)
- `FormControl.Label` — the visible label; renders with `htmlFor` wired to the input (FormControl.d.ts:28-32)
- `FormControl.Caption` — helper text below the input (FormControl.d.ts:27)
- `FormControl.Validation` — validation message slot (FormControl.d.ts:36)
- `FormControl.LeadingVisual` — visual before the control (FormControl.d.ts:33-35)

## Best Practices

- `required` lives on FormControl, not on the input — the wrapper propagates it and renders the indicator (FormControl.d.ts:13-16; references/examples/new.md).
- Each input row is one FormControl wrapping Label + input + optional Caption — lifted from the new exemplar (`references/examples/new.md`).
- For checkbox rows the control precedes the label — see [Checkbox](./checkbox.md).

## Composition examples

Lifted from vercel-labs/primer-nextjs-template/app/new/page.tsx:

```tsx
import { FormControl, TextInput } from "@primer/react";
import { RepoIcon } from "@primer/octicons-react";

<FormControl required>
  <FormControl.Label>Repository name</FormControl.Label>
  <TextInput block placeholder="awesome-project" leadingVisual={RepoIcon} />
  <FormControl.Caption>
    Great repository names are short and memorable.
  </FormControl.Caption>
</FormControl>
```

## Source references

- `node_modules/@primer/react/dist/FormControl/FormControl.d.ts` — published prop types + subcomponents
- `primer/react` @ main: `packages/react/src/FormControl/FormControl.docs.json` + `FormControl.stories.tsx`

## Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<label>Name</label><TextInput />` | `<FormControl><FormControl.Label>Name</FormControl.Label><TextInput /></FormControl>` | the wrapper wires the id/htmlFor association (FormControl.d.ts:10-12) |
| `<TextInput required />` | `<FormControl required>` | `required` is a FormControl concern (FormControl.d.ts:13-16) |
| `layout="inline"` | `layout="horizontal"` | the enum is `horizontal \| vertical` only (FormControl.d.ts:21) |

## Things to never invent

- Props not listed under "Key props".
- `layout` values outside `'horizontal' | 'vertical'`.
- A `label` string prop — the label is the `FormControl.Label` subcomponent.
- Sibling components not present in the in-scope set.
