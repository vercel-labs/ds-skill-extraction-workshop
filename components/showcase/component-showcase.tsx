"use client";

import {
  Button,
  CounterLabel,
  IconButton,
  Label,
  LabelGroup,
  Stack,
  Text,
} from "@primer/react";
import {
  DownloadIcon,
  GitBranchIcon,
  HeartIcon,
  PlusIcon,
  TrashIcon,
} from "@primer/octicons-react";

export function ComponentShowcase() {
  return (
    <Stack direction="vertical" gap="normal">
      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
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
        <IconButton icon={HeartIcon} aria-label="Star" variant="invisible" />
      </Stack>

      <Stack direction="horizontal" gap="normal" align="center" wrap="wrap">
        <LabelGroup>
          <Label variant="accent">enhancement</Label>
          <Label variant="success">approved</Label>
          <Label variant="attention">needs review</Label>
          <Label variant="danger">bug</Label>
          <Label variant="done">resolved</Label>
        </LabelGroup>

        <Stack direction="horizontal" gap="condensed" align="center">
          <GitBranchIcon />
          <Text style={{ color: "var(--fgColor-muted)" }}>main</Text>
        </Stack>

        <Stack direction="horizontal" gap="condensed" align="center">
          <CounterLabel>12</CounterLabel>
          <CounterLabel scheme="primary">3</CounterLabel>
        </Stack>
      </Stack>
    </Stack>
  );
}
