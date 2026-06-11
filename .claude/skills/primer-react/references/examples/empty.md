# Example: Empty

Lifted from `vercel-labs/primer-nextjs-template/app/empty/page.tsx` (next-app).

## Required imports

- `@primer/react`: PageLayout, Stack
- `@primer/react/experimental`: Blankslate
- `@primer/octicons-react`: SearchIcon
- Other: (none)

## Composition (verbatim)

```tsx
"use client";

// Empty-state exemplar. Demonstrates the experimental Blankslate entrypoint
// (Visual + Heading + Description + PrimaryAction). Wraps in a PageLayout
// so the empty surface still reads like a routed page, not a floating card.

import { PageLayout, Stack } from "@primer/react";
import { Blankslate } from "@primer/react/experimental";
import { SearchIcon } from "@primer/octicons-react";

export default function EmptyPage() {
  return (
    <PageLayout containerWidth="medium">
      <PageLayout.Content>
        <Stack direction="vertical" gap="normal" style={{ paddingTop: "var(--base-size-32, 2rem)" }}>
          <Blankslate spacious border>
            <Blankslate.Visual>
              <SearchIcon size={32} />
            </Blankslate.Visual>
            <Blankslate.Heading>No results found</Blankslate.Heading>
            <Blankslate.Description>
              We could not find any repositories matching your search. Try
              broadening the filters or check the spelling and try again.
            </Blankslate.Description>
            <Blankslate.PrimaryAction href="/repos">
              Browse all repositories
            </Blankslate.PrimaryAction>
            <Blankslate.SecondaryAction href="/new">
              Create a new repository
            </Blankslate.SecondaryAction>
          </Blankslate>
        </Stack>
      </PageLayout.Content>
    </PageLayout>
  );
}
```

## What to copy

- Empty state composes `Blankslate` slots in fixed order: `.Visual` (icon at 32px), `.Heading` (single short sentence), `.Description` (one short paragraph), `.PrimaryAction` (recovery path), optional `.SecondaryAction` (alternative path). Reordering the slots breaks the visual rhythm; omit instead of reorder.
- Two outcomes get two actions: PrimaryAction is `/repos` (recover the user's original intent), SecondaryAction is `/new` (offer an adjacent route). When the recovery path is unambiguous, drop the secondary — extra choices read as indecision in an empty state.
- `Blankslate` ships `spacious` + `border` as boolean props in this lift — `spacious` enlarges the vertical padding for landing-page-style emptiness, `border` paints a card surround. Both together turn the Blankslate from "inline empty" into "page-level empty".
- The empty surface still sits inside `PageLayout.Content` with `containerWidth="medium"` — empty states are page content, not modals; the page chrome stays consistent with non-empty routes so navigation does not collapse.
- The icon size 32 (twice the 16 used for inline icons) is the canonical empty-state icon scale — larger than inline use, smaller than hero imagery. `var(--base-size-32, 2rem)` aligns padding to the same scale.
