"use client";

import {
  BranchName,
  Button,
  Checkbox,
  CounterLabel,
  Flash,
  FormControl,
  Heading,
  Label,
  ProgressBar,
  RelativeTime,
  Select,
  Spinner,
  StateLabel,
  Stack,
  Text,
  TextInput,
  Textarea,
  Timeline,
} from "@primer/react";
import {
  AlertIcon,
  CheckCircleFillIcon,
  CheckIcon,
  CommentIcon,
  DotFillIcon,
  EyeIcon,
  FileDiffIcon,
  GitCommitIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  TrashIcon,
  XCircleFillIcon,
} from "@primer/octicons-react";
import { useEffect, useMemo, useReducer, useState } from "react";

// ----------------------------------------------------------------------------
// Reduced-motion hook — gates every staged transition. When the user prefers
// reduced motion, checks resolve in a single tick and CSS transitions collapse
// to zero so nothing animates into a state a screen reader would misreport.
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// Invented data — fictional repo / branches / labels / check names.
// ----------------------------------------------------------------------------
type CheckState = "pending" | "running" | "success" | "failure";

interface CheckRow {
  id: string;
  name: string;
  context: string;
  /** when this check should flip to a terminal state, in ms from mount */
  resolveAt: number;
  outcome: "success" | "failure";
}

const CHECKS: readonly CheckRow[] = [
  { id: "lint", name: "lint / eslint", context: "code quality", resolveAt: 900, outcome: "success" },
  { id: "unit", name: "test / unit", context: "vitest", resolveAt: 1900, outcome: "success" },
  { id: "types", name: "test / typecheck", context: "tsc --noEmit", resolveAt: 2900, outcome: "success" },
  { id: "e2e", name: "test / e2e", context: "playwright", resolveAt: 4100, outcome: "success" },
  { id: "build", name: "build / bundle", context: "rollup", resolveAt: 5000, outcome: "success" },
  { id: "deploy", name: "deploy / preview", context: "atlas-cloud", resolveAt: 5800, outcome: "success" },
] as const;

const TOPIC_LABELS: readonly { text: string; variant: React.ComponentProps<typeof Label>["variant"] }[] = [
  { text: "feature", variant: "accent" },
  { text: "telemetry", variant: "done" },
  { text: "needs-changelog", variant: "attention" },
] as const;

type MergeMethod = "merge" | "squash" | "rebase";

const MERGE_VERB: Record<MergeMethod, string> = {
  merge: "Create a merge commit",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};

// ----------------------------------------------------------------------------
// Check-progression reducer — advances each check from running -> terminal as
// timers fire. Kept as a reducer so the live counts derive from one source.
// ----------------------------------------------------------------------------
type CheckMap = Record<string, CheckState>;

function checksReducer(
  state: CheckMap,
  action: { type: "resolve"; id: string; outcome: "success" | "failure" } | { type: "resolveAll" },
): CheckMap {
  if (action.type === "resolveAll") {
    const next: CheckMap = {};
    for (const c of CHECKS) next[c.id] = c.outcome;
    return next;
  }
  if (state[action.id] === action.outcome) return state;
  return { ...state, [action.id]: action.outcome };
}

const INITIAL_CHECKS: CheckMap = Object.fromEntries(
  CHECKS.map((c) => [c.id, "running" as CheckState]),
) as CheckMap;

// ----------------------------------------------------------------------------
// Per-check rail row presentation.
// ----------------------------------------------------------------------------
function CheckBadge({ state }: { state: CheckState }) {
  if (state === "success") {
    return (
      <Timeline.Badge variant="success">
        <CheckCircleFillIcon aria-hidden />
      </Timeline.Badge>
    );
  }
  if (state === "failure") {
    return (
      <Timeline.Badge variant="danger">
        <XCircleFillIcon aria-hidden />
      </Timeline.Badge>
    );
  }
  return (
    <Timeline.Badge variant="attention">
      <Spinner size="small" srText={null} />
    </Timeline.Badge>
  );
}

function checkStatusText(state: CheckState): string {
  switch (state) {
    case "success":
      return "Successful";
    case "failure":
      return "Failing";
    default:
      return "In progress";
  }
}

// ----------------------------------------------------------------------------
// Main composition.
// ----------------------------------------------------------------------------
export function PrMergedTheaterBaseI2Gen2() {
  const reducedMotion = usePrefersReducedMotion();
  const [checks, dispatch] = useReducer(checksReducer, INITIAL_CHECKS);
  const [merged, setMerged] = useState(false);
  const [merging, setMerging] = useState(false);

  // Editable merge box state.
  const [method, setMethod] = useState<MergeMethod>("squash");
  const [headline, setHeadline] = useState("Add request-scoped telemetry to the gateway (#482)");
  const [description, setDescription] = useState(
    "Threads a per-request trace id through the gateway and emits structured\nspans for every downstream call. No behavioural change for callers.",
  );
  const [deleteBranch, setDeleteBranch] = useState(true);
  const [branchRemoved, setBranchRemoved] = useState(false);

  // Drive the check progression with timers. Reduced motion resolves at once.
  useEffect(() => {
    if (reducedMotion) {
      dispatch({ type: "resolveAll" });
      return;
    }
    const timers = CHECKS.map((c) =>
      setTimeout(() => dispatch({ type: "resolve", id: c.id, outcome: c.outcome }), c.resolveAt),
    );
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  // Derived live counts.
  const passed = useMemo(() => CHECKS.filter((c) => checks[c.id] === "success").length, [checks]);
  const failed = useMemo(() => CHECKS.filter((c) => checks[c.id] === "failure").length, [checks]);
  const resolved = passed + failed;
  const total = CHECKS.length;
  const progress = Math.round((resolved / total) * 100);
  const allGreen = passed === total;

  // Running metadata counts that tick up as checks land.
  const commitCount = 8;
  const filesChanged = 12;

  // Merge action: flip the capsule, collapse the box, honor the branch choice.
  function handleMerge() {
    setMerging(true);
    const finish = () => {
      setMerged(true);
      setMerging(false);
      setBranchRemoved(deleteBranch);
    };
    if (reducedMotion) {
      finish();
    } else {
      // a single beat of "merging" before the flip — state, not fireworks
      window.setTimeout(finish, 500);
    }
  }

  function handleToggleBranch() {
    // After merge: restore (re-create) or delete the branch.
    setBranchRemoved((prev) => !prev);
  }

  // Transition strings — collapse to none under reduced motion.
  const stateChange = reducedMotion ? "none" : "var(--motion-transition-stateChange)";
  const enterTransition = reducedMotion ? "none" : "var(--motion-transition-enter)";

  const cardSurface: React.CSSProperties = {
    backgroundColor: "var(--bgColor-default)",
    border: "1px solid var(--borderColor-default)",
    borderRadius: "var(--borderRadius-large, 12px)",
    boxShadow: "var(--shadow-resting-medium)",
    overflow: "hidden",
  };

  const sectionDivider: React.CSSProperties = {
    borderTop: "1px solid var(--borderColor-muted)",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bgColor-default)",
        color: "var(--fgColor-default)",
        padding: "var(--base-size-24, 1.5rem)",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <Stack direction="vertical" gap="normal">
          {/* ---- PR header: title + number, state capsule, branch line ---- */}
          <Stack direction="vertical" gap="condensed">
            <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
              <span
                aria-hidden={!merged ? undefined : undefined}
                style={{ transition: stateChange, display: "inline-flex" }}
              >
                <StateLabel status={merged ? "pullMerged" : "pullOpened"}>
                  {merged ? "Merged" : "Open"}
                </StateLabel>
              </span>
              <Heading as="h1" variant="large" style={{ flex: 1, minWidth: 240 }}>
                Add request-scoped telemetry to the gateway{" "}
                <Text as="span" weight="light" style={{ color: "var(--fgColor-muted)" }}>
                  #482
                </Text>
              </Heading>
            </Stack>

            <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                <Text as="strong" weight="semibold" style={{ color: "var(--fgColor-default)" }}>
                  marlowe-dev
                </Text>{" "}
                wants to merge {commitCount} commits into
              </Text>
              <BranchName as="span">main</BranchName>
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                from
              </Text>
              <BranchName as="span">feat/gateway-telemetry</BranchName>
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                opened{" "}
                <RelativeTime datetime="2026-06-12T08:30:00Z" tense="past">
                  yesterday
                </RelativeTime>
              </Text>
            </Stack>
          </Stack>

          {/* ---- Metadata scan line: topic labels + running counts ---- */}
          <Stack
            direction="horizontal"
            gap="normal"
            align="center"
            justify="space-between"
            wrap="wrap"
          >
            <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
              {TOPIC_LABELS.map((l) => (
                <Label key={l.text} variant={l.variant}>
                  {l.text}
                </Label>
              ))}
            </Stack>
            <Stack direction="horizontal" gap="normal" align="center" wrap="wrap">
              <Stack direction="horizontal" gap="condensed" align="center">
                <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
                  <GitCommitIcon aria-hidden />
                </span>
                <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                  Commits
                </Text>
                <CounterLabel variant="primary">{commitCount}</CounterLabel>
              </Stack>
              <Stack direction="horizontal" gap="condensed" align="center">
                <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
                  <CheckIcon aria-hidden />
                </span>
                <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                  Checks
                </Text>
                <CounterLabel
                  variant={allGreen ? "primary" : "secondary"}
                  aria-label={`${resolved} of ${total} checks complete`}
                >
                  {resolved}/{total}
                </CounterLabel>
              </Stack>
              <Stack direction="horizontal" gap="condensed" align="center">
                <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
                  <FileDiffIcon aria-hidden />
                </span>
                <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                  Files changed
                </Text>
                <CounterLabel variant="secondary">{filesChanged}</CounterLabel>
              </Stack>
            </Stack>
          </Stack>

          {/* ---- The merge box ---- */}
          <section style={cardSurface} aria-label="Merge box">
            {/* Reviews summary */}
            <Stack
              direction="horizontal"
              gap="condensed"
              align="center"
              padding="normal"
            >
              <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
                <EyeIcon aria-hidden />
              </span>
              <Text weight="semibold">2 approving reviews</Text>
              <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
                <CommentIcon aria-hidden />
              </span>
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                @priya-anand and @lucas-vega approved these changes
              </Text>
            </Stack>

            {/* Checks wall */}
            <div style={sectionDivider}>
              <Stack direction="vertical" gap="condensed" padding="normal">
                <Stack
                  direction="horizontal"
                  gap="condensed"
                  align="center"
                  justify="space-between"
                  wrap="wrap"
                >
                  <Stack direction="horizontal" gap="condensed" align="center">
                    <Heading as="h2" variant="small">
                      {allGreen ? "All checks have passed" : "Checks are still running"}
                    </Heading>
                    {!allGreen && <Spinner size="small" srText="Checks running" />}
                  </Stack>
                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    {passed} successful
                    {failed > 0 ? `, ${failed} failing` : ""} · {total - resolved} pending
                  </Text>
                </Stack>

                {/* Determinate progress as the dominoes fall */}
                <ProgressBar
                  progress={progress}
                  aria-label={`${resolved} of ${total} checks complete`}
                  aria-valuetext={`${resolved} of ${total} checks complete`}
                  bg={
                    failed > 0
                      ? "danger.emphasis"
                      : allGreen
                        ? "success.emphasis"
                        : "accent.emphasis"
                  }
                  animated={!reducedMotion && !allGreen}
                  barSize="default"
                />

                {/* The check list along a connecting rail */}
                <Timeline clipSidebar>
                  {CHECKS.map((c) => {
                    const state = checks[c.id];
                    return (
                      <Timeline.Item key={c.id} condensed>
                        <CheckBadge state={state} />
                        <Timeline.Body>
                          <Stack
                            direction="horizontal"
                            gap="condensed"
                            align="center"
                            justify="space-between"
                            wrap="wrap"
                          >
                            <Stack direction="vertical" gap="none">
                              <Text
                                weight="semibold"
                                style={{ color: "var(--fgColor-default)" }}
                              >
                                {c.name}
                              </Text>
                              <Text
                                size="small"
                                style={{ color: "var(--fgColor-muted)" }}
                              >
                                {c.context} — {checkStatusText(state)}
                              </Text>
                            </Stack>
                          </Stack>
                        </Timeline.Body>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
              </Stack>
            </div>

            {/* Ready cue + merge controls. role=status so the ready announcement
                is polite, not assertive, and is only present once truly ready. */}
            <div style={sectionDivider}>
              <Stack direction="vertical" gap="normal" padding="normal">
                {!merged && allGreen && (
                  <div
                    role="status"
                    style={{
                      transition: enterTransition,
                    }}
                  >
                    <Flash variant="success">
                      <Stack direction="horizontal" gap="condensed" align="center">
                        <CheckCircleFillIcon aria-hidden />
                        <Text weight="semibold">
                          This branch is ready to merge.
                        </Text>
                        <Text style={{ color: "var(--fgColor-muted)" }}>
                          All required checks have passed and reviews are in.
                        </Text>
                      </Stack>
                    </Flash>
                  </div>
                )}

                {merged ? (
                  // Collapsed confirmation honoring the branch choice.
                  <Stack direction="vertical" gap="normal">
                    <div role="status" style={{ transition: enterTransition }}>
                      <Flash variant="default">
                        <Stack direction="horizontal" gap="condensed" align="center">
                          <span
                            style={{
                              color: "var(--fgColor-done, var(--fgColor-default))",
                              display: "inline-flex",
                            }}
                          >
                            <GitMergeIcon aria-hidden />
                          </span>
                          <Text weight="semibold">
                            Pull request successfully merged and closed.
                          </Text>
                        </Stack>
                      </Flash>
                    </div>

                    <Stack
                      direction="horizontal"
                      gap="condensed"
                      align="center"
                      justify="space-between"
                      wrap="wrap"
                    >
                      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
                        <BranchName as="span">feat/gateway-telemetry</BranchName>
                        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                          {branchRemoved
                            ? "was deleted from this repository."
                            : "is still available in this repository."}
                        </Text>
                      </Stack>
                      <Button
                        variant={branchRemoved ? "default" : "danger"}
                        leadingVisual={branchRemoved ? GitMergeIcon : TrashIcon}
                        onClick={handleToggleBranch}
                      >
                        {branchRemoved ? "Restore branch" : "Delete branch"}
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  // Full editable merge box — only mounted as enabled when green.
                  <Stack direction="vertical" gap="normal">
                    <FormControl>
                      <FormControl.Label>Merge method</FormControl.Label>
                      <Select
                        value={method}
                        onChange={(e) => setMethod(e.target.value as MergeMethod)}
                        disabled={!allGreen}
                        block
                      >
                        <Select.Option value="merge">Create a merge commit</Select.Option>
                        <Select.Option value="squash">Squash and merge</Select.Option>
                        <Select.Option value="rebase">Rebase and merge</Select.Option>
                      </Select>
                      <FormControl.Caption>
                        {method === "rebase"
                          ? "All commits will be rebased and added to the base branch."
                          : method === "squash"
                            ? "The commits will be combined into one commit on the base branch."
                            : "A merge commit will be added to the base branch."}
                      </FormControl.Caption>
                    </FormControl>

                    <FormControl disabled={method === "rebase" || !allGreen}>
                      <FormControl.Label>Commit headline</FormControl.Label>
                      <TextInput
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        block
                        monospace
                      />
                    </FormControl>

                    <FormControl disabled={method === "rebase" || !allGreen}>
                      <FormControl.Label>Extended description</FormControl.Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        resize="vertical"
                        block
                        rows={4}
                      />
                      <FormControl.Caption>
                        Markdown is supported in the extended description.
                      </FormControl.Caption>
                    </FormControl>

                    <FormControl disabled={!allGreen}>
                      <Checkbox
                        checked={deleteBranch}
                        onChange={(e) => setDeleteBranch(e.target.checked)}
                      />
                      <FormControl.Label>
                        Delete branch after merge
                      </FormControl.Label>
                      <FormControl.Caption>
                        feat/gateway-telemetry will be removed once the merge completes.
                      </FormControl.Caption>
                    </FormControl>

                    <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
                      {/* While checks run, merging is genuinely unavailable: the
                          primary action is disabled (out of tab order, not
                          announced as actionable) and a waiting note replaces the
                          ready cue. */}
                      <Button
                        variant="primary"
                        leadingVisual={method === "rebase" ? GitPullRequestIcon : GitMergeIcon}
                        disabled={!allGreen || merging}
                        loading={merging}
                        loadingAnnouncement="Merging pull request"
                        onClick={handleMerge}
                      >
                        {MERGE_VERB[method]}
                      </Button>
                      {!allGreen && (
                        <Stack direction="horizontal" gap="condensed" align="center">
                          <span
                            style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}
                          >
                            <AlertIcon aria-hidden />
                          </span>
                          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                            Merging is blocked until all checks pass.
                          </Text>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </div>
          </section>

          {/* ---- Footer activity rail (decorative-but-real) ---- */}
          <Stack direction="horizontal" gap="condensed" align="center">
            <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
              <DotFillIcon aria-hidden />
            </span>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              {merged
                ? "Merged just now"
                : allGreen
                  ? "Ready — waiting on you"
                  : "Watching checks…"}
            </Text>
          </Stack>
        </Stack>
      </div>
    </main>
  );
}

export default PrMergedTheaterBaseI2Gen2;
