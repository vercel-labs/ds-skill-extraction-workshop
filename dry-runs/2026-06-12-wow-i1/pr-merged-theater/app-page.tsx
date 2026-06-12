"use client";

import { useState } from "react";
import {
  BranchName,
  Heading,
  Stack,
  StateLabel,
  Text,
} from "@primer/react";
import { PrMergedTheater } from "../components/showcase/pr-merged-theater";

type Phase = "checking" | "ready" | "merging" | "merged";

export default function Page() {
  const [phase, setPhase] = useState<Phase>("checking");
  const merged = phase === "merged";

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
            <span
              style={{
                transition: "opacity 220ms ease-out",
                display: "inline-flex",
              }}
              key={merged ? "merged" : "open"}
            >
              {merged ? (
                <StateLabel status="pullMerged">Merged</StateLabel>
              ) : (
                <StateLabel status="pullOpened">Open</StateLabel>
              )}
            </span>
          </Stack>

          <Stack
            direction="horizontal"
            align="center"
            gap="condensed"
            wrap="wrap"
          >
            <Text weight="semibold">@lena-petrov</Text>
            <Text style={{ color: "var(--fgColor-muted)" }}>
              {merged ? "merged 14 commits into" : "wants to merge 14 commits into"}
            </Text>
            <BranchName as="span">main</BranchName>
            <Text style={{ color: "var(--fgColor-muted)" }}>from</Text>
            <BranchName as="span">platform/token-manifest</BranchName>
          </Stack>
        </Stack>

        <PrMergedTheater onPhaseChange={setPhase} />
      </Stack>
    </main>
  );
}
