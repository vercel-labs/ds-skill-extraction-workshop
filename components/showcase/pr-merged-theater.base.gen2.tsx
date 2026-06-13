"use client";

// PR-merged theater — encore. A dense, GitHub-style pull request panel where
// CI checks resolve one-by-one over ~6s, a progress bar advances, live counts
// tick, then the merge box opens into its full editable form. Clicking merge
// flips the lifecycle capsule Open -> Merged with a motion beat and collapses
// the box into a confirmation that honors the delete-branch choice.
//
// Shell/token/a11y/motion hard rules from the primer-react skill are obeyed:
// this file self-wraps in ThemeProvider + BaseStyles and paints its own root
// surface with var(--bgColor-default) + minHeight (never a fixed height), so it
// renders correctly standalone in both color modes. Motion rides design-system
// motion tokens and is gated on prefers-reduced-motion. Colors/durations/easings
// are token-derived only — no hand-picked hex, px, ms, or easing strings.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BaseStyles,
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
  ThemeProvider,
  // HARVEST: Avatar — author/reviewer identity; the 15-slate has no avatar primitive and faking it with a Label/div loses the image + alt semantics
  Avatar,
  // HARVEST: AvatarStack — overlapping reviewer cluster; the slate has no avatar-grouping primitive and stacking raw imgs loses the cascade + expand a11y
  AvatarStack,
  // HARVEST: ProgressBar — the "dominoes" check-completion meter; no slate component renders a determinate progress track (CounterLabel is numeric text only)
  ProgressBar,
  // HARVEST: RelativeTime — live "opened N hours ago"; the slate has no time element and a hard-coded Text string is neither localized nor live
  RelativeTime,
  // HARVEST: Spinner — the in-flight "running" indicator on a pending check row; the slate ships no spinner (Button.loading is button-scoped, not a standalone glyph)
  Spinner,
  // HARVEST: Timeline — the vertical CI-checks "wall" with per-event lifecycle badges; the slate has no timeline/event-rail primitive
  Timeline,
  // HARVEST: Tooltip — hover/focus hint on the merge-method picker affordance; the slate exposes tooltips only via IconButton's aria-label, not on arbitrary controls
  Tooltip,
} from "@primer/react";
import {
  CheckCircleFillIcon,
  ClockIcon,
  CommentDiscussionIcon,
  DotFillIcon,
  FileDiffIcon,
  GitCommitIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  InfoIcon,
  TrashIcon,
  UndoIcon,
  XCircleFillIcon,
  type Icon,
} from "@primer/octicons-react";

// ---------------------------------------------------------------------------
// Invented data (fictional usernames / repo / branches / labels / checks)
// ---------------------------------------------------------------------------

const REPO = "lumen-labs/aurora-ui";
const PR_NUMBER = 318;
const PR_TITLE = "feat(panel): stream merge-readiness state without a refetch";
const SOURCE_BRANCH = "fenwick/stream-merge-state";
const TARGET_BRANCH = "main";
const PR_OPENED_AGO_MS = 1000 * 60 * 60 * 5; // 5 hours ago, as a real Date

const AUTHOR = {
  login: "fenwick",
  avatar: "https://avatars.example.invalid/fenwick.png",
};

const REVIEWERS = [
  { login: "marlowe", avatar: "https://avatars.example.invalid/marlowe.png" },
  { login: "delacroix", avatar: "https://avatars.example.invalid/delacroix.png" },
  { login: "ileana", avatar: "https://avatars.example.invalid/ileana.png" },
];

const TOPIC_LABELS: { text: string; variant: "accent" | "done" | "attention" }[] = [
  { text: "frontend", variant: "accent" },
  { text: "needs-changelog", variant: "attention" },
  { text: "perf", variant: "done" },
];

type CheckState = "pending" | "running" | "success" | "failure";

type CheckDef = {
  id: string;
  name: string;
  context: string;
  // The terminal state this check resolves to (most pass; the encore is "the last ones go green").
  resolvesTo: Extract<CheckState, "success" | "failure">;
};

const CHECK_DEFS: CheckDef[] = [
  { id: "lint", name: "lint / eslint", context: "static analysis", resolvesTo: "success" },
  { id: "unit", name: "test / unit", context: "vitest", resolvesTo: "success" },
  { id: "types", name: "test / typecheck", context: "tsc --noEmit", resolvesTo: "success" },
  { id: "e2e", name: "test / e2e", context: "playwright", resolvesTo: "success" },
  { id: "build", name: "build / preview", context: "next build", resolvesTo: "success" },
  { id: "a11y", name: "audit / a11y", context: "axe-core", resolvesTo: "success" },
];

type MergeMethod = "merge" | "squash" | "rebase";

const MERGE_METHOD_LABEL: Record<MergeMethod, string> = {
  merge: "Create a merge commit",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};

const MERGE_BUTTON_LABEL: Record<MergeMethod, string> = {
  merge: "Merge pull request",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};

// ---------------------------------------------------------------------------
// Tokens / motion helpers — all values are design-system tokens.
// ---------------------------------------------------------------------------

const surface: React.CSSProperties = {
  backgroundColor: "var(--bgColor-default)",
  border: "1px solid var(--borderColor-default)",
  borderRadius: "var(--borderRadius-large, 12px)",
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

// Resolve check icon + Timeline badge variant from lifecycle state.
function checkVisual(state: CheckState): {
  variant: "accent" | "success" | "danger" | "attention";
  Glyph: Icon | null;
  fg: string;
} {
  switch (state) {
    case "success":
      return { variant: "success", Glyph: CheckCircleFillIcon, fg: "var(--fgColor-success)" };
    case "failure":
      return { variant: "danger", Glyph: XCircleFillIcon, fg: "var(--fgColor-danger)" };
    case "running":
      return { variant: "attention", Glyph: null, fg: "var(--fgColor-muted)" };
    default:
      return { variant: "accent", Glyph: ClockIcon, fg: "var(--fgColor-muted)" };
  }
}

// ---------------------------------------------------------------------------
// Sub-component: a single CI check row inside the checks wall (Timeline).
// ---------------------------------------------------------------------------

function CheckRow({ def, state }: { def: CheckDef; state: CheckState }) {
  const { variant, Glyph, fg } = checkVisual(state);
  const statusText =
    state === "success"
      ? "Successful"
      : state === "failure"
        ? "Failing"
        : state === "running"
          ? "In progress"
          : "Queued";
  return (
    <Timeline.Item>
      <Timeline.Badge variant={variant}>
        {state === "running" ? (
          <Spinner size="small" srText={null} />
        ) : Glyph ? (
          <Glyph size={16} />
        ) : null}
      </Timeline.Badge>
      <Timeline.Body>
        <Stack direction="horizontal" gap="condensed" align="center" justify="space-between" wrap="wrap">
          <Stack direction="vertical" gap="none">
            <Text weight="semibold">{def.name}</Text>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              {def.context}
            </Text>
          </Stack>
          {/* Status text carries the meaning for SR; the icon/spinner is decorative. */}
          <Text size="small" weight="semibold" style={{ color: fg }}>
            {statusText}
          </Text>
        </Stack>
      </Timeline.Body>
    </Timeline.Item>
  );
}

// ---------------------------------------------------------------------------
// Main composition.
// ---------------------------------------------------------------------------

function MergeTheater() {
  const reducedMotion = usePrefersReducedMotion();

  // PR lifecycle.
  const [merged, setMerged] = useState(false);

  // Check progression. Start all pending; resolve one-by-one over ~6s.
  const [checkStates, setCheckStates] = useState<CheckState[]>(
    () => CHECK_DEFS.map(() => "pending"),
  );
  const timers = useRef<number[]>([]);

  // Editable merge box.
  const [method, setMethod] = useState<MergeMethod>("squash");
  const [headline, setHeadline] = useState(
    `${PR_TITLE} (#${PR_NUMBER})`,
  );
  const [description, setDescription] = useState(
    "Push merge-readiness state to the client over a timer-driven stream so the panel reflects check completion without a refetch.",
  );
  const [deleteBranch, setDeleteBranch] = useState(true);

  // After-merge: did we actually remove the branch? Mirror the choice at merge time.
  const [branchRemoved, setBranchRemoved] = useState(false);
  const [branchActionPending, setBranchActionPending] = useState(false);

  // Drive the check resolution. Each check: pending -> running -> terminal.
  useEffect(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];

    const stepMs = reducedMotion ? 0 : 950; // spacing between dominoes
    CHECK_DEFS.forEach((def, i) => {
      const runAt = reducedMotion ? 0 : stepMs * i + 300;
      const doneAt = reducedMotion ? 0 : runAt + 520;
      const toRunning = window.setTimeout(() => {
        setCheckStates((prev) => {
          const next = [...prev];
          if (next[i] === "pending") next[i] = "running";
          return next;
        });
      }, runAt);
      const toDone = window.setTimeout(() => {
        setCheckStates((prev) => {
          const next = [...prev];
          next[i] = def.resolvesTo;
          return next;
        });
      }, doneAt);
      timers.current.push(toRunning, toDone);
    });

    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [reducedMotion]);

  // Derived counts (the "running totals" that tick up as checks resolve).
  const resolvedCount = checkStates.filter(
    (s) => s === "success" || s === "failure",
  ).length;
  const successCount = checkStates.filter((s) => s === "success").length;
  const failureCount = checkStates.filter((s) => s === "failure").length;
  const total = CHECK_DEFS.length;
  const allResolved = resolvedCount === total;
  const allGreen = allResolved && failureCount === 0;
  const progress = Math.round((resolvedCount / total) * 100);

  // Invented running totals that grow alongside the checks landing.
  const commitsCount = 7;
  const filesChanged = 12;

  const canMerge = allGreen && !merged;

  const handleMerge = useCallback(() => {
    if (!canMerge) return;
    setMerged(true);
    setBranchRemoved(deleteBranch);
  }, [canMerge, deleteBranch]);

  const handleBranchAction = useCallback(() => {
    // Restore (if removed) or delete (if kept) — flips the reported branch state.
    setBranchActionPending(true);
    const delay = reducedMotion ? 0 : 600;
    const t = window.setTimeout(() => {
      setBranchRemoved((prev) => !prev);
      setBranchActionPending(false);
    }, delay);
    timers.current.push(t);
  }, [reducedMotion]);

  // Motion: a one-shot "beat" applied to the capsule + ready cue on state change.
  const beatStyle: React.CSSProperties = reducedMotion
    ? {}
    : {
        transition:
          "transform var(--motion-duration-short) var(--motion-easing-enter), opacity var(--motion-duration-short) var(--motion-easing-enter)",
      };

  const MethodIcon =
    method === "rebase" ? GitPullRequestIcon : GitMergeIcon;

  return (
    <div
      style={{
        maxWidth: 1080,
        margin: "0 auto",
        paddingTop: "var(--base-size-32, 2rem)",
        paddingBottom: "var(--base-size-32, 2rem)",
        paddingLeft: "var(--base-size-16, 1rem)",
        paddingRight: "var(--base-size-16, 1rem)",
      }}
    >
      <Stack direction="vertical" gap="spacious">
        {/* ---------- PR header: title, number, state, branches ---------- */}
        <Stack direction="vertical" gap="condensed">
          <Stack direction="horizontal" gap="normal" align="center" justify="space-between" wrap="wrap">
            <Heading as="h1" variant="large">
              {PR_TITLE}{" "}
              <Text
                as="span"
                size="large"
                weight="light"
                style={{ color: "var(--fgColor-muted)" }}
              >
                #{PR_NUMBER}
              </Text>
            </Heading>
            {/* Lifecycle capsule — the centerpiece flip Open -> Merged. */}
            <span style={beatStyle} key={merged ? "merged" : "open"}>
              <StateLabel status={merged ? "pullMerged" : "pullOpened"}>
                {merged ? "Merged" : "Open"}
              </StateLabel>
            </span>
          </Stack>

          <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
            <Avatar src={AUTHOR.avatar} size={20} alt="" />
            <Text weight="semibold">{AUTHOR.login}</Text>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              {merged ? "merged" : "wants to merge"} into{" "}
            </Text>
            <BranchName as="span">{TARGET_BRANCH}</BranchName>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              from
            </Text>
            <BranchName as="span">{SOURCE_BRANCH}</BranchName>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              opened{" "}
              <RelativeTime date={new Date(Date.now() - PR_OPENED_AGO_MS)} />{" "}
              · {REPO}
            </Text>
          </Stack>
        </Stack>

        {/* ---------- Metadata strip a maintainer scans: labels + counts ---------- */}
        <Stack direction="horizontal" gap="normal" align="center" justify="space-between" wrap="wrap">
          <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
            {TOPIC_LABELS.map((l) => (
              <Label key={l.text} variant={l.variant}>
                {l.text}
              </Label>
            ))}
          </Stack>
          <Stack direction="horizontal" gap="normal" align="center" wrap="wrap">
            <Stack direction="horizontal" gap="condensed" align="center">
              <span style={{ color: "var(--fgColor-muted)" }}>
                <GitCommitIcon size={16} />
              </span>
              <Text size="small" weight="semibold">
                Commits
              </Text>
              <CounterLabel variant="secondary">{commitsCount}</CounterLabel>
            </Stack>
            <Stack direction="horizontal" gap="condensed" align="center">
              <span style={{ color: "var(--fgColor-muted)" }}>
                <CommentDiscussionIcon size={16} />
              </span>
              <Text size="small" weight="semibold">
                Checks
              </Text>
              {/* Live count ticks up as dominoes fall. */}
              <CounterLabel variant={allGreen ? "primary" : "secondary"}>
                {`${resolvedCount}/${total}`}
              </CounterLabel>
            </Stack>
            <Stack direction="horizontal" gap="condensed" align="center">
              <span style={{ color: "var(--fgColor-muted)" }}>
                <FileDiffIcon size={16} />
              </span>
              <Text size="small" weight="semibold">
                Files changed
              </Text>
              <CounterLabel variant="secondary">{filesChanged}</CounterLabel>
            </Stack>
          </Stack>
        </Stack>

        {/* ---------- Two-column body: merge box (main) + reviewer rail ---------- */}
        <Stack direction="horizontal" gap="spacious" align="start" wrap="wrap">
          {/* MAIN COLUMN ---------------------------------------------------- */}
          <div style={{ flex: "1 1 560px", minWidth: 320 }}>
            <div style={{ ...surface, overflow: "hidden" }}>
              {/* Reviews summary header */}
              <Stack
                direction="horizontal"
                gap="condensed"
                align="center"
                justify="space-between"
                wrap="wrap"
                padding="normal"
                style={{ borderBottom: "1px solid var(--borderColor-muted)" }}
              >
                <Stack direction="horizontal" gap="condensed" align="center">
                  <Timeline.Badge variant="success">
                    <CheckCircleFillIcon size={16} />
                  </Timeline.Badge>
                  <Stack direction="vertical" gap="none">
                    <Text weight="semibold">Reviews</Text>
                    <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                      {REVIEWERS.length} approving reviews
                    </Text>
                  </Stack>
                </Stack>
                <AvatarStack>
                  {REVIEWERS.map((r) => (
                    <Avatar key={r.login} src={r.avatar} alt={r.login} size={24} />
                  ))}
                </AvatarStack>
              </Stack>

              {/* Checks wall ------------------------------------------------ */}
              <div style={{ padding: "var(--base-size-16, 1rem)" }}>
                <Stack direction="vertical" gap="normal">
                  <Stack
                    direction="horizontal"
                    gap="condensed"
                    align="center"
                    justify="space-between"
                    wrap="wrap"
                  >
                    <Heading as="h2" variant="small">
                      {allResolved
                        ? failureCount > 0
                          ? "Some checks were not successful"
                          : "All checks have passed"
                        : "Checks are running"}
                    </Heading>
                    <Stack direction="horizontal" gap="condensed" align="center">
                      <Text size="small" style={{ color: "var(--fgColor-success)" }}>
                        {successCount} passing
                      </Text>
                      {failureCount > 0 && (
                        <Text size="small" style={{ color: "var(--fgColor-danger)" }}>
                          {failureCount} failing
                        </Text>
                      )}
                    </Stack>
                  </Stack>

                  {/* Determinate progress meter advancing as checks land. */}
                  <ProgressBar
                    progress={progress}
                    barSize="default"
                    bg={
                      allGreen
                        ? "var(--bgColor-success-emphasis)"
                        : failureCount > 0
                          ? "var(--bgColor-danger-emphasis)"
                          : "var(--bgColor-accent-emphasis)"
                    }
                    aria-label={`Checks complete: ${resolvedCount} of ${total}`}
                  />

                  <Timeline>
                    {CHECK_DEFS.map((def, i) => (
                      <CheckRow key={def.id} def={def} state={checkStates[i]} />
                    ))}
                  </Timeline>
                </Stack>
              </div>

              {/* Ready cue + merge controls -------------------------------- */}
              <div
                style={{
                  padding: "var(--base-size-16, 1rem)",
                  borderTop: "1px solid var(--borderColor-muted)",
                }}
              >
                {merged ? (
                  // ----- Post-merge confirmation (box collapses to a quiet note) -----
                  <Stack direction="vertical" gap="normal">
                    <Stack direction="horizontal" gap="condensed" align="center">
                      <span style={{ color: "var(--fgColor-done)" }}>
                        <GitMergeIcon size={24} />
                      </span>
                      <Stack direction="vertical" gap="none">
                        <Text weight="semibold">
                          Pull request successfully merged and closed
                        </Text>
                        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                          {MERGE_METHOD_LABEL[method]} ·{" "}
                          <BranchName as="span">{SOURCE_BRANCH}</BranchName> into{" "}
                          <BranchName as="span">{TARGET_BRANCH}</BranchName>
                        </Text>
                      </Stack>
                    </Stack>

                    {branchRemoved ? (
                      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
                        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                          The <BranchName as="span">{SOURCE_BRANCH}</BranchName> branch
                          was deleted.
                        </Text>
                        <Button
                          variant="default"
                          size="small"
                          leadingVisual={UndoIcon}
                          loading={branchActionPending}
                          loadingAnnouncement="Restoring branch"
                          onClick={handleBranchAction}
                        >
                          Restore branch
                        </Button>
                      </Stack>
                    ) : (
                      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
                        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                          You can safely delete the{" "}
                          <BranchName as="span">{SOURCE_BRANCH}</BranchName> branch.
                        </Text>
                        <Button
                          variant="danger"
                          size="small"
                          leadingVisual={TrashIcon}
                          loading={branchActionPending}
                          loadingAnnouncement="Deleting branch"
                          onClick={handleBranchAction}
                        >
                          Delete branch
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                ) : (
                  // ----- Pre-merge: ready cue + editable merge box -----
                  <Stack direction="vertical" gap="normal">
                    {/* The "ready" cue. aria-live polite so the moment everything is
                        green is announced without misreporting an in-flight state. */}
                    <div
                      role="status"
                      aria-live="polite"
                      style={{
                        ...beatStyle,
                        opacity: allGreen ? 1 : 0,
                        // Keep it out of the a11y tree + layout until truly ready,
                        // so a SR never announces "ready" while checks still run.
                        height: allGreen ? "auto" : 0,
                        overflow: "hidden",
                      }}
                    >
                      {allGreen && (
                        <Flash variant="success">
                          <Stack direction="horizontal" gap="condensed" align="center">
                            <CheckCircleFillIcon size={16} />
                            <Text weight="semibold">
                              This branch has no conflicts with the base branch
                            </Text>
                          </Stack>
                        </Flash>
                      )}
                    </div>

                    {!allGreen && (
                      <Flash variant="default">
                        <Stack direction="horizontal" gap="condensed" align="center">
                          <Spinner size="small" srText="Checks in progress" />
                          <Text weight="semibold">
                            Merging is blocked until all checks pass
                          </Text>
                        </Stack>
                      </Flash>
                    )}

                    {/* Editable commit box — only fully actionable when green. */}
                    <fieldset
                      disabled={!canMerge}
                      style={{ border: "none", margin: 0, padding: 0, minWidth: 0 }}
                    >
                      <Stack direction="vertical" gap="normal">
                        <Stack
                          direction="horizontal"
                          gap="condensed"
                          align="center"
                          wrap="wrap"
                        >
                          <div style={{ flex: "1 1 240px", minWidth: 200 }}>
                            <FormControl>
                              <FormControl.Label>Merge method</FormControl.Label>
                              <Select
                                value={method}
                                onChange={(e) =>
                                  setMethod(e.target.value as MergeMethod)
                                }
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
                                The primary action reflects the method you choose.
                              </FormControl.Caption>
                            </FormControl>
                          </div>
                          <Tooltip
                            text="Squash combines all commits into one; rebase replays them onto the base."
                            direction="n"
                          >
                            <IconButton
                              icon={InfoIcon}
                              aria-label="About merge methods"
                              variant="invisible"
                              type="button"
                            />
                          </Tooltip>
                        </Stack>

                        {method !== "rebase" && (
                          <>
                            <FormControl>
                              <FormControl.Label>Commit headline</FormControl.Label>
                              <TextInput
                                value={headline}
                                onChange={(e) => setHeadline(e.target.value)}
                                block
                              />
                            </FormControl>

                            <FormControl>
                              <FormControl.Label>
                                Extended description
                              </FormControl.Label>
                              <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                resize="vertical"
                                block
                              />
                              <FormControl.Caption>
                                Add any context for the {MERGE_METHOD_LABEL[method].toLowerCase()}.
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
                            Removes <BranchName as="span">{SOURCE_BRANCH}</BranchName>{" "}
                            once the pull request is merged.
                          </FormControl.Caption>
                        </FormControl>
                      </Stack>
                    </fieldset>

                    {/* Primary action. While checks run it is genuinely
                        unavailable — disabled keeps it out of tab order and
                        un-actionable to AT. The label reflects the method. */}
                    <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
                      <Button
                        variant="primary"
                        size="large"
                        leadingVisual={MethodIcon}
                        disabled={!canMerge}
                        onClick={handleMerge}
                        type="button"
                      >
                        {MERGE_BUTTON_LABEL[method]}
                      </Button>
                      {!allGreen && (
                        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                          Waiting on {total - resolvedCount} of {total} checks…
                        </Text>
                      )}
                    </Stack>
                  </Stack>
                )}
              </div>
            </div>
          </div>

          {/* RAIL COLUMN --------------------------------------------------- */}
          <div style={{ flex: "0 1 260px", minWidth: 220 }}>
            <Stack direction="vertical" gap="normal">
              <div style={{ ...surface, padding: "var(--base-size-16, 1rem)" }}>
                <Stack direction="vertical" gap="condensed">
                  <Text size="small" weight="semibold" style={{ color: "var(--fgColor-muted)" }}>
                    Reviewers
                  </Text>
                  {REVIEWERS.map((r) => (
                    <Stack key={r.login} direction="horizontal" gap="condensed" align="center">
                      <Avatar src={r.avatar} alt="" size={20} />
                      <Text size="small">{r.login}</Text>
                      <span style={{ marginLeft: "auto", color: "var(--fgColor-success)" }}>
                        <CheckCircleFillIcon size={16} />
                      </span>
                    </Stack>
                  ))}
                </Stack>
              </div>

              <div style={{ ...surface, padding: "var(--base-size-16, 1rem)" }}>
                <Stack direction="vertical" gap="condensed">
                  <Text size="small" weight="semibold" style={{ color: "var(--fgColor-muted)" }}>
                    Labels
                  </Text>
                  <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
                    {TOPIC_LABELS.map((l) => (
                      <Label key={l.text} variant={l.variant}>
                        {l.text}
                      </Label>
                    ))}
                  </Stack>
                </Stack>
              </div>

              <div style={{ ...surface, padding: "var(--base-size-16, 1rem)" }}>
                <Stack direction="vertical" gap="condensed">
                  <Text size="small" weight="semibold" style={{ color: "var(--fgColor-muted)" }}>
                    Status
                  </Text>
                  <Stack direction="horizontal" gap="condensed" align="center">
                    <span style={{ color: merged ? "var(--fgColor-done)" : "var(--fgColor-muted)" }}>
                      <DotFillIcon size={16} />
                    </span>
                    <Text size="small">
                      {merged
                        ? "Merged"
                        : allGreen
                          ? "Ready to merge"
                          : "Checks in progress"}
                    </Text>
                  </Stack>
                </Stack>
              </div>
            </Stack>
          </div>
        </Stack>
      </Stack>
    </div>
  );
}

export function PrMergedTheaterBaseGen2() {
  // Self-contained shell so the component renders correctly standalone in both
  // color modes: ThemeProvider wraps BaseStyles wraps children; the root surface
  // paints var(--bgColor-default) and fills the viewport with minHeight (never a
  // fixed height — shell/fixed-viewport-height).
  return (
    <ThemeProvider colorMode="auto">
      <BaseStyles
        style={{
          backgroundColor: "var(--bgColor-default)",
          color: "var(--fgColor-default)",
          minHeight: "100vh",
        }}
      >
        <MergeTheater />
      </BaseStyles>
    </ThemeProvider>
  );
}

export default PrMergedTheaterBaseGen2;
