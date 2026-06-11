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

- Route index is a centred column (`maxWidth: 768`, `margin: "0 auto"`) of token-painted link cards inside an outer vertical Stack with `gap="spacious"` — the spacious gap separates the page title block from the navigation list.
- Each card paints with three tokens (`var(--bgColor-default)` background, `var(--borderColor-default)` border, `var(--borderRadius-medium, 8px)` corners) and uses `var(--base-size-16, 1rem)` for the inner padding — the inline fallbacks (`, 1rem`, `, 8px`) cover the case where a consumer drops a primitives import.
- Card body is a horizontal Stack with `align="center"` so the leading icon vertically centres against the two-line title-plus-description column built from an inner vertical Stack with `gap="none"` (title and description sit on adjacent baselines, not separated by an extra row gap).
- Page title block uses `PageHeader.TitleArea` wrapping `PageHeader.Title`, with `PageHeader.Description` outside the TitleArea — slot composition matters (TitleArea is the visual title group, Description is sibling chrome).
- Muted-foreground prose (`color: var(--fgColor-muted)`) is applied via the `style` prop on `Text`, not via a `variant` — Text exposes `size` and `weight` but no semantic foreground variant; the token goes through `style`.
