---
title: Select
description: Compound native-style select for short fixed option lists.
---

## Public imports

`import { Select } from "@/ds/components/Select"` (project wrapper) — equivalent to `import { Select } from "@primer/react"`. The `Select.Option` subcomponent is preserved.

## When to use

Use `Select` for a short, fixed list of mutually exclusive options (visibility, theme, default branch). For a filterable / searchable list, reach for `SelectPanel` from `@primer/react` (see `references/examples/repos.md`). Always wrap `Select` in a [FormControl](./formcontrol.md) with a `FormControl.Label`.

## Key props

- `block` — boolean; spans the container width. (used at `references/examples/new.md`)
- `defaultValue` / `value` — uncontrolled / controlled selected value. (used at `references/examples/settings.md`)
- `Select.Option` — `value` + label children; one per choice. (used at `references/examples/new.md`)

## Best Practices

- Never render a `Select` outside a `FormControl` with a `FormControl.Label` — label association breaks and axe fails. (`ds/components/Select.tsx:8`) `component/input-requires-formcontrol`
- Build options with `Select.Option`, not bare `<option>` elements. (`ds/components/Select.tsx:7`) `component/select-option-subcomponent`

## Composition examples

```tsx
import { FormControl } from "@/ds/components/FormControl";
import { Select } from "@/ds/components/Select";

export function VisibilityField() {
  return (
    <FormControl>
      <FormControl.Label>Visibility</FormControl.Label>
      <Select block defaultValue="public">
        <Select.Option value="public">Public</Select.Option>
        <Select.Option value="private">Private</Select.Option>
      </Select>
    </FormControl>
  );
}
```

## Source references

- `ds/components/Select.tsx:1-12` — wrapper re-export (Select.Option preserved) + FormControl note
- `@primer/react@38.26.0` — `Select` published types (props verified via Phase 2 typecheck)

## Common mistakes

- Bare `<option>` children → use `Select.Option`.
- Building a searchable picker with `Select` → use `SelectPanel`.

## Things to never invent

- Subcomponents beyond `Select.Option`.
- A `label` prop — use `FormControl.Label`.
