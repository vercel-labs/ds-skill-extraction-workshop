"use client";

import { MarkGithubIcon, RepoIcon } from "@primer/octicons-react";

import { Button } from "@/ds/components/Button";
import { Checkbox } from "@/ds/components/Checkbox";
import { Flash } from "@/ds/components/Flash";
import { FormControl } from "@/ds/components/FormControl";
import { Heading } from "@/ds/components/Heading";
import { Select } from "@/ds/components/Select";
import { Stack } from "@/ds/components/Stack";
import { Text } from "@/ds/components/Text";
import { Textarea } from "@/ds/components/Textarea";
import { TextInput } from "@/ds/components/TextInput";

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
        <Stack direction="horizontal" gap="normal" align="start">
          <MarkGithubIcon size={20} />
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

        <Flash variant="default">
          You are creating this repository in your personal account.
        </Flash>

        <FormControl required>
          <FormControl.Label>Repository name</FormControl.Label>
          <TextInput
            block
            leadingVisual={RepoIcon}
            placeholder="awesome-project"
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
          </Select>
        </FormControl>

        <FormControl>
          <Checkbox defaultChecked />
          <FormControl.Label>Add a README file</FormControl.Label>
          <FormControl.Caption>
            This is where you can write a long description for your project.
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
  );
}
