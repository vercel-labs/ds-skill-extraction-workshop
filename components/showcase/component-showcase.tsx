"use client";

import {
  Button,
  CounterLabel,
  Label,
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
      {/* Button palette */}
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
        {/* Icon-only [VERIFY: icon-only via leadingVisual-only pattern] */}
        <Button variant="default" leadingVisual={HeartIcon} aria-label="Star" />
      </Stack>

      {/* Labels, branch indicator, counter badges */}
      <Stack direction="horizontal" gap="condensed" wrap="wrap" align="center">
        <Label variant="accent">enhancement</Label>
        <Label variant="success">approved</Label>
        <Label variant="attention">needs review</Label>
        <Label variant="danger">bug</Label>
        <Label variant="done">resolved</Label>

        <Stack direction="horizontal" gap="tight" align="center">
          <GitBranchIcon size={16} />
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            main
          </Text>
        </Stack>

        {/* CounterLabel variant: "secondary" = neutral, "primary" = accented */}
        <CounterLabel variant="secondary">12</CounterLabel>
        <CounterLabel variant="primary">3</CounterLabel>
      </Stack>
    </Stack>
  );
}
