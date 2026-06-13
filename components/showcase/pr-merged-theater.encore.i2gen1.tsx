"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  TextInput,
  Textarea,
  Timeline,
} from "@primer/react"; // all IN-SLATE
import {
  CheckCircleFillIcon,
  ClockIcon,
  CommentIcon,
  DotFillIcon,
  FileDiffIcon,
  GitCommitIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  TrashIcon,
  UndoIcon,
  XCircleFillIcon,
} from "@primer/octicons-react";

/* ────────────────────────────────────────────────────────────────────────
   Invented fixtures (no real GitHub names/mascots).
   ──────────────────────────────────────────────────────────────────────── */

type CheckState = "pending" | "running" | "success" | "failure";

interface Check {
  id: string;
  name: string;
  context: string;
  /** if true this check ends "failure"; the encore keeps it green-dominant. */
  flaky?: boolean;
}

const CHECKS: Check[] = [
  { id: "lint", name: "lint / eslint", context: "Style & static analysis" },
  { id: "types", name: "typecheck / tsc", context: "Type safety" },
  { id: "unit", name: "test / unit", context: "Unit suite (842 specs)" },
  { id: "e2e", name: "test / e2e", context: "End-to-end (Maple runner)" },
  { id: "build", name: "build / bundle", context: "Production bundle" },
  { id: "deploy", name: "deploy / preview", context: "Preview environment" },
];

const TOPICS = ["frontend", "performance", "needs-changelog"];

const REVIEWERS = [
  { user: "ravenmaple", verdict: "approved" as const },
  { user: "lio-quartz", verdict: "approved" as const },
  { user: "fenwick.d", verdict: "commented" as const },
];

type MergeMethod = "merge" | "squash" | "rebase";

const MERGE_METHOD_LABELS: Record<MergeMethod, string> = {
  merge: "Create a merge commit",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};

const PR_OPENED_ISO = (() => {
  const d = new Date();
  d.setHours(d.getHours() - 5);
  return d.toISOString();
})();

/* ────────────────────────────────────────────────────────────────────────
   Motion helpers — all timing/easing comes from Primer motion tokens read
   off the live :root, never hand-picked numbers.
   ──────────────────────────────────────────────────────────────────────── */

function readDurationMs(varName: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  if (!raw) return fallback;
  if (raw.endsWith("ms")) return parseFloat(raw);
  if (raw.endsWith("s")) return parseFloat(raw) * 1000;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ──────────────────────────────────────────────────────────────────────── */

export function PrMergedTheaterEncoreI2Gen1() {
  const [checks, setChecks] = useState<Record<string, CheckState>>(() =>
    Object.fromEntries(CHECKS.map((c) => [c.id, "running" as CheckState])),
  );
  const [committedCount, setCommittedCount] = useState(0); // ticks up as checks land
  const [merged, setMerged] = useState(false);
  const [justLanded, setJustLanded] = useState<string | null>(null);

  // Merge-box form state
  const [method, setMethod] = useState<MergeMethod>("squash");
  const [headline, setHeadline] = useState(
    "Stream check results without blocking paint (#4821)",
  );
  const [description, setDescription] = useState(
    "Moves the check aggregator off the main thread and lands results incrementally.",
  );
  const [deleteBranch, setDeleteBranch] = useState(true);
  const [branchDeleted, setBranchDeleted] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const resolvedCount = useMemo(
    () =>
      Object.values(checks).filter(
        (s) => s === "success" || s === "failure",
      ).length,
    [checks],
  );
  const allGreen = useMemo(
    () => Object.values(checks).every((s) => s === "success"),
    [checks],
  );
  const progress = Math.round((resolvedCount / CHECKS.length) * 100);

  // Drive the domino sequence: each check resolves ~one motion-long beat apart.
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const beat = reduced
      ? 0
      : readDurationMs("--motion-duration-long", 500) * 2; // ~1s per check → ~6s total

    CHECKS.forEach((check, i) => {
      const t = setTimeout(
        () => {
          setChecks((prev) => ({
            ...prev,
            [check.id]: check.flaky ? "failure" : "success",
          }));
          setCommittedCount((n) => n + (check.flaky ? 0 : 1));
          setJustLanded(check.id);
        },
        reduced ? 0 : beat * (i + 1),
      );
      timers.current.push(t);
    });

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  // Clear the per-check "just landed" beat shortly after it fires.
  useEffect(() => {
    if (!justLanded) return;
    const ms = readDurationMs("--motion-duration-short", 200);
    const t = setTimeout(() => setJustLanded(null), ms + 40);
    return () => clearTimeout(t);
  }, [justLanded]);

  const handleMerge = useCallback(() => {
    setMerged(true);
    setBranchDeleted(deleteBranch);
  }, [deleteBranch]);

  const canMerge = allGreen && !merged;

  // Token-driven transition payloads (compositor-friendly props only).
  const flipTransition =
    "transform var(--motion-transition-stateChange), opacity var(--motion-transition-stateChange)";

  const cardSurface: React.CSSProperties = {
    backgroundColor: "var(--bgColor-default)",
    border: "1px solid var(--borderColor-default)",
    borderRadius: "var(--borderRadius-large, 12px)",
    overflow: "hidden",
  };

  const sectionDivider: React.CSSProperties = {
    borderTop: "1px solid var(--borderColor-muted)",
  };

  return (
    <Stack
      as="main"
      direction="vertical"
      gap="normal"
      padding="spacious"
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bgColor-default)",
        color: "var(--fgColor-default)",
        maxWidth: 880,
        marginInline: "auto",
      }}
    >
      <style>{`
        @keyframes prmt-land {
          from { opacity: 0; transform: translateY(var(--base-size-4, 4px)); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes prmt-reveal {
          from { opacity: 0; transform: translateY(var(--base-size-8, 8px)); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .prmt-flip {
          transition: ${flipTransition};
        }
        .prmt-land   { animation: prmt-land var(--motion-duration-short) var(--motion-easing-enter) both; }
        .prmt-reveal { animation: prmt-reveal var(--motion-duration-medium) var(--motion-easing-enter) both; }
        @media (prefers-reduced-motion: reduce) {
          .prmt-land, .prmt-reveal { animation: none; }
          .prmt-flip { transition: none; }
        }
      `}</style>

      {/* ── PR header ─────────────────────────────────────────────── */}
      <Stack direction="vertical" gap="condensed">
        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          <span
            className="prmt-flip"
            style={{ display: "inline-flex" }}
            // The capsule itself flips status; aria-live announces the change.
            aria-live="polite"
          >
            <StateLabel status={merged ? "pullMerged" : "pullOpened"}>
              {merged ? "Merged" : "Open"}
            </StateLabel>
          </span>
          <Heading as="h1" variant="large" style={{ flex: 1, minWidth: 240 }}>
            Stream check results without blocking paint{" "}
            <Text
              as="span"
              size="large"
              weight="light"
              style={{ color: "var(--fgColor-muted)" }}
            >
              #4821
            </Text>
          </Heading>
        </Stack>

        <Stack
          direction="horizontal"
          gap="condensed"
          align="center"
          wrap="wrap"
        >
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            <Text as="span" weight="semibold" style={{ color: "var(--fgColor-default)" }}>
              ravenmaple
            </Text>{" "}
            wants to merge {committedCount} commits into
          </Text>
          <BranchName as="span">main</BranchName>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            from
          </Text>
          <BranchName as="span">feat/streamed-checks</BranchName>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            · opened{" "}
            <RelativeTime datetime={PR_OPENED_ISO} tense="past">
              {new Date(PR_OPENED_ISO).toLocaleString()}
            </RelativeTime>
          </Text>
        </Stack>

        {/* topic labels (metadata) + running counts */}
        <Stack
          direction="horizontal"
          gap="condensed"
          align="center"
          wrap="wrap"
        >
          {TOPICS.map((t) => (
            <Label key={t} variant="accent">
              {t}
            </Label>
          ))}
          <span style={{ flex: 1 }} />
          <Stack direction="horizontal" gap="normal" align="center">
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              <GitCommitIcon size={16} aria-hidden /> commits{" "}
              <CounterLabel>{committedCount}</CounterLabel>
            </Text>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              <CheckCircleFillIcon size={16} aria-hidden /> checks{" "}
              <CounterLabel variant={allGreen ? "primary" : "secondary"}>
                {resolvedCount}/{CHECKS.length}
              </CounterLabel>
            </Text>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              <FileDiffIcon size={16} aria-hidden /> files{" "}
              <CounterLabel>14</CounterLabel>
            </Text>
          </Stack>
        </Stack>
      </Stack>

      {/* ── Merge box ─────────────────────────────────────────────── */}
      <div style={cardSurface}>
        {/* Reviews */}
        <Stack direction="vertical" gap="condensed" padding="normal">
          <Heading as="h2" variant="small">
            Reviews
          </Heading>
          <Timeline clipSidebar>
            {REVIEWERS.map((r) => (
              <Timeline.Item key={r.user}>
                <Timeline.Badge
                  variant={r.verdict === "approved" ? "success" : undefined}
                >
                  {r.verdict === "approved" ? (
                    <CheckCircleFillIcon aria-hidden />
                  ) : (
                    <CommentIcon aria-hidden />
                  )}
                </Timeline.Badge>
                <Timeline.Body>
                  <Text weight="semibold">{r.user}</Text>{" "}
                  {r.verdict === "approved"
                    ? "approved these changes"
                    : "left review comments"}
                </Timeline.Body>
              </Timeline.Item>
            ))}
          </Timeline>
        </Stack>

        {/* CI checks */}
        <Stack direction="vertical" gap="condensed" padding="normal" style={sectionDivider}>
          <Stack direction="horizontal" gap="condensed" align="center">
            <Heading as="h2" variant="small" style={{ flex: 1 }}>
              {merged
                ? "All checks passed"
                : allGreen
                  ? "All checks have passed"
                  : "Checks are running"}
            </Heading>
            {!allGreen && !merged && (
              <Spinner size="small" srText="Checks running" />
            )}
          </Stack>

          <ProgressBar
            progress={progress}
            bg={
              allGreen
                ? "success.emphasis"
                : "accent.emphasis"
            }
            aria-label={`Checks complete: ${resolvedCount} of ${CHECKS.length}`}
            aria-valuetext={`${resolvedCount} of ${CHECKS.length} checks complete`}
          />

          <Stack as="ul" direction="vertical" gap="none" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {CHECKS.map((check) => {
              const state = checks[check.id];
              const isLanded = justLanded === check.id;
              return (
                <Stack
                  as="li"
                  key={check.id}
                  direction="horizontal"
                  gap="condensed"
                  align="center"
                  paddingBlock="condensed"
                  className={isLanded ? "prmt-land" : undefined}
                >
                  <span
                    aria-hidden
                    style={{
                      display: "inline-flex",
                      color:
                        state === "success"
                          ? "var(--fgColor-success)"
                          : state === "failure"
                            ? "var(--fgColor-danger)"
                            : "var(--fgColor-muted)",
                    }}
                  >
                    {state === "success" ? (
                      <CheckCircleFillIcon size={16} />
                    ) : state === "failure" ? (
                      <XCircleFillIcon size={16} />
                    ) : (
                      <DotFillIcon size={16} />
                    )}
                  </span>
                  <Stack direction="vertical" gap="none" style={{ flex: 1 }}>
                    <Text weight="semibold" size="small">
                      {check.name}
                    </Text>
                    <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                      {check.context}
                    </Text>
                  </Stack>
                  {state === "running" || state === "pending" ? (
                    <Stack direction="horizontal" gap="condensed" align="center">
                      <Spinner size="small" srText={null} />
                      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                        <ClockIcon size={16} aria-hidden /> In progress
                      </Text>
                    </Stack>
                  ) : (
                    <Label variant={state === "success" ? "success" : "danger"}>
                      {state === "success" ? "Passed" : "Failed"}
                    </Label>
                  )}
                </Stack>
              );
            })}
          </Stack>
        </Stack>

        {/* Ready cue + merge controls */}
        <Stack direction="vertical" gap="normal" padding="normal" style={sectionDivider}>
          {merged ? (
            /* Quiet confirmation after the flip */
            <Stack direction="vertical" gap="condensed" className="prmt-reveal">
              <Flash variant="default">
                <Stack direction="horizontal" gap="condensed" align="center">
                  <span style={{ color: "var(--fgColor-done)", display: "inline-flex" }}>
                    <GitMergeIcon size={16} aria-hidden />
                  </span>
                  <Text weight="semibold">
                    Pull request successfully merged and closed
                  </Text>
                </Stack>
              </Flash>
              <Stack
                direction="horizontal"
                gap="condensed"
                align="center"
                wrap="wrap"
              >
                {branchDeleted ? (
                  <>
                    <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                      The branch <BranchName as="span">feat/streamed-checks</BranchName>{" "}
                      was deleted.
                    </Text>
                    <Button
                      variant="default"
                      size="small"
                      leadingVisual={UndoIcon}
                      onClick={() => setBranchDeleted(false)}
                    >
                      Restore branch
                    </Button>
                  </>
                ) : (
                  <>
                    <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                      You can safely delete{" "}
                      <BranchName as="span">feat/streamed-checks</BranchName> now.
                    </Text>
                    <Button
                      variant="danger"
                      size="small"
                      leadingVisual={TrashIcon}
                      onClick={() => setBranchDeleted(true)}
                    >
                      Delete branch
                    </Button>
                  </>
                )}
              </Stack>
            </Stack>
          ) : (
            <>
              {allGreen && (
                <div className="prmt-reveal">
                  <Flash variant="success">
                    <Stack direction="horizontal" gap="condensed" align="center">
                      <span style={{ color: "var(--fgColor-success)", display: "inline-flex" }}>
                        <CheckCircleFillIcon size={16} aria-hidden />
                      </span>
                      <Text weight="semibold">
                        All checks have passed — this branch is ready to merge.
                      </Text>
                    </Stack>
                  </Flash>
                </div>
              )}

              {/* Full editable merge box, only meaningful once green. While
                  running, merge is genuinely unavailable: the button is
                  disabled (not focusable, not announced as actionable) and the
                  form fields stay disabled too. */}
              {allGreen ? (
                <Stack
                  direction="vertical"
                  gap="normal"
                  className="prmt-reveal"
                >
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
                        Create a merge commit
                      </Select.Option>
                      <Select.Option value="squash">
                        Squash and merge
                      </Select.Option>
                      <Select.Option value="rebase">
                        Rebase and merge
                      </Select.Option>
                    </Select>
                    <FormControl.Caption>
                      {method === "merge"
                        ? "All commits from this branch will be added to the base branch via a merge commit."
                        : method === "squash"
                          ? "The commits will be combined into one commit on the base branch."
                          : "The commits will be rebased and added to the base branch individually."}
                    </FormControl.Caption>
                  </FormControl>

                  <FormControl>
                    <FormControl.Label>Commit headline</FormControl.Label>
                    <TextInput
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      block
                      monospace
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
                      Add an optional extended description for the merge commit.
                    </FormControl.Caption>
                  </FormControl>

                  <FormControl>
                    <Checkbox
                      checked={deleteBranch}
                      onChange={(e) => setDeleteBranch(e.target.checked)}
                    />
                    <FormControl.Label>
                      Delete branch after merge
                    </FormControl.Label>
                    <FormControl.Caption>
                      Remove <BranchName as="span">feat/streamed-checks</BranchName>{" "}
                      once it has been merged.
                    </FormControl.Caption>
                  </FormControl>

                  <Stack direction="horizontal" gap="condensed" align="center">
                    <Button
                      variant="primary"
                      leadingVisual={GitMergeIcon}
                      onClick={handleMerge}
                    >
                      {MERGE_METHOD_LABELS[method]}
                    </Button>
                    <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                      You can also merge from the command line.
                    </Text>
                  </Stack>
                </Stack>
              ) : (
                /* Pre-green: merge unavailable. disabled keeps it out of tab
                   order and unannounced as actionable. */
                <Stack direction="horizontal" gap="condensed" align="center">
                  <Button
                    variant="primary"
                    leadingVisual={GitPullRequestIcon}
                    disabled
                  >
                    Merge when ready
                  </Button>
                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    Merging is blocked until all required checks pass.
                  </Text>
                  <span style={{ flex: 1 }} />
                  <IconButton
                    icon={GitCommitIcon}
                    aria-label="View commit history"
                    variant="invisible"
                  />
                </Stack>
              )}
            </>
          )}
        </Stack>
      </div>
    </Stack>
  );
}

export default PrMergedTheaterEncoreI2Gen1;
