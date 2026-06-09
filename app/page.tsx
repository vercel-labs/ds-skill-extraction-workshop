"use client";

import { Heading, Stack, Text } from "@primer/react";
import { ComponentShowcase } from "@/components/showcase/component-showcase";
import { CreateRepoCard } from "@/components/showcase/create-repo-card";

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Stack direction="vertical" gap="normal">
      <Stack direction="vertical" gap="condensed">
        <Heading as="h2" variant="medium">
          {title}
        </Heading>
        <Text style={{ color: "var(--fgColor-muted)" }}>{subtitle}</Text>
      </Stack>
      {children}
    </Stack>
  );
}

export default function Page() {
  return (
    <Stack
      direction="vertical"
      gap="spacious"
      padding="spacious"
      style={{ maxWidth: "48rem", marginInline: "auto" }}
    >
      <Section
        title="Components"
        subtitle="The full action, label, and metadata palette."
      >
        <ComponentShowcase />
      </Section>
      <Section
        title="Composition"
        subtitle="The palette assembled into a create-repository surface."
      >
        <CreateRepoCard />
      </Section>
    </Stack>
  );
}
