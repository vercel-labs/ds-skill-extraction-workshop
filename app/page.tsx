"use client";

import { Heading, PageLayout, Stack, Text } from "@primer/react";
import { ComponentShowcase } from "../components/showcase/component-showcase";
import { CreateRepoCard } from "../components/showcase/create-repo-card";

export default function Page() {
  return (
    <PageLayout containerWidth="large">
      <PageLayout.Content>
        <Stack direction="vertical" gap="spacious">
          <Stack direction="vertical" gap="condensed">
            <Heading as="h2" variant="medium">
              Components
            </Heading>
            <Text style={{ color: "var(--fgColor-muted)" }}>
              Core Primer React primitives — buttons, labels, and counters.
            </Text>
            <ComponentShowcase />
          </Stack>

          <Stack direction="vertical" gap="condensed">
            <Heading as="h2" variant="medium">
              Composition
            </Heading>
            <Text style={{ color: "var(--fgColor-muted)" }}>
              A form card assembled from Primer tokens and components.
            </Text>
            <CreateRepoCard />
          </Stack>
        </Stack>
      </PageLayout.Content>
    </PageLayout>
  );
}
