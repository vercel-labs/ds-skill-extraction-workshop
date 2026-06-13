"use client";

/**
 * PR Merged Theater — Encore (iteration 2, gen 2)
 * ------------------------------------------------
 * A dense, alive pull-request panel that stages the satisfying flip from
 * Open → Merged. CI checks resolve as falling dominoes over ~6s, a determinate
 * ProgressBar advances, running counts tick up, then a "ready" Flash appears and
 * the editable merge box opens. Choosing a merge method drives the primary
 * action; clicking merge flips the lifecycle capsule (with a motion beat) and
 * collapses the box into a branch-aware confirmation.
 *
 * All color / motion comes from Primer semantic + motion tokens; no hand-picked
 * hex, px, durations, or easings. prefers-reduced-motion is honored throughout.
 *
 * Shell wiring (ThemeProvider / BaseStyles / globals theme imports) lives in
 * app/layout.tsx per the primer-react skill; this file is the composition only.
 */

import {
  BranchName, // IN-SLATE
  Button, // IN-SLATE
  Checkbox, // IN-SLATE
  CounterLabel, // IN-SLATE
  Flash, // IN-SLATE
  FormControl, // IN-SLATE
  Heading, // IN-SLATE
  IconButton, // IN-SLATE
  Label, // IN-SLATE
  ProgressBar, // IN-SLATE
  RelativeTime, // IN-SLATE
  Select, // IN-SLATE
  Spinner, // IN-SLATE
  Stack, // IN-SLATE
  StateLabel, // IN-SLATE
  Text, // IN-SLATE
  Textarea, // IN-SLATE
  TextInput, // IN-SLATE
  Timeline, // IN-SLATE
} from "@primer/react";
import {
  AlertIcon,
  CheckCircleFillIcon,
  CheckIcon,
  ClockIcon,
  CommentDiscussionIcon,
  DotFillIcon,
  EyeIcon,
  FileDiffIcon,
  GitBranchIcon,
  GitCommitIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  HourglassIcon,
  ShieldCheckIcon,
  SkipIcon,
  TrashIcon,
} from "@primer/octicons-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";

/* ------------------------------------------------------------------ */
/* Invented data (fictional repo / branches / labels / check names).   */
/* ------------------------------------------------------------------ */

const PR_NUMBER = 4827;
const PR_TITLE = "Stream incremental ledger snapshots to the audit pipeline";
const SOURCE_BRANCH = "lumen/streaming-snapshots";
const TARGET_BRANCH = "trunk";
const PR_AUTHOR = "marlow-quill";
const OPENED_AT = "2026-06-11T09:14:00Z";

const TOPIC_LABELS: ReadonlyArray<{
  name: string;
  variant: React.ComponentProps<typeof Label>["variant"];
}> = [
  { name: "area: ledger", variant: "accent" },
  { name: "perf", variant: "success" },
  { name: "needs-changelog", variant: "attention" },
];

type CheckState = "pending" | "running" | "success";

interface Check {
  id: string;
  name: string;
  context: string;
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
}

const CHECKS: ReadonlyArray<Check> = [
  { id: "lint", name: "lint / eslint", context: "Static analysis", icon: CheckIcon },
  { id: "unit", name: "test / unit", context: "Jest · 1,204 specs", icon: CheckIcon },
  { id: "types", name: "build / typecheck", context: "tsc --noEmit", icon: ShieldCheckIcon },
  { id: "integration", name: "test / integration", context: "Ephemeral env", icon: CheckIcon },
  { id: "e2e", name: "test / e2e", context: "Playwright · 38 flows", icon: CheckIcon },
];

/** Per-check resolve schedule (ms from mount) — the dominoes fall one by one. */
const RESOLVE_AT_MS = [900, 1900, 2900, 4100, 5600] as const;

type MergeMethod = "merge" | "squash" | "rebase";

const MERGE_METHOD_LABEL: Record<MergeMethod, string> = {
  merge: "Create a merge commit",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};

const MERGE_ACTION_LABEL: Record<MergeMethod, string> = {
  merge: "Merge pull request",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};

/* ------------------------------------------------------------------ */
/* Reduced-motion hook (motion is opt-in; SR-safe regardless).         */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/* ------------------------------------------------------------------ */
/* Small presentational helpers (token-only styling).                  */
/* ------------------------------------------------------------------ */

function Muted({ children }: { children: React.ReactNode }) {
  return (
    <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
      {children}
    </Text>
  );
}

/** A running count that reads as "<icon> <n> <noun>" for SRs. */
function CountStat({
  icon: Icon,
  value,
  noun,
}: {
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  value: number;
  noun: string;
}) {
  return (
    <Stack direction="horizontal" gap="condensed" align="center">
      <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
        <Icon size={16} aria-hidden />
      </span>
      <Text size="small" weight="semibold">
        {value}
      </Text>
      <Muted>{noun}</Muted>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function PrMergedTheaterEncoreI2Gen2() {
  const reducedMotion = usePrefersReducedMotion();
  const titleId = useId();

  // Lifecycle: checks run → ready → merged.
  const [checkStates, setCheckStates] = useState<CheckState[]>(() =>
    CHECKS.map(() => "pending"),
  );
  const [merged, setMerged] = useState(false);

  // Editable merge box.
  const [method, setMethod] = useState<MergeMethod>("squash");
  const [commitHeadline, setCommitHeadline] = useState(
    `${PR_TITLE} (#${PR_NUMBER})`,
  );
  const [commitBody, setCommitBody] = useState(
    "Snapshots are now flushed incrementally rather than batched at close, " +
      "cutting peak memory on the audit worker.",
  );
  const [deleteBranch, setDeleteBranch] = useState(true);
  const [branchDeleted, setBranchDeleted] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Domino schedule: each check goes running shortly before it resolves green.
  useEffect(() => {
    CHECKS.forEach((_, i) => {
      const resolveAt = RESOLVE_AT_MS[i];
      // Stagger the "running" beat so each lands as a visible domino.
      const startAt = Math.max(0, resolveAt - 700);
      timers.current.push(
        setTimeout(() => {
          setCheckStates((prev) => {
            if (prev[i] !== "pending") return prev;
            const next = [...prev];
            next[i] = "running";
            return next;
          });
        }, startAt),
      );
      timers.current.push(
        setTimeout(() => {
          setCheckStates((prev) => {
            const next = [...prev];
            next[i] = "success";
            return next;
          });
        }, resolveAt),
      );
    });
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  const passedCount = checkStates.filter((s) => s === "success").length;
  const total = CHECKS.length;
  const allGreen = passedCount === total;
  const progress = Math.round((passedCount / total) * 100);

  // Running counts tick up alongside the checks (commits land as work resolves).
  const commitCount = 6 + passedCount;
  const filesChanged = 11 + passedCount * 2;

  const transition = reducedMotion ? undefined : "var(--motion-transition-enter)";
  const stateChangeTransition = reducedMotion
    ? undefined
    : "var(--motion-transition-stateChange)";

  const onMerge = useCallback(() => {
    setMerged(true);
    setBranchDeleted(deleteBranch);
  }, [deleteBranch]);

  const onToggleBranchAfterMerge = useCallback(() => {
    // Post-merge: restore the deleted branch, or delete the surviving one.
    setBranchDeleted((prev) => !prev);
  }, []);

  /* ----- derived banner state ----- */
  const lifecycle = merged ? "merged" : allGreen ? "ready" : "running";

  return (
    <Stack
      as="main"
      direction="vertical"
      gap="normal"
      padding="spacious"
      style={{
        maxWidth: "var(--base-size-768, 48rem)",
        marginInline: "auto",
      }}
    >
      {/* ============================ Header band ============================ */}
      <Stack direction="vertical" gap="condensed">
        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          <span
            style={{
              display: "inline-flex",
              transition: stateChangeTransition,
              color: merged
                ? "var(--fgColor-done)"
                : "var(--fgColor-open)",
            }}
          >
            {merged ? (
              <GitMergeIcon size={24} aria-hidden />
            ) : (
              <GitPullRequestIcon size={24} aria-hidden />
            )}
          </span>
          <Heading
            as="h1"
            variant="large"
            id={titleId}
            style={{ flexGrow: 1, minWidth: "0" }}
          >
            {PR_TITLE}{" "}
            <Text
              as="span"
              size="large"
              style={{ color: "var(--fgColor-muted)", fontWeight: "normal" }}
            >
              #{PR_NUMBER}
            </Text>
          </Heading>
        </Stack>

        {/* Lifecycle capsule + branch line — the headline scan a maintainer reads */}
        <Stack direction="horizontal" gap="normal" align="center" wrap="wrap">
          <span
            style={{
              display: "inline-flex",
              transition: stateChangeTransition,
            }}
          >
            {merged ? (
              <StateLabel status="pullMerged">Merged</StateLabel>
            ) : (
              <StateLabel status="pullOpened">Open</StateLabel>
            )}
          </span>
          <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
            <Muted>
              <Text as="span" weight="semibold">
                {PR_AUTHOR}
              </Text>{" "}
              wants to merge into
            </Muted>
            <BranchName as="span">
              <GitBranchIcon size={16} aria-hidden /> {TARGET_BRANCH}
            </BranchName>
            <Muted>from</Muted>
            <BranchName as="span">
              <GitBranchIcon size={16} aria-hidden /> {SOURCE_BRANCH}
            </BranchName>
            <Muted>
              opened <RelativeTime datetime={OPENED_AT} tense="past">
                {new Date(OPENED_AT).toLocaleDateString()}
              </RelativeTime>
            </Muted>
          </Stack>
        </Stack>
      </Stack>

      {/* ===================== Metadata scan: labels + counts ===================== */}
      <Stack
        direction="horizontal"
        gap="normal"
        justify="space-between"
        align="center"
        wrap="wrap"
        style={{
          paddingBlock: "var(--base-size-8, 0.5rem)",
          borderTop: "1px solid var(--borderColor-muted)",
          borderBottom: "1px solid var(--borderColor-muted)",
        }}
      >
        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          {TOPIC_LABELS.map((l) => (
            <Label key={l.name} variant={l.variant}>
              {l.name}
            </Label>
          ))}
        </Stack>
        <Stack direction="horizontal" gap="normal" align="center" wrap="wrap">
          <CountStat icon={GitCommitIcon} value={commitCount} noun="commits" />
          <CountStat icon={FileDiffIcon} value={filesChanged} noun="files" />
          <Stack direction="horizontal" gap="condensed" align="center">
            <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
              <CheckIcon size={16} aria-hidden />
            </span>
            <Text size="small" weight="semibold">
              {passedCount}
            </Text>
            <Muted>/</Muted>
            <Muted>{total} checks</Muted>
          </Stack>
        </Stack>
      </Stack>

      {/* ============================ Merge box ============================ */}
      <Stack
        as="section"
        aria-labelledby={titleId}
        direction="vertical"
        gap="none"
        style={{
          border: "1px solid var(--borderColor-default)",
          borderRadius: "var(--borderRadius-large, 12px)",
          backgroundColor: "var(--bgColor-default)",
          boxShadow: "var(--shadow-resting-medium)",
          overflow: "hidden",
        }}
      >
        {/* ---- Reviews row ---- */}
        <Stack
          direction="horizontal"
          gap="condensed"
          align="center"
          padding="normal"
          style={{ borderBottom: "1px solid var(--borderColor-muted)" }}
        >
          <span style={{ color: "var(--fgColor-success)", display: "inline-flex" }}>
            <CheckCircleFillIcon size={16} aria-hidden />
          </span>
          <Stack direction="vertical" gap="none">
            <Text weight="semibold">2 approving reviews</Text>
            <Muted>
              Approved by <Text as="span" weight="semibold">dax-orbit</Text> and{" "}
              <Text as="span" weight="semibold">vera-pinecone</Text>
            </Muted>
          </Stack>
          <span style={{ marginInlineStart: "auto" }}>
            <Stack direction="horizontal" gap="condensed" align="center">
              <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
                <EyeIcon size={16} aria-hidden />
              </span>
              <Muted>3 reviewers</Muted>
            </Stack>
          </span>
        </Stack>

        {/* ---- CI checks wall ---- */}
        <Stack
          direction="vertical"
          gap="condensed"
          padding="normal"
          style={{ borderBottom: "1px solid var(--borderColor-muted)" }}
        >
          <Stack direction="horizontal" gap="condensed" align="center" justify="space-between">
            <Stack direction="horizontal" gap="condensed" align="center">
              <Heading as="h2" variant="small">
                Checks
              </Heading>
              <CounterLabel variant="primary">{total}</CounterLabel>
            </Stack>
            {/* Live, polite status for the running phase — announced, never misreported */}
            <span aria-live="polite" style={{ display: "inline-flex" }}>
              {!allGreen ? (
                <Stack direction="horizontal" gap="condensed" align="center">
                  <Spinner size="small" srText={null} />
                  <Muted>
                    {passedCount} of {total} checks passed
                  </Muted>
                </Stack>
              ) : (
                <Stack direction="horizontal" gap="condensed" align="center">
                  <span style={{ color: "var(--fgColor-success)", display: "inline-flex" }}>
                    <CheckCircleFillIcon size={16} aria-hidden />
                  </span>
                  <Muted>All checks have passed</Muted>
                </Stack>
              )}
            </span>
          </Stack>

          <ProgressBar
            progress={progress}
            bg={allGreen ? "success.emphasis" : "accent.emphasis"}
            animated={!reducedMotion && !allGreen}
            aria-label={`Checks complete: ${passedCount} of ${total}`}
            aria-valuetext={`${passedCount} of ${total} checks passed`}
          />

          {/* Each check is a Timeline.Item; the badge color carries lifecycle.
              The Body text is the SR-announced source of truth for each state. */}
          <Timeline clipSidebar>
            {CHECKS.map((check, i) => {
              const state = checkStates[i];
              const badgeVariant =
                state === "success" ? "success" : undefined; // neutral while pending/running
              return (
                <Timeline.Item key={check.id} condensed>
                  <Timeline.Badge
                    variant={badgeVariant}
                    style={{ transition }}
                  >
                    {state === "success" ? (
                      <CheckIcon aria-hidden />
                    ) : state === "running" ? (
                      <HourglassIcon aria-hidden />
                    ) : (
                      <DotFillIcon aria-hidden />
                    )}
                  </Timeline.Badge>
                  <Timeline.Body>
                    <Stack
                      direction="horizontal"
                      gap="condensed"
                      align="center"
                      justify="space-between"
                      wrap="wrap"
                    >
                      <Stack direction="vertical" gap="none">
                        <Text weight="semibold">{check.name}</Text>
                        <Muted>{check.context}</Muted>
                      </Stack>
                      <Text
                        size="small"
                        style={{
                          color:
                            state === "success"
                              ? "var(--fgColor-success)"
                              : "var(--fgColor-muted)",
                        }}
                      >
                        {state === "success"
                          ? "Successful"
                          : state === "running"
                            ? "In progress…"
                            : "Queued"}
                      </Text>
                    </Stack>
                  </Timeline.Body>
                </Timeline.Item>
              );
            })}
          </Timeline>
        </Stack>

        {/* ---- Ready cue + merge controls / confirmation ---- */}
        <Stack direction="vertical" gap="normal" padding="normal">
          {/* The "ready" banner appears only when every check is green and not yet merged. */}
          {lifecycle === "ready" && (
            <div role="status" style={{ transition }}>
              <Flash variant="success">
                <Stack direction="horizontal" gap="condensed" align="center">
                  <ShieldCheckIcon size={16} aria-hidden />
                  <Text weight="semibold">
                    This branch has no conflicts with the base branch — ready to
                    merge.
                  </Text>
                </Stack>
              </Flash>
            </div>
          )}

          {/* WAITING: merging is genuinely unavailable to keyboard + SR. */}
          {lifecycle === "running" && (
            <Stack direction="horizontal" gap="condensed" align="center">
              <span style={{ color: "var(--fgColor-attention)", display: "inline-flex" }}>
                <ClockIcon size={16} aria-hidden />
              </span>
              <Muted>
                Merging is blocked until all checks pass. Waiting on{" "}
                {total - passedCount} check
                {total - passedCount === 1 ? "" : "s"}…
              </Muted>
            </Stack>
          )}

          {/* READY: the full editable merge box opens up. */}
          {lifecycle === "ready" && (
            <Stack direction="vertical" gap="normal" style={{ transition }}>
              <FormControl>
                <FormControl.Label>Merge method</FormControl.Label>
                <Select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as MergeMethod)}
                  block
                >
                  <Select.Option value="merge">
                    {MERGE_METHOD_LABEL.merge}
                  </Select.Option>
                  <Select.Option value="squash">
                    {MERGE_METHOD_LABEL.squash}
                  </Select.Option>
                  <Select.Option value="rebase">
                    {MERGE_METHOD_LABEL.rebase}
                  </Select.Option>
                </Select>
                <FormControl.Caption>
                  {method === "rebase"
                    ? "Commits are rebased and replayed onto the base branch."
                    : method === "squash"
                      ? "All commits combine into one commit on the base branch."
                      : "A merge commit records the full history of this branch."}
                </FormControl.Caption>
              </FormControl>

              {/* Rebase has no editable commit message — mirror GitHub's restraint. */}
              {method !== "rebase" && (
                <>
                  <FormControl>
                    <FormControl.Label>Commit headline</FormControl.Label>
                    <TextInput
                      value={commitHeadline}
                      onChange={(e) => setCommitHeadline(e.target.value)}
                      block
                    />
                    <FormControl.Caption>
                      The first line of the commit message.
                    </FormControl.Caption>
                  </FormControl>

                  <FormControl>
                    <FormControl.Label>Extended description</FormControl.Label>
                    <Textarea
                      value={commitBody}
                      onChange={(e) => setCommitBody(e.target.value)}
                      resize="vertical"
                      block
                    />
                    <FormControl.Caption>
                      Optional. Add context that belongs in the commit body.
                    </FormControl.Caption>
                  </FormControl>
                </>
              )}

              <FormControl>
                <Checkbox
                  checked={deleteBranch}
                  onChange={(e) => setDeleteBranch(e.target.checked)}
                />
                <FormControl.Label>
                  Delete branch after merge
                </FormControl.Label>
                <FormControl.Caption>
                  Removes <BranchName as="span">{SOURCE_BRANCH}</BranchName> once
                  the merge completes. You can restore it later.
                </FormControl.Caption>
              </FormControl>

              <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
                <Button
                  variant="primary"
                  leadingVisual={GitMergeIcon}
                  onClick={onMerge}
                >
                  {MERGE_ACTION_LABEL[method]}
                </Button>
                <Muted>
                  {method === "squash"
                    ? `Squashes ${commitCount} commits into 1`
                    : method === "rebase"
                      ? `Replays ${commitCount} commits onto ${TARGET_BRANCH}`
                      : `Adds a merge commit to ${TARGET_BRANCH}`}
                </Muted>
              </Stack>
            </Stack>
          )}

          {/* MERGED: quiet, branch-aware confirmation. */}
          {lifecycle === "merged" && (
            <Stack direction="vertical" gap="normal" style={{ transition }}>
              <div role="status">
                <Flash variant="default">
                  <Stack direction="horizontal" gap="condensed" align="center">
                    <span style={{ color: "var(--fgColor-done)", display: "inline-flex" }}>
                      <GitMergeIcon size={16} aria-hidden />
                    </span>
                    <Text weight="semibold">
                      Pull request successfully{" "}
                      {method === "rebase"
                        ? "rebased and merged"
                        : method === "squash"
                          ? "squashed and merged"
                          : "merged"}
                      .
                    </Text>
                  </Stack>
                </Flash>
              </div>

              <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
                <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
                  {branchDeleted ? (
                    <SkipIcon size={16} aria-hidden />
                  ) : (
                    <GitBranchIcon size={16} aria-hidden />
                  )}
                </span>
                <Muted>
                  {branchDeleted ? (
                    <>
                      The branch{" "}
                      <BranchName as="span">{SOURCE_BRANCH}</BranchName> was
                      deleted.
                    </>
                  ) : (
                    <>
                      The branch{" "}
                      <BranchName as="span">{SOURCE_BRANCH}</BranchName> was not
                      deleted.
                    </>
                  )}
                </Muted>
                <Button
                  variant={branchDeleted ? "default" : "danger"}
                  size="small"
                  leadingVisual={branchDeleted ? GitBranchIcon : TrashIcon}
                  onClick={onToggleBranchAfterMerge}
                >
                  {branchDeleted ? "Restore branch" : "Delete branch"}
                </Button>
              </Stack>

              {/* Post-merge activity feed — the history the room just watched unfold */}
              <Timeline clipSidebar>
                <Timeline.Item condensed>
                  <Timeline.Badge variant="success">
                    <CheckCircleFillIcon aria-hidden />
                  </Timeline.Badge>
                  <Timeline.Body>
                    <Text>
                      All {total} checks passed on{" "}
                      <BranchName as="span">{SOURCE_BRANCH}</BranchName>
                    </Text>
                  </Timeline.Body>
                </Timeline.Item>
                <Timeline.Item condensed>
                  <Timeline.Badge variant="done">
                    <GitMergeIcon aria-hidden />
                  </Timeline.Badge>
                  <Timeline.Body>
                    <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
                      <Text>
                        <Text as="span" weight="semibold">
                          {PR_AUTHOR}
                        </Text>{" "}
                        merged into{" "}
                        <BranchName as="span">{TARGET_BRANCH}</BranchName>
                      </Text>
                      <Muted>just now</Muted>
                    </Stack>
                  </Timeline.Body>
                </Timeline.Item>
              </Timeline>
            </Stack>
          )}
        </Stack>
      </Stack>

      {/* Footer affordance — open the conversation (icon-only control, named). */}
      <Stack direction="horizontal" gap="condensed" align="center" justify="end">
        <IconButton
          icon={CommentDiscussionIcon}
          aria-label="Open conversation"
          variant="invisible"
        />
        <IconButton
          icon={AlertIcon}
          aria-label="View linked advisories"
          variant="invisible"
        />
      </Stack>
    </Stack>
  );
}

export default PrMergedTheaterEncoreI2Gen2;
