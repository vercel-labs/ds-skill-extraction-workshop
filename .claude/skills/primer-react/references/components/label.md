---
title: Label
description: Small pill/tag for status and metadata, color-driven by variant.
---

## Public imports

`import { Label } from "@/ds/components/Label"` (project wrapper) — equivalent to `import { Label } from "@primer/react"`. The prop type `LabelProps` is exported from `@primer/react`.

## When to use

Use `Label` for a short status or metadata pill (visibility, "Last 7 days"). For a numeric count, use [CounterLabel](./counterlabel.md) instead. Drive the color from data via `variant`, not a hardcoded color.

## Key props

- `variant` — semantic color, e.g. `'default' | 'accent' | 'success' | 'attention' | 'danger'`. (used at `references/examples/repos.md`, `references/examples/dashboard.md`)

## Best Practices

- Map the `variant` from data through a typed record (`Record<Status, LabelProps["variant"]>`), don't hardcode a color per row. (used at `references/examples/repos.md`) `component/label-variant-from-data`

## Composition examples

```tsx
import { Label } from "@/ds/components/Label";

export function VisibilityBadge({ isPublic }: { isPublic: boolean }) {
  return <Label variant={isPublic ? "success" : "attention"}>{isPublic ? "Public" : "Private"}</Label>;
}
```

## Source references

- `ds/components/Label.tsx:1-7` — wrapper re-export
- `@primer/react@38.26.0` — `Label` / `LabelProps` published types (verified via Phase 2 typecheck)

## Common mistakes

- Styling a `Label` with a raw color → use a `variant`.
- Using `Label` to display a number → use `CounterLabel`.

## Things to never invent

- Variant names not present in `LabelProps["variant"]`.
