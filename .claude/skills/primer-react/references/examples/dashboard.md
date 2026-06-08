# Example: Dashboard

Lifted from `vercel-labs/primer-nextjs-template/app/dashboard/page.tsx` (next-app).

## Required imports

- `@primer/react`: CounterLabel, Heading, Label, PageHeader, PageLayout, Stack, Text, Timeline
- `@primer/octicons-react`: GitPullRequestIcon, IssueOpenedIcon, RepoIcon, StarIcon
- Other: (none)

## Composition (verbatim)

```tsx
"use client";

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

- `PageLayout containerWidth="large"` wraps a dashboard with `PageLayout.Header` for the `PageHeader` and `PageLayout.Content` for all body sections — use the Header slot for the page title, not a raw heading in Content.
- Stat card: token-painted `div` with `flex: "1 1 200px"` + `wrap="wrap"` on the parent `Stack` produces a responsive grid of equal-width cards; `--borderRadius-large` (12px) + `--shadow-resting-small` + `--borderColor-default` are the card surface trio.
- Label + CounterLabel pairing: `<Label variant="accent">` for a categorical filter tag; `<CounterLabel>` for a numeric badge; both sit in a horizontal condensed Stack to the right of a heading — a repeatable header-action pattern.
- Timeline.Badge variant maps to Label's semantic variants (`success`, `open`, `closed`, `accent`) — use the status variant that matches the event type, not a hardcoded color.
- Section heading hierarchy: `variant="medium"` for `<h2>` section headings; `variant="large"` for `<h3>` stat values — heading variant is visual scale, independent of semantic level.
