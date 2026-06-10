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

- Form lives inside a token-painted card: `--bgColor-default` surface, `--borderColor-default` border, `--borderRadius-large` radius, `--shadow-resting-medium` shadow, `--base-size-24` padding — the full card recipe, not just a border.
- Every input is a `FormControl` wrapping `FormControl.Label` + the input + an optional `FormControl.Caption`; the caption is the help-text slot, never a bare `Text` under the input.
- `required` is set on the `FormControl`, not on the inner `TextInput` — the wrapper owns the required state so the label gets the required affordance.
- Checkbox rows invert the order: `Checkbox` comes **before** `FormControl.Label` inside the control (the documented Primer checkbox layout).
- Inputs that should span the card use `block`; icon affordances pass the octicon as a component to `leadingVisual` (`leadingVisual={RepoIcon}`), never as JSX.
- Action footer is a horizontal `Stack` with `gap="condensed"` and `justify="end"`, separated from the form by a `--borderColor-muted` top border: invisible Cancel first, primary submit last.
- A context note above the fields is `Flash variant="default"`, not an experimental `Banner`.
