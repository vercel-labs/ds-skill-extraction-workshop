"use client";

import {
  Banner,
  Button,
  Checkbox,
  FormControl,
  Heading,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@primer/react";
import {
  MarkGithubIcon,
  RepoIcon,
} from "@primer/octicons-react";

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--bgColor-default)",
  border: "var(--borderWidth-thin) solid var(--borderColor-default)",
  borderRadius: "var(--borderRadius-medium)",
  boxShadow: "var(--shadow-resting-medium)",
  padding: "var(--base-size-24)",
  maxWidth: "32rem",
  width: "100%",
};

export function CreateRepoCard() {
  return (
    <div style={cardStyle}>
      <Stack direction="vertical" gap="normal">
        <Stack direction="horizontal" gap="normal" align="start">
          <MarkGithubIcon size={24} />
          <Stack direction="vertical" gap="condensed">
            <Stack direction="horizontal" gap="condensed" align="center">
              <RepoIcon />
              <Heading as="h2" variant="medium">
                Create a new repository
              </Heading>
            </Stack>
            <Text style={{ color: "var(--fgColor-muted)" }}>
              A repository contains all project files, including the revision
              history.
            </Text>
          </Stack>
        </Stack>

        <Banner
          variant="info"
          title="Account"
          hideTitle
          description="You are creating this repository in your personal account."
        />

        <FormControl required>
          <FormControl.Label>Repository name</FormControl.Label>
          <TextInput
            leadingVisual={RepoIcon}
            placeholder="awesome-project"
            block
          />
          <FormControl.Caption>
            Great repository names are short and memorable.
          </FormControl.Caption>
        </FormControl>

        <FormControl>
          <FormControl.Label>Description</FormControl.Label>
          <Textarea
            rows={3}
            placeholder="Optional description"
            resize="vertical"
            block
          />
        </FormControl>

        <FormControl>
          <FormControl.Label>Visibility</FormControl.Label>
          <Select>
            <Select.Option value="public">Public</Select.Option>
            <Select.Option value="private">Private</Select.Option>
          </Select>
        </FormControl>

        <FormControl>
          <Checkbox defaultChecked />
          <FormControl.Label>Initialize with README</FormControl.Label>
          <FormControl.Caption>
            This is where you can write a long description for your project.
          </FormControl.Caption>
        </FormControl>

        <Stack direction="horizontal" gap="condensed" justify="end">
          <Button variant="invisible">Cancel</Button>
          <Button variant="primary">Create repository</Button>
        </Stack>
      </Stack>
    </div>
  );
}
