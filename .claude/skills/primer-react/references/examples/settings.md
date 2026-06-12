# Example: Settings

Lifted from `vercel-labs/primer-nextjs-template/app/settings/page.tsx` (next-app).

## Required imports

- `@primer/react`: Button, FormControl, Heading, NavList, PageLayout, Select, Stack, Text, TextInput, Textarea
- `@primer/octicons-react`: BellIcon, CreditCardIcon, KeyIcon, PersonIcon, type Icon
- Other: (none)

## Composition (verbatim)

```tsx
"use client";

// Sidebar-nav exemplar. Shape: PageLayout regions — Pane carries a NavList
// with leading-visual octicons (one item marked aria-current="page"), Content
// carries a stack of section headings each wrapping FormControl groups.
// NavList here is the root entrypoint (also re-exported from experimental).

import {
  Button,
  FormControl,
  Heading,
  NavList,
  PageLayout,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@primer/react";
import {
  BellIcon,
  CreditCardIcon,
  KeyIcon,
  PersonIcon,
  type Icon,
} from "@primer/octicons-react";

type SettingsRoute = {
  href: string;
  text: string;
  icon: Icon;
  current?: boolean;
};

const NAV_ITEMS: SettingsRoute[] = [
  { href: "#profile", text: "Profile", icon: PersonIcon, current: true },
  { href: "#billing", text: "Billing", icon: CreditCardIcon },
  { href: "#ssh-keys", text: "SSH keys", icon: KeyIcon },
  { href: "#notifications", text: "Notifications", icon: BellIcon },
];

export default function SettingsPage() {
  return (
    <PageLayout containerWidth="large">
      <PageLayout.Header>
        <Heading as="h1" variant="large">
          Settings
        </Heading>
      </PageLayout.Header>

      <PageLayout.Pane position="start" width="medium">
        <NavList aria-label="Account settings">
          {NAV_ITEMS.map((item) => {
            const ItemIcon = item.icon;
            return (
              <NavList.Item
                key={item.href}
                href={item.href}
                aria-current={item.current ? "page" : undefined}
              >
                <NavList.LeadingVisual>
                  <ItemIcon />
                </NavList.LeadingVisual>
                {item.text}
              </NavList.Item>
            );
          })}
        </NavList>
      </PageLayout.Pane>

      <PageLayout.Content>
        <Stack direction="vertical" gap="spacious">
          <section>
            <Stack direction="vertical" gap="normal">
              <Stack direction="vertical" gap="condensed">
                <Heading as="h2" variant="medium">
                  Public profile
                </Heading>
                <Text style={{ color: "var(--fgColor-muted)" }}>
                  This information appears on your profile and in @-mentions.
                </Text>
              </Stack>

              <FormControl>
                <FormControl.Label>Name</FormControl.Label>
                <TextInput block defaultValue="Diego de M." />
                <FormControl.Caption>
                  Your name may appear around GitHub where you contribute.
                </FormControl.Caption>
              </FormControl>

              <FormControl>
                <FormControl.Label>Bio</FormControl.Label>
                <Textarea
                  block
                  rows={3}
                  resize="vertical"
                  defaultValue="Builds workshops on agentic coding."
                />
                <FormControl.Caption>
                  You can @mention other users and organizations.
                </FormControl.Caption>
              </FormControl>

              <Stack direction="horizontal" justify="end">
                <Button variant="primary">Update profile</Button>
              </Stack>
            </Stack>
          </section>

          <div
            style={{ borderTop: "1px solid var(--borderColor-muted)" }}
            aria-hidden
          />

          <section>
            <Stack direction="vertical" gap="normal">
              <Stack direction="vertical" gap="condensed">
                <Heading as="h2" variant="medium">
                  Preferences
                </Heading>
                <Text style={{ color: "var(--fgColor-muted)" }}>
                  Tune how GitHub looks and behaves for you.
                </Text>
              </Stack>

              <FormControl>
                <FormControl.Label>Theme</FormControl.Label>
                <Select block defaultValue="system">
                  <Select.Option value="system">Sync with system</Select.Option>
                  <Select.Option value="light">Light</Select.Option>
                  <Select.Option value="dark">Dark</Select.Option>
                </Select>
              </FormControl>

              <FormControl>
                <FormControl.Label>Default branch</FormControl.Label>
                <TextInput block defaultValue="main" />
                <FormControl.Caption>
                  Used when creating new repositories.
                </FormControl.Caption>
              </FormControl>

              <Stack direction="horizontal" justify="end">
                <Button variant="primary">Save preferences</Button>
              </Stack>
            </Stack>
          </section>
        </Stack>
      </PageLayout.Content>
    </PageLayout>
  );
}
```

## What to copy

- Sidebar-nav shape: `PageLayout` with `PageLayout.Pane position="start" width="medium"` carrying a `NavList`, and `PageLayout.Content` carrying the form sections.
- NavList recipe: `aria-label` on the list, octicons via `NavList.LeadingVisual`, and exactly one item with `aria-current="page"` driven by data.
- Section shape inside Content: vertical `Stack gap="spacious"` of `<section>`s, each opening with `Heading as="h2" variant="medium"` + muted intro `Text` in a condensed Stack.
- **Select uses `defaultValue` here (uncontrolled)** — the styled-native-wrapper trap: prefer controlled `value` + `onChange` when the selection must drive UI; the lift is verbatim, the produced Select contract carries the rule.
- Per-section action row: horizontal Stack `justify="end"` with a single `Button variant="primary"` — each section commits independently.
- Section divider is a bare top-bordered `<div>` with `aria-hidden`, painted with `var(--borderColor-muted)`.
