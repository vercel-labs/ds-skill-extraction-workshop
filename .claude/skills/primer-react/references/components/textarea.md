---
title: Textarea
description: Multi-line text input with configurable rows and resize behavior.
---

## Public imports

`import { Textarea } from "@/ds/components/Textarea"` (project wrapper) — equivalent to `import { Textarea } from "@primer/react"`.

## When to use

Use `Textarea` for multi-line free text (descriptions, bios, comments). For a single line use [TextInput](./textinput.md). Always wrap it in a [FormControl](./formcontrol.md) with a `FormControl.Label`.

## Key props

- `block` — boolean; spans the container width. (used at `references/examples/new.md`)
- `rows` — number of visible text rows. (used at `references/examples/new.md`)
- `resize` — `'none' | 'both' | 'horizontal' | 'vertical'`; `vertical` is the common choice. (used at `references/examples/new.md`)
- `placeholder` / `defaultValue` — placeholder / uncontrolled value. (used at `references/examples/settings.md`)

## Best Practices

- Never render a `Textarea` outside a `FormControl` with a `FormControl.Label` — label association breaks and axe fails. (`ds/components/Textarea.tsx:7`) `component/input-requires-formcontrol`

## Composition examples

```tsx
import { FormControl } from "@/ds/components/FormControl";
import { Textarea } from "@/ds/components/Textarea";

export function BioField() {
  return (
    <FormControl>
      <FormControl.Label>Bio</FormControl.Label>
      <Textarea block rows={3} resize="vertical" placeholder="Optional description" />
      <FormControl.Caption>You can @mention other users and organizations.</FormControl.Caption>
    </FormControl>
  );
}
```

## Source references

- `ds/components/Textarea.tsx:1-11` — wrapper re-export + FormControl note
- `@primer/react@38.26.0` — `Textarea` published types (props verified via Phase 2 typecheck)

## Common mistakes

- Bare `Textarea` with no `FormControl` → label association breaks.
- Letting it resize horizontally inside a fixed card → prefer `resize="vertical"`.

## Things to never invent

- A `label` prop — use `FormControl.Label`.
- `resize` values beyond `none | both | horizontal | vertical`.
