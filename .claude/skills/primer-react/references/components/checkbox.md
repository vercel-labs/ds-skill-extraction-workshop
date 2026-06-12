---
title: Checkbox
description: Native accessible checkbox with indeterminate and required props; validationStatus is ARIA-only
---

## Public imports

```tsx
import { Checkbox } from '@primer/react'
```

## When to use

Pick `Checkbox` for boolean input (toggle, multi-select within a form). Wrap in [FormControl](./form-control.md) — FormControl's `layout` defaults to `'horizontal'` for checkbox/radio inputs, putting the label next to the control. For a multi-line option with description, use `<FormControl>` with `<FormControl.Caption>`.

## Key props

- `indeterminate?: boolean` — third visual state (e.g. "some children selected"). `node_modules/@primer/react/dist/Checkbox/Checkbox.d.ts:6`
- `disabled?: boolean`. `dist/Checkbox/Checkbox.d.ts:10`
- `required?: boolean` — must be checked to submit. `dist/Checkbox/Checkbox.d.ts:18`
- `validationStatus?: 'error' | 'success'` (`FormValidationStatus`) — **ARIA-only** on Checkbox: individual checkboxes do NOT carry validation styles, only ARIA wiring. `dist/Checkbox/Checkbox.d.ts:22`
- `value?: string` — submit value (not user-visible). `dist/Checkbox/Checkbox.d.ts:27`
- Ref: `React.RefObject<HTMLInputElement>`. `dist/Checkbox/Checkbox.d.ts:14`
- Native passthrough: `InputHTMLAttributes<HTMLInputElement>` minus `value` (Primer narrows to `string`). `dist/Checkbox/Checkbox.d.ts:29`

## Accessibility

- Native checkbox semantics — the browser handles keyboard (Space toggles), focus ring, and `aria-checked`.
- `indeterminate` is set imperatively on the input element; the Primer prop wires this through. `dist/Checkbox/Checkbox.d.ts:6`
- `validationStatus` is **ARIA-only** at the individual checkbox level — the d.ts JSDoc on the prop explicitly says "Individual checkboxes do not have validation styles. Only used to inform ARIA attributes." Visible error state must come from a paired `<FormControl.Validation>`. `dist/Checkbox/Checkbox.d.ts:20-22`
- Always wrap in `<FormControl>` so the label is properly associated (clicking the label toggles the checkbox).

## Best Practices

- **Inside a [FormControl](./form-control.md), the Checkbox comes FIRST, then `<FormControl.Label>`, then `<FormControl.Caption>`** — the inverse of the label-first order used for TextInput/Textarea/Select rows. The lifted `new.md` exemplar shows both orders side by side; [FormControl](./form-control.md) carries the same rule. (reference exemplar: `vercel-labs/primer-nextjs-template@app/new/page.tsx`)
- Use `indeterminate` for "some selected" rollup states (parent checkbox of a list with mixed children). `dist/Checkbox/Checkbox.d.ts:6`
- Do not rely on Checkbox `validationStatus` for VISIBLE error state — it is ARIA-only. Pair with `<FormControl.Validation variant="error">` for the visible message. `dist/Checkbox/Checkbox.d.ts:20-22`
- `validationStatus` does NOT accept `'warning'` — the union is `'error' | 'success'`. `dist/utils/types/FormValidationStatus.d.ts`

## Composition examples

```tsx
import { Checkbox, FormControl } from '@primer/react'

export function NotifyToggle({ checked, onChange }: {
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <FormControl>
      <Checkbox
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <FormControl.Label>Email me about new releases</FormControl.Label>
      <FormControl.Caption>You can change this in settings.</FormControl.Caption>
    </FormControl>
  )
}
```

## Source references

- `node_modules/@primer/react/dist/Checkbox/Checkbox.d.ts:1-34` — `CheckboxProps`
- `node_modules/@primer/react/dist/utils/types/FormValidationStatus.d.ts`
- Upstream: `primer/react@main:packages/react/src/Checkbox/Checkbox.tsx`
- Reference exemplar: `vercel-labs/primer-nextjs-template@app/new/page.tsx` — control-first children order

## Common mistakes

- `<FormControl><FormControl.Label>Add README</FormControl.Label><Checkbox /></FormControl>` — label-first order on a Checkbox row; the control comes FIRST for checkbox/radio.
- `<Checkbox validationStatus="error" />` expecting a red border — Checkbox's `validationStatus` is ARIA-only; pair with `<FormControl.Validation>` for visible state. `dist/Checkbox/Checkbox.d.ts:20-22`
- `<Checkbox validationStatus="warning">` — not a union member.
- `<Checkbox value={42} />` — `value` is typed as `string` (Primer narrows from native `value`).

## Things to never invent

- Props not listed under "Key props".
- `validationStatus="warning"` — does not exist.
- Visible error styling on the checkbox itself — Primer routes that through the `<FormControl.Validation>` sibling.
