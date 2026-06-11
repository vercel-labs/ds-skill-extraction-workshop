# Example: New

Lifted from `vercel-labs/primer-nextjs-template/app/new/page.tsx` (next-app).

## Required imports

- `@primer/react`: Button, Checkbox, Flash, FormControl, Heading, PageLayout, Select, Stack, Text, TextInput, Textarea
- `@primer/octicons-react`: RepoIcon
- Other: (none)

## Composition (verbatim)

```tsx
"use client";

// Form-page exemplar. Surface is a token-painted card (background +
// border + radius + shadow all via vars) wrapping a vertical Stack of
// FormControl rows, with a Flash context banner up top and an action
// footer at the bottom. Every component imports from @primer/react root.

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
          <Heading as="h1" variant="large">
            Create a new repository
          </Heading>
          <Text style={{ color: "var(--fgColor-muted)" }}>
            A repository contains all project files, including the revision
            history.
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
              <TextInput
                block
                placeholder="awesome-project"
                leadingVisual={RepoIcon}
              />
              <FormControl.Caption>
                Great repository names are short and memorable.
              </FormControl.Caption>
            </FormControl>

            <FormControl>
              <FormControl.Label>Description</FormControl.Label>
              <Textarea
                block
                rows={3}
                placeholder="Optional description"
                resize="vertical"
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>Visibility</FormControl.Label>
              <Select block>
                <Select.Option value="public">Public</Select.Option>
                <Select.Option value="private">Private</Select.Option>
                <Select.Option value="internal">Internal</Select.Option>
              </Select>
              <FormControl.Caption>
                Anyone on the internet can see this repository when set to
                Public.
              </FormControl.Caption>
            </FormControl>

            <FormControl>
              <Checkbox defaultChecked />
              <FormControl.Label>Add a README file</FormControl.Label>
              <FormControl.Caption>
                This is where you can write a long description for your
                project.
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

- Form lives inside a token-painted card div: four tokens fully define its surface (`var(--bgColor-default)` background, `var(--borderColor-default)` border, `var(--borderRadius-large, 12px)` corners, `var(--shadow-resting-medium)` elevation) — no raw hex, no Tailwind classes.
- A page header sits OUTSIDE the card: `PageLayout.Header` carries the H1 + muted-foreground subtitle; the card holds the form body only. Splitting the chrome from the surface is what makes the page read as a real page, not a centered modal.
- The form is a vertical Stack with `gap="normal"`: a contextual `Flash variant="default"` (informational, not error) leads, then FormControl rows, then a divider, then the action footer. Each FormControl wraps `.Label`, the input, and (when needed) `.Caption` — Checkbox flips the order: `<Checkbox />` first, `.Label` second, `.Caption` third.
- The action footer is a horizontal Stack with `justify="end"` separated from the form by an explicit `borderTop` line painted in `var(--borderColor-muted)` and `paddingTop: var(--base-size-16, 1rem)` — Cancel is `variant="invisible"` (low-emphasis cancel pattern), submit is `variant="primary"`. Invisible before primary, never the reverse.
- `Textarea resize="vertical"` constrains the user to a single axis of resize — multi-line textareas in dense forms rarely need horizontal resize and unconstrained corner drag breaks the surrounding layout.
