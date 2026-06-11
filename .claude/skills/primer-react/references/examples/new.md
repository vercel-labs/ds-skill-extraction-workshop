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

- The form surface is one token-painted card `<div>` (`var(--bgColor-default)` + `var(--borderColor-default)` + `var(--borderRadius-large, 12px)` + `var(--shadow-resting-medium)` + `var(--base-size-24, 1.5rem)` padding) wrapping a single vertical Stack of rows.
- Every input row is a `FormControl` wrapping `Label` + input + optional `Caption` — label association comes from the wrapper, never a bare `<label>`; `required` lives on FormControl, not the input.
- Checkbox rows invert the order: `<Checkbox />` FIRST, then `FormControl.Label`, then `Caption` — the control precedes its label for checkbox-shaped rows.
- Text entry is `TextInput block` with `leadingVisual={RepoIcon}` (icon passed as a component reference, not an element); multi-line is `Textarea block rows={3} resize="vertical"`.
- Context banner is `Flash variant="default"` as the first Stack row — page-level context sits inside the card, above the first field.
- Action footer: top border `var(--borderColor-muted)` + horizontal Stack `justify="end"` with `Button variant="invisible"` Cancel before `Button variant="primary"` submit.
