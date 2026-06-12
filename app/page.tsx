"use client";

import {
  BranchName,
  Heading,
  Stack,
  StateLabel,
  Text,
} from "@primer/react";
import { MergeReadinessPanel } from "../components/showcase/merge-readiness-panel";

export default function Page() {
  return (
    <main
      style={{
        maxWidth: 1012,
        margin: "0 auto",
        paddingBlock: "var(--base-size-32, 32px)",
        paddingInline: "var(--base-size-24, 24px)",
      }}
    >
      <Stack direction="vertical" gap="spacious">
        <Stack direction="vertical" gap="condensed">
          <Stack
            direction="horizontal"
            align="start"
            justify="space-between"
            gap="normal"
            wrap="wrap"
          >
            <Heading as="h1" variant="large">
              Extract design tokens into a skill manifest{" "}
              <Text
                as="span"
                weight="light"
                style={{ color: "var(--fgColor-muted)" }}
              >
                #4128
              </Text>
            </Heading>
            <StateLabel status="pullOpened">Open</StateLabel>
          </Stack>

          <Stack
            direction="horizontal"
            align="center"
            gap="condensed"
            wrap="wrap"
          >
            <Text weight="semibold">@lena-petrov</Text>
            <Text style={{ color: "var(--fgColor-muted)" }}>
              wants to merge 14 commits into
            </Text>
            <BranchName as="span">main</BranchName>
            <Text style={{ color: "var(--fgColor-muted)" }}>from</Text>
            <BranchName as="span">platform/token-manifest</BranchName>
          </Stack>
        </Stack>

        <MergeReadinessPanel />
      </Stack>
    </main>
  );
}
