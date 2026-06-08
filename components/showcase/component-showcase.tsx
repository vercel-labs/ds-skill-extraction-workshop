"use client";

import {
  DownloadIcon,
  GitBranchIcon,
  HeartIcon,
  PlusIcon,
  TrashIcon,
} from "@primer/octicons-react";

import { Button } from "@/ds/components/Button";
import { CounterLabel } from "@/ds/components/CounterLabel";
import { IconButton } from "@/ds/components/IconButton";
import { Label } from "@/ds/components/Label";
import { Stack } from "@/ds/components/Stack";
import { Text } from "@/ds/components/Text";

export function ComponentShowcase() {
  return (
    <Stack direction="vertical" gap="normal">
      <Stack direction="horizontal" gap="condensed" wrap="wrap" align="center">
        <Button variant="primary" leadingVisual={PlusIcon}>
          New repository
        </Button>
        <Button variant="default" leadingVisual={DownloadIcon}>
          Clone
        </Button>
        <Button variant="danger" leadingVisual={TrashIcon}>
          Delete
        </Button>
        <Button variant="invisible">Cancel</Button>
        <IconButton icon={HeartIcon} aria-label="Star" variant="default" />
      </Stack>

      <Stack direction="horizontal" gap="condensed" wrap="wrap" align="center">
        <Label variant="accent">enhancement</Label>
        <Label variant="success">approved</Label>
        <Label variant="attention">needs review</Label>
        <Label variant="danger">bug</Label>
        <Label variant="done">resolved</Label>

        <Stack direction="horizontal" gap="condensed" align="center">
          <GitBranchIcon />
          <Text>main</Text>
        </Stack>

        <CounterLabel>12</CounterLabel>
        <CounterLabel scheme="primary">3</CounterLabel>
      </Stack>
    </Stack>
  );
}
