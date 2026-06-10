# Example: Home

Lifted from `vercel-labs/primer-nextjs-template/app/page.tsx` (next-app).

## Required imports

- `@primer/react`: Heading, Link, PageHeader, Stack, Text
- `@primer/octicons-react`: GearIcon, GraphIcon, PlusIcon, RepoIcon, SearchIcon, type Icon
- Other: (none)

## Composition (verbatim)

```tsx
"use client";

import { Heading, Link, PageHeader, Stack, Text } from "@primer/react";
import {
  GearIcon,
  GraphIcon,
  PlusIcon,
  RepoIcon,
  SearchIcon,
  type Icon,
} from "@primer/octicons-react";

type Route = {
  href: string;
  title: string;
  description: string;
  icon: Icon;
};

const ROUTES: Route[] = [
  {
    href: "/repos",
    title: "Repositories",
    description:
      "List page — PageHeader, DataTable, SelectPanel filter, Label.",
    icon: RepoIcon,
  },
  {
    href: "/new",
    title: "New repository",
    description:
      "Form page — token-painted card, FormControl rows, action footer.",
    icon: PlusIcon,
  },
  {
    href: "/settings",
    title: "Settings",
    description: "Sidebar-nav page — PageLayout.Pane with NavList + Content.",
    icon: GearIcon,
  },
  {
    href: "/empty",
    title: "Empty state",
    description: "Blankslate (experimental) — Visual, Heading, Description, action.",
    icon: SearchIcon,
  },
  {
    href: "/dashboard",
    title: "Dashboard",
    description: "Multi-section — stat cards + Timeline of recent activity.",
    icon: GraphIcon,
  },
];

export default function Home() {
  return (
    <Stack
      direction="vertical"
      gap="spacious"
      style={{ padding: "2rem", maxWidth: 768, margin: "0 auto" }}
    >
      <PageHeader>
        <PageHeader.TitleArea>
          <PageHeader.Title>primer-nextjs-template</PageHeader.Title>
        </PageHeader.TitleArea>
        <PageHeader.Description>
          Composition exemplars for the Primer + Next.js App Router wiring.
          Click each route to verify dark + light mode paint correctly after a
          Primer version bump.
        </PageHeader.Description>
      </PageHeader>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <Stack direction="vertical" gap="normal">
          {ROUTES.map((route) => {
            const RouteIcon = route.icon;
            return (
              <li key={route.href}>
                <Link
                  href={route.href}
                  style={{
                    display: "block",
                    padding: "var(--base-size-16, 1rem)",
                    border: "1px solid var(--borderColor-default)",
                    borderRadius: "var(--borderRadius-medium, 8px)",
                    backgroundColor: "var(--bgColor-default)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <Stack direction="horizontal" gap="condensed" align="center">
                    <RouteIcon size={16} />
                    <Stack direction="vertical" gap="none">
                      <Heading as="h2" variant="small">
                        {route.title}
                      </Heading>
                      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                        {route.description}
                      </Text>
                    </Stack>
                  </Stack>
                </Link>
              </li>
            );
          })}
        </Stack>
      </ul>
    </Stack>
  );
}
```

## What to copy

- Page is a single vertical `Stack` with `gap="spacious"` and a `maxWidth` + `margin: 0 auto` style for a centered reading column — the outer Stack owns layout, not a wrapper div.
- `PageHeader` composes `TitleArea > Title` plus `Description` as named subcomponents; the title is never a bare `Heading` at the top of a page.
- A token-painted "card" is a `Link` (or div) styled with the `--borderColor-default` / `--borderRadius-medium` / `--bgColor-default` token trio — border + radius + surface together are what make a clickable region read as a DS card.
- Secondary/meta text is `Text size="small"` with `style={{ color: "var(--fgColor-muted)" }}` — the muted foreground token is how you de-emphasize without a custom gray.
- Octicons are passed as components and rendered as JSX with a `size` prop (`<RouteIcon size={16} />`); the icon type is `Icon` from `@primer/octicons-react`.
- Nested `Stack`s (vertical inside horizontal) with `gap="none"` build tight icon-plus-label rows without margin hacks.
