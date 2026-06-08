# Example: Dashboard

Lifted from `vercel-labs/primer-nextjs-template/app/dashboard/page.tsx` (next-app).

## Required imports

- `@primer/react`: CounterLabel, Heading, Label, PageHeader, PageLayout, Stack, Text, Timeline
- `@primer/octicons-react`: GitPullRequestIcon, IssueOpenedIcon, RepoIcon, StarIcon, type Icon
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

- A stat-card row is a horizontal `Stack` with `wrap="wrap"`; each card is a token-painted `<div>` (`flex: 1 1 200px`) carrying the same surface/border/radius/shadow token quartet as the form card, with `--shadow-resting-small` for the lighter resting elevation.
- Inside a card, the label row is a horizontal `Stack` with `justify="space-between"` (muted semibold `Text` + octicon), the value is a `Heading as="h3" variant="large"`, the delta is muted small `Text`.
- A section header pairs a `Heading` on the left with a metadata cluster on the right (`Label variant="accent"` + `CounterLabel`) via `justify="space-between"`.
- Activity feeds use `Timeline` → `Timeline.Item` → `Timeline.Badge variant=…` (carrying a sized octicon) + `Timeline.Body`; the badge variant is data-driven (`success`/`open`/`closed`/`accent`), matching the status-color roles.
