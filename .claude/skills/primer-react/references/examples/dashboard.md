# Example: Dashboard

Lifted from `vercel-labs/primer-nextjs-template/app/dashboard/page.tsx` (next-app).

## Required imports

- `@primer/react`: CounterLabel, Heading, Label, PageHeader, PageLayout, Stack, Text, Timeline
- `@primer/octicons-react`: GitPullRequestIcon, IssueOpenedIcon, RepoIcon, StarIcon, type Icon
- Other: (none)

## Composition (verbatim)

```tsx
"use client";

// Multi-section dashboard exemplar. Shape: PageHeader + horizontal Stack of
// token-painted stat cards + a Timeline of recent activity using badge
// variants. All imports from @primer/react root + @primer/octicons-react.

import {
  CounterLabel,
  Heading,
  Label,
  PageHeader,
  PageLayout,
  Stack,
  Text,
  Timeline,
} from "@primer/react";
import {
  GitPullRequestIcon,
  IssueOpenedIcon,
  RepoIcon,
  StarIcon,
  type Icon,
} from "@primer/octicons-react";

type Stat = {
  label: string;
  value: string;
  delta: string;
  icon: Icon;
};

const STATS: Stat[] = [
  { label: "Active repositories", value: "18", delta: "+2 this month", icon: RepoIcon },
  { label: "Open issues", value: "47", delta: "12 assigned to you", icon: IssueOpenedIcon },
  { label: "Open pull requests", value: "9", delta: "3 ready for review", icon: GitPullRequestIcon },
  { label: "Stars earned", value: "1.2k", delta: "+38 this week", icon: StarIcon },
];

type Activity = {
  id: number;
  badgeVariant: "success" | "open" | "closed" | "accent";
  title: string;
  body: string;
  meta: string;
  badgeIcon: Icon;
};

const ACTIVITY: Activity[] = [
  {
    id: 1,
    badgeVariant: "success",
    badgeIcon: GitPullRequestIcon,
    title: "Merged primer-nextjs-template#42",
    body: "feat: ship composition exemplars for the meta-skill lift.",
    meta: "2 hours ago",
  },
  {
    id: 2,
    badgeVariant: "open",
    badgeIcon: IssueOpenedIcon,
    title: "Opened extract-ds-skill#118",
    body: "Phase 2 should walk app/**/page.tsx and components/showcase/*.tsx.",
    meta: "yesterday",
  },
  {
    id: 3,
    badgeVariant: "accent",
    badgeIcon: StarIcon,
    title: "Starred ship-2025-companion",
    body: "Workshop scaffolding for the agentic-coding session.",
    meta: "3 days ago",
  },
  {
    id: 4,
    badgeVariant: "closed",
    badgeIcon: IssueOpenedIcon,
    title: "Closed primer-nextjs-template#40",
    body: "Resolved: the smoke-test page was missing border-radius tokens.",
    meta: "last week",
  },
];

export default function DashboardPage() {
  return (
    <PageLayout containerWidth="large">
      <PageLayout.Header>
        <PageHeader>
          <PageHeader.TitleArea>
            <PageHeader.Title>Dashboard</PageHeader.Title>
          </PageHeader.TitleArea>
          <PageHeader.Description>
            <Text style={{ color: "var(--fgColor-muted)" }}>
              Activity across the projects you maintain.
            </Text>
          </PageHeader.Description>
        </PageHeader>
      </PageLayout.Header>

      <PageLayout.Content>
        <Stack direction="vertical" gap="spacious">
          <Stack direction="horizontal" gap="normal" wrap="wrap">
            {STATS.map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div
                  key={stat.label}
                  style={{
                    flex: "1 1 200px",
                    minWidth: 200,
                    backgroundColor: "var(--bgColor-default)",
                    border: "1px solid var(--borderColor-default)",
                    borderRadius: "var(--borderRadius-large, 12px)",
                    boxShadow: "var(--shadow-resting-small)",
                    padding: "var(--base-size-16, 1rem)",
                  }}
                >
                  <Stack direction="vertical" gap="condensed">
                    <Stack
                      direction="horizontal"
                      gap="condensed"
                      align="center"
                      justify="space-between"
                    >
                      <Text
                        size="small"
                        weight="semibold"
                        style={{ color: "var(--fgColor-muted)" }}
                      >
                        {stat.label}
                      </Text>
                      <StatIcon size={16} />
                    </Stack>
                    <Heading as="h3" variant="large">
                      {stat.value}
                    </Heading>
                    <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                      {stat.delta}
                    </Text>
                  </Stack>
                </div>
              );
            })}
          </Stack>

          <section>
            <Stack direction="vertical" gap="normal">
              <Stack
                direction="horizontal"
                gap="condensed"
                align="center"
                justify="space-between"
              >
                <Heading as="h2" variant="medium">
                  Recent activity
                </Heading>
                <Stack direction="horizontal" gap="condensed" align="center">
                  <Label variant="accent">Last 7 days</Label>
                  <CounterLabel>{ACTIVITY.length}</CounterLabel>
                </Stack>
              </Stack>

              <Timeline>
                {ACTIVITY.map((item) => {
                  const BadgeIcon = item.badgeIcon;
                  return (
                    <Timeline.Item key={item.id}>
                      <Timeline.Badge variant={item.badgeVariant}>
                        <BadgeIcon size={16} />
                      </Timeline.Badge>
                      <Timeline.Body>
                        <Stack direction="vertical" gap="none">
                          <Text weight="semibold">{item.title}</Text>
                          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                            {item.body}
                          </Text>
                          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                            {item.meta}
                          </Text>
                        </Stack>
                      </Timeline.Body>
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            </Stack>
          </section>
        </Stack>
      </PageLayout.Content>
    </PageLayout>
  );
}
```

## What to copy

- Multi-section page shape: `PageLayout` regions (`Header` / `Content`) with a vertical `Stack` `gap="spacious"` separating sections inside Content.
- Stat-card recipe: a wrapping horizontal `Stack` (`wrap="wrap"`) of token-painted `<div>`s — `flex: "1 1 200px"` for fluid columns, surface from `var(--bgColor-default)`, border, `var(--borderRadius-large, 12px)`, `var(--shadow-resting-small)`, padding `var(--base-size-16, 1rem)`.
- Section header row is a horizontal Stack with `justify="space-between"`: `Heading as="h2" variant="medium"` left, metadata chips (`Label variant="accent"` + `CounterLabel`) right.
- **Lifecycle-transition surface** (preferred composition category): `Timeline` with `Timeline.Badge variant` keyed to the event lifecycle (`success` merged, `open`, `closed`, `accent`) and an octicon inside the badge — state is expressed by the badge variant, not by text color.
- Three-line activity entry: vertical `Stack gap="none"` of semibold `Text`, muted body `Text size="small"`, muted meta `Text size="small"` inside `Timeline.Body`.
- Headings carry both semantics and scale separately: `as` sets the document outline (`h2`/`h3`), `variant` sets the visual size — the two are chosen independently.
