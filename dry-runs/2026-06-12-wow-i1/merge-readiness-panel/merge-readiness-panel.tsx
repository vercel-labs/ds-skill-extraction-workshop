"use client";

import {
  BranchName,
  Button,
  Checkbox,
  CounterLabel,
  Flash,
  FormControl,
  Heading,
  IconButton,
  Label,
  Select,
  Stack,
  StateLabel,
  Text,
  TextInput,
  Textarea,
} from "@primer/react";
import type { ReactNode } from "react";
import {
  AlertFillIcon,
  CheckCircleFillIcon,
  ChevronRightIcon,
  CommentIcon,
  DotFillIcon,
  GitMergeIcon,
  KebabHorizontalIcon,
  SkipIcon,
  StopIcon,
  XCircleFillIcon,
} from "@primer/octicons-react";

type ReviewState = "approved" | "changes-requested" | "re-review" | "pending";
type CheckStatus = "success" | "failure" | "neutral" | "skipped";

const reviewers: Array<{
  handle: string;
  role: string;
  state: ReviewState;
  note: string;
}> = [
  {
    handle: "lena-petrov",
    role: "Code owner · platform-runtime",
    state: "approved",
    note: "Approved 2 hours ago",
  },
  {
    handle: "amir-haddad",
    role: "Reviewer · design-systems",
    state: "approved",
    note: "Approved 41 minutes ago",
  },
  {
    handle: "sora-mendez",
    role: "Code owner · docs",
    state: "re-review",
    note: "Re-review requested after last push",
  },
  {
    handle: "jules-ito",
    role: "Reviewer",
    state: "changes-requested",
    note: "Requested changes · 1 unresolved thread",
  },
  {
    handle: "rin-andersen",
    role: "Reviewer · security",
    state: "pending",
    note: "Awaiting review",
  },
];

const checks: Array<{
  name: string;
  pipeline: string;
  status: CheckStatus;
  duration: string;
  detail: string;
}> = [
  {
    name: "build / linux-x86",
    pipeline: "stratus-ci",
    status: "success",
    duration: "4m 12s",
    detail: "Build succeeded",
  },
  {
    name: "build / darwin-arm64",
    pipeline: "stratus-ci",
    status: "success",
    duration: "5m 03s",
    detail: "Build succeeded",
  },
  {
    name: "unit-tests",
    pipeline: "stratus-ci",
    status: "success",
    duration: "2m 41s",
    detail: "1,284 passing",
  },
  {
    name: "integration / postgres-15",
    pipeline: "stratus-ci",
    status: "success",
    duration: "7m 18s",
    detail: "All suites green",
  },
  {
    name: "lint",
    pipeline: "stratus-ci",
    status: "success",
    duration: "0m 38s",
    detail: "0 errors, 0 warnings",
  },
  {
    name: "type-check",
    pipeline: "stratus-ci",
    status: "success",
    duration: "1m 09s",
    detail: "No type errors",
  },
  {
    name: "visual-regression",
    pipeline: "argo-snapshot",
    status: "failure",
    duration: "3m 47s",
    detail:
      "12 snapshots differ in components/token-manifest · review baseline before re-running",
  },
  {
    name: "bundle-size",
    pipeline: "stratus-ci",
    status: "neutral",
    duration: "0m 22s",
    detail: "Pending — waiting on dependency graph",
  },
  {
    name: "license-audit",
    pipeline: "compliance-bot",
    status: "skipped",
    duration: "—",
    detail: "Skipped on docs-only diff",
  },
];

const SUCCESS = checks.filter((c) => c.status === "success").length;
const FAILURE = checks.filter((c) => c.status === "failure").length;
const NEUTRAL = checks.filter((c) => c.status === "neutral").length;
const SKIPPED = checks.filter((c) => c.status === "skipped").length;
const TOTAL = checks.length;

const REVIEW_APPROVED = reviewers.filter((r) => r.state === "approved").length;

function IconSwatch({
  color,
  label,
  children,
  hidden,
}: {
  color: string;
  label?: string;
  children: ReactNode;
  hidden?: boolean;
}) {
  return (
    <span
      aria-label={hidden ? undefined : label}
      aria-hidden={hidden ? true : undefined}
      role={hidden ? undefined : "img"}
      style={{
        color,
        display: "inline-flex",
        alignItems: "center",
        lineHeight: 0,
      }}
    >
      {children}
    </span>
  );
}

function CheckStatusGlyph({ status }: { status: CheckStatus }) {
  switch (status) {
    case "success":
      return (
        <IconSwatch
          color="var(--fgColor-success, var(--fgColor-default))"
          label="Successful"
        >
          <CheckCircleFillIcon size={16} />
        </IconSwatch>
      );
    case "failure":
      return (
        <IconSwatch
          color="var(--fgColor-danger, var(--fgColor-default))"
          label="Failed"
        >
          <XCircleFillIcon size={16} />
        </IconSwatch>
      );
    case "neutral":
      return (
        <IconSwatch
          color="var(--fgColor-attention, var(--fgColor-muted))"
          label="In progress"
        >
          <DotFillIcon size={16} />
        </IconSwatch>
      );
    case "skipped":
      return (
        <IconSwatch color="var(--fgColor-muted)" label="Skipped">
          <SkipIcon size={16} />
        </IconSwatch>
      );
  }
}

function ReviewerStateGlyph({ state }: { state: ReviewState }) {
  switch (state) {
    case "approved":
      return (
        <IconSwatch
          color="var(--fgColor-success, var(--fgColor-default))"
          label="Approved"
        >
          <CheckCircleFillIcon size={16} />
        </IconSwatch>
      );
    case "changes-requested":
      return (
        <IconSwatch
          color="var(--fgColor-danger, var(--fgColor-default))"
          label="Changes requested"
        >
          <XCircleFillIcon size={16} />
        </IconSwatch>
      );
    case "re-review":
      return (
        <IconSwatch
          color="var(--fgColor-attention, var(--fgColor-muted))"
          label="Re-review requested"
        >
          <DotFillIcon size={16} />
        </IconSwatch>
      );
    case "pending":
      return (
        <IconSwatch color="var(--fgColor-muted)" label="Awaiting review">
          <CommentIcon size={16} />
        </IconSwatch>
      );
  }
}

function ZoneDivider() {
  return (
    <div
      role="presentation"
      style={{
        height: 1,
        backgroundColor: "var(--borderColor-muted)",
      }}
    />
  );
}

export function MergeReadinessPanel() {
  const blockerPresent = true;

  return (
    <section
      aria-label="Merge readiness"
      style={{
        backgroundColor: "var(--bgColor-default)",
        border: "1px solid var(--borderColor-default)",
        borderRadius: "var(--borderRadius-large, 12px)",
        overflow: "hidden",
      }}
    >
      <Stack direction="vertical" gap="none">
        {/* Zone 1 — Reviews */}
        <Stack
          direction="vertical"
          gap="normal"
          padding="normal"
          paddingBlock="normal"
          paddingInline="normal"
        >
          <Stack
            direction="horizontal"
            align="center"
            justify="space-between"
            gap="condensed"
          >
            <Stack direction="horizontal" align="center" gap="condensed">
              <Heading as="h2" variant="small">
                Reviews
              </Heading>
              <CounterLabel variant="secondary">{REVIEW_APPROVED}</CounterLabel>
              <Text
                size="small"
                style={{ color: "var(--fgColor-muted)" }}
              >
                of {reviewers.length} approved
              </Text>
            </Stack>
            <Label variant="attention">2 outstanding</Label>
          </Stack>

          <Stack as="ul" direction="vertical" gap="condensed" style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}>
            {reviewers.map((r) => (
              <Stack
                key={r.handle}
                as="li"
                direction="horizontal"
                align="center"
                gap="normal"
                justify="space-between"
              >
                <Stack direction="horizontal" align="center" gap="condensed">
                  <ReviewerStateGlyph state={r.state} />
                  <Stack direction="vertical" gap="none">
                    <Text weight="semibold">@{r.handle}</Text>
                    <Text
                      size="small"
                      style={{ color: "var(--fgColor-muted)" }}
                    >
                      {r.role}
                    </Text>
                  </Stack>
                </Stack>
                <Text
                  size="small"
                  style={{
                    color: "var(--fgColor-muted)",
                    textAlign: "right",
                  }}
                >
                  {r.note}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Stack>

        <ZoneDivider />

        {/* Zone 2 — Checks */}
        <Stack
          direction="vertical"
          gap="normal"
          paddingBlock="normal"
          paddingInline="normal"
        >
          <Stack
            direction="horizontal"
            align="center"
            justify="space-between"
            gap="condensed"
          >
            <Stack direction="horizontal" align="center" gap="condensed">
              <IconSwatch
                color="var(--fgColor-danger, var(--fgColor-default))"
                label="Failing"
              >
                <XCircleFillIcon size={16} />
              </IconSwatch>
              <Heading as="h2" variant="small">
                Some checks were not successful
              </Heading>
            </Stack>
            <IconButton
              icon={KebabHorizontalIcon}
              aria-label="Check options"
              variant="invisible"
              size="small"
            />
          </Stack>

          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            {FAILURE} failing, {NEUTRAL} in progress, {SKIPPED} skipped, and{" "}
            {SUCCESS} successful checks ({TOTAL} total)
          </Text>

          <Stack as="ul" direction="vertical" gap="none" style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            border: "1px solid var(--borderColor-muted)",
            borderRadius: "var(--borderRadius-medium, 8px)",
            overflow: "hidden",
          }}>
            {checks.map((c, idx) => (
              <Stack
                key={c.name}
                as="li"
                direction="horizontal"
                align="center"
                gap="condensed"
                paddingBlock="condensed"
                paddingInline="normal"
                style={{
                  borderTop:
                    idx === 0 ? "none" : "1px solid var(--borderColor-muted)",
                }}
              >
                <IconSwatch color="var(--fgColor-muted)" hidden>
                  <ChevronRightIcon size={12} />
                </IconSwatch>
                <CheckStatusGlyph status={c.status} />
                <Stack direction="vertical" gap="none" style={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="horizontal" align="center" gap="condensed">
                    <Text weight="semibold">{c.name}</Text>
                    <Text
                      size="small"
                      style={{ color: "var(--fgColor-muted)" }}
                    >
                      / {c.pipeline}
                    </Text>
                  </Stack>
                  {c.status === "failure" ? (
                    <Text
                      size="small"
                      style={{ color: "var(--fgColor-danger, var(--fgColor-default))" }}
                    >
                      {c.detail}
                    </Text>
                  ) : (
                    <Text
                      size="small"
                      style={{ color: "var(--fgColor-muted)" }}
                    >
                      {c.detail}
                    </Text>
                  )}
                </Stack>
                <Text
                  size="small"
                  style={{
                    color: "var(--fgColor-muted)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {c.duration}
                </Text>
                <Button size="small" variant="invisible">
                  Details
                </Button>
              </Stack>
            ))}
          </Stack>
        </Stack>

        <ZoneDivider />

        {/* Zone 3 — Blocker */}
        <Stack
          direction="vertical"
          gap="condensed"
          paddingBlock="normal"
          paddingInline="normal"
        >
          <Flash variant="danger">
            <Stack direction="horizontal" align="center" gap="normal" justify="space-between">
              <Stack direction="horizontal" align="center" gap="condensed">
                <AlertFillIcon size={16} aria-hidden />
                <Stack direction="vertical" gap="none">
                  <Text weight="semibold">
                    This branch has conflicts that must be resolved
                  </Text>
                  <Text size="small">
                    Conflicts in 3 files · packages/tokens/manifest.ts,
                    packages/tokens/index.ts, docs/migration.md
                  </Text>
                </Stack>
              </Stack>
              <Stack direction="horizontal" align="center" gap="condensed">
                <Button variant="default" size="small">
                  Resolve conflicts
                </Button>
                <Button variant="invisible" size="small">
                  Command line instructions
                </Button>
              </Stack>
            </Stack>
          </Flash>
        </Stack>

        <ZoneDivider />

        {/* Zone 4 — Merge controls */}
        <Stack
          direction="vertical"
          gap="normal"
          paddingBlock="normal"
          paddingInline="normal"
        >
          <Stack direction="horizontal" align="center" gap="condensed">
            <GitMergeIcon size={16} aria-hidden />
            <Heading as="h2" variant="small">
              Merge pull request
            </Heading>
          </Stack>

          <Stack direction="horizontal" gap="normal" align="end" wrap="wrap">
            <div style={{ flex: "0 0 220px" }}>
              <FormControl>
                <FormControl.Label>Merge method</FormControl.Label>
                <Select
                  defaultValue="squash"
                  block
                  aria-label="Merge method"
                >
                  <Select.Option value="merge">
                    Create a merge commit
                  </Select.Option>
                  <Select.Option value="squash">
                    Squash and merge
                  </Select.Option>
                  <Select.Option value="rebase">Rebase and merge</Select.Option>
                </Select>
                <FormControl.Caption>
                  All commits combined into one with the headline below.
                </FormControl.Caption>
              </FormControl>
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <FormControl>
                <FormControl.Label>Commit headline</FormControl.Label>
                <TextInput
                  defaultValue="Extract design tokens into a skill manifest (#4128)"
                  block
                />
              </FormControl>
            </div>
          </Stack>

          <FormControl>
            <FormControl.Label>Extended description</FormControl.Label>
            <Textarea
              resize="vertical"
              block
              defaultValue={`Adds a manifest generator that walks @stratus/tokens and emits a typed JSON descriptor.

- New CLI: \`stratus tokens manifest\`
- Output shape documented in docs/skills/tokens.md
- Companion skill consumes the manifest at install time
`}
            />
            <FormControl.Caption>
              Markdown supported. Co-authors will be detected from commit
              trailers.
            </FormControl.Caption>
          </FormControl>

          <FormControl layout="horizontal">
            <Checkbox defaultChecked />
            <FormControl.Label>Delete branch after merge</FormControl.Label>
            <FormControl.Caption>
              {`Removes `}
              <BranchName as="span">platform/token-manifest</BranchName>
              {` from origin. The default branch is not affected.`}
            </FormControl.Caption>
          </FormControl>

          <Stack
            direction="horizontal"
            align="center"
            justify="space-between"
            gap="normal"
          >
            <Stack direction="horizontal" align="center" gap="condensed">
              <IconSwatch
                color="var(--fgColor-danger, var(--fgColor-default))"
                hidden
              >
                <StopIcon size={16} />
              </IconSwatch>
              <Text
                size="small"
                style={{ color: "var(--fgColor-muted)" }}
                id="merge-blocker-reason"
              >
                Merging is unavailable until the conflicts above are resolved.
              </Text>
            </Stack>
            <Stack direction="horizontal" align="center" gap="condensed">
              <Button variant="invisible">Cancel</Button>
              <Button
                variant="primary"
                leadingVisual={GitMergeIcon}
                disabled={blockerPresent}
                aria-describedby="merge-blocker-reason"
              >
                Merge pull request
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </section>
  );
}
