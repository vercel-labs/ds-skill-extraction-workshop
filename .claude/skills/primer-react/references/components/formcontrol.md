---
title: FormControl
description: Compound field wrapper that associates a label, caption, and validation with an input.
---

## Public imports

`import { FormControl } from "@/ds/components/FormControl"` (project wrapper) — equivalent to `import { FormControl } from "@primer/react"`. Subcomponents `FormControl.Label`, `FormControl.Caption`, `FormControl.Validation` are preserved.

## When to use

Wrap every interactive input — [TextInput](./textinput.md), [Textarea](./textarea.md), [Select](./select.md), [Checkbox](./checkbox.md) — in a `FormControl`. It is the only correct way to associate a visible label (and optional help text / validation message) with the input for accessibility.

## Key props

- `required` — boolean on the `FormControl` (not the inner input); the wrapper owns the required affordance on the label. (used at `references/examples/new.md`)
- `FormControl.Label` — the field label (required subcomponent for label association). (`ds/components/FormControl.docs.tsx:5`)
- `FormControl.Caption` — optional help text rendered under the input. (`ds/components/FormControl.docs.tsx:6`)
- `FormControl.Validation` — optional validation message slot. (`ds/components/FormControl.tsx:8`)

## Best Practices

- Never render a `TextInput`, `Textarea`, `Select`, or `Checkbox` outside a `FormControl` with a `FormControl.Label` — bare inputs lose label association and fail axe. (`ds/components/FormControl.docs.tsx:4`) `component/input-requires-formcontrol`
- For a `Checkbox`, put the `Checkbox` **before** `FormControl.Label` inside the control — that is Primer's documented checkbox layout. (`ds/components/FormControl.docs.tsx:9`) `component/checkbox-before-label`
- Set `required` on the `FormControl`, not on the inner input, so the label gets the required affordance. (used at `references/examples/new.md`)

## Composition examples

```tsx
import { FormControl } from "@/ds/components/FormControl";
import { TextInput } from "@/ds/components/TextInput";

export function NameField() {
  return (
    <FormControl required>
      <FormControl.Label>Repository name</FormControl.Label>
      <TextInput block placeholder="awesome-project" />
      <FormControl.Caption>Short and memorable names work best.</FormControl.Caption>
    </FormControl>
  );
}
```

## Source references

- `ds/components/FormControl.tsx:10` — wrapper re-export (Label/Caption/Validation preserved)
- `ds/components/FormControl.docs.tsx:1-25` — annotated composition rule + checkbox layout
- `@primer/react@38.26.0` — `FormControl` published types (props verified via Phase 2 typecheck)

## Common mistakes

- Putting help text in a bare `Text` under the input → use `FormControl.Caption` so it is associated.
- Marking the inner `TextInput` required instead of the `FormControl`.

## Things to never invent

- Subcomponents beyond `Label`, `Caption`, `Validation`.
- A label-association prop on the input itself — association comes from the `FormControl` wrapper.
