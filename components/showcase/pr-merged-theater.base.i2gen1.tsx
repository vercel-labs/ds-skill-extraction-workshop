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
  ProgressBar,
  RelativeTime,
  Select,
  Spinner,
  StateLabel,
  Stack,
  Text,
  Textarea,
  TextInput,
  Timeline,
} from "@primer/react";
import {
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
  PersonIcon,
  TrashIcon,
} from "@primer/octicons-react";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 * Invented data — fictional repo, branches, labels, checks, authors.  *
 * ------------------------------------------------------------------ */

const PR_NUMBER = 4827;
const PR_TITLE = "Stream merge-queue events over the websocket gateway";
const SOURCE_BRANCH = "fenwick/merge-queue-stream";
const TARGET_BRANCH = "trunk";
const PR_OPENED_AT = "2026-06-13T09:14:00Z";
const COMMIT_COUNT = 11;
const FILES_CHANGED = 23;

const TOPIC_LABELS: { name: string; variant: React.ComponentProps<typeof Label>["variant"] }[] = [
  { name: "gateway", variant: "accent" },
  { name: "realtime", variant: "done" },
  { name: "needs-deploy", variant: "attention" },
];

type CheckState = "pending" | "running" | "success";

interface Check {
  id: string;
  name: string;
  context: string;
  /** ms after mount when this check flips to success */
  resolveAt: number;
}

// Spread the resolutions across ~6 seconds so the room watches the dominoes fall.
const CHECKS: Check[] = [
  { id: "lint", name: "lint / eslint", context: "style", resolveAt: 900 },
  { id: "types", name: "build / typecheck", context: "compile", resolveAt: 1900 },
  { id: "unit", name: "test / unit", context: "node 20", resolveAt: 2900 },
  { id: "integration", name: "test / integration", context: "gateway", resolveAt: 4200 },
  { id: "e2e", name: "test / e2e", context: "playwright", resolveAt: 5300 },
  { id: "deploy", name: "deploy / preview", context: "vercel", resolveAt: 6100 },
];

type MergeMethod = "merge" | "squash" | "rebase";

const MERGE_METHOD_LABEL: Record<MergeMethod, string> = {
  merge: "Create a merge commit",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};

/* ------------------------------------------------------------------ *
 * Phase state machine.                                                *
 * ------------------------------------------------------------------ */

type Phase = "checks" | "ready" | "merged";

interface MachineState {
  phase: Phase;
  resolved: string[]; // ids of checks that have gone green, in arrival order
  branchWasDeleted: boolean; // honored choice captured at merge time
  branchRestored: boolean;
}

type Action =
  | { type: "RESOLVE_CHECK"; id: string }
  | { type: "ALL_GREEN" }
  | { type: "MERGE"; deleteBranch: boolean }
  | { type: "RESTORE_BRANCH" }
  | { type: "DELETE_BRANCH" };

function reducer(state: MachineState, action: Action): MachineState {
  switch (action.type) {
    case "RESOLVE_CHECK":
      if (state.resolved.includes(action.id)) return state;
      return { ...state, resolved: [...state.resolved, action.id] };
    case "ALL_GREEN":
      return state.phase === "checks" ? { ...state, phase: "ready" } : state;
    case "MERGE":
      return { ...state, phase: "merged", branchWasDeleted: action.deleteBranch };
    case "RESTORE_BRANCH":
      return { ...state, branchRestored: true };
    case "DELETE_BRANCH":
      return { ...state, branchWasDeleted: true };
    default:
      return state;
  }
}

const INITIAL: MachineState = {
  phase: "checks",
  resolved: [],
  branchWasDeleted: false,
  branchRestored: false,
};

/* ------------------------------------------------------------------ *
 * Reduced-motion hook — drives whether transitions are applied.       *
 * ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ *
 * Small presentational helpers.                                       *
 * ------------------------------------------------------------------ */

function MetaCount({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <Stack direction="horizontal" gap="condensed" align="center">
      <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>{icon}</span>
      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
        {label}
      </Text>
      <CounterLabel variant="primary">{count}</CounterLabel>
    </Stack>
  );
}

function CheckRow({
  check,
  state,
  reducedMotion,
}: {
  check: Check;
  state: CheckState;
  reducedMotion: boolean;
}) {
  // The transition is the "beat" each check lands with. Gated by reduced-motion.
  const landTransition = reducedMotion
    ? undefined
    : "background-color var(--motion-transition-stateChange), opacity var(--motion-transition-enter)";

  const { glyph, color, statusText } = useMemo(() => {
    switch (state) {
      case "success":
        return {
          glyph: <CheckCircleFillIcon size={16} aria-hidden />,
          color: "var(--fgColor-success)",
          statusText: "Successful",
        };
      case "running":
        return {
          glyph: <Spinner size="small" srText={null} />,
          color: "var(--fgColor-muted)",
          statusText: "In progress",
        };
      default:
        return {
          glyph: <ClockIcon size={16} aria-hidden />,
          color: "var(--fgColor-muted)",
          statusText: "Queued",
        };
    }
  }, [state]);

  return (
    <Stack
      direction="horizontal"
      gap="condensed"
      align="center"
      justify="space-between"
      style={{
        paddingBlock: "var(--base-size-8)",
        paddingInline: "var(--base-size-12)",
        borderTop: "var(--borderWidth-thin) solid var(--borderColor-muted)",
        transition: landTransition,
      }}
    >
      <Stack direction="horizontal" gap="condensed" align="center">
        <span style={{ color, display: "inline-flex", minWidth: "var(--base-size-16)" }}>
          {glyph}
        </span>
        <Stack direction="vertical" gap="none">
          <Text size="small" weight="semibold">
            {check.name}
          </Text>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            {check.context}
          </Text>
        </Stack>
      </Stack>
      {/* The textual status is what a screen reader announces — never color alone. */}
      <Text size="small" style={{ color }}>
        {statusText}
      </Text>
    </Stack>
  );
}

/* ------------------------------------------------------------------ *
 * Main component.                                                     *
 * ------------------------------------------------------------------ */

export function PrMergedTheaterBaseI2Gen1() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const reducedMotion = usePrefersReducedMotion();

  // Editable merge box.
  const [mergeMethod, setMergeMethod] = useState<MergeMethod>("squash");
  const [headline, setHeadline] = useState(
    `${PR_TITLE} (#${PR_NUMBER})`,
  );
  const [description, setDescription] = useState(
    "Pipes merge-queue lifecycle events into the gateway fan-out so dashboards update without polling.",
  );
  const [deleteBranch, setDeleteBranch] = useState(true);

  // Drive the simulated check progression with timers.
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    CHECKS.forEach((check) => {
      timers.current.push(
        setTimeout(() => dispatch({ type: "RESOLVE_CHECK", id: check.id }), check.resolveAt),
      );
    });
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  // When every check is green, open the merge box.
  useEffect(() => {
    if (state.resolved.length === CHECKS.length && state.phase === "checks") {
      dispatch({ type: "ALL_GREEN" });
    }
  }, [state.resolved.length, state.phase]);

  const checkState = useCallback(
    (check: Check, index: number): CheckState => {
      if (state.resolved.includes(check.id)) return "success";
      // The earliest unresolved check is actively running; the rest are queued.
      const firstUnresolved = CHECKS.findIndex((c) => !state.resolved.includes(c.id));
      return index === firstUnresolved ? "running" : "pending";
    },
    [state.resolved],
  );

  const passedCount = state.resolved.length;
  const totalCount = CHECKS.length;
  const progressPercent = Math.round((passedCount / totalCount) * 100);
  const allGreen = passedCount === totalCount;
  const merged = state.phase === "merged";

  const capsuleTransition = reducedMotion
    ? undefined
    : "all var(--motion-transition-stateChange)";

  const handleMerge = useCallback(() => {
    dispatch({ type: "MERGE", deleteBranch });
  }, [deleteBranch]);

  return (
    <Stack
      direction="vertical"
      gap="normal"
      style={{
        maxWidth: "920px",
        marginInline: "auto",
        paddingInline: "var(--base-size-16)",
        paddingBlock: "var(--base-size-32)",
      }}
    >
      {/* ---- PR header: title, number, state capsule, branches ---- */}
      <Stack direction="vertical" gap="condensed">
        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          <span
            style={{
              display: "inline-flex",
              transition: capsuleTransition,
            }}
          >
            {merged ? (
              <StateLabel status="pullMerged">Merged</StateLabel>
            ) : (
              <StateLabel status="pullOpened">Open</StateLabel>
            )}
          </span>
          <Heading as="h1" variant="medium" style={{ margin: 0 }}>
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
        </Stack>

        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            <PersonIcon size={16} aria-hidden /> fenwick
          </Text>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            opened this pull request{" "}
            <RelativeTime datetime={PR_OPENED_AT} tense="past">
              {new Date(PR_OPENED_AT).toLocaleDateString()}
            </RelativeTime>
          </Text>
          <Stack direction="horizontal" gap="none" align="center">
            <BranchName as="span">{SOURCE_BRANCH}</BranchName>
            <span style={{ color: "var(--fgColor-muted)", padding: "0 var(--base-size-4)" }}>
              <GitBranchIcon size={16} aria-hidden />
            </span>
            <BranchName as="span">{TARGET_BRANCH}</BranchName>
          </Stack>
        </Stack>
      </Stack>

      {/* ---- Metadata a maintainer scans: topic labels + running counts ---- */}
      <Stack direction="horizontal" gap="normal" align="center" wrap="wrap">
        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          {TOPIC_LABELS.map((t) => (
            <Label key={t.name} variant={t.variant}>
              {t.name}
            </Label>
          ))}
        </Stack>
        <Stack direction="horizontal" gap="normal" align="center" wrap="wrap">
          <MetaCount
            icon={<GitCommitIcon size={16} aria-hidden />}
            label="Commits"
            count={COMMIT_COUNT}
          />
          <MetaCount
            icon={<CheckIcon size={16} aria-hidden />}
            label="Checks passing"
            count={passedCount}
          />
          <MetaCount
            icon={<FileDiffIcon size={16} aria-hidden />}
            label="Files changed"
            count={FILES_CHANGED}
          />
        </Stack>
      </Stack>

      {/* ---- The merge box ---- */}
      <Stack
        as="section"
        direction="vertical"
        gap="none"
        aria-label="Merge pull request"
        style={{
          border: "var(--borderWidth-thin) solid var(--borderColor-default)",
          borderRadius: "var(--borderRadius-medium)",
          overflow: "hidden",
          backgroundColor: "var(--bgColor-default)",
        }}
      >
        {/* Reviews row */}
        <Stack
          direction="horizontal"
          gap="condensed"
          align="center"
          style={{
            paddingBlock: "var(--base-size-12)",
            paddingInline: "var(--base-size-16)",
            backgroundColor: "var(--bgColor-muted)",
          }}
        >
          <span style={{ color: "var(--fgColor-success)", display: "inline-flex" }}>
            <CheckCircleFillIcon size={16} aria-hidden />
          </span>
          <Stack direction="vertical" gap="none">
            <Text size="small" weight="semibold">
              2 approving reviews
            </Text>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              <EyeIcon size={16} aria-hidden /> @okonkwo and @riedel approved these changes
            </Text>
          </Stack>
        </Stack>

        {/* CI checks — the wall, with the dominoes */}
        <Stack
          direction="vertical"
          gap="none"
          style={{
            paddingBlock: "var(--base-size-12)",
            paddingInline: "var(--base-size-16)",
          }}
        >
          <Stack
            direction="horizontal"
            gap="condensed"
            align="center"
            justify="space-between"
            wrap="wrap"
            style={{ marginBottom: "var(--base-size-8)" }}
          >
            <Stack direction="horizontal" gap="condensed" align="center">
              {allGreen ? (
                <span style={{ color: "var(--fgColor-success)", display: "inline-flex" }}>
                  <CheckCircleFillIcon size={16} aria-hidden />
                </span>
              ) : (
                <Spinner size="small" srText={null} />
              )}
              <Text size="small" weight="semibold">
                {allGreen ? "All checks have passed" : "Some checks haven’t completed yet"}
              </Text>
            </Stack>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              {passedCount} of {totalCount} successful
            </Text>
          </Stack>

          {/* Progress meter advances as checks land. Live announced politely. */}
          <span role="status" aria-live="polite" aria-atomic="true">
            <span
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                overflow: "hidden",
                clip: "rect(0 0 0 0)",
                whiteSpace: "nowrap",
              }}
            >
              {allGreen
                ? "All checks passed. Pull request is ready to merge."
                : `${passedCount} of ${totalCount} checks passing.`}
            </span>
            <ProgressBar
              progress={progressPercent}
              bg={allGreen ? "success.emphasis" : "accent.emphasis"}
              animated={!reducedMotion && !allGreen}
              aria-label={`Checks progress: ${passedCount} of ${totalCount} passing`}
              aria-valuetext={`${passedCount} of ${totalCount} checks passing`}
            />
          </span>

          <div
            style={{
              marginTop: "var(--base-size-8)",
              border: "var(--borderWidth-thin) solid var(--borderColor-muted)",
              borderRadius: "var(--borderRadius-medium)",
              overflow: "hidden",
            }}
          >
            {CHECKS.map((check, i) => (
              <CheckRow
                key={check.id}
                check={check}
                state={checkState(check, i)}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>
        </Stack>

        {/* The "ready" cue + the merge controls */}
        <Stack
          direction="vertical"
          gap="normal"
          style={{
            paddingBlock: "var(--base-size-16)",
            paddingInline: "var(--base-size-16)",
            borderTop: "var(--borderWidth-thin) solid var(--borderColor-default)",
          }}
        >
          {merged ? (
            /* ---- Merged confirmation ---- */
            <MergedConfirmation
              state={state}
              mergeMethod={mergeMethod}
              onRestore={() => dispatch({ type: "RESTORE_BRANCH" })}
              onDelete={() => dispatch({ type: "DELETE_BRANCH" })}
            />
          ) : allGreen ? (
            /* ---- Ready: full editable merge box ---- */
            <Stack direction="vertical" gap="normal">
              <Flash variant="success">
                <Stack direction="horizontal" gap="condensed" align="center">
                  <GitMergeIcon size={16} aria-hidden />
                  <Text weight="semibold">
                    This branch has no conflicts with the base branch. Merging is ready.
                  </Text>
                </Stack>
              </Flash>

              <FormControl>
                <FormControl.Label>Merge method</FormControl.Label>
                <Select
                  value={mergeMethod}
                  onChange={(e) => setMergeMethod(e.target.value as MergeMethod)}
                  block
                >
                  <Select.Option value="merge">Create a merge commit</Select.Option>
                  <Select.Option value="squash">Squash and merge</Select.Option>
                  <Select.Option value="rebase">Rebase and merge</Select.Option>
                </Select>
                <FormControl.Caption>
                  {mergeMethod === "merge"
                    ? "All commits from this branch will be added to the base branch via a merge commit."
                    : mergeMethod === "squash"
                      ? "The 11 commits will be combined into one commit on the base branch."
                      : "The 11 commits will be rebased and added to the base branch."}
                </FormControl.Caption>
              </FormControl>

              {/* Headline + extended description only apply to commit-creating methods */}
              {mergeMethod !== "rebase" && (
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
                    <FormControl.Label>Extended description</FormControl.Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      resize="vertical"
                      block
                    />
                    <FormControl.Caption>
                      Add more detail to the {MERGE_METHOD_LABEL[mergeMethod].toLowerCase()} commit.
                    </FormControl.Caption>
                  </FormControl>
                </>
              )}

              <FormControl>
                <Checkbox
                  checked={deleteBranch}
                  onChange={(e) => setDeleteBranch(e.target.checked)}
                />
                <FormControl.Label>Delete branch after merge</FormControl.Label>
                <FormControl.Caption>
                  Removes <BranchName as="span">{SOURCE_BRANCH}</BranchName> once the merge completes.
                </FormControl.Caption>
              </FormControl>

              <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
                <Button
                  variant="primary"
                  leadingVisual={GitMergeIcon}
                  onClick={handleMerge}
                >
                  {MERGE_METHOD_LABEL[mergeMethod]}
                </Button>
                <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                  You can also merge from the command line.
                </Text>
              </Stack>
            </Stack>
          ) : (
            /* ---- Checks still running: merge genuinely unavailable ---- *
             * No interactive merge control is rendered, so a keyboard user
             * cannot reach it and a screen reader is not told it is actionable. */
            <Stack direction="horizontal" gap="condensed" align="center">
              <span style={{ color: "var(--fgColor-attention)", display: "inline-flex" }}>
                <DotFillIcon size={16} aria-hidden />
              </span>
              <Stack direction="vertical" gap="none">
                <Text weight="semibold">Merging is blocked</Text>
                <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                  Required status checks must pass before merging.
                </Text>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>

      {/* ---- Activity timeline below the box ---- */}
      <Stack as="section" direction="vertical" gap="condensed" aria-label="Pull request activity">
        <Heading as="h2" variant="small">
          Activity
        </Heading>
        <Timeline clipSidebar>
          <Timeline.Item>
            <Timeline.Badge>
              <GitCommitIcon aria-hidden />
            </Timeline.Badge>
            <Timeline.Body>
              <Text size="small">
                fenwick pushed {COMMIT_COUNT} commits{" "}
                <RelativeTime datetime={PR_OPENED_AT} tense="past">
                  {new Date(PR_OPENED_AT).toLocaleDateString()}
                </RelativeTime>
              </Text>
            </Timeline.Body>
          </Timeline.Item>
          <Timeline.Item>
            <Timeline.Badge variant="accent">
              <CommentDiscussionIcon aria-hidden />
            </Timeline.Badge>
            <Timeline.Body>
              <Text size="small">@okonkwo and @riedel approved these changes</Text>
            </Timeline.Body>
          </Timeline.Item>
          {allGreen && !merged && (
            <Timeline.Item>
              <Timeline.Badge variant="success">
                <CheckIcon aria-hidden />
              </Timeline.Badge>
              <Timeline.Body>
                <Text size="small">All required checks passed</Text>
              </Timeline.Body>
            </Timeline.Item>
          )}
          {merged && (
            <>
              <Timeline.Break />
              <Timeline.Item>
                <Timeline.Badge variant="done">
                  <GitMergeIcon aria-hidden />
                </Timeline.Badge>
                <Timeline.Body>
                  <Text size="small">
                    fenwick merged commit into <BranchName as="span">{TARGET_BRANCH}</BranchName>
                  </Text>
                </Timeline.Body>
              </Timeline.Item>
            </>
          )}
        </Timeline>
      </Stack>
    </Stack>
  );
}

/* ------------------------------------------------------------------ *
 * Merged confirmation — collapses the box, honors the branch choice.  *
 * ------------------------------------------------------------------ */

function MergedConfirmation({
  state,
  mergeMethod,
  onRestore,
  onDelete,
}: {
  state: MachineState;
  mergeMethod: MergeMethod;
  onRestore: () => void;
  onDelete: () => void;
}) {
  return (
    <Stack direction="vertical" gap="normal">
      <Stack direction="horizontal" gap="condensed" align="center">
        <span style={{ color: "var(--fgColor-done)", display: "inline-flex" }}>
          <GitMergeIcon size={16} aria-hidden />
        </span>
        <Stack direction="vertical" gap="none">
          <Text weight="semibold">
            Pull request successfully {mergeMethod === "rebase" ? "rebased and merged" : "merged"}
          </Text>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            <GitPullRequestIcon size={16} aria-hidden /> #{PR_NUMBER} is now part of{" "}
            <BranchName as="span">{TARGET_BRANCH}</BranchName>.
          </Text>
        </Stack>
      </Stack>

      {/* Honor the branch choice captured at merge time. */}
      {state.branchWasDeleted ? (
        state.branchRestored ? (
          <Flash variant="default">
            <Stack direction="horizontal" gap="condensed" align="center">
              <GitBranchIcon size={16} aria-hidden />
              <Text>
                Branch <BranchName as="span">{SOURCE_BRANCH}</BranchName> was restored.
              </Text>
            </Stack>
          </Flash>
        ) : (
          <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              The <BranchName as="span">{SOURCE_BRANCH}</BranchName> branch was deleted.
            </Text>
            <Button leadingVisual={GitBranchIcon} onClick={onRestore}>
              Restore branch
            </Button>
          </Stack>
        )
      ) : (
        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            The <BranchName as="span">{SOURCE_BRANCH}</BranchName> branch can now be removed.
          </Text>
          <Button variant="danger" leadingVisual={TrashIcon} onClick={onDelete}>
            Delete branch
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
