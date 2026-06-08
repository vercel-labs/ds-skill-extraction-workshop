# Example: Home

Lifted from `vercel-labs/primer-nextjs-template/app/page.tsx` (next-app).

## Required imports

- `@primer/react`: Heading, Link, PageHeader, Stack, Text
- `@primer/octicons-react`: GearIcon, GraphIcon, PlusIcon, RepoIcon, SearchIcon
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

- Page-level chrome: outer `<Stack direction="vertical" gap="spacious">` with `PageHeader.TitleArea` + `PageHeader.Title` + `PageHeader.Description` establishes a consistent page heading contract before any content.
- Navigation card pattern: each item is a `<Link>` with `display: block`, token-painted border (`--borderColor-default`), background (`--bgColor-default`), and radius (`--borderRadius-medium`) — turns a link into a full-width clickable surface without CSS framework.
- Icon + text row: horizontal `<Stack direction="horizontal" gap="condensed" align="center">` with an octicon at a fixed pixel size and a vertical `<Stack>` of heading + description text — the canonical leading-visual composition for list items.
- Gap vocabulary: `spacious` between major page sections, `normal` between list items, `condensed` inside a single row — use this three-tier vocabulary, not arbitrary pixel values.
- Muted secondary text: `<Text size="small" style={{ color: "var(--fgColor-muted)" }}>` pairs `fgColor-muted` (not `fgColor-subtle` or hardcoded gray) with `size="small"` for secondary descriptions.
