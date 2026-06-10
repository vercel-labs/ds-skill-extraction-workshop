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

- Empty states use `<Blankslate>` from `@primer/react/experimental` — not a hand-rolled card. The component carries `Visual / Heading / Description / PrimaryAction / SecondaryAction` slots in that order.
- `<Blankslate spacious border>` is the standard variant for routed empty pages — `border` paints the dashed token-driven border, `spacious` enlarges internal padding.
- Wrap `<Blankslate>` in `<PageLayout containerWidth="medium">` + `<PageLayout.Content>` so the empty surface reads as a routed page, not a floating card.
- Top padding on the inner `<Stack>` uses `var(--base-size-32, 2rem)` not raw `2rem` — keeps the spacing scale token-driven.
- Both actions take an `href` prop (anchor semantics); pass `onClick` instead when the action is a handler not a navigation.
