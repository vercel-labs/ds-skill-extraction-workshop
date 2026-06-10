---
title: TextInput
description: Single-line text input with optional leading/trailing icon visual slots.
---

## Public imports

`import { TextInput } from "@/ds/components/TextInput"` (project wrapper) — equivalent to `import { TextInput } from "@primer/react"`.

## When to use

Use `TextInput` for single-line text entry (names, search terms, identifiers). For multi-line entry use [Textarea](./textarea.md); for a fixed list of choices use [Select](./select.md). Always wrap it in a [FormControl](./formcontrol.md) with a `FormControl.Label`.

## Key props

- `block` — boolean; makes the input span its container's width. (used at `references/examples/new.md`)
- `leadingVisual` / `trailingVisual` — an octicon **component** rendered inside the field, e.g. `leadingVisual={RepoIcon}`. (used at `references/examples/new.md`)
- `placeholder` — placeholder text. (used at `references/examples/new.md`)
- `defaultValue` / `value` — uncontrolled / controlled value. (used at `references/examples/settings.md`)

## Best Practices

- Never render a `TextInput` outside a `FormControl` with a `FormControl.Label` — label association breaks and axe fails. (`ds/components/TextInput.tsx:7`) `component/input-requires-formcontrol`
- Pass icon affordances as **components** to `leadingVisual` / `trailingVisual`, never JSX. (`ds/components/TextInput.tsx:8`) `component/icon-prop-not-jsx`

## Composition examples

```tsx
import { FormControl } from "@/ds/components/FormControl";
import { TextInput } from "@/ds/components/TextInput";
import { RepoIcon } from "@primer/octicons-react";

export function RepoNameField() {
  return (
    <FormControl required>
      <FormControl.Label>Repository name</FormControl.Label>
      <TextInput block placeholder="awesome-project" leadingVisual={RepoIcon} />
    </FormControl>
  );
}
```

## Source references

- `ds/components/TextInput.tsx:1-12` — wrapper re-export + FormControl/icon notes
- `@primer/react@38.26.0` — `TextInput` published types (props verified via Phase 2 typecheck)

## Common mistakes

- Rendering a bare `TextInput` with a sibling `Text` as the label → use `FormControl` + `FormControl.Label`.
- `leadingVisual={<RepoIcon />}` → pass the component reference.

## Things to never invent

- A `label` prop on `TextInput` — the label comes from `FormControl.Label`.
- Visual props beyond `leadingVisual` / `trailingVisual`.
