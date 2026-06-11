---
title: Checkbox
description: Accessible native checkbox with indeterminate state; validation styling lives on the group, not the box.
---

# Checkbox

- package: `@primer/react`
- version: `38.26.0`

## Public imports

`import { Checkbox } from '@primer/react'`

## When to use

Use Checkbox for boolean opt-ins and multi-select rows. Always wrap in [FormControl](./form-control.md); for checkbox rows the control PRECEDES `FormControl.Label` (inverted from text inputs). The types describe it as "An accessible, native checkbox component" (node_modules/@primer/react/dist/Checkbox/Checkbox.d.ts:32-34).

## Key props

- `indeterminate` — indeterminate visual appearance (Checkbox.d.ts:8)
- `disabled` — inactive appearance (Checkbox.d.ts:12)
- `required` — must be checked before form submit (Checkbox.d.ts:20)
- `validationStatus` — `'error' | 'success'`; per the types, "Only used to inform ARIA attributes. Individual checkboxes do not have validation styles." (Checkbox.d.ts:22-24)
- `value` — identifies the checkbox in form submission, "never shown to the user" (Checkbox.d.ts:26-29)
- Native `<input type="checkbox">` attributes pass through (`defaultChecked`, `checked`, `onChange`) (Checkbox.d.ts:31)

## Best Practices

- Checkbox rows invert the FormControl order: `<Checkbox />` first, then `FormControl.Label`, then `Caption` — lifted from the new exemplar (`references/examples/new.md`).
- Never expect visual validation styling on a single Checkbox — `validationStatus` only informs ARIA attributes (Checkbox.d.ts:22-24).

## Composition examples

Lifted from vercel-labs/primer-nextjs-template/app/new/page.tsx:

```tsx
import { Checkbox, FormControl } from "@primer/react";

<FormControl>
  <Checkbox defaultChecked />
  <FormControl.Label>Add a README file</FormControl.Label>
  <FormControl.Caption>
    This is where you can write a long description for your project.
  </FormControl.Caption>
</FormControl>
```

## Source references

- `node_modules/@primer/react/dist/Checkbox/Checkbox.d.ts` — published prop types
- `primer/react` @ main: `packages/react/src/Checkbox/Checkbox.docs.json` + `Checkbox.stories.tsx`

## Common mistakes

| Bad | Good | Why |
|---|---|---|
| `<FormControl.Label>...</FormControl.Label><Checkbox />` | `<Checkbox /><FormControl.Label>...</FormControl.Label>` | checkbox-shaped rows put the control before its label (references/examples/new.md) |
| styling a lone Checkbox red via `validationStatus="error"` | put the validation message on the group via `FormControl.Validation` | individual checkboxes do not have validation styles (Checkbox.d.ts:22-24) |

## Things to never invent

- Props not listed under "Key props".
- `validationStatus` values outside `'error' | 'success'`.
- A `label` prop — the label is a `FormControl.Label` sibling, not a prop.
- Sibling components not present in the in-scope set.
