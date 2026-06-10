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

- Sidebar-nav shell is PageLayout regions: `PageLayout.Header` (page h1), `PageLayout.Pane position="start" width="medium"` (the nav), `PageLayout.Content` (the form sections).
- The nav is `NavList aria-label="..."` with `NavList.Item href` rows; the active row carries `aria-current="page"` and each row's octicon sits in `NavList.LeadingVisual`.
- Each content section is a `<section>` with a heading block (`Heading as="h2" variant="medium"` over muted `Text`) followed by FormControl rows, all in vertical Stacks (`spacious` between sections, `normal` within).
- Section divider is an `aria-hidden` `div` with only `borderTop: "1px solid var(--borderColor-muted)"` — a token-painted rule, not an `<hr>`.
- Each section closes with its own right-aligned action row (horizontal Stack `justify="end"` with a single `Button variant="primary"`) — per-section save, not one global footer.
- Inputs take `block` + `defaultValue` for uncontrolled prefilled forms; `Textarea` adds `rows` and `resize="vertical"`.
