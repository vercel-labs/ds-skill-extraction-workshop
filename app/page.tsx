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
      padding="spacious"
      style={{ maxWidth: "768px", margin: "0 auto" }}
    >
      <Stack direction="vertical" gap="normal">
        <Stack direction="vertical" gap="condensed">
          <Heading as="h2" variant="medium">
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
          <Heading as="h2" variant="medium">
            Composition
          </Heading>
          <Text style={{ color: "var(--fgColor-muted)" }}>
            Form primitives composed into a create-repository card.
          </Text>
        </Stack>
        <CreateRepoCard />
      </Stack>
    </Stack>
  );
}
