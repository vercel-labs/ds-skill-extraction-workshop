"use client";

import {
  Button,
  Checkbox,
  FormControl,
  Heading,
  IconButton,
  Label,
  PageHeader,
  PageLayout,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@primer/react";
import {
  AlertIcon,
  CheckCircleFillIcon,
  GitMergeIcon,
  SyncIcon,
  XCircleFillIcon,
} from "@primer/octicons-react";
import type { CSSProperties, ReactNode } from "react";

const cardSurface: CSSProperties = {
  backgroundColor: "var(--bgColor-default)",
  border: "1px solid var(--borderColor-default)",
  borderRadius: "var(--borderRadius-large, 12px)",
  boxShadow: "var(--shadow-resting-medium)",
  overflow: "hidden",
};

const zonePadding: CSSProperties = {
  padding: "var(--base-size-20, 1.25rem) var(--base-size-24, 1.5rem)",
};

const zoneDivider: CSSProperties = {
  borderTop: "1px solid var(--borderColor-muted)",
};

const sectionHeading: CSSProperties = {
  fontSize: "var(--text-body-size-small, 0.75rem)",
  fontWeight: "var(--base-text-weight-semibold, 600)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--fgColor-muted)",
};

const mutedText: CSSProperties = { color: "var(--fgColor-muted)" };

function Zone({ children, divided }: { children: ReactNode; divided?: boolean }) {
  return <div style={{ ...zonePadding, ...(divided ? zoneDivider : {}) }}>{children}</div>;
}

function ReviewRow({
  handle,
  badge,
  badgeVariant,
}: {
  handle: string;
  badge: string;
  badgeVariant: "accent" | "done";
}) {
  return (
    <Stack direction="horizontal" align="center" gap="condensed" justify="space-between">
      <Stack direction="horizontal" align="center" gap="condensed">
        <span style={{ color: "var(--fgColor-success)", display: "inline-flex" }}>
          <CheckCircleFillIcon size={16} />
        </span>
        <Text weight="semibold">{handle}</Text>
        <Text size="small" style={mutedText}>
          approved these changes
        </Text>
        <Label variant={badgeVariant}>{badge}</Label>
      </Stack>
      <IconButton
        icon={SyncIcon}
        aria-label={`Re-request review from ${handle}`}
        variant="invisible"
      />
    </Stack>
  );
}

function CheckRow({
  name,
  ok,
  detail,
}: {
  name: string;
  ok: boolean;
  detail?: string;
}) {
  return (
    <Stack direction="horizontal" align="center" gap="condensed" justify="space-between">
      <Stack direction="horizontal" align="center" gap="condensed">
        <span
          style={{
            color: ok ? "var(--fgColor-success)" : "var(--fgColor-danger)",
            display: "inline-flex",
          }}
        >
          {ok ? <CheckCircleFillIcon size={16} /> : <XCircleFillIcon size={16} />}
        </span>
        <Text weight="semibold">{name}</Text>
        <Text size="small" style={mutedText}>
          {ok ? "Passing" : "Failing"}
        </Text>
        {detail ? (
          <Text size="small" style={mutedText}>
            — {detail}
          </Text>
        ) : null}
      </Stack>
      {ok ? null : <Button variant="invisible">Details</Button>}
    </Stack>
  );
}

export function MergeBox() {
  return (
    <PageLayout containerWidth="medium">
      <PageLayout.Header>
        <PageHeader>
          <PageHeader.TitleArea>
            <PageHeader.Title as="h1">Merge pull request #482</PageHeader.Title>
          </PageHeader.TitleArea>
          <PageHeader.Description>
            <Stack direction="horizontal" align="center" gap="condensed" wrap="wrap">
              <Text style={mutedText}>
                diego wants to merge 3 commits into{" "}
                <Text as="span" weight="semibold" style={{ color: "var(--fgColor-default)" }}>
                  <code>main</code>
                </Text>{" "}
                from{" "}
                <Text as="span" weight="semibold" style={{ color: "var(--fgColor-default)" }}>
                  <code>feat/skill-extraction</code>
                </Text>
              </Text>
              <Label variant="success">Open</Label>
              <Label>3</Label>
              <Text size="small" style={mutedText}>
                commits
              </Text>
            </Stack>
          </PageHeader.Description>
        </PageHeader>
      </PageLayout.Header>

      <PageLayout.Content>
        <div style={cardSurface}>
          {/* Zone 1 — Reviews */}
          <Zone>
            <Stack direction="vertical" gap="normal">
              <Heading as="h2" variant="small" style={sectionHeading}>
                Reviews
              </Heading>
              <Stack direction="vertical" gap="condensed">
                <ReviewRow handle="@octocat" badge="code owner" badgeVariant="accent" />
                <ReviewRow handle="@hubot" badge="maintainer" badgeVariant="done" />
              </Stack>
            </Stack>
          </Zone>

          {/* Zone 2 — Checks */}
          <Zone divided>
            <Stack direction="vertical" gap="normal">
              <Stack direction="horizontal" align="center" gap="condensed">
                <Heading as="h2" variant="small" style={sectionHeading}>
                  Checks
                </Heading>
                <Label variant="accent">5</Label>
              </Stack>
              <Stack direction="vertical" gap="condensed">
                <CheckRow name="CI build" ok />
                <CheckRow name="typecheck" ok />
                <CheckRow name="skill-audit" ok={false} detail="2 token violations" />
              </Stack>
            </Stack>
          </Zone>

          {/* Zone 3 — Conflict callout */}
          <Zone divided>
            <Stack direction="vertical" gap="normal">
              <div
                role="alert"
                style={{
                  backgroundColor: "var(--bgColor-danger-muted)",
                  border: "1px solid var(--borderColor-danger-muted)",
                  borderRadius: "var(--borderRadius-medium, 6px)",
                  color: "var(--fgColor-danger)",
                  padding: "var(--base-size-12, 0.75rem) var(--base-size-16, 1rem)",
                }}
              >
                <Stack direction="horizontal" align="start" gap="condensed">
                  <span style={{ display: "inline-flex", marginTop: 2 }}>
                    <AlertIcon size={16} />
                  </span>
                  <Text>
                    This branch has conflicts that must be resolved. Resolve conflicts in{" "}
                    <code>references/components.md</code> before merging.
                  </Text>
                </Stack>
              </div>
              <Stack direction="horizontal" justify="start">
                <Button variant="danger">Resolve conflicts</Button>
              </Stack>
            </Stack>
          </Zone>

          {/* Zone 4 — Merge controls */}
          <Zone divided>
            <Stack direction="vertical" gap="normal">
              <FormControl>
                <FormControl.Label>Merge method</FormControl.Label>
                <Select block defaultValue="merge">
                  <Select.Option value="merge">Create a merge commit</Select.Option>
                  <Select.Option value="squash">Squash and merge</Select.Option>
                  <Select.Option value="rebase">Rebase and merge</Select.Option>
                </Select>
              </FormControl>

              <FormControl required>
                <FormControl.Label>Commit headline</FormControl.Label>
                <TextInput block defaultValue="feat: extract skill from ds/ (#482)" />
              </FormControl>

              <FormControl>
                <FormControl.Label>Extended description</FormControl.Label>
                <Textarea
                  block
                  rows={4}
                  resize="vertical"
                  placeholder="Optional extended description…"
                />
              </FormControl>

              <FormControl>
                <Checkbox defaultChecked />
                <FormControl.Label>Delete branch after merge</FormControl.Label>
                <FormControl.Caption>
                  The <code>feat/skill-extraction</code> branch will be deleted once merged.
                </FormControl.Caption>
              </FormControl>
            </Stack>
          </Zone>

          {/* Footer */}
          <div style={{ ...zonePadding, ...zoneDivider }}>
            <Stack direction="horizontal" gap="condensed" justify="end">
              <Button variant="invisible">Cancel</Button>
              <Button variant="primary" leadingVisual={GitMergeIcon} disabled>
                Merge pull request
              </Button>
            </Stack>
          </div>
        </div>
      </PageLayout.Content>
    </PageLayout>
  );
}
