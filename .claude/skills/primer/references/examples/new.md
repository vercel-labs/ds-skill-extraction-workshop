# Example: New

Lifted from `vercel-labs/primer-nextjs-template/app/new/page.tsx` (next-app).

## Required imports

- `@primer/react`: Button, Checkbox, Flash, FormControl, Heading, PageLayout, Select, Stack, Text, TextInput, Textarea
- `@primer/octicons-react`: RepoIcon
- Other: (none)

## Composition (verbatim)

```tsx
"use client";

import {
  Button,
  Checkbox,
  Flash,
  FormControl,
  Heading,
  PageLayout,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@primer/react";
import { RepoIcon } from "@primer/octicons-react";

export default function NewRepoPage() {
  return (
    <PageLayout containerWidth="medium">
      <PageLayout.Header>
        <Stack direction="vertical" gap="condensed">
          <Heading as="h1" variant="large">Create a new repository</Heading>
          <Text style={{ color: "var(--fgColor-muted)" }}>
            A repository contains all project files, including the revision history.
          </Text>
        </Stack>
      </PageLayout.Header>

      <PageLayout.Content>
        <div
          style={{
            backgroundColor: "var(--bgColor-default)",
            border: "1px solid var(--borderColor-default)",
            borderRadius: "var(--borderRadius-large, 12px)",
            boxShadow: "var(--shadow-resting-medium)",
            padding: "var(--base-size-24, 1.5rem)",
          }}
        >
          <Stack direction="vertical" gap="normal">
            <Flash variant="default">
              You are creating this repository in your personal account.
            </Flash>

            <FormControl required>
              <FormControl.Label>Repository name</FormControl.Label>
              <TextInput block placeholder="awesome-project" leadingVisual={RepoIcon} />
              <FormControl.Caption>
                Great repository names are short and memorable.
              </FormControl.Caption>
            </FormControl>

            <FormControl>
              <FormControl.Label>Description</FormControl.Label>
              <Textarea block rows={3} placeholder="Optional description" resize="vertical" />
            </FormControl>

            <FormControl>
              <FormControl.Label>Visibility</FormControl.Label>
              <Select block>
                <Select.Option value="public">Public</Select.Option>
                <Select.Option value="private">Private</Select.Option>
                <Select.Option value="internal">Internal</Select.Option>
              </Select>
              <FormControl.Caption>
                Anyone on the internet can see this repository when set to Public.
              </FormControl.Caption>
            </FormControl>

            <FormControl>
              <Checkbox defaultChecked />
              <FormControl.Label>Add a README file</FormControl.Label>
              <FormControl.Caption>
                This is where you can write a long description for your project.
              </FormControl.Caption>
            </FormControl>

            <FormControl>
              <Checkbox />
              <FormControl.Label>Add .gitignore</FormControl.Label>
              <FormControl.Caption>
                Choose which files not to track from a list of templates.
              </FormControl.Caption>
            </FormControl>

            <div
              style={{
                borderTop: "1px solid var(--borderColor-muted)",
                paddingTop: "var(--base-size-16, 1rem)",
              }}
            >
              <Stack direction="horizontal" gap="condensed" justify="end">
                <Button variant="invisible">Cancel</Button>
                <Button variant="primary">Create repository</Button>
              </Stack>
            </div>
          </Stack>
        </div>
      </PageLayout.Content>
    </PageLayout>
  );
}
```

## What to copy

- Form pages render their fields inside a token-painted card `<div>` (background + border + radius + shadow + padding all from tokens) — same paint recipe as the dashboard stat cards but with `shadow-resting-medium` and `base-size-24` padding for the heavier surface.
- Each input row is one `<FormControl>` carrying `FormControl.Label`, the input primitive (`TextInput`, `Textarea`, `Select`), and `FormControl.Caption` — label association is automatic; never wire `htmlFor`/`id` by hand.
- `<FormControl required>` is the prop, not `<FormControl.Label required>`; the wrapper drives the required-state visual + ARIA.
- Checkbox rows put `<Checkbox />` BEFORE `<FormControl.Label>` inside `<FormControl>` — the wrapper detects the inline checkbox and arranges the label-on-right layout automatically.
- Action footer is a horizontal `<Stack gap="condensed" justify="end">` with `<Button variant="invisible">Cancel</Button>` then `<Button variant="primary">Submit</Button>` — invisible on the left, primary on the right.
- Footer separator is a `<div style={{ borderTop: "1px solid var(--borderColor-muted)" }}>` plus internal top padding — Primer ships no `<Divider>` primitive for this slot.
- `<TextInput leadingVisual={Icon}>` takes the icon component as a prop (not a child); icons go via the prop slot.
