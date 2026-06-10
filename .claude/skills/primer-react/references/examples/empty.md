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

- `Blankslate` imports from `@primer/react/experimental`, not the root entrypoint — the root import fails to resolve.
- The empty state is wrapped in `PageLayout containerWidth="medium" > PageLayout.Content` so it reads as a routed page, not a floating card.
- Blankslate slot order: `Blankslate.Visual` (octicon at `size={32}`), `Blankslate.Heading`, `Blankslate.Description`, then `Blankslate.PrimaryAction` and `Blankslate.SecondaryAction` with `href` props.
- `spacious` and `border` boolean props on `Blankslate` give the bordered, padded variant suited to full-page empty states.
- Vertical offset from the page top uses a spacing token with fallback (`paddingTop: "var(--base-size-32, 2rem)"`) on the wrapping Stack, not a magic number.
