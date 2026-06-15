"use client";

import { useState, useEffect } from "react";
import {
  Stack,
  StateLabel,
  Label,
  CounterLabel,
  BranchName,
  Heading,
  Text,
  Flash,
  Timeline,
  ProgressBar,
  Button,
  IconButton,
  FormControl,
  Select,
  TextInput,
  Textarea,
  Checkbox,
  useTheme,
} from "@primer/react";
import {
  CheckIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  ClockIcon,
  DotFillIcon,
  SunIcon,
  MoonIcon,
  PersonIcon,
  CheckCircleFillIcon,
} from "@primer/octicons-react";

// ── Types ────────────────────────────────────────────────────────────────────

type CheckStatus = "pending" | "running" | "pass";
type MergeMethod = "merge" | "squash" | "rebase";
type MergeState = "idle" | "merging" | "merged";

type CICheck = {
  id: string;
  name: string;
  status: CheckStatus;
};

// ── Static data ──────────────────────────────────────────────────────────────

const INITIAL_CHECKS: CICheck[] = [
  { id: "build", name: "Build", status: "pending" },
  { id: "unit-tests", name: "Unit tests", status: "pending" },
  { id: "type-check", name: "Type check", status: "pending" },
  { id: "lint", name: "Lint", status: "pending" },
  { id: "coverage", name: "Coverage", status: "pending" },
  { id: "deploy-preview", name: "Deploy preview", status: "pending" },
  { id: "security-scan", name: "Security scan", status: "pending" },
];

const MERGE_METHOD_LABELS: Record<MergeMethod, string> = {
  merge: "Create a merge commit",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};

const REVIEWS = [
  { user: "priya-stormlight", approved: true },
  { user: "kai-dawnwatch", approved: true },
];

// ── ColorModeToggle ───────────────────────────────────────────────────────────

// Mirrors resolvedColorMode to document.documentElement so the page background
// (which resolves var(--bgColor-default) against <html>) recolors with the toggle,
// and the active mode is observable at document.documentElement[data-color-mode]
// for headless tests.
function ColorModeToggle() {
  const { resolvedColorMode, setColorMode } = useTheme();
  const isDark =
    resolvedColorMode === "night" || resolvedColorMode === "dark";

  useEffect(() => {
    if (!resolvedColorMode) return;
    const mode =
      resolvedColorMode === "day" || resolvedColorMode === "light"
        ? "light"
        : "dark";
    document.documentElement.setAttribute("data-color-mode", mode);
  }, [resolvedColorMode]);

  return (
    <IconButton
      icon={isDark ? SunIcon : MoonIcon}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      variant="invisible"
      data-testid="color-mode-toggle"
      onClick={() => setColorMode(isDark ? "day" : "night")}
    />
  );
}

// ── CheckBadgeIcon ────────────────────────────────────────────────────────────

function checkBadgeVariant(
  status: CheckStatus
): "success" | "attention" | undefined {
  if (status === "pass") return "success";
  if (status === "running") return "attention";
  return undefined;
}

function CheckBadgeIcon({ status }: { status: CheckStatus }) {
  if (status === "pass") return <CheckIcon size={12} aria-hidden />;
  if (status === "running") return <DotFillIcon size={12} aria-hidden />;
  return <ClockIcon size={12} aria-hidden />;
}

// ── PrMergedTheater ───────────────────────────────────────────────────────────

export default function PrMergedTheater() {
  const [checks, setChecks] = useState<CICheck[]>(INITIAL_CHECKS);
  const [mergeState, setMergeState] = useState<MergeState>("idle");
  const [mergeMethod, setMergeMethod] = useState<MergeMethod>("squash");
  const [commitHeadline, setCommitHeadline] = useState(
    "refactor: migrate authentication to edge-native session model (#847)"
  );
  const [commitDescription, setCommitDescription] = useState("");
  const [deleteBranch, setDeleteBranch] = useState(true);
  const [branchDeleted, setBranchDeleted] = useState(false);

  const passedCount = checks.filter((c) => c.status === "pass").length;
  const allPassed = passedCount === checks.length;
  const progress = Math.round((passedCount / checks.length) * 100);

  // Sequence CI checks over ~6 s, respecting prefers-reduced-motion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setChecks(INITIAL_CHECKS.map((c) => ({ ...c, status: "pass" })));
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    INITIAL_CHECKS.forEach((_, index) => {
      // Mark running
      timers.push(
        setTimeout(() => {
          setChecks((prev) =>
            prev.map((c, i) =>
              i === index ? { ...c, status: "running" } : c
            )
          );
        }, index * 900)
      );
      // Mark passed
      timers.push(
        setTimeout(() => {
          setChecks((prev) =>
            prev.map((c, i) =>
              i === index ? { ...c, status: "pass" } : c
            )
          );
        }, index * 900 + 600)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  function handleMerge() {
    setMergeState("merging");
    setTimeout(() => {
      setMergeState("merged");
      if (deleteBranch) setBranchDeleted(true);
    }, 1200);
  }

  const prState = mergeState === "merged" ? "pullMerged" : "pullOpened";
  const prStateLabel = mergeState === "merged" ? "Merged" : "Open";

  return (
    <div
      style={{
        maxWidth: 760,
        margin: "0 auto",
      }}
    >
      {/* Page header row */}
      <Stack direction="horizontal" gap="normal" align="start" justify="space-between">
        <Stack direction="vertical" gap="condensed">
          <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
            <StateLabel status={prState}>{prStateLabel}</StateLabel>
            <Heading as="h1" variant="large">
              refactor: migrate authentication to edge-native session model
            </Heading>
            <Text style={{ color: "var(--fgColor-muted)" }} size="large">
              #847
            </Text>
          </Stack>
          <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              <PersonIcon size={14} aria-hidden />
              {" "}
              <strong>aria-codewright</strong> wants to merge into
            </Text>
            <BranchName as="span">main</BranchName>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              from
            </Text>
            <BranchName as="span">feature/auth-edge</BranchName>
          </Stack>
        </Stack>
        <ColorModeToggle />
      </Stack>

      {/* Topic labels + counters */}
      <Stack
        direction="horizontal"
        gap="condensed"
        align="center"
        wrap="wrap"
        style={{ marginTop: "var(--base-size-16, 1rem)" }}
      >
        <Label variant="accent">backend</Label>
        <Label variant="attention">security</Label>
        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
          14 commits
        </Text>
        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
          <CounterLabel variant="secondary">{passedCount}</CounterLabel>
          {" "}/ {checks.length} checks
        </Text>
        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
          43 files changed
        </Text>
      </Stack>

      {/* Main merge panel */}
      <div
        style={{
          marginTop: "var(--base-size-24, 1.5rem)",
          border: "1px solid var(--borderColor-default)",
          borderRadius: "var(--borderRadius-large, 12px)",
          overflow: "hidden",
        }}
      >
        {/* Reviews section */}
        <div
          style={{
            padding: "var(--base-size-16, 1rem)",
            borderBottom: "1px solid var(--borderColor-muted)",
          }}
        >
          <Stack direction="horizontal" gap="condensed" align="center" justify="space-between">
            <Stack direction="horizontal" gap="condensed" align="center">
              <span style={{ color: "var(--fgColor-success)" }}>
                <CheckCircleFillIcon size={16} aria-hidden />
              </span>
              <Text weight="semibold">2 approving reviews</Text>
            </Stack>
            <Stack direction="horizontal" gap="condensed">
              {REVIEWS.map((r) => (
                <Label key={r.user} variant="success">
                  {r.user}
                </Label>
              ))}
            </Stack>
          </Stack>
        </div>

        {/* CI Checks section */}
        <div
          style={{
            padding: "var(--base-size-16, 1rem)",
            borderBottom: "1px solid var(--borderColor-muted)",
          }}
        >
          <Stack direction="vertical" gap="condensed">
            {/* Progress header */}
            <Stack direction="horizontal" gap="condensed" align="center" justify="space-between">
              <Stack direction="horizontal" gap="condensed" align="center">
                {allPassed ? (
                  <span style={{ color: "var(--fgColor-success)" }}>
                    <CheckCircleFillIcon size={16} aria-hidden />
                  </span>
                ) : (
                  <span style={{ color: "var(--fgColor-attention)" }}>
                    <GitPullRequestIcon size={16} aria-hidden />
                  </span>
                )}
                <Text weight="semibold">
                  {allPassed
                    ? "All checks passed"
                    : `${passedCount} / ${checks.length} checks passed`}
                </Text>
              </Stack>
            </Stack>

            <ProgressBar
              progress={progress}
              animated
              aria-label={`CI checks: ${passedCount} of ${checks.length} passed`}
              bg={allPassed ? "success.emphasis" : "accent.emphasis"}
            />

            {/* Check timeline */}
            <Timeline clipSidebar="both">
              {checks.map((check) => (
                <Timeline.Item key={check.id} condensed>
                  <Timeline.Badge variant={checkBadgeVariant(check.status)}>
                    <CheckBadgeIcon status={check.status} />
                  </Timeline.Badge>
                  <Timeline.Body>
                    <Stack direction="horizontal" gap="condensed" align="center" justify="space-between">
                      <Text size="small" weight={check.status === "pass" ? "semibold" : "normal"}>
                        {check.name}
                      </Text>
                      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                        {check.status === "pass"
                          ? "passed"
                          : check.status === "running"
                          ? "running…"
                          : "queued"}
                      </Text>
                    </Stack>
                  </Timeline.Body>
                </Timeline.Item>
              ))}
            </Timeline>
          </Stack>
        </div>

        {/* Merge box */}
        <div style={{ padding: "var(--base-size-16, 1rem)" }}>
          {mergeState === "merged" ? (
            /* Post-merge confirmation */
            <Flash variant="success" role="status">
              <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
                <GitMergeIcon size={16} aria-hidden />
                <Text weight="semibold">Pull request successfully merged and closed.</Text>
                {branchDeleted ? (
                  <Stack direction="horizontal" gap="condensed" align="center">
                    <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                      The <BranchName as="span">feature/auth-edge</BranchName> branch has been
                      deleted.
                    </Text>
                    <Button variant="invisible" size="small">
                      Restore branch
                    </Button>
                  </Stack>
                ) : (
                  <Button variant="invisible" size="small">
                    Delete branch
                  </Button>
                )}
              </Stack>
            </Flash>
          ) : (
            /* Merge form */
            <Stack direction="vertical" gap="normal">
              {allPassed && (
                <Flash variant="success" role="status">
                  <Stack direction="horizontal" gap="condensed" align="center">
                    <CheckIcon size={16} aria-hidden />
                    <Text>This branch has no conflicts with the base branch. Ready to merge.</Text>
                  </Stack>
                </Flash>
              )}

              {!allPassed && (
                <Flash variant="default">
                  <Stack direction="horizontal" gap="condensed" align="center">
                    <GitPullRequestIcon size={16} aria-hidden />
                    <Text>
                      Some checks are still running. Merging is unavailable until all checks
                      pass.
                    </Text>
                  </Stack>
                </Flash>
              )}

              <FormControl disabled={!allPassed}>
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
              </FormControl>

              <FormControl disabled={!allPassed}>
                <FormControl.Label>Commit message</FormControl.Label>
                <TextInput
                  value={commitHeadline}
                  onChange={(e) => setCommitHeadline(e.target.value)}
                  block
                />
              </FormControl>

              <FormControl disabled={!allPassed}>
                <FormControl.Label>Extended description</FormControl.Label>
                <Textarea
                  value={commitDescription}
                  onChange={(e) => setCommitDescription(e.target.value)}
                  placeholder="Add an optional extended description…"
                  resize="vertical"
                  block
                />
              </FormControl>

              <FormControl disabled={!allPassed}>
                <Checkbox
                  checked={deleteBranch}
                  onChange={(e) => setDeleteBranch(e.target.checked)}
                />
                <FormControl.Label>Delete branch after merge</FormControl.Label>
                <FormControl.Caption>
                  The <BranchName as="span">feature/auth-edge</BranchName> branch will be
                  removed from the repository.
                </FormControl.Caption>
              </FormControl>

              <Button
                variant="primary"
                leadingVisual={GitMergeIcon}
                disabled={!allPassed}
                loading={mergeState === "merging"}
                loadingAnnouncement="Merging pull request"
                onClick={handleMerge}
                block
              >
                {MERGE_METHOD_LABELS[mergeMethod]}
              </Button>
            </Stack>
          )}
        </div>
      </div>
    </div>
  );
}
