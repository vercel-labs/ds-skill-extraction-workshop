"use client";

import {
  Button,
  Checkbox,
  Flash,
  FormControl,
  Heading,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@primer/react";
import { MarkGithubIcon, RepoIcon } from "@primer/octicons-react";

export function CreateRepoCard() {
  return (
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
        {/* Card header */}
        <Stack direction="horizontal" gap="condensed" align="start">
          <MarkGithubIcon size={24} />
          <Stack direction="vertical" gap="tight">
            <Stack direction="horizontal" gap="condensed" align="center">
              <RepoIcon size={16} />
              <Heading as="h1" variant="medium">
                Create a new repository
              </Heading>
            </Stack>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              A repository contains all project files, including the revision
              history.
            </Text>
          </Stack>
        </Stack>

        {/* Divider */}
        <div
          style={{
            borderTop: "1px solid var(--borderColor-muted)",
          }}
        />

        {/* Info callout */}
        <Flash variant="default">
          You are creating this repository in your personal account.
        </Flash>

        {/* Repository name */}
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

        {/* Description */}
        <FormControl>
          <FormControl.Label>
            Description{" "}
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              (optional)
            </Text>
          </FormControl.Label>
          <Textarea
            block
            rows={3}
            placeholder="Optional description"
            resize="vertical"
          />
        </FormControl>

        {/* Visibility */}
        <FormControl>
          <FormControl.Label>Visibility</FormControl.Label>
          <Select block>
            <Select.Option value="public">Public</Select.Option>
            <Select.Option value="private">Private</Select.Option>
          </Select>
        </FormControl>

        {/* Initialize with README */}
        <FormControl>
          <Checkbox defaultChecked />
          <FormControl.Label>Initialize with README</FormControl.Label>
          <FormControl.Caption>
            This is where you can write a long description for your project.
          </FormControl.Caption>
        </FormControl>

        {/* Footer */}
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
  );
}
