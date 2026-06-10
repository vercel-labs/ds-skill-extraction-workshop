---
title: Checkbox
description: Boolean input; placed before the label inside a FormControl.
---

## Public imports

`import { Checkbox } from "@/ds/components/Checkbox"` (project wrapper) — equivalent to `import { Checkbox } from "@primer/react"`.

## When to use

Use `Checkbox` for an independent boolean toggle inside a form (add README, add .gitignore). Always wrap it in a [FormControl](./formcontrol.md) — but note the order differs from text inputs: the `Checkbox` comes **before** `FormControl.Label`.

## Key props

- `defaultChecked` — boolean; uncontrolled initial checked state. (used at `references/examples/new.md`)
- `checked` / `onChange` — controlled checked state. (`@primer/react@38.26.0` Checkbox types)

## Best Practices

- Never render a `Checkbox` outside a `FormControl` with a `FormControl.Label` — label association breaks and axe fails. (`ds/components/Checkbox.tsx:7`) `component/input-requires-formcontrol`
- Put the `Checkbox` **before** `FormControl.Label` inside the control — that is Primer's documented checkbox layout (the reverse of text-input order). (`ds/components/FormControl.docs.tsx:9`) `component/checkbox-before-label`

## Composition examples

```tsx
import { FormControl } from "@/ds/components/FormControl";
import { Checkbox } from "@/ds/components/Checkbox";

export function AddReadmeField() {
  return (
    <FormControl>
      <Checkbox defaultChecked />
      <FormControl.Label>Add a README file</FormControl.Label>
      <FormControl.Caption>Write a long description for your project.</FormControl.Caption>
    </FormControl>
  );
}
```

## Source references

- `ds/components/Checkbox.tsx:1-11` — wrapper re-export + FormControl note
- `ds/components/FormControl.docs.tsx:9` — checkbox-before-label layout
- `@primer/react@38.26.0` — `Checkbox` published types (props verified via Phase 2 typecheck)

## Common mistakes

- Putting `FormControl.Label` before the `Checkbox` → invert to Checkbox-first.
- A bare `Checkbox` with a sibling `Text` label → use `FormControl`.

## Things to never invent

- A `label` prop on `Checkbox` — use `FormControl.Label`.
- An `indeterminate` API unless confirmed in the `@primer/react` types.
