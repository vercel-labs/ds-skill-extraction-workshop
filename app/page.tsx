"use client";

import { Heading } from "@/ds/components/Heading";
import { Stack } from "@/ds/components/Stack";
import { Text } from "@/ds/components/Text";

import { ComponentShowcase } from "@/components/showcase/component-showcase";
import { CreateRepoCard } from "@/components/showcase/create-repo-card";

export default function Page() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 96px" }}>
      <Stack direction="vertical" gap="spacious">
        <Stack direction="vertical" gap="condensed">
          <Heading as="h2" variant="medium">
            Components
          </Heading>
          <Text style={{ color: "var(--fgColor-muted)" }}>
            Buttons, labels, and counters from the design system.
          </Text>
          <ComponentShowcase />
        </Stack>

        <Stack direction="vertical" gap="condensed">
          <Heading as="h2" variant="medium">
            Composition
          </Heading>
          <Text style={{ color: "var(--fgColor-muted)" }}>
            Form primitives composed into a create-repository card.
          </Text>
          <CreateRepoCard />
        </Stack>
      </Stack>
    </main>
  );
}
