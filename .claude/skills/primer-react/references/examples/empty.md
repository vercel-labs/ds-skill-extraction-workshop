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

- `Blankslate` comes from `@primer/react/experimental` — not the root entrypoint; the import path is load-bearing.
- `Blankslate spacious border` — `spacious` increases internal padding for center-of-page empty states; `border` adds the default border token surface so the blank region is visually distinct from the page background.
- Compound slot order: `Blankslate.Visual` → `Blankslate.Heading` → `Blankslate.Description` → `Blankslate.PrimaryAction` → `Blankslate.SecondaryAction` — Primer renders these in visual order; changing slot order in JSX does not reorder the output (slots are position-controlled by the component).
- `Blankslate.Visual` wraps a bare icon at a large size (`size={32}`) — not a `Button` or interactive element; visual only.
- `PageLayout containerWidth="medium"` centers the empty state without overflowing on wide screens — medium (768px) is the canonical single-column empty-state container width.
- Top padding via `--base-size-32` on the outer Stack creates breathing room between the page header area and the blankslate card.
