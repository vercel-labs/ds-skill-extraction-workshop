"use client";

import { ComponentShowcase } from "@/components/showcase/component-showcase";
import { CreateRepoCard } from "@/components/showcase/create-repo-card";
import { Heading } from "@/ds/components/Heading";
import { Stack } from "@/ds/components/Stack";
import { Text } from "@/ds/components/Text";

export default function Page() {
  return (
    <Stack
      direction="vertical"
      gap="spacious"
      style={{
        maxWidth: 768,
        margin: "0 auto",
        padding: "var(--base-size-24, 1.5rem)",
      }}
    >
      <Stack direction="vertical" gap="normal">
        <Stack direction="vertical" gap="condensed">
          <Heading as="h1" variant="medium">
            Components
          </Heading>
          <Text style={{ color: "var(--fgColor-muted)" }}>
            Buttons, labels, and counters from the design system.
          </Text>
        </Stack>
        <ComponentShowcase />
      </Stack>

      <Stack direction="vertical" gap="normal">
        <Stack direction="vertical" gap="condensed">
          <Heading as="h1" variant="medium">
            Composition
          </Heading>
          <Text style={{ color: "var(--fgColor-muted)" }}>
            A create-a-new-repository form composed from form-control fields.
          </Text>
        </Stack>
        <CreateRepoCard />
      </Stack>
    </Stack>
  );
}
