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

- Empty states are the experimental `Blankslate` entrypoint (`@primer/react/experimental`), not a hand-rolled centered div — slots: `Visual` (octicon size 32), `Heading`, `Description`, `PrimaryAction`, `SecondaryAction`.
- `Blankslate` takes `spacious` and `border` boolean props for padding and the framed look; the frame replaces any hand-painted border.
- The empty surface still mounts inside `PageLayout containerWidth="medium"` + `PageLayout.Content` so it reads as a routed page, not a floating card.
- Actions are href-shaped (`PrimaryAction href=...`) — an empty state routes the user somewhere useful, primary before secondary.
