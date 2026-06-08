"use client";

import { RepoIcon } from "@primer/octicons-react";
import { Avatar } from "@/ds/components/Avatar";
import { Button } from "@/ds/components/Button";
import { Checkbox } from "@/ds/components/Checkbox";
import { Flash } from "@/ds/components/Flash";
import { FormControl } from "@/ds/components/FormControl";
import { Heading } from "@/ds/components/Heading";
import { Select } from "@/ds/components/Select";
import { Stack } from "@/ds/components/Stack";
import { Text } from "@/ds/components/Text";
import { TextInput } from "@/ds/components/TextInput";
import { Textarea } from "@/ds/components/Textarea";

export function CreateRepoCard() {
  return (
    <div
      style={{
        backgroundColor: "var(--bgColor-default)",
        border: "1px solid var(--borderColor-default)",
        borderRadius: "var(--borderRadius-large)",
        boxShadow: "var(--shadow-resting-medium)",
        padding: "24px",
        maxWidth: 540,
      }}
    >
      <Stack direction="vertical" gap="normal">
        <Stack direction="horizontal" gap="normal" align="center">
          <Avatar
            src="https://avatars.githubusercontent.com/u/583231?v=4"
            size={40}
            alt="Octocat"
          />
          <Stack direction="vertical" gap="none">
            <Stack direction="horizontal" gap="tight" align="center">
              <RepoIcon size={16} />
              <Heading as="h3" variant="small">
                Create a new repository
              </Heading>
            </Stack>
            <Text style={{ color: "var(--fgColor-muted)", fontSize: 14 }}>
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
          <Select>
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

        <Stack direction="horizontal" justify="end" gap="condensed">
          <Button variant="invisible">Cancel</Button>
          <Button variant="primary">Create repository</Button>
        </Stack>
      </Stack>
    </div>
  );
}
