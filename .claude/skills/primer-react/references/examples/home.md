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

- Route-index shape: a vertical `Stack` with `gap="spacious"` caps page width via `style={{ maxWidth: 768, margin: "0 auto" }}` — the layout primitive carries rhythm, inline style carries the measure.
- `PageHeader` opens the page: `PageHeader.Title` inside `PageHeader.TitleArea`, prose in `PageHeader.Description` — chrome stays outside the TitleArea.
- Card link recipe: a block-level `Link` painted entirely with tokens (`var(--borderColor-default)`, `var(--borderRadius-medium, 8px)`, `var(--bgColor-default)`) plus `textDecoration: "none", color: "inherit"` so the card does not read as inline text link.
- Icon + two-line text row: horizontal `Stack` with `gap="condensed"` and `align="center"` wraps an octicon and a vertical `gap="none"` Stack of `Heading as="h2" variant="small"` over muted `Text`.
- Muted secondary text is `Text` with `style={{ color: "var(--fgColor-muted)" }}` — the color comes from the functional token, never a hex value.
- Semantic list discipline: the card grid is a `<ul>` with list styling zeroed inline, each card in an `<li>` — the Stack nests inside the list element, it does not replace it.
