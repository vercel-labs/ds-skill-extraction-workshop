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

- An empty state is a `Blankslate` (from `@primer/react/experimental`) composed of `Blankslate.Visual` (a sized octicon) + `Blankslate.Heading` + `Blankslate.Description` + a `PrimaryAction`/`SecondaryAction` pair — never an ad-hoc centered `<div>`.
- The `Blankslate` is still wrapped in `PageLayout` → `PageLayout.Content` so the empty surface reads as a routed page, not a floating card.
- `spacious` + `border` props give the blankslate its padded, outlined treatment; actions take `href` and render as links.
- Spacing above the blankslate uses a token (`paddingTop: var(--base-size-32)`), not a raw pixel value.
