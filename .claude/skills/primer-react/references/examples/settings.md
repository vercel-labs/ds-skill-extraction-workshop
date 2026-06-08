# Example: Settings

Lifted from `vercel-labs/primer-nextjs-template/app/settings/page.tsx` (next-app).

## Required imports

- `@primer/react`: Button, FormControl, Heading, NavList, PageLayout, Select, Stack, Text, TextInput, Textarea
- `@primer/octicons-react`: BellIcon, CreditCardIcon, KeyIcon, PersonIcon
- Other: (none)

## Composition (verbatim)

```tsx
"use client";

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

- Two-panel layout: `<PageLayout.Pane position="start" width="medium">` renders the sidebar nav before `<PageLayout.Content>` — `position="start"` pins the pane to the left; `width="medium"` is the canonical settings-nav width.
- `NavList aria-label`: always pass `aria-label` to `NavList` when it is the primary navigation for a section — the label identifies it as a landmark to screen readers.
- Active nav item: `aria-current={item.current ? "page" : undefined}` on `NavList.Item` — use `"page"` for the currently viewed section, `undefined` (not `false`) for inactive items to avoid cluttering the accessibility tree.
- `NavList.LeadingVisual`: wrap the icon in `<NavList.LeadingVisual>` rather than passing it via a prop — this is the compound-component slot that Primer uses to position and size the visual.
- Section dividers: a `<div style={{ borderTop: "1px solid var(--borderColor-muted)" }} aria-hidden />` between settings sections — uses `--borderColor-muted` (not `--borderColor-default`), which is the subtle horizontal rule treatment; `aria-hidden` removes it from the accessibility tree.
- Section heading hierarchy: condensed inner Stack with `<Heading as="h2" variant="medium">` + muted description text, then a normal-gap Stack of form controls — this is the canonical settings section block.
