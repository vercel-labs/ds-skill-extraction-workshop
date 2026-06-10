# Example: Home

Lifted from `vercel-labs/primer-nextjs-template/app/page.tsx` (next-app).

## Required imports

- `@primer/react`: Heading, Link, PageHeader, Stack, Text
- `@primer/octicons-react`: GearIcon, GraphIcon, PlusIcon, RepoIcon, SearchIcon, type Icon
- Other: (none)

## Composition (verbatim)

```tsx
"use client";

// Route index. Smoke-test role for the wiring contract: every link below
// hits a composition exemplar that the extract-ds-skill meta-skill lifts
// into references/examples/<route>.md. Imports stay on @primer/react root
// (Link, Stack, PageHeader, Text) plus @primer/octicons-react.

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

- Page chrome is a vertical `Stack` with `gap="spacious"` and an inline-style content cap (`maxWidth` + `margin: "0 auto"`) — Primer ships no page-width primitive at this level, so the cap is plain CSS on the outermost Stack.
- `PageHeader` opens the page: `PageHeader.TitleArea > PageHeader.Title` for the h1, `PageHeader.Description` for the one-line summary beneath it.
- Card-shaped link rows are a `Link` painted entirely with tokens: `var(--borderColor-default)` border, `var(--borderRadius-medium, 8px)` radius, `var(--bgColor-default)` background, with `textDecoration: "none"` and `color: "inherit"` to suppress link styling on a block card.
- Icon + two-line text rows are nested Stacks: horizontal `gap="condensed" align="center"` for icon-beside-text, then vertical `gap="none"` for title-over-description.
- Secondary text uses `Text size="small"` painted with `var(--fgColor-muted)` via the `style` prop — muted color is a token, not a Text prop.
- Semantic lists keep the `<ul>`/`<li>` elements and neutralize their default styling inline (`listStyle: "none", padding: 0, margin: 0`) rather than dropping the list semantics.
