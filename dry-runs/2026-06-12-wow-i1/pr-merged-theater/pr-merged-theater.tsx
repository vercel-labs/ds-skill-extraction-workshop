"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
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
import {
  CheckCircleFillIcon,
  ChevronRightIcon,
  CommentIcon,
  DotFillIcon,
  GitMergeIcon,
  KebabHorizontalIcon,
  TrashIcon,
  XCircleFillIcon,
} from "@primer/octicons-react";

type Phase = "checking" | "ready" | "merging" | "merged";
type CheckStatus = "queued" | "running" | "success";
type ReviewState = "approved" | "changes-requested" | "re-review" | "pending";

const TOTAL_RESOLUTION_MS = 6000;
const STAGGER_MS = 80;

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
    state: "approved",
    note: "Approved 6 minutes ago",
  },
  {
    handle: "rin-andersen",
    role: "Reviewer · security",
    state: "approved",
    note: "Approved just now",
  },
];

const checkDefs: Array<{
  name: string;
  pipeline: string;
  duration: string;
}> = [
  { name: "build / linux-x86", pipeline: "stratus-ci", duration: "4m 12s" },
  { name: "build / darwin-arm64", pipeline: "stratus-ci", duration: "5m 03s" },
  { name: "unit-tests", pipeline: "stratus-ci", duration: "2m 41s" },
  { name: "integration / postgres-15", pipeline: "stratus-ci", duration: "7m 18s" },
  { name: "lint", pipeline: "stratus-ci", duration: "0m 38s" },
  { name: "type-check", pipeline: "stratus-ci", duration: "1m 09s" },
  { name: "visual-regression", pipeline: "argo-snapshot", duration: "3m 47s" },
  { name: "bundle-size", pipeline: "stratus-ci", duration: "0m 22s" },
];

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
  if (status === "success") {
    return (
      <IconSwatch
        color="var(--fgColor-success, var(--fgColor-default))"
        label="Successful"
      >
        <CheckCircleFillIcon size={16} />
      </IconSwatch>
    );
  }
  if (status === "running") {
    return (
      <IconSwatch
        color="var(--fgColor-attention, var(--fgColor-muted))"
        label="Running"
      >
        <DotFillIcon size={16} />
      </IconSwatch>
    );
  }
  return (
    <IconSwatch color="var(--fgColor-muted)" label="Queued">
      <DotFillIcon size={16} />
    </IconSwatch>
  );
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
      style={{ height: 1, backgroundColor: "var(--borderColor-muted)" }}
    />
  );
}

function buildResolutionSchedule(count: number, totalMs: number) {
  // Stagger the first transitions tightly, ease out so the last two land
  // together — "dominoes fall" feel.
  const schedule: number[] = [];
  for (let i = 0; i < count; i++) {
    // Ease-out-ish: i^1.6 normalized to totalMs
    const t = Math.pow(i / (count - 1), 1.6) * (totalMs - STAGGER_MS);
    schedule.push(Math.round(t + STAGGER_MS));
  }
  return schedule;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PrMergedTheater({
  onPhaseChange,
}: {
  onPhaseChange?: (phase: Phase) => void;
}) {
  const [phase, setPhase] = useState<Phase>("checking");
  const [checkStatuses, setCheckStatuses] = useState<CheckStatus[]>(() => {
    // First two start as "running" so something is visibly moving on load;
    // the rest are queued.
    return checkDefs.map((_, i) => (i < 2 ? "running" : "queued"));
  });

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  // Resolve checks over TOTAL_RESOLUTION_MS, then flip to "ready".
  useEffect(() => {
    if (phase !== "checking") return;

    const reduced = prefersReducedMotion();
    if (reduced) {
      setCheckStatuses(checkDefs.map(() => "success"));
      const t = setTimeout(() => setPhase("ready"), 200);
      return () => clearTimeout(t);
    }

    const schedule = buildResolutionSchedule(
      checkDefs.length,
      TOTAL_RESOLUTION_MS,
    );

    const runningTimers = checkDefs.map((_, i) => {
      // A check briefly enters "running" ~250ms before it lands on "success".
      const startRunning = Math.max(0, schedule[i] - 250);
      return setTimeout(() => {
        setCheckStatuses((prev) => {
          if (prev[i] === "success") return prev;
          const next = prev.slice();
          next[i] = "running";
          return next;
        });
      }, startRunning);
    });

    const successTimers = checkDefs.map((_, i) =>
      setTimeout(() => {
        setCheckStatuses((prev) => {
          const next = prev.slice();
          next[i] = "success";
          return next;
        });
      }, schedule[i]),
    );

    const readyTimer = setTimeout(() => {
      setPhase("ready");
    }, TOTAL_RESOLUTION_MS + 150);

    return () => {
      runningTimers.forEach(clearTimeout);
      successTimers.forEach(clearTimeout);
      clearTimeout(readyTimer);
    };
  }, [phase]);

  const counts = useMemo(() => {
    const success = checkStatuses.filter((s) => s === "success").length;
    const running = checkStatuses.filter((s) => s === "running").length;
    const queued = checkStatuses.filter((s) => s === "queued").length;
    return { success, running, queued, total: checkStatuses.length };
  }, [checkStatuses]);

  const allGreen = counts.success === counts.total;

  function handleMerge() {
    if (phase !== "ready") return;
    setPhase("merging");
    const reduced = prefersReducedMotion();
    const delay = reduced ? 200 : 700;
    setTimeout(() => setPhase("merged"), delay);
  }

  if (phase === "merged") {
    return (
      <MergedConfirmation />
    );
  }

  return (
    <section
      aria-label="Merge readiness"
      style={{
        backgroundColor: "var(--bgColor-default)",
        border: "1px solid var(--borderColor-default)",
        borderRadius: "var(--borderRadius-large, 12px)",
        overflow: "hidden",
        transition: "opacity 220ms ease-out",
        opacity: phase === "merging" ? 0.6 : 1,
      }}
    >
      <Stack direction="vertical" gap="none">
        {/* Reviews */}
        <Stack direction="vertical" gap="normal" padding="normal">
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
              <CounterLabel variant="secondary">
                {reviewers.length}
              </CounterLabel>
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                of {reviewers.length} approved
              </Text>
            </Stack>
            <Label variant="success">All required approvals in</Label>
          </Stack>

          <Stack
            as="ul"
            direction="vertical"
            gap="condensed"
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {reviewers.map((r) => (
              <Stack
                key={r.handle}
                as="li"
                direction="horizontal"
                align="center"
                justify="space-between"
                gap="normal"
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
                  style={{ color: "var(--fgColor-muted)", textAlign: "right" }}
                >
                  {r.note}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Stack>

        <ZoneDivider />

        {/* Checks */}
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
              {allGreen ? (
                <IconSwatch
                  color="var(--fgColor-success, var(--fgColor-default))"
                  label="All checks passing"
                >
                  <CheckCircleFillIcon size={16} />
                </IconSwatch>
              ) : (
                <IconSwatch
                  color="var(--fgColor-attention, var(--fgColor-muted))"
                  label="Checks running"
                >
                  <DotFillIcon size={16} />
                </IconSwatch>
              )}
              <Heading as="h2" variant="small">
                {allGreen
                  ? "All checks have passed"
                  : "Some checks haven’t completed yet"}
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
            {counts.success} successful · {counts.running} running ·{" "}
            {counts.queued} queued · {counts.total} total
          </Text>

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
            {checkDefs.map((c, idx) => {
              const status = checkStatuses[idx];
              return (
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
                      idx === 0
                        ? "none"
                        : "1px solid var(--borderColor-muted)",
                    transition: "background-color 220ms ease-out",
                    backgroundColor:
                      status === "running"
                        ? "var(--bgColor-attention-muted, transparent)"
                        : "transparent",
                  }}
                >
                  <IconSwatch color="var(--fgColor-muted)" hidden>
                    <ChevronRightIcon size={12} />
                  </IconSwatch>
                  <CheckStatusGlyph status={status} />
                  <Stack
                    direction="vertical"
                    gap="none"
                    style={{ flex: 1, minWidth: 0 }}
                  >
                    <Stack direction="horizontal" align="center" gap="condensed">
                      <Text weight="semibold">{c.name}</Text>
                      <Text
                        size="small"
                        style={{ color: "var(--fgColor-muted)" }}
                      >
                        / {c.pipeline}
                      </Text>
                    </Stack>
                    <Text
                      size="small"
                      style={{ color: "var(--fgColor-muted)" }}
                    >
                      {status === "queued"
                        ? "Waiting to start"
                        : status === "running"
                          ? "Running…"
                          : "Succeeded"}
                    </Text>
                  </Stack>
                  <Text
                    size="small"
                    style={{
                      color: "var(--fgColor-muted)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {status === "success" ? c.duration : "—"}
                  </Text>
                  <Button size="small" variant="invisible">
                    Details
                  </Button>
                </Stack>
              );
            })}
          </Stack>
        </Stack>

        <ZoneDivider />

        {/* Merge controls */}
        <Stack
          direction="vertical"
          gap="normal"
          paddingBlock="normal"
          paddingInline="normal"
        >
          <Stack direction="horizontal" align="center" gap="condensed">
            <IconSwatch
              color={
                allGreen
                  ? "var(--fgColor-success, var(--fgColor-default))"
                  : "var(--fgColor-muted)"
              }
              hidden
            >
              <GitMergeIcon size={16} />
            </IconSwatch>
            <Heading as="h2" variant="small">
              {allGreen
                ? "This branch has no conflicts with the base branch"
                : "Waiting for checks to complete"}
            </Heading>
          </Stack>

          <Stack direction="horizontal" gap="normal" align="end" wrap="wrap">
            <div style={{ flex: "0 0 220px" }}>
              <FormControl>
                <FormControl.Label>Merge method</FormControl.Label>
                <Select
                  value="squash"
                  onChange={() => {
                    /* fixed for the demo */
                  }}
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
              {allGreen ? null : (
                <IconSwatch
                  color="var(--fgColor-attention, var(--fgColor-muted))"
                  hidden
                >
                  <DotFillIcon size={16} />
                </IconSwatch>
              )}
              <Text
                size="small"
                style={{ color: "var(--fgColor-muted)" }}
                id="merge-blocker-reason"
              >
                {allGreen
                  ? "All checks have passed. You can merge this pull request."
                  : `Waiting on ${counts.queued + counts.running} of ${counts.total} checks. Merging will become available when every check has succeeded.`}
              </Text>
            </Stack>
            <Stack direction="horizontal" align="center" gap="condensed">
              <Button variant="invisible">Cancel</Button>
              <Button
                variant="primary"
                leadingVisual={GitMergeIcon}
                disabled={!allGreen}
                loading={phase === "merging"}
                loadingAnnouncement="Merging pull request"
                onClick={handleMerge}
                aria-describedby={
                  allGreen ? undefined : "merge-blocker-reason"
                }
              >
                {phase === "merging" ? "Merging…" : "Merge pull request"}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </section>
  );
}

function MergedConfirmation() {
  const [branchDeleted, setBranchDeleted] = useState(false);

  return (
    <section
      aria-label="Pull request merged"
      style={{
        backgroundColor: "var(--bgColor-default)",
        border: "1px solid var(--borderColor-default)",
        borderRadius: "var(--borderRadius-large, 12px)",
        overflow: "hidden",
        animation: "fadeIn 240ms ease-out both",
      }}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }`}</style>
      <Stack direction="vertical" gap="normal" padding="normal">
        <Flash variant="success">
          <Stack direction="horizontal" align="center" gap="condensed">
            <IconSwatch
              color="var(--fgColor-success, var(--fgColor-default))"
              hidden
            >
              <GitMergeIcon size={16} />
            </IconSwatch>
            <Text weight="semibold">
              Pull request successfully merged and closed
            </Text>
          </Stack>
        </Flash>

        <Stack direction="vertical" gap="condensed">
          <Text style={{ color: "var(--fgColor-muted)" }}>
            You can safely delete the{" "}
            <BranchName as="span">platform/token-manifest</BranchName> branch
            now. The default branch is not affected.
          </Text>
          <Stack direction="horizontal" align="center" gap="condensed">
            <Button
              variant="danger"
              leadingVisual={TrashIcon}
              disabled={branchDeleted}
              onClick={() => setBranchDeleted(true)}
            >
              {branchDeleted ? "Branch deleted" : "Delete branch"}
            </Button>
            {branchDeleted ? (
              <Label variant="done">platform/token-manifest deleted</Label>
            ) : null}
          </Stack>
        </Stack>
      </Stack>
    </section>
  );
}
