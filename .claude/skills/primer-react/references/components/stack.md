---
title: Stack
description: Flex + gap layout primitive with named gap/direction/align/justify props.
---

## Public imports

`import { Stack } from "@/ds/components/Stack"` (project wrapper) — equivalent to `import { Stack } from "@primer/react"`.

## When to use

Use `Stack` as the default layout primitive for rows and columns — it owns direction and gap so you avoid ad-hoc margins. Nest `Stack`s for tight icon-plus-label rows. Reach for `PageLayout` (from `@primer/react`) for page-level header/pane/content regions; `Stack` handles the in-region composition.

## Key props

- `direction` — `'vertical' | 'horizontal'`. (used at `references/examples/home.md`)
- `gap` — named gap `'none' | 'condensed' | 'normal' | 'spacious'`; use the named scale, not pixel margins. (used at `references/examples/dashboard.md`)
- `align` — cross-axis alignment, e.g. `'center'`. (used at `references/examples/repos.md`)
- `justify` — main-axis distribution, e.g. `'space-between' | 'end'`. (used at `references/examples/dashboard.md`)
- `wrap` — `'wrap' | 'nowrap'` for responsive reflow. (used at `references/examples/dashboard.md`)

## Best Practices

- Build spacing from the named `gap` scale, not margins on children — named gaps keep vertical rhythm on the grid. (used at `references/examples/dashboard.md`) `component/stack-named-gap`

## Composition examples

```tsx
import { Stack } from "@/ds/components/Stack";
import { Heading } from "@/ds/components/Heading";
import { Text } from "@/ds/components/Text";

export function SectionHeader() {
  return (
    <Stack direction="vertical" gap="condensed">
      <Heading as="h2" variant="medium">Public profile</Heading>
      <Text size="small">This information appears on your profile.</Text>
    </Stack>
  );
}
```

## Source references

- `ds/components/Stack.tsx:1-7` — wrapper re-export
- `@primer/react@38.26.0` — `Stack` published types (props verified via Phase 2 typecheck)

## Common mistakes

- Adding `margin` to children for spacing → use `gap`.
- Reaching for a raw fl/grid div → `Stack` carries the DS gap scale.

## Things to never invent

- `gap` values outside `none | condensed | normal | spacious`.
- `direction` values outside `vertical | horizontal`.
