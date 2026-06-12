---
title: FormControl
description: Wrapper that associates a Label, Caption, Validation message, and LeadingVisual with an input
---

## Public imports

```tsx
import { FormControl } from '@primer/react'
```

## When to use

Pick `FormControl` whenever a [TextInput](./text-input.md), [Textarea](./textarea.md), [Select](./select.md), or [Checkbox](./checkbox.md) needs a label, caption, or validation message. FormControl wires `id`/`htmlFor` automatically — never roll your own `<label htmlFor>` for Primer inputs. For a tightly-coupled label-and-input row, FormControl is the only correct wrapper.

## Key props

- `id?: string` — generates `htmlFor` on `<FormControl.Label>` and `id` on the input automatically when omitted. `node_modules/@primer/react/dist/FormControl/FormControl.d.ts:9-10`
- `disabled?: boolean` — propagates to all subcomponents. `dist/FormControl/FormControl.d.ts:7`
- `required?: boolean` — propagates required indicator to Label. `dist/FormControl/FormControl.d.ts:14`
- `layout?: 'horizontal' | 'vertical'` — default `'vertical'`, horizontal for checkbox/radio. `dist/FormControl/FormControl.d.ts:18`
- `className?: string`. `dist/FormControl/FormControl.d.ts:20`
- Subcomponents:
  - `<FormControl.Label>` — labels the input; `htmlFor` is wired automatically. `dist/FormControl/FormControl.d.ts:24`
  - `<FormControl.Caption>` — helper text below the input. `dist/FormControl/FormControl.d.ts:23`
  - `<FormControl.Validation variant="error" | "success">` — paired error/success message. `dist/FormControl/FormControl.d.ts:25`
  - `<FormControl.LeadingVisual>` — icon BEFORE the label (typically for Checkbox/Radio rows). `dist/FormControl/FormControl.d.ts:25`

## Accessibility

- FormControl wires `id` / `htmlFor` / `aria-describedby` so the input, label, caption, and validation message are programmatically associated — clicking the label moves focus to the input; SR reads label + caption + validation. `dist/FormControl/FormControl.d.ts:9-10`
- `<FormControl.Validation variant="error">` is the canonical visible error message and the only SR-announced error path. Pair it with the input's `validationStatus="error"` so styling and a11y agree.
- `layout` default is `'vertical'` for inputs; switch to `'horizontal'` when wrapping a `<Checkbox>` or radio so the label sits beside the control. `dist/FormControl/FormControl.d.ts:16-18`

## Best Practices

- Always render `<FormControl.Label>` inside `<FormControl>` — without it, the input has no programmatic label. `dist/FormControl/FormControl.d.ts:24`
- **Children order inverts for Checkbox/Radio rows**: text inputs are label-first (`<FormControl.Label>` → input → `<FormControl.Caption>`), but a Checkbox row puts the CONTROL first (`<Checkbox />` → `<FormControl.Label>` → `<FormControl.Caption>`) — the lifted `new.md` exemplar shows both orders side by side. [Checkbox](./checkbox.md) carries the same rule. (reference exemplar: `vercel-labs/primer-nextjs-template@app/new/page.tsx`)
- **Do not rely on a horizontal [Stack](./stack.md)'s `align="end"` (or `align="center"`) to line up two FormControls when one has a `<FormControl.Caption>` and the other does not** — the stack aligns boxes, not baselines, so the captioned control's label rides up. Align on `start` and equalize with an explicit spacer, or give both controls a caption slot ([Stack](./stack.md) carries the same rule — the trap is reachable from either side). `dist/Stack/Stack.d.ts:35`
- For error states, render `<FormControl.Validation variant="error">{msg}</FormControl.Validation>` AND set the input's `validationStatus="error"` — the validation slot is what the SR reads.
- Do NOT wrap the children with a bare `<label htmlFor>` — FormControl already provides this; double-labelling breaks SR association.
- `layout='horizontal'` is the right choice for Checkbox/Radio FormControls (Primer's default for checkbox/radio inputs per the JSDoc). `dist/FormControl/FormControl.d.ts:16-18`

## Composition examples

```tsx
import { FormControl, TextInput } from '@primer/react'

export function RepoNameField({ value, onChange, error }: {
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  return (
    <FormControl required>
      <FormControl.Label>Repository name</FormControl.Label>
      <TextInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        validationStatus={error ? 'error' : undefined}
        block
      />
      <FormControl.Caption>
        Great repository names are short and memorable.
      </FormControl.Caption>
      {error && (
        <FormControl.Validation variant="error">{error}</FormControl.Validation>
      )}
    </FormControl>
  )
}
```

Checkbox row — control FIRST, then label, then caption (the inverse of the text-input order above; lifted from `vercel-labs/primer-nextjs-template@app/new/page.tsx`):

```tsx
import { Checkbox, FormControl } from '@primer/react'

export function ReadmeToggle() {
  return (
    <FormControl>
      <Checkbox defaultChecked />
      <FormControl.Label>Add a README file</FormControl.Label>
      <FormControl.Caption>
        This is where you can write a long description for your project.
      </FormControl.Caption>
    </FormControl>
  )
}
```

## Source references

- `node_modules/@primer/react/dist/FormControl/FormControl.d.ts:1-30` — `FormControlProps` + subcomponents
- Upstream: `primer/react@main:packages/react/src/FormControl/FormControl.tsx`
- Reference exemplar: `vercel-labs/primer-nextjs-template@app/new/page.tsx` — both children orders in one form

## Common mistakes

- `<FormControl layout="stacked">` — not a union member; values are `'horizontal' | 'vertical'`.
- `<FormControl><label>Name</label><TextInput /></FormControl>` — use `<FormControl.Label>`, not a bare `<label>`; FormControl wires the association.
- `<FormControl><FormControl.Label>Add README</FormControl.Label><Checkbox /></FormControl>` — label-first order on a Checkbox row; the control comes FIRST for checkbox/radio (see the exemplar order above).
- `<FormControl><TextInput validationStatus="error" /></FormControl>` (no `<FormControl.Validation>`) — the input shows red but the SR has no message to announce.

## Things to never invent

- Props not listed under "Key props".
- `layout` values outside `'horizontal' | 'vertical'`.
- A separate `<FormControl.Error>` component — error messages go through `<FormControl.Validation variant="error">`.
