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

- Form-page shape: `PageLayout containerWidth="medium"` with the title block in `PageLayout.Header` (Heading + muted descriptive `Text` in a condensed vertical Stack) and the form card in `PageLayout.Content`.
- Token-painted card recipe: background `var(--bgColor-default)` + border `var(--borderColor-default)` + `var(--borderRadius-large, 12px)` + `var(--shadow-resting-medium)` + padding `var(--base-size-24, 1.5rem)` — every visual attribute from a var, zero hex.
- **Message surface + leading icon** (preferred composition category): a `Flash variant="default"` context banner leads the form body, and the first `TextInput` carries `leadingVisual={RepoIcon}` — the icon is passed as a component reference, not an element.
- FormControl row recipe: `FormControl.Label` then the input then `FormControl.Caption`; `required` lives on the `FormControl` wrapper, not the input.
- **Checkbox children order inverts text inputs** (asymmetric form-children trap): `Checkbox` comes FIRST, then `FormControl.Label`, then `FormControl.Caption` — the opposite of the label-first order used for TextInput/Textarea/Select rows.
- Action footer: a top-bordered (`var(--borderColor-muted)`) strip with a horizontal Stack `justify="end"` — `Button variant="invisible"` Cancel before `Button variant="primary"` submit.
- Inputs that should fill the card width take `block`; Textarea adds `rows` + `resize="vertical"`.
