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

- Page body is a single vertical `Stack` with `gap="spacious"`, width-capped and centered via inline `style` (`maxWidth`, `margin: "0 auto"`) — the DS owns rhythm, the page owns the measure.
- A navigable card is a `Link` painted by hand with token vars: `border: 1px solid var(--borderColor-default)`, `borderRadius: var(--borderRadius-medium)`, `backgroundColor: var(--bgColor-default)` — every literal carries a token, never a raw hex.
- Icon + text pairing is a horizontal `Stack` with `align="center"`; the label/description column is a nested vertical `Stack` with `gap="none"`.
- Muted secondary text is `<Text size="small" style={{ color: "var(--fgColor-muted)" }}>` — the muted foreground token, not opacity.
- Octicons are typed as `Icon` and rendered as components (`const RouteIcon = route.icon; <RouteIcon size={16} />`), never inline SVG.
