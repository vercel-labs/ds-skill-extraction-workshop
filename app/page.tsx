"use client";

import { Stack } from "@primer/react";
import { PrMergedTheater } from "../components/showcase/pr-merged-theater";

export default function Page() {
  return (
    <Stack
      direction="vertical"
      align="center"
      justify="center"
      padding="spacious"
      style={{ minHeight: "100vh" }}
    >
      <PrMergedTheater />
    </Stack>
  );
}
