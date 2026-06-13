"use client";

// Encore of the merged-PR theater, staged on a dense, alive merge box.
// Choreography: dense PR header → reviewers strip → live CI wall that resolves
// one-by-one (token-timed) with a progress bar and ticking counts → a "ready"
// banner that unlocks a full, editable merge box → the Open→Merged flip and a
// branch-aware confirmation. Drama from state/color/density/timing, no invented
// effects. All durations/easings read from Primer motion tokens at runtime.

// Self-contained shell: the consumer app/layout.tsx is bare (no ThemeProvider,
// no primitives CSS), and the task forbids editing it — so this component imports
// the primitives CSS and mounts its own ThemeProvider + BaseStyles. ThemeProvider
// colorMode="auto" renders its own wrapper carrying the data-color-mode /
// data-light-theme / data-dark-theme trio, and BOTH light.css and dark.css are
// imported below, so both modes paint from the system preference.

import "@primer/primitives/dist/css/base/size/size.css";
import "@primer/primitives/dist/css/base/typography/typography.css";
import "@primer/primitives/dist/css/base/motion/motion.css";
import "@primer/primitives/dist/css/functional/motion/motion.css";
import "@primer/primitives/dist/css/functional/size/border.css";
import "@primer/primitives/dist/css/functional/size/radius.css";
import "@primer/primitives/dist/css/functional/size/size.css";
import "@primer/primitives/dist/css/functional/spacing/space.css";
import "@primer/primitives/dist/css/functional/typography/typography.css";
import "@primer/primitives/dist/css/functional/themes/light.css";
import "@primer/primitives/dist/css/functional/themes/dark.css";

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
  ProgressBar, // HARVEST: ProgressBar — slate has no progress/percentage indicator; the prompt's "progress indicator advances" beat cannot be expressed by CounterLabel/Text.
  RelativeTime, // HARVEST: RelativeTime — slate has no relative-timestamp element; the prompt's "opened … ago" live stamp needs the auto-updating <relative-time>.
  Select,
  Spinner, // HARVEST: Spinner — slate has no busy/loading indicator for a non-button row; each still-running check needs a determinate-looking spinner the slate cannot draw.
  Stack,
  StateLabel,
  Text,
  Textarea,
  TextInput,
  ThemeProvider,
  Timeline, // HARVEST: Timeline — slate has no event/activity timeline; the per-check "dominoes" rail with lifecycle-keyed badges is exactly Timeline's job and faking it with divs is forbidden.
} from "@primer/react";
import {
  CheckCircleFillIcon,
  ClockIcon,
  CommentDiscussionIcon,
  DotFillIcon,
  EyeIcon,
  FileDiffIcon,
  FoldIcon,
  GitBranchIcon,
  GitCommitIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  HistoryIcon,
  TrashIcon,
  UndoIcon,
  XCircleFillIcon,
  type Icon,
} from "@primer/octicons-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ---- Invented data (fictional repo, branches, labels, checks, reviewers) ----

const REPO = "lumen/aurora-edge";
const PR_NUMBER = 248;
const PR_TITLE = "Stream tile pre-warming into the edge cache layer";
const SOURCE_BRANCH = "feat/edge-prewarm";
const TARGET_BRANCH = "main";
const TOPICS = ["caching", "performance", "edge-runtime"] as const;
const COMMIT_COUNT = 7;
const FILES_CHANGED = 19;

type ReviewState = "approved" | "commented";
const REVIEWERS: { handle: string; state: ReviewState }[] = [
  { handle: "marlowe-q", state: "approved" },
  { handle: "ines.vega", state: "approved" },
  { handle: "tobias-ahn", state: "commented" },
];

type CheckOutcome = "pass" | "fail";
type CheckStatus = "running" | "pass" | "fail";
type CheckDef = { id: string; name: string; context: string; outcome: CheckOutcome };

// Every check passes — this is the satisfying-flip encore, not a red wall.
// The last two are the ones the room watches "go green".
const CHECKS: CheckDef[] = [
  { id: "lint", name: "lint / eslint", context: "Style and import rules", outcome: "pass" },
  { id: "unit", name: "test / unit", context: "1,204 specs", outcome: "pass" },
  { id: "types", name: "build / typecheck", context: "tsc --noEmit", outcome: "pass" },
  { id: "e2e", name: "test / e2e", context: "Playbook smoke", outcome: "pass" },
  { id: "bundle", name: "size / bundle", context: "diff vs main", outcome: "pass" },
  { id: "deploy", name: "deploy / preview", context: "edge preview", outcome: "pass" },
];

type MergeMethod = "merge" | "squash" | "rebase";
const METHOD_LABEL: Record<MergeMethod, string> = {
  merge: "Create a merge commit",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};
const METHOD_ICON: Record<MergeMethod, Icon> = {
  merge: GitMergeIcon,
  squash: FoldIcon,
  rebase: HistoryIcon,
};
const METHOD_VERB: Record<MergeMethod, string> = {
  merge: "Merge pull request",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};

type Phase = "running" | "ready" | "merged";

// Read a duration token (e.g. "--motion-duration-medium") in ms from the live
// theme so the JS choreography is token-driven, never a hand-picked number.
function readDurationMs(varName: string, fallbackMs: number): number {
  if (typeof window === "undefined") return fallbackMs;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  if (!raw) return fallbackMs;
  if (raw.endsWith("ms")) return parseFloat(raw);
  if (raw.endsWith("s")) return parseFloat(raw) * 1000;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallbackMs;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Token-painted surface used for the card and the inset merge box.
function surfaceStyle(inset = false): React.CSSProperties {
  return {
    backgroundColor: inset ? "var(--bgColor-muted)" : "var(--bgColor-default)",
    border: "1px solid var(--borderColor-default)",
    borderRadius: "var(--borderRadius-large, 12px)",
    boxShadow: inset ? undefined : "var(--shadow-resting-medium)",
    padding: "var(--base-size-24, 1.5rem)",
  };
}

export function PrMergedTheaterEncoreGen2() {
  const [statuses, setStatuses] = useState<Record<string, CheckStatus>>(
    () => Object.fromEntries(CHECKS.map((c) => [c.id, "running" as CheckStatus])),
  );
  const [phase, setPhase] = useState<Phase>("running");
  // The branch choice is captured BEFORE merge so the confirmation can honor it.
  const [deleteBranch, setDeleteBranch] = useState(true);
  const [method, setMethod] = useState<MergeMethod>("squash");
  const [headline, setHeadline] = useState(
    `${PR_TITLE} (#${PR_NUMBER})`,
  );
  const [description, setDescription] = useState(
    "Pre-warms hot tiles into the edge cache on deploy so the first request in each region is a cache hit.",
  );
  const [committedDelete, setCommittedDelete] = useState(true);
  const [branchRestored, setBranchRestored] = useState(false);
  const [branchDeleted, setBranchDeleted] = useState(false);

  const openedAt = useMemo(
    // Stable fictional "opened" instant ~3h before mount, for RelativeTime.
    () => new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    [],
  );

  const passedCount = CHECKS.filter((c) => statuses[c.id] === "pass").length;
  const resolvedCount = CHECKS.filter((c) => statuses[c.id] !== "running").length;
  const allResolved = resolvedCount === CHECKS.length;
  const progress = Math.round((resolvedCount / CHECKS.length) * 100);

  // ---- The dominoes: resolve checks one-by-one on a token-timed cadence. ----
  useEffect(() => {
    const reduce = prefersReducedMotion();
    const step = readDurationMs("--motion-duration-long", 500) * 2; // ~1s/check → ~6s total
    const timers: ReturnType<typeof setTimeout>[] = [];

    const resolveAt = (index: number, delay: number) => {
      timers.push(
        setTimeout(() => {
          setStatuses((prev) => ({
            ...prev,
            [CHECKS[index].id]:
              CHECKS[index].outcome === "fail" ? "fail" : "pass",
          }));
        }, delay),
      );
    };

    if (reduce) {
      // Reduced motion: resolve immediately, no staged beats.
      setStatuses(
        Object.fromEntries(
          CHECKS.map((c) => [c.id, c.outcome === "fail" ? "fail" : "pass"]),
        ) as Record<string, CheckStatus>,
      );
    } else {
      CHECKS.forEach((_, i) => resolveAt(i, step * (i + 1)));
    }

    return () => timers.forEach(clearTimeout);
  }, []);

  // When the last check lands, surface the "ready" cue and open the merge box.
  useEffect(() => {
    if (allResolved && phase === "running") setPhase("ready");
  }, [allResolved, phase]);

  const canMerge = phase === "ready";

  const handleMerge = useCallback(() => {
    if (!canMerge) return;
    setCommittedDelete(deleteBranch);
    if (deleteBranch) setBranchDeleted(true);
    setPhase("merged");
  }, [canMerge, deleteBranch]);

  const handleRestore = useCallback(() => {
    setBranchRestored(true);
    setBranchDeleted(false);
  }, []);

  const handleDeleteNow = useCallback(() => {
    setBranchDeleted(true);
  }, []);

  const MethodIcon = METHOD_ICON[method];
  const isMerged = phase === "merged";

  // Token-driven transitions (compositor properties only). Reduced motion is
  // handled by the media query disabling the keyframe/transition payloads.
  const flipTransition =
    "transform var(--motion-transition-stateChange), opacity var(--motion-transition-stateChange)";

  return (
    <ThemeProvider colorMode="auto">
      <BaseStyles
        style={{
          backgroundColor: "var(--bgColor-default)",
          color: "var(--fgColor-default)",
          minHeight: "100vh",
        }}
      >
        <style>{`
          @keyframes prmt-land {
            from { opacity: 0; transform: translateY(var(--base-size-4, 4px)); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes prmt-reveal {
            from { opacity: 0; transform: translateY(calc(-1 * var(--base-size-8, 8px))); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .prmt-land {
            animation: prmt-land var(--motion-duration-short) var(--motion-easing-enter) both;
          }
          .prmt-reveal {
            animation: prmt-reveal var(--motion-duration-medium) var(--motion-easing-enter) both;
          }
          .prmt-flip {
            transition: ${flipTransition};
          }
          @media (prefers-reduced-motion: reduce) {
            .prmt-land, .prmt-reveal { animation: none; }
            .prmt-flip { transition: none; }
          }
        `}</style>

        <Stack
          direction="vertical"
          gap="spacious"
          padding="spacious"
          style={{ maxWidth: 920, margin: "0 auto" }}
        >
          {/* ===== Dense PR header ===== */}
          <Stack direction="vertical" gap="condensed" as="header">
            <Stack
              direction="horizontal"
              gap="normal"
              align="start"
              justify="space-between"
              wrap="wrap"
            >
              <Stack direction="vertical" gap="condensed">
                <Heading as="h1" variant="large">
                  {PR_TITLE}{" "}
                  <Text
                    as="span"
                    weight="light"
                    style={{ color: "var(--fgColor-muted)" }}
                  >
                    #{PR_NUMBER}
                  </Text>
                </Heading>

                <Stack
                  direction="horizontal"
                  gap="condensed"
                  align="center"
                  wrap="wrap"
                >
                  <span
                    className="prmt-flip"
                    style={{
                      display: "inline-flex",
                      transform: isMerged ? "translateY(0)" : "translateY(0)",
                    }}
                    role="status"
                    aria-live="polite"
                  >
                    {isMerged ? (
                      <StateLabel status="pullMerged">Merged</StateLabel>
                    ) : (
                      <StateLabel status="pullOpened">Open</StateLabel>
                    )}
                  </span>

                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    <Text as="span" weight="semibold">
                      @{REVIEWERS[0].handle}
                    </Text>{" "}
                    wants to merge {COMMIT_COUNT} commits into{" "}
                    <BranchName as="span">{TARGET_BRANCH}</BranchName>{" "}
                    from{" "}
                    <BranchName as="span">{SOURCE_BRANCH}</BranchName>
                  </Text>
                </Stack>

                <Stack direction="horizontal" gap="condensed" align="center">
                  <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
                    <ClockIcon size={14} />
                  </span>
                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    {REPO} · opened{" "}
                    <RelativeTime date={new Date(openedAt)} />
                  </Text>
                </Stack>
              </Stack>

              <IconButton
                icon={EyeIcon}
                aria-label="Watch this pull request"
                variant="invisible"
              />
            </Stack>

            {/* Topic labels (metadata) + running counts */}
            <Stack
              direction="horizontal"
              gap="normal"
              align="center"
              wrap="wrap"
              style={{
                paddingTop: "var(--base-size-8, 8px)",
                borderTop: "1px solid var(--borderColor-muted)",
              }}
            >
              <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
                {TOPICS.map((t) => (
                  <Label key={t} variant="accent">
                    {t}
                  </Label>
                ))}
              </Stack>

              <Stack direction="horizontal" gap="normal" align="center" wrap="wrap">
                <CountChip icon={GitCommitIcon} label="Commits">
                  {COMMIT_COUNT}
                </CountChip>
                <CountChip icon={CheckCircleFillIcon} label="Checks passed">
                  {`${passedCount}/${CHECKS.length}`}
                </CountChip>
                <CountChip icon={FileDiffIcon} label="Files changed">
                  {FILES_CHANGED}
                </CountChip>
              </Stack>
            </Stack>
          </Stack>

          {/* ===== Merge box ===== */}
          <Stack direction="vertical" gap="normal" as="section" style={surfaceStyle()}>
            {/* Reviews */}
            <Stack direction="vertical" gap="condensed">
              <Stack direction="horizontal" gap="condensed" align="center">
                <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
                  <CommentDiscussionIcon size={16} />
                </span>
                <Heading as="h2" variant="small">
                  Reviews
                </Heading>
                <CounterLabel variant="primary">{REVIEWERS.length}</CounterLabel>
              </Stack>
              <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
                {REVIEWERS.map((r) => (
                  <Stack
                    key={r.handle}
                    direction="horizontal"
                    gap="condensed"
                    align="center"
                  >
                    <span
                      style={{
                        color:
                          r.state === "approved"
                            ? "var(--fgColor-success)"
                            : "var(--fgColor-muted)",
                        display: "inline-flex",
                      }}
                    >
                      {r.state === "approved" ? (
                        <CheckCircleFillIcon size={16} />
                      ) : (
                        <CommentDiscussionIcon size={16} />
                      )}
                    </span>
                    <Text size="small" weight="semibold">
                      @{r.handle}
                    </Text>
                    <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                      {r.state === "approved" ? "approved" : "commented"}
                    </Text>
                  </Stack>
                ))}
              </Stack>
            </Stack>

            <Divider />

            {/* CI checks: the dominoes */}
            <Stack direction="vertical" gap="condensed">
              <Stack
                direction="horizontal"
                gap="condensed"
                align="center"
                justify="space-between"
                wrap="wrap"
              >
                <Stack direction="horizontal" gap="condensed" align="center">
                  <Heading as="h2" variant="small">
                    {allResolved
                      ? "All checks have passed"
                      : "Checks are running"}
                  </Heading>
                  <CounterLabel variant={allResolved ? "primary" : "secondary"}>
                    {`${resolvedCount}/${CHECKS.length}`}
                  </CounterLabel>
                </Stack>
                <Text
                  size="small"
                  style={{
                    color: "var(--fgColor-muted)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                  aria-hidden="true"
                >
                  {progress}%
                </Text>
              </Stack>

              {/* Token-driven determinate progress; linear easing per DS for loaders */}
              <ProgressBar
                progress={progress}
                aria-label={`${resolvedCount} of ${CHECKS.length} checks complete`}
                barSize="default"
              />

              <Timeline clipSidebar>
                {CHECKS.map((check) => {
                  const status = statuses[check.id];
                  const variant =
                    status === "pass"
                      ? "success"
                      : status === "fail"
                        ? "danger"
                        : "accent";
                  return (
                    <Timeline.Item key={check.id}>
                      <Timeline.Badge variant={variant}>
                        {status === "running" ? (
                          <Spinner size="small" srText={null} />
                        ) : status === "pass" ? (
                          <CheckCircleFillIcon size={16} />
                        ) : (
                          <XCircleFillIcon size={16} />
                        )}
                      </Timeline.Badge>
                      <Timeline.Body>
                        <span
                          className={status !== "running" ? "prmt-land" : undefined}
                          style={{ display: "block" }}
                        >
                          <Stack
                            direction="horizontal"
                            gap="condensed"
                            align="center"
                            justify="space-between"
                            wrap="wrap"
                          >
                            <Stack direction="vertical" gap="none">
                              <Text weight="semibold">{check.name}</Text>
                              <Text
                                size="small"
                                style={{ color: "var(--fgColor-muted)" }}
                              >
                                {check.context}
                              </Text>
                            </Stack>
                            <Text
                              size="small"
                              style={{
                                color:
                                  status === "pass"
                                    ? "var(--fgColor-success)"
                                    : status === "fail"
                                      ? "var(--fgColor-danger)"
                                      : "var(--fgColor-muted)",
                              }}
                            >
                              {status === "running"
                                ? "In progress…"
                                : status === "pass"
                                  ? "Successful"
                                  : "Failed"}
                            </Text>
                          </Stack>
                        </span>
                      </Timeline.Body>
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            </Stack>

            <Divider />

            {/* Ready cue — appears only when everything is green */}
            <div aria-live="polite">
              {phase === "ready" && (
                <div className="prmt-reveal">
                  <Flash variant="success">
                    <Stack direction="horizontal" gap="condensed" align="center">
                      <GitMergeIcon size={16} />
                      <Text weight="semibold">
                        This branch has no conflicts with the base branch.
                      </Text>
                      <Text style={{ color: "var(--fgColor-muted)" }}>
                        Merging can be performed automatically.
                      </Text>
                    </Stack>
                  </Flash>
                </div>
              )}
            </div>

            {/* The centerpiece: full editable merge form, gated on "ready" */}
            {phase !== "merged" && (
              <div className={phase === "ready" ? "prmt-reveal" : undefined}>
                <Stack direction="vertical" gap="normal" style={surfaceStyle(true)}>
                  <FormControl disabled={!canMerge}>
                    <FormControl.Label>Merge method</FormControl.Label>
                    <Select
                      value={method}
                      onChange={(e) => setMethod(e.target.value as MergeMethod)}
                      disabled={!canMerge}
                      block
                    >
                      <Select.Option value="merge">
                        {METHOD_LABEL.merge}
                      </Select.Option>
                      <Select.Option value="squash">
                        {METHOD_LABEL.squash}
                      </Select.Option>
                      <Select.Option value="rebase">
                        {METHOD_LABEL.rebase}
                      </Select.Option>
                    </Select>
                    <FormControl.Caption>
                      The primary action below reflects the method you choose.
                    </FormControl.Caption>
                  </FormControl>

                  {method !== "rebase" && (
                    <>
                      <FormControl disabled={!canMerge}>
                        <FormControl.Label>Commit headline</FormControl.Label>
                        <TextInput
                          value={headline}
                          onChange={(e) => setHeadline(e.target.value)}
                          disabled={!canMerge}
                          block
                        />
                      </FormControl>

                      <FormControl disabled={!canMerge}>
                        <FormControl.Label>Extended description</FormControl.Label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          resize="vertical"
                          disabled={!canMerge}
                          block
                        />
                        <FormControl.Caption>
                          Add any context reviewers should see in the commit body.
                        </FormControl.Caption>
                      </FormControl>
                    </>
                  )}

                  <FormControl disabled={!canMerge}>
                    <Checkbox
                      checked={deleteBranch}
                      onChange={(e) => setDeleteBranch(e.target.checked)}
                      disabled={!canMerge}
                    />
                    <FormControl.Label>
                      Delete{" "}
                      <BranchName as="span">{SOURCE_BRANCH}</BranchName> after merge
                    </FormControl.Label>
                    <FormControl.Caption>
                      You can restore the branch later if you change your mind.
                    </FormControl.Caption>
                  </FormControl>

                  <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
                    {/* disabled (not inactive): while running, a keyboard user
                        cannot trigger merge and a SR does not announce it as
                        actionable — exactly the prompt's a11y contract. */}
                    <Button
                      variant="primary"
                      leadingVisual={MethodIcon}
                      disabled={!canMerge}
                      onClick={handleMerge}
                    >
                      {METHOD_VERB[method]}
                    </Button>
                    {!canMerge && (
                      <Stack direction="horizontal" gap="condensed" align="center">
                        <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
                          <DotFillIcon size={12} />
                        </span>
                        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                          Waiting for status checks to finish…
                        </Text>
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              </div>
            )}

            {/* Merged: quiet, branch-aware confirmation */}
            {isMerged && (
              <div className="prmt-reveal">
                <Stack direction="vertical" gap="normal" style={surfaceStyle(true)}>
                  <Stack direction="horizontal" gap="condensed" align="center">
                    <span style={{ color: "var(--fgColor-done)", display: "inline-flex" }}>
                      <GitMergeIcon size={16} />
                    </span>
                    <Heading as="h2" variant="small">
                      Pull request successfully merged and closed
                    </Heading>
                  </Stack>

                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    <Text as="span" weight="semibold">
                      @{REVIEWERS[0].handle}
                    </Text>{" "}
                    merged {COMMIT_COUNT} commits into{" "}
                    <BranchName as="span">{TARGET_BRANCH}</BranchName> via{" "}
                    {METHOD_LABEL[method].toLowerCase()}.
                  </Text>

                  <Divider />

                  {committedDelete ? (
                    branchRestored ? (
                      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
                        <span style={{ color: "var(--fgColor-success)", display: "inline-flex" }}>
                          <GitBranchIcon size={16} />
                        </span>
                        <Text size="small">
                          Restored branch{" "}
                          <BranchName as="span">{SOURCE_BRANCH}</BranchName>.
                        </Text>
                      </Stack>
                    ) : (
                      <Stack direction="horizontal" gap="normal" align="center" justify="space-between" wrap="wrap">
                        <Stack direction="horizontal" gap="condensed" align="center">
                          <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
                            <TrashIcon size={16} />
                          </span>
                          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                            The branch{" "}
                            <BranchName as="span">{SOURCE_BRANCH}</BranchName>{" "}
                            was deleted.
                          </Text>
                        </Stack>
                        <Button leadingVisual={UndoIcon} onClick={handleRestore}>
                          Restore branch
                        </Button>
                      </Stack>
                    )
                  ) : branchDeleted ? (
                    <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
                      <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
                        <TrashIcon size={16} />
                      </span>
                      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                        The branch{" "}
                        <BranchName as="span">{SOURCE_BRANCH}</BranchName>{" "}
                        was deleted.
                      </Text>
                    </Stack>
                  ) : (
                    <Stack direction="horizontal" gap="normal" align="center" justify="space-between" wrap="wrap">
                      <Stack direction="horizontal" gap="condensed" align="center">
                        <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
                          <GitBranchIcon size={16} />
                        </span>
                        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                          The branch{" "}
                          <BranchName as="span">{SOURCE_BRANCH}</BranchName>{" "}
                          can be safely deleted.
                        </Text>
                      </Stack>
                      <Button
                        variant="danger"
                        leadingVisual={TrashIcon}
                        onClick={handleDeleteNow}
                      >
                        Delete branch
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </div>
            )}
          </Stack>

          {/* Footer meta line */}
          <Stack direction="horizontal" gap="condensed" align="center">
            <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
              <GitPullRequestIcon size={16} />
            </span>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              {REPO} · #{PR_NUMBER}
            </Text>
          </Stack>
        </Stack>
      </BaseStyles>
    </ThemeProvider>
  );
}

// Small count chip: an octicon + a CounterLabel, captioned for SR.
function CountChip({
  icon: IconCmp,
  label,
  children,
}: {
  icon: Icon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack direction="horizontal" gap="condensed" align="center">
      <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
        <IconCmp size={16} />
      </span>
      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
        {label}
      </Text>
      <CounterLabel variant="secondary">{children}</CounterLabel>
    </Stack>
  );
}

function Divider() {
  return (
    <div
      role="presentation"
      style={{
        height: 1,
        backgroundColor: "var(--borderColor-muted)",
        margin: "var(--base-size-4, 4px) 0",
      }}
    />
  );
}

export default PrMergedTheaterEncoreGen2;
