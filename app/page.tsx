"use client";

import { ComponentShowcase } from "@/components/showcase/component-showcase";
import { CreateRepoCard } from "@/components/showcase/create-repo-card";
import { Heading } from "@/ds/components/Heading";
import { Stack } from "@/ds/components/Stack";
import { Text } from "@/ds/components/Text";

export default function Page() {
  return (
    <Stack direction="vertical" gap="spacious" padding="spacious">
      <Stack direction="vertical" gap="condensed">
        <Heading as="h1" variant="medium">
          Components
        </Heading>
        <Text style={{ color: "var(--fgColor-muted)" }}>
          Buttons, labels, and counters from the design system.
        </Text>
        <ComponentShowcase />
      </Stack>

      <Stack direction="vertical" gap="condensed">
        <Heading as="h1" variant="medium">
          Composition
        </Heading>
        <Text style={{ color: "var(--fgColor-muted)" }}>
          A create-repository form composed from design-system primitives.
        </Text>
        <CreateRepoCard />
      </Stack>
    </Stack>
  );
}
