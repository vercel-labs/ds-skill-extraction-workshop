"use client"

import { Heading, Text, Label, CounterLabel, Stack } from "@primer/react"
import { MergeBox } from "@/components/showcase/merge-box"

const inlineCode: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "inherit",
  backgroundColor: "var(--bgColor-neutral-muted, rgba(129,139,152,0.12))",
  padding: "0 4px",
  borderRadius: "4px",
}

export default function Page() {
  return (
    <div
      style={{
        backgroundColor: "var(--bgColor-default, #ffffff)",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "768px", margin: "0 auto" }}>
        {/* Page header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
              <Heading as="h1" variant="medium">
                Merge pull request #482
              </Heading>
              <Label variant="success">Open</Label>
              <Stack direction="horizontal" gap="tight" align="center">
                <CounterLabel variant="secondary">3</CounterLabel>
                <Text size="small" style={{ color: "var(--fgColor-muted, #57606a)" }}>
                  commits
                </Text>
              </Stack>
            </Stack>
          </div>
          <Text as="p" size="small" style={{ color: "var(--fgColor-muted, #57606a)", margin: 0 }}>
            diego wants to merge 3 commits into{" "}
            <code style={inlineCode}>main</code>
            {" "}from{" "}
            <code style={inlineCode}>feat/skill-extraction</code>
          </Text>
        </div>

        <MergeBox />
      </div>
    </div>
  )
}
