"use client";

// PR "merged theater" encore — a dense, live GitHub-style pull request panel built
// with Primer React. Checks resolve one-by-one over ~6s (client timers), a progress
// indicator advances and live counts tick, then the merge box opens into its full
// editable form. Clicking merge flips the Open capsule to Merged with a tokenized
// state-change transition and collapses the box into a quiet, branch-aware confirmation.
//
// Component sourcing (every import grounded against node_modules):
//   IN-SLATE: BranchName, Button, Checkbox, CounterLabel, Flash, FormControl,
//             Heading, IconButton, Label, Select, Stack, StateLabel, Text, TextInput, Textarea
//   HARVEST:  Timeline (lifecycle event/check feed — the slate has no event-feed primitive),
//             Spinner (in-flight check indicator — the slate has no busy/loader primitive),
//             ProgressBar (checks-progress meter — the slate has no progress primitive),
//             RelativeTime (relative timestamp — the slate has no time-formatting primitive)
//
// Motion, color, spacing, radius, shadow all come from Primer tokens (CSS vars). No
// hand-picked hex/px/ms/easing. prefers-reduced-motion is honored. The merge button is
// genuinely unavailable (disabled) while checks run, so a keyboard/SR user cannot fire it.

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
  ProgressBar, // HARVEST: ProgressBar — slate has no progress-meter primitive; checks-progress must read as a determinate bar, not faked with a div
  RelativeTime, // HARVEST: RelativeTime — slate has no time primitive; "opened 3 hours ago" needs a real <relative-time> for correct SR/locale formatting
  Select, // IN-SLATE
  Spinner, // HARVEST: Spinner — slate has no busy indicator; an in-flight check needs a real animated loader, not a static glyph
  Stack, // IN-SLATE
  StateLabel, // IN-SLATE
  Text, // IN-SLATE
  TextInput, // IN-SLATE
  Textarea, // IN-SLATE
  Timeline, // HARVEST: Timeline — slate has no event/activity-feed primitive; the wall of checks + reviews reads as a lifecycle feed with per-event badges
} from "@primer/react";
import {
  AlertIcon,
  CheckCircleFillIcon,
  CheckIcon,
  ClockIcon,
  CommentIcon,
  DotFillIcon,
  FileDiffIcon,
  GitBranchIcon,
  GitCommitIcon,
  GitMergeIcon,
  PersonIcon,
  TrashIcon,
  XCircleFillIcon,
  type Icon,
} from "@primer/octicons-react";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";

/* ------------------------------------------------------------------ */
/* Invented data (fictional repo / users / branches / checks)          */
/* ------------------------------------------------------------------ */

const REPO = "lumen-labs/aurora-console";
const PR_NUMBER = 482;
const PR_TITLE = "Stream telemetry deltas over the websocket bridge";
const SOURCE_BRANCH = "feat/telemetry-delta-stream";
const TARGET_BRANCH = "main";
const AUTHOR = "rivenwald";

// "opened" timestamp ~3h ago, fixed at module load so RelativeTime is stable across renders.
const OPENED_AT = new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString();

type CheckStatus = "running" | "success" | "failure";

type CheckDef = {
  id: string;
  name: string;
  context: string;
  /** Final state once resolved. The last few intentionally land green for the payoff. */
  resolvesTo: Exclude<CheckStatus, "running">;
  icon: Icon;
};

const CHECK_DEFS: CheckDef[] = [
  { id: "lint", name: "lint / eslint", context: "code quality", resolvesTo: "success", icon: CheckIcon },
  { id: "unit", name: "test / unit", context: "vitest · 1.2k cases", resolvesTo: "success", icon: CheckIcon },
  { id: "types", name: "build / typecheck", context: "tsc --noEmit", resolvesTo: "success", icon: CheckIcon },
  { id: "e2e", name: "test / e2e", context: "playwright · chromium", resolvesTo: "success", icon: CheckIcon },
  { id: "bundle", name: "analyze / bundle-size", context: "+0.4 kB gzip", resolvesTo: "success", icon: CheckIcon },
  { id: "deploy", name: "deploy / preview", context: "aurora-console.preview", resolvesTo: "success", icon: CheckIcon },
];

type Reviewer = {
  login: string;
  decision: "approved" | "commented";
};

const REVIEWERS: Reviewer[] = [
  { login: "marleneo", decision: "approved" },
  { login: "tovahk", decision: "approved" },
  { login: "destrey", decision: "commented" },
];

const TOPIC_LABELS: { text: string; variant: React.ComponentProps<typeof Label>["variant"] }[] = [
  { text: "telemetry", variant: "accent" },
  { text: "websocket", variant: "done" },
  { text: "needs-changelog", variant: "attention" },
];

const COMMITS = 7;
const FILES_CHANGED = 12;

type MergeMethod = "merge" | "squash" | "rebase";

const MERGE_METHOD_COPY: Record<
  MergeMethod,
  { option: string; action: string; defaultHeadline: string }
> = {
  merge: {
    option: "Create a merge commit",
    action: "Merge pull request",
    defaultHeadline: `Merge pull request #${PR_NUMBER} from ${SOURCE_BRANCH}`,
  },
  squash: {
    option: "Squash and merge",
    action: "Squash and merge",
    defaultHeadline: `${PR_TITLE} (#${PR_NUMBER})`,
  },
  rebase: {
    option: "Rebase and merge",
    action: "Rebase and merge",
    defaultHeadline: `${PR_TITLE} (#${PR_NUMBER})`,
  },
};

/* ------------------------------------------------------------------ */
/* Check progression state machine (client timers)                     */
/* ------------------------------------------------------------------ */

type ChecksState = Record<string, CheckStatus>;

type ChecksAction = { type: "resolve"; id: string; status: Exclude<CheckStatus, "running"> };

function checksReducer(state: ChecksState, action: ChecksState | ChecksAction): ChecksState {
  if ("type" in (action as ChecksAction)) {
    const a = action as ChecksAction;
    return { ...state, [a.id]: a.status };
  }
  return action as ChecksState;
}

const INITIAL_CHECKS: ChecksState = Object.fromEntries(
  CHECK_DEFS.map((c) => [c.id, "running" as CheckStatus]),
);

/** Detect a reduced-motion preference once on mount; SSR-safe. */
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
/* Presentational helpers                                              */
/* ------------------------------------------------------------------ */

const CARD: React.CSSProperties = {
  backgroundColor: "var(--bgColor-default)",
  border: "1px solid var(--borderColor-default)",
  borderRadius: "var(--borderRadius-large, 12px)",
  boxShadow: "var(--shadow-resting-small)",
};

function MetaCount({ icon: MetaIcon, label, count }: { icon: Icon; label: string; count: number }) {
  return (
    <Stack direction="horizontal" gap="condensed" align="center">
      <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
        <MetaIcon size={16} />
      </span>
      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
        {label}
      </Text>
      <CounterLabel>{count}</CounterLabel>
    </Stack>
  );
}

function CheckRowState({ status }: { status: CheckStatus }) {
  if (status === "running") {
    return <Spinner size="small" srText="Check in progress" />;
  }
  if (status === "success") {
    return (
      <span style={{ color: "var(--fgColor-success, var(--fgColor-default))", display: "inline-flex" }}>
        <CheckCircleFillIcon size={16} aria-label="Passed" />
      </span>
    );
  }
  return (
    <span style={{ color: "var(--fgColor-danger, var(--fgColor-default))", display: "inline-flex" }}>
      <XCircleFillIcon size={16} aria-label="Failed" />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export function PrMergedTheaterEncoreGen1() {
  const reducedMotion = usePrefersReducedMotion();

  const [checks, dispatch] = useReducer(checksReducer, INITIAL_CHECKS);
  const [merged, setMerged] = useState(false);

  // Editable merge box state
  const [mergeMethod, setMergeMethod] = useState<MergeMethod>("squash");
  const [headline, setHeadline] = useState(MERGE_METHOD_COPY.squash.defaultHeadline);
  const [headlineEdited, setHeadlineEdited] = useState(false);
  const [description, setDescription] = useState(
    "Adds an incremental delta encoder so the dashboard only re-sends changed telemetry keys.",
  );
  const [deleteBranch, setDeleteBranch] = useState(true);

  // Drive the check dominoes. Each check resolves on its own staggered timer so the
  // room watches them fall one by one; the whole run is ~6s.
  useEffect(() => {
    if (reducedMotion) {
      // Respect reduced motion: resolve immediately to the final green state without
      // staging visible per-check beats.
      dispatch(
        Object.fromEntries(
          CHECK_DEFS.map((c) => [c.id, c.resolvesTo as CheckStatus]),
        ) as ChecksState,
      );
      return;
    }
    const STEP_MS = 950; // staggered cadence; ~6 checks ≈ 5.7s of dominoes
    const timers = CHECK_DEFS.map((c, i) =>
      setTimeout(() => dispatch({ type: "resolve", id: c.id, status: c.resolvesTo }), STEP_MS * (i + 1)),
    );
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  const resolvedCount = useMemo(
    () => CHECK_DEFS.filter((c) => checks[c.id] !== "running").length,
    [checks],
  );
  const passedCount = useMemo(
    () => CHECK_DEFS.filter((c) => checks[c.id] === "success").length,
    [checks],
  );
  const anyFailed = useMemo(
    () => CHECK_DEFS.some((c) => checks[c.id] === "failure"),
    [checks],
  );
  const allResolved = resolvedCount === CHECK_DEFS.length;
  const allGreen = allResolved && !anyFailed;
  const progressPct = Math.round((resolvedCount / CHECK_DEFS.length) * 100);

  // Keep the headline in sync with the chosen method until the user hand-edits it.
  const onMethodChange = useCallback(
    (next: MergeMethod) => {
      setMergeMethod(next);
      if (!headlineEdited) setHeadline(MERGE_METHOD_COPY[next].defaultHeadline);
    },
    [headlineEdited],
  );

  const onMerge = useCallback(() => {
    if (!allGreen || merged) return;
    setMerged(true);
  }, [allGreen, merged]);

  const stateTransition = reducedMotion
    ? undefined
    : "background-color var(--motion-transition-stateChange), color var(--motion-transition-stateChange)";
  const enterTransition = reducedMotion ? undefined : "opacity var(--motion-transition-enter)";

  return (
    <Stack
      as="main"
      direction="vertical"
      gap="normal"
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "var(--base-size-24, 1.5rem)",
      }}
    >
      {/* ---- PR header: title + number, branches, lifecycle capsule ---- */}
      <Stack direction="vertical" gap="condensed">
        <Stack direction="horizontal" gap="normal" align="center" justify="space-between" wrap="wrap">
          <Heading as="h1" variant="large">
            {PR_TITLE}{" "}
            <Text as="span" size="large" weight="light" style={{ color: "var(--fgColor-muted)" }}>
              #{PR_NUMBER}
            </Text>
          </Heading>
          {/* Lifecycle capsule flips Open -> Merged with a tokenized state-change beat. */}
          <span
            style={{
              display: "inline-flex",
              transition: stateTransition,
            }}
          >
            {merged ? (
              <StateLabel status="pullMerged">Merged</StateLabel>
            ) : (
              <StateLabel status="pullOpened">Open</StateLabel>
            )}
          </span>
        </Stack>

        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          <Text size="small" weight="semibold">
            {AUTHOR}
          </Text>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            wants to merge {COMMITS} commits into
          </Text>
          <BranchName as="span">{TARGET_BRANCH}</BranchName>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            from
          </Text>
          <BranchName as="span">{SOURCE_BRANCH}</BranchName>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            ·
          </Text>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            opened <RelativeTime date={new Date(OPENED_AT)} /> · {REPO}
          </Text>
        </Stack>

        {/* ---- Maintainer scan line: topic labels + running counts ---- */}
        <Stack direction="horizontal" gap="normal" align="center" wrap="wrap">
          <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
            {TOPIC_LABELS.map((l) => (
              <Label key={l.text} variant={l.variant}>
                {l.text}
              </Label>
            ))}
          </Stack>
          <Stack direction="horizontal" gap="normal" align="center" wrap="wrap">
            <MetaCount icon={GitCommitIcon} label="commits" count={COMMITS} />
            <MetaCount icon={CheckIcon} label="checks passing" count={passedCount} />
            <MetaCount icon={FileDiffIcon} label="files changed" count={FILES_CHANGED} />
          </Stack>
        </Stack>
      </Stack>

      {/* ---- Merge box ---- */}
      <section aria-label="Merge box" style={{ ...CARD, overflow: "hidden" }}>
        {/* Reviews timeline */}
        <div style={{ padding: "var(--base-size-16, 1rem)", borderBottom: "1px solid var(--borderColor-muted)" }}>
          <Stack direction="vertical" gap="condensed">
            <Stack direction="horizontal" gap="condensed" align="center" justify="space-between">
              <Heading as="h2" variant="small">
                Reviews
              </Heading>
              <CounterLabel>{REVIEWERS.length}</CounterLabel>
            </Stack>
            <Timeline clipSidebar>
              {REVIEWERS.map((r) => (
                <Timeline.Item key={r.login}>
                  <Timeline.Badge variant={r.decision === "approved" ? "success" : "accent"}>
                    {r.decision === "approved" ? <CheckIcon size={16} /> : <CommentIcon size={16} />}
                  </Timeline.Badge>
                  <Timeline.Body>
                    <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
                      <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
                        <PersonIcon size={16} />
                      </span>
                      <Text weight="semibold">{r.login}</Text>
                      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                        {r.decision === "approved" ? "approved these changes" : "left a comment"}
                      </Text>
                    </Stack>
                  </Timeline.Body>
                </Timeline.Item>
              ))}
            </Timeline>
          </Stack>
        </div>

        {/* Checks wall */}
        <div style={{ padding: "var(--base-size-16, 1rem)", borderBottom: "1px solid var(--borderColor-muted)" }}>
          <Stack direction="vertical" gap="condensed">
            <Stack direction="horizontal" gap="condensed" align="center" justify="space-between" wrap="wrap">
              <Stack direction="horizontal" gap="condensed" align="center">
                <Heading as="h2" variant="small">
                  Checks
                </Heading>
                <CounterLabel>{CHECK_DEFS.length}</CounterLabel>
              </Stack>
              <Stack direction="horizontal" gap="condensed" align="center">
                {!allResolved && <Spinner size="small" srText={null} />}
                <Text
                  size="small"
                  aria-live="polite"
                  style={{ color: "var(--fgColor-muted)" }}
                >
                  {allResolved
                    ? anyFailed
                      ? `${passedCount} of ${CHECK_DEFS.length} checks passed`
                      : "All checks have passed"
                    : `Running checks — ${resolvedCount} of ${CHECK_DEFS.length} complete`}
                </Text>
              </Stack>
            </Stack>

            {/* Determinate progress meter advancing as checks land. */}
            <ProgressBar
              progress={progressPct}
              barSize="small"
              aria-label={`Checks progress: ${resolvedCount} of ${CHECK_DEFS.length} complete`}
            />

            <Timeline clipSidebar>
              {CHECK_DEFS.map((c) => {
                const status = checks[c.id];
                const badgeVariant =
                  status === "success" ? "success" : status === "failure" ? "danger" : "accent";
                return (
                  <Timeline.Item key={c.id}>
                    <Timeline.Badge variant={badgeVariant}>
                      {status === "running" ? (
                        <DotFillIcon size={16} />
                      ) : status === "success" ? (
                        <CheckIcon size={16} />
                      ) : (
                        <AlertIcon size={16} />
                      )}
                    </Timeline.Badge>
                    <Timeline.Body>
                      <Stack
                        direction="horizontal"
                        gap="condensed"
                        align="center"
                        justify="space-between"
                      >
                        <Stack direction="vertical" gap="none">
                          <Text weight="semibold">{c.name}</Text>
                          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                            {c.context}
                          </Text>
                        </Stack>
                        <CheckRowState status={status} />
                      </Stack>
                    </Timeline.Body>
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </Stack>
        </div>

        {/* Merge controls — collapsed/quiet while running, full editable form when green,
            confirmation after merge. */}
        <div style={{ padding: "var(--base-size-16, 1rem)" }}>
          {merged ? (
            <MergeConfirmation deleteBranch={deleteBranch} transition={enterTransition} />
          ) : allGreen ? (
            <Stack direction="vertical" gap="normal" style={{ transition: enterTransition }}>
              {/* The "ready" cue — announced politely the moment everything is green. */}
              <Flash variant="success">
                <Stack direction="horizontal" gap="condensed" align="center" role="status">
                  <CheckCircleFillIcon size={16} />
                  <Text weight="semibold">This branch has no conflicts. Ready to merge.</Text>
                </Stack>
              </Flash>

              <FormControl>
                <FormControl.Label>Merge method</FormControl.Label>
                <Select
                  value={mergeMethod}
                  onChange={(e) => onMethodChange(e.target.value as MergeMethod)}
                  block
                >
                  <Select.Option value="merge">{MERGE_METHOD_COPY.merge.option}</Select.Option>
                  <Select.Option value="squash">{MERGE_METHOD_COPY.squash.option}</Select.Option>
                  <Select.Option value="rebase">{MERGE_METHOD_COPY.rebase.option}</Select.Option>
                </Select>
                <FormControl.Caption>
                  The commit history written to {TARGET_BRANCH} depends on the method.
                </FormControl.Caption>
              </FormControl>

              {/* Rebase writes commits verbatim, so the editable commit box is hidden then. */}
              {mergeMethod !== "rebase" && (
                <>
                  <FormControl>
                    <FormControl.Label>Commit headline</FormControl.Label>
                    <TextInput
                      value={headline}
                      onChange={(e) => {
                        setHeadline(e.target.value);
                        setHeadlineEdited(true);
                      }}
                      block
                    />
                  </FormControl>

                  <FormControl>
                    <FormControl.Label>Extended description</FormControl.Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      resize="vertical"
                      block
                    />
                    <FormControl.Caption>
                      Optional. Markdown is supported.
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
                  Delete {SOURCE_BRANCH} after merge
                </FormControl.Label>
                <FormControl.Caption>
                  You can restore the branch later if you change your mind.
                </FormControl.Caption>
              </FormControl>

              <Stack direction="horizontal" gap="condensed" align="center">
                <Button variant="primary" leadingVisual={GitMergeIcon} onClick={onMerge}>
                  {MERGE_METHOD_COPY[mergeMethod].action}
                </Button>
                <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                  You can also merge from the command line.
                </Text>
              </Stack>
            </Stack>
          ) : (
            // While checks run, merging is genuinely unavailable: the button is disabled
            // (out of the accessibility tree as actionable) and a status line says why.
            <Stack direction="vertical" gap="condensed">
              <Stack direction="horizontal" gap="condensed" align="center">
                <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
                  <ClockIcon size={16} />
                </span>
                <Text weight="semibold" aria-live="polite">
                  {anyFailed
                    ? "Some checks were not successful"
                    : "Merging is blocked until checks finish"}
                </Text>
              </Stack>
              <Stack direction="horizontal" gap="condensed" align="center">
                <Button
                  variant="primary"
                  leadingVisual={GitMergeIcon}
                  disabled
                  onClick={onMerge}
                >
                  Merge pull request
                </Button>
                <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                  Required status checks must pass before merging.
                </Text>
              </Stack>
            </Stack>
          )}
        </div>
      </section>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/* Post-merge confirmation — honors the delete-branch choice           */
/* ------------------------------------------------------------------ */

function MergeConfirmation({
  deleteBranch,
  transition,
}: {
  deleteBranch: boolean;
  transition?: string;
}) {
  // Local toggle so "Restore"/"Delete" feels real without inventing APIs.
  const [branchRemoved, setBranchRemoved] = useState(deleteBranch);

  return (
    <Stack direction="vertical" gap="normal" style={{ transition }}>
      <Flash variant="default">
        <Stack direction="horizontal" gap="condensed" align="center" role="status">
          <span style={{ color: "var(--fgColor-done, var(--fgColor-default))", display: "inline-flex" }}>
            <GitMergeIcon size={16} />
          </span>
          <Text weight="semibold">
            Pull request successfully merged and closed
          </Text>
        </Stack>
      </Flash>

      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
        <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
          <GitBranchIcon size={16} />
        </span>
        {branchRemoved ? (
          <>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              The <BranchName as="span">{SOURCE_BRANCH}</BranchName> branch was deleted.
            </Text>
            <Button
              size="small"
              variant="default"
              leadingVisual={GitBranchIcon}
              onClick={() => setBranchRemoved(false)}
            >
              Restore branch
            </Button>
          </>
        ) : (
          <>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              The <BranchName as="span">{SOURCE_BRANCH}</BranchName> branch was kept.
            </Text>
            <Button
              size="small"
              variant="danger"
              leadingVisual={TrashIcon}
              onClick={() => setBranchRemoved(true)}
            >
              Delete branch
            </Button>
          </>
        )}
      </Stack>
    </Stack>
  );
}

export default PrMergedTheaterEncoreGen1;
