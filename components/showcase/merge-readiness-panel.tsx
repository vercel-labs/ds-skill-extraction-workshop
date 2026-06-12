"use client";

import type { ReactNode } from "react";
import {
  BranchName,
  Button,
  Checkbox,
  CounterLabel,
  Flash,
  FormControl,
  Heading,
  IconButton,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@primer/react";
import {
  AlertIcon,
  CheckCircleFillIcon,
  ClockIcon,
  DotFillIcon,
  FileDiffIcon,
  GitMergeIcon,
  KebabHorizontalIcon,
  SkipFillIcon,
  SyncIcon,
  XCircleFillIcon,
} from "@primer/octicons-react";

type ReviewState = "approved" | "changes-requested" | "re-review-requested" | "pending";

type Reviewer = {
  handle: string;
  role: string;
  state: ReviewState;
  note: string;
};

const reviewers: Reviewer[] = [
  {
    handle: "marisol-vega",
    role: "Code owner · platform-runtime",
    state: "approved",
    note: "Approved 2 hours ago",
  },
  {
    handle: "kenji-okafor",
    role: "Reviewer · design-systems",
    state: "approved",
    note: "Approved 47 minutes ago",
  },
  {
    handle: "priya-rao",
    role: "Code owner · security",
    state: "changes-requested",
    note: "Requested changes yesterday — re-review pending",
  },
  {
    handle: "iris-bauman",
    role: "Reviewer · docs",
    state: "re-review-requested",
    note: "Re-review requested 11 minutes ago",
  },
  {
    handle: "tomas-akkerman",
    role: "Reviewer · billing",
    state: "pending",
    note: "Awaiting response",
  },
];

type CheckStatus = "success" | "failure" | "running" | "skipped" | "queued";

type Check = {
  app: string;
  name: string;
  status: CheckStatus;
  detail: string;
  duration?: string;
};

const checks: Check[] = [
  { app: "build", name: "build / linux-x64", status: "success", detail: "Successful in 3m 12s", duration: "3m 12s" },
  { app: "build", name: "build / linux-arm64", status: "success", detail: "Successful in 3m 41s", duration: "3m 41s" },
  { app: "build", name: "build / darwin-arm64", status: "success", detail: "Successful in 4m 02s", duration: "4m 02s" },
  { app: "test", name: "test / unit", status: "success", detail: "1,284 tests passed in 1m 18s", duration: "1m 18s" },
  { app: "test", name: "test / integration", status: "success", detail: "Successful in 2m 47s", duration: "2m 47s" },
  { app: "test", name: "test / e2e (chromium)", status: "success", detail: "Successful in 5m 09s", duration: "5m 09s" },
  { app: "test", name: "test / e2e (firefox)", status: "running", detail: "In progress — 4m 38s elapsed" },
  {
    app: "lint",
    name: "lint / typecheck",
    status: "failure",
    detail: "TS2322 in packages/manifest/src/index.ts — Token['scope'] missing in returned object",
  },
  { app: "lint", name: "lint / eslint", status: "success", detail: "Successful in 22s", duration: "22s" },
  { app: "security", name: "security / codeql", status: "success", detail: "No new findings", duration: "1m 56s" },
  { app: "security", name: "security / dependency-review", status: "skipped", detail: "Skipped — no manifest changes" },
  { app: "deploy", name: "deploy / preview", status: "queued", detail: "Waiting for required checks" },
];

const successCount = checks.filter((c) => c.status === "success").length;
const failureCount = checks.filter((c) => c.status === "failure").length;
const runningCount = checks.filter((c) => c.status === "running").length;
const skippedCount = checks.filter((c) => c.status === "skipped").length;
const queuedCount = checks.filter((c) => c.status === "queued").length;

const hasMergeBlocker = true;

export function MergeReadinessPanel() {
  return (
    <Stack
      as="section"
      direction="vertical"
      gap="none"
      aria-label="Merge readiness"
      style={{
        border: "1px solid var(--borderColor-default)",
        borderRadius: "var(--borderRadius-large, 12px)",
        backgroundColor: "var(--bgColor-default)",
        boxShadow: "var(--shadow-resting-medium)",
        overflow: "hidden",
      }}
    >
      <ReviewsZone />
      <Divider />
      <ChecksZone />
      <Divider />
      <BlockerZone />
      <Divider />
      <MergeControlsZone />
    </Stack>
  );
}

function Divider() {
  return (
    <div
      role="presentation"
      style={{
        borderTop: "1px solid var(--borderColor-muted)",
      }}
    />
  );
}

function ZoneShell({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Stack
      direction="vertical"
      gap="normal"
      padding="normal"
      style={{
        paddingBlock: "var(--base-size-16, 16px)",
        paddingInline: "var(--base-size-24, 24px)",
      }}
    >
      <Stack
        direction="horizontal"
        align="center"
        justify="space-between"
        gap="condensed"
        wrap="wrap"
      >
        <Heading as="h2" variant="medium" style={{ fontSize: "1rem" }}>
          {title}
        </Heading>
        {meta ? <div>{meta}</div> : null}
      </Stack>
      {children}
    </Stack>
  );
}

function ReviewsZone() {
  const approved = reviewers.filter((r) => r.state === "approved").length;
  const blocking = reviewers.filter((r) => r.state === "changes-requested").length;
  const reReview = reviewers.filter((r) => r.state === "re-review-requested").length;
  const pending = reviewers.filter((r) => r.state === "pending").length;

  return (
    <ZoneShell
      title="Reviews"
      meta={
        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          <ReviewSummaryPill tone="success" label={`${approved} approved`} />
          {blocking > 0 ? (
            <ReviewSummaryPill tone="danger" label={`${blocking} changes requested`} />
          ) : null}
          {reReview > 0 ? (
            <ReviewSummaryPill tone="attention" label={`${reReview} re-review requested`} />
          ) : null}
          {pending > 0 ? (
            <ReviewSummaryPill tone="muted" label={`${pending} pending`} />
          ) : null}
        </Stack>
      }
    >
      <Stack as="ul" direction="vertical" gap="condensed" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {reviewers.map((r) => (
          <ReviewerRow key={r.handle} reviewer={r} />
        ))}
      </Stack>
    </ZoneShell>
  );
}

function ReviewSummaryPill({
  tone,
  label,
}: {
  tone: "success" | "danger" | "attention" | "muted";
  label: string;
}) {
  const color =
    tone === "success"
      ? "var(--fgColor-success)"
      : tone === "danger"
      ? "var(--fgColor-danger)"
      : tone === "attention"
      ? "var(--fgColor-attention)"
      : "var(--fgColor-muted)";
  const Glyph =
    tone === "success"
      ? CheckCircleFillIcon
      : tone === "danger"
      ? XCircleFillIcon
      : tone === "attention"
      ? AlertIcon
      : ClockIcon;
  return (
    <Stack direction="horizontal" gap="condensed" align="center">
      <span style={{ color, display: "inline-flex" }}>
        <Glyph size={14} />
      </span>
      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
        {label}
      </Text>
    </Stack>
  );
}

function ReviewerRow({ reviewer }: { reviewer: Reviewer }) {
  return (
    <Stack
      as="li"
      direction="horizontal"
      align="center"
      gap="normal"
      justify="space-between"
      wrap="wrap"
      style={{ minWidth: 0 }}
    >
      <Stack direction="horizontal" align="center" gap="condensed" style={{ minWidth: 0 }}>
        <Avatar handle={reviewer.handle} />
        <Stack direction="vertical" gap="none" style={{ minWidth: 0 }}>
          <Text weight="semibold">@{reviewer.handle}</Text>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            {reviewer.role}
          </Text>
        </Stack>
      </Stack>
      <Stack direction="horizontal" align="center" gap="condensed">
        <ReviewStateBadge state={reviewer.state} />
        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
          {reviewer.note}
        </Text>
      </Stack>
    </Stack>
  );
}

function Avatar({ handle }: { handle: string }) {
  const initials = handle
    .split("-")
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: "50%",
        backgroundColor: "var(--bgColor-muted)",
        color: "var(--fgColor-muted)",
        fontSize: "0.75rem",
        fontWeight: 600,
        border: "1px solid var(--borderColor-muted)",
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  );
}

function ReviewStateBadge({ state }: { state: ReviewState }) {
  if (state === "approved") {
    return (
      <Stack direction="horizontal" gap="condensed" align="center">
        <span style={{ color: "var(--fgColor-success)", display: "inline-flex" }}>
          <CheckCircleFillIcon size={16} />
        </span>
        <Text size="small" weight="semibold" style={{ color: "var(--fgColor-success)" }}>
          Approved
        </Text>
      </Stack>
    );
  }
  if (state === "changes-requested") {
    return (
      <Stack direction="horizontal" gap="condensed" align="center">
        <span style={{ color: "var(--fgColor-danger)", display: "inline-flex" }}>
          <FileDiffIcon size={16} />
        </span>
        <Text size="small" weight="semibold" style={{ color: "var(--fgColor-danger)" }}>
          Changes requested
        </Text>
      </Stack>
    );
  }
  if (state === "re-review-requested") {
    return (
      <Stack direction="horizontal" gap="condensed" align="center">
        <span style={{ color: "var(--fgColor-attention)", display: "inline-flex" }}>
          <SyncIcon size={16} />
        </span>
        <Text size="small" weight="semibold" style={{ color: "var(--fgColor-attention)" }}>
          Re-review requested
        </Text>
      </Stack>
    );
  }
  return (
    <Stack direction="horizontal" gap="condensed" align="center">
      <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
        <DotFillIcon size={16} />
      </span>
      <Text size="small" weight="semibold" style={{ color: "var(--fgColor-muted)" }}>
        Pending
      </Text>
    </Stack>
  );
}

function ChecksZone() {
  return (
    <ZoneShell
      title="Checks"
      meta={
        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          <ChecksSummaryStat tone="success" icon={CheckCircleFillIcon} label="passing" value={successCount} />
          <ChecksSummaryStat tone="danger" icon={XCircleFillIcon} label="failing" value={failureCount} />
          <ChecksSummaryStat tone="attention" icon={ClockIcon} label="running" value={runningCount} />
          <ChecksSummaryStat tone="muted" icon={SkipFillIcon} label="skipped" value={skippedCount} />
          <ChecksSummaryStat tone="muted" icon={ClockIcon} label="queued" value={queuedCount} />
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            {checks.length} total
          </Text>
        </Stack>
      }
    >
      <Stack
        as="ul"
        direction="vertical"
        gap="none"
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          border: "1px solid var(--borderColor-muted)",
          borderRadius: "var(--borderRadius-medium, 8px)",
          overflow: "hidden",
        }}
      >
        {checks.map((c, idx) => (
          <CheckRow key={c.name} check={c} isLast={idx === checks.length - 1} />
        ))}
      </Stack>
    </ZoneShell>
  );
}

function ChecksSummaryStat({
  tone,
  icon: Icon,
  label,
  value,
}: {
  tone: "success" | "danger" | "attention" | "muted";
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  if (value === 0) return null;
  const color =
    tone === "success"
      ? "var(--fgColor-success)"
      : tone === "danger"
      ? "var(--fgColor-danger)"
      : tone === "attention"
      ? "var(--fgColor-attention)"
      : "var(--fgColor-muted)";
  return (
    <Stack direction="horizontal" gap="condensed" align="center">
      <span style={{ color, display: "inline-flex" }}>
        <Icon size={14} />
      </span>
      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
        <Text as="span" weight="semibold" style={{ color: "var(--fgColor-default)" }}>
          {value}
        </Text>{" "}
        {label}
      </Text>
    </Stack>
  );
}

function CheckRow({ check, isLast }: { check: Check; isLast: boolean }) {
  return (
    <li
      style={{
        display: "grid",
        gridTemplateColumns: "auto auto 1fr auto auto",
        alignItems: "center",
        gap: "var(--base-size-12, 12px)",
        paddingBlock: "var(--base-size-8, 8px)",
        paddingInline: "var(--base-size-12, 12px)",
        borderBottom: isLast ? "none" : "1px solid var(--borderColor-muted)",
      }}
    >
      <CheckStatusGlyph status={check.status} />
      <Text weight="semibold" size="small">
        {check.name}
      </Text>
      <Text size="small" style={{ color: "var(--fgColor-muted)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {check.detail}
      </Text>
      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
        {check.duration ?? ""}
      </Text>
      <Button variant="invisible" size="small">
        Details
      </Button>
    </li>
  );
}

function CheckStatusGlyph({ status }: { status: CheckStatus }) {
  if (status === "success") {
    return (
      <span aria-label="Passing" style={{ color: "var(--fgColor-success)", display: "inline-flex" }}>
        <CheckCircleFillIcon size={16} />
      </span>
    );
  }
  if (status === "failure") {
    return (
      <span aria-label="Failing" style={{ color: "var(--fgColor-danger)", display: "inline-flex" }}>
        <XCircleFillIcon size={16} />
      </span>
    );
  }
  if (status === "running") {
    return (
      <span aria-label="Running" style={{ color: "var(--fgColor-attention)", display: "inline-flex" }}>
        <DotFillIcon size={16} />
      </span>
    );
  }
  if (status === "skipped") {
    return (
      <span aria-label="Skipped" style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
        <SkipFillIcon size={16} />
      </span>
    );
  }
  return (
    <span aria-label="Queued" style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
      <ClockIcon size={16} />
    </span>
  );
}

function BlockerZone() {
  return (
    <Stack
      direction="vertical"
      gap="normal"
      style={{
        paddingBlock: "var(--base-size-16, 16px)",
        paddingInline: "var(--base-size-24, 24px)",
      }}
    >
      <Flash variant="danger">
        <Stack direction="horizontal" gap="condensed" align="start" justify="space-between" wrap="wrap">
          <Stack direction="horizontal" gap="condensed" align="start" style={{ minWidth: 0 }}>
            <span style={{ display: "inline-flex", paddingTop: 2 }}>
              <AlertIcon size={16} />
            </span>
            <Stack direction="vertical" gap="none" style={{ minWidth: 0 }}>
              <Text weight="semibold">
                This branch has conflicts that must be resolved
              </Text>
              <Text size="small">
                Conflicting files: <Text as="span" weight="semibold">packages/manifest/src/index.ts</Text>,{" "}
                <Text as="span" weight="semibold">packages/manifest/CHANGELOG.md</Text>. Resolve conflicts on{" "}
                <BranchName as="span">platform/token-manifest</BranchName> before merging.
              </Text>
            </Stack>
          </Stack>
          <Stack direction="horizontal" gap="condensed" align="center">
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
  );
}

function MergeControlsZone() {
  return (
    <Stack
      direction="vertical"
      gap="normal"
      style={{
        paddingBlock: "var(--base-size-16, 16px)",
        paddingInline: "var(--base-size-24, 24px)",
        backgroundColor: "var(--bgColor-muted)",
      }}
    >
      <Stack direction="horizontal" align="center" justify="space-between" gap="condensed" wrap="wrap">
        <Heading as="h2" variant="medium" style={{ fontSize: "1rem" }}>
          Merge pull request
        </Heading>
        <Stack direction="horizontal" gap="condensed" align="center">
          <CounterLabel>14 commits</CounterLabel>
          <IconButton
            icon={KebabHorizontalIcon}
            aria-label="More merge options"
            variant="invisible"
            size="small"
          />
        </Stack>
      </Stack>

      <Stack direction="vertical" gap="condensed">
        <FormControl>
          <FormControl.Label>Merge method</FormControl.Label>
          <Select block defaultValue="squash">
            <Select.Option value="merge">Create a merge commit</Select.Option>
            <Select.Option value="squash">Squash and merge</Select.Option>
            <Select.Option value="rebase">Rebase and merge</Select.Option>
          </Select>
          <FormControl.Caption>
            Squash combines all 14 commits into a single commit on{" "}
            <Text as="span" weight="semibold">main</Text>.
          </FormControl.Caption>
        </FormControl>

        <FormControl>
          <FormControl.Label>Commit headline</FormControl.Label>
          <TextInput
            block
            defaultValue="Extract design tokens into a skill manifest (#4128)"
          />
        </FormControl>

        <FormControl>
          <FormControl.Label>Extended description</FormControl.Label>
          <Textarea
            block
            rows={4}
            resize="vertical"
            defaultValue={`Moves the token catalog out of the runtime bundle and into a versioned manifest consumed by the skill loader.\n\n* Adds packages/manifest with a typed Token schema\n* Wires the loader to read manifest.json at build time\n* Documents the migration in docs/skills/tokens.md`}
          />
          <FormControl.Caption>
            This will appear in the squash commit body.
          </FormControl.Caption>
        </FormControl>

        <FormControl>
          <Checkbox defaultChecked />
          <FormControl.Label>
            Delete <BranchName as="span">platform/token-manifest</BranchName> after merge
          </FormControl.Label>
          <FormControl.Caption>
            The branch will be deleted from the repository once the merge completes.
          </FormControl.Caption>
        </FormControl>
      </Stack>

      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
        <Button
          variant="primary"
          leadingVisual={GitMergeIcon}
          disabled={hasMergeBlocker}
          aria-describedby="merge-blocker-help"
        >
          Squash and merge
        </Button>
        <Button variant="default">Cancel</Button>
        <Text
          id="merge-blocker-help"
          size="small"
          style={{ color: "var(--fgColor-muted)" }}
        >
          Merging is unavailable while conflicts on{" "}
          <Text as="span" weight="semibold">platform/token-manifest</Text> are unresolved.
        </Text>
      </Stack>
    </Stack>
  );
}
