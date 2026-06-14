"use client";

import { useState, useEffect } from "react";
import {
  Button,
  IconButton,
  StateLabel,
  Label,
  CounterLabel,
  BranchName,
  ProgressBar,
  Flash,
  Select,
  FormControl,
  TextInput,
  Textarea,
  Checkbox,
  Spinner,
  Stack,
  Text,
  Heading,
  useTheme,
} from "@primer/react";
import {
  MoonIcon,
  SunIcon,
  CheckCircleFillIcon,
  GitMergeIcon,
  CircleIcon,
} from "@primer/octicons-react";

type Phase = "checking" | "ready" | "merging" | "merged";
type MergeMethod = "merge-commit" | "squash" | "rebase";

const PR = {
  number: 847,
  title: "feat: implement async job dispatch for meridian pipeline",
  author: "vaux",
  sourceBranch: "vaux/async-dispatch",
  targetBranch: "main",
  labels: [
    { text: "enhancement", variant: "accent" as const },
    { text: "pipeline", variant: "done" as const },
  ],
  commitCount: 7,
  filesChanged: 12,
};

const CHECKS = [
  { id: 1, name: "lint / eslint", delay: 800 },
  { id: 2, name: "test / unit", delay: 1600 },
  { id: 3, name: "test / integration", delay: 2600 },
  { id: 4, name: "build / staging", delay: 3800 },
  { id: 5, name: "deploy / preview", delay: 4800 },
  { id: 6, name: "security / audit", delay: 5800 },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export default function PrMergedTheater() {
  const { resolvedColorMode, setColorMode } = useTheme();
  const isDark = resolvedColorMode === "night" || resolvedColorMode === "dark";
  const prefersReducedMotion = useReducedMotion();

  const [phase, setPhase] = useState<Phase>("checking");
  const [checksCompleted, setChecksCompleted] = useState(0);
  const [mergeMethod, setMergeMethod] = useState<MergeMethod>("merge-commit");
  const [commitHeadline, setCommitHeadline] = useState(
    `Merge pull request #${PR.number} from ${PR.author}/${PR.sourceBranch}`
  );
  const [commitDescription, setCommitDescription] = useState("");
  const [deleteBranch, setDeleteBranch] = useState(true);
  const [branchRestored, setBranchRestored] = useState(false);

  // StateLabel flip state
  const [displayedLabelState, setDisplayedLabelState] = useState<
    "open" | "merged"
  >("open");
  const [capsuleVisible, setCapsuleVisible] = useState(true);

  useEffect(() => {
    const timers = CHECKS.map((check) =>
      setTimeout(() => {
        setChecksCompleted((prev) => prev + 1);
      }, check.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (checksCompleted === CHECKS.length) {
      setPhase("ready");
    }
  }, [checksCompleted]);

  function handleMerge() {
    if (phase !== "ready") return;
    setPhase("merging");
    setTimeout(() => {
      setPhase("merged");
      if (prefersReducedMotion) {
        setDisplayedLabelState("merged");
      } else {
        // Three-step flip: fade out → swap content → fade in
        // 200ms matches --motion-duration-short used on the CSS transition
        setCapsuleVisible(false);
        setTimeout(() => setDisplayedLabelState("merged"), 200);
        setTimeout(() => setCapsuleVisible(true), 250);
      }
    }, 1200);
  }

  function toggleColorMode() {
    setColorMode(isDark ? "day" : "night");
  }

  const mergeButtonLabel =
    mergeMethod === "merge-commit"
      ? "Merge pull request"
      : mergeMethod === "squash"
      ? "Squash and merge"
      : "Rebase and merge";

  const progressPercent = Math.round((checksCompleted / CHECKS.length) * 100);
  const allChecksPassed = checksCompleted === CHECKS.length;
  const isCheckingPhase = phase === "checking";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bgColor-default)",
        padding: "var(--space-xl) var(--space-lg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Top bar: color mode toggle */}
      <div
        style={{
          width: "100%",
          maxWidth: 768,
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "var(--space-lg)",
        }}
      >
        <IconButton
          icon={isDark ? SunIcon : MoonIcon}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          variant="invisible"
          tooltipDirection="s"
          onClick={toggleColorMode}
          data-testid="color-mode-toggle"
        />
      </div>

      {/* PR Panel */}
      <div
        style={{
          width: "100%",
          maxWidth: 768,
          border: "1px solid var(--borderColor-default)",
          borderRadius: "var(--borderRadius-default)",
          overflow: "hidden",
          backgroundColor: "var(--bgColor-default)",
        }}
      >
        {/* Panel header */}
        <div
          style={{
            padding: "var(--space-lg)",
            borderBottom: "1px solid var(--borderColor-muted)",
          }}
        >
          <Stack direction="horizontal" align="start" gap="normal">
            {/* StateLabel with animated flip */}
            <div
              style={{
                flexShrink: 0,
                opacity: capsuleVisible ? 1 : 0,
                transition: prefersReducedMotion
                  ? "none"
                  : "opacity var(--motion-transition-stateChange)",
              }}
            >
              <StateLabel
                status={
                  displayedLabelState === "merged"
                    ? "pullMerged"
                    : "pullOpened"
                }
              >
                {displayedLabelState === "merged" ? "Merged" : "Open"}
              </StateLabel>
            </div>

            <Heading as="h1" variant="medium">
              {PR.title}
            </Heading>
          </Stack>

          {/* Subtitle: number · author · branches */}
          <Stack
            direction="horizontal"
            align="center"
            gap="condensed"
            style={{ marginTop: "var(--space-sm)" }}
          >
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              #{PR.number} by @{PR.author}
            </Text>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              ·
            </Text>
            <BranchName as="span">{PR.sourceBranch}</BranchName>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              →
            </Text>
            <BranchName as="span">{PR.targetBranch}</BranchName>
          </Stack>

          {/* Labels + running counts */}
          <Stack
            direction="horizontal"
            align="center"
            gap="condensed"
            wrap="wrap"
            style={{ marginTop: "var(--space-sm)" }}
          >
            {PR.labels.map((label) => (
              <Label key={label.text} variant={label.variant}>
                {label.text}
              </Label>
            ))}
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              ·
            </Text>
            <Text size="small">
              <CounterLabel variant="primary">{PR.commitCount}</CounterLabel>{" "}
              commits
            </Text>
            <Text size="small">
              <CounterLabel variant="secondary">{checksCompleted}</CounterLabel>
              /{CHECKS.length} checks
            </Text>
            <Text size="small">
              <CounterLabel variant="secondary">{PR.filesChanged}</CounterLabel>{" "}
              files
            </Text>
          </Stack>
        </div>

        {/* CI Checks section */}
        <div
          style={{
            padding: "var(--space-md) var(--space-lg)",
            borderBottom: "1px solid var(--borderColor-muted)",
          }}
        >
          <Stack direction="vertical" gap="condensed">
            <Stack
              direction="horizontal"
              justify="space-between"
              align="center"
            >
              <Text size="small" weight="semibold">
                CI Checks
              </Text>
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                {checksCompleted}/{CHECKS.length} passing
              </Text>
            </Stack>

            <ProgressBar
              progress={progressPercent}
              bg={allChecksPassed ? "success.emphasis" : "accent.emphasis"}
              barSize="small"
              aria-label={`CI checks: ${checksCompleted} of ${CHECKS.length} complete`}
            />

            {CHECKS.map((check, i) => {
              const passed = i < checksCompleted;
              const running = i === checksCompleted && phase !== "merged";
              return (
                <Stack
                  key={check.id}
                  direction="horizontal"
                  align="center"
                  gap="condensed"
                  style={{
                    opacity: passed ? 1 : running ? 0.8 : 0.35,
                    transition: prefersReducedMotion
                      ? "none"
                      : "opacity var(--motion-transition-stateChange)",
                  }}
                >
                  {passed ? (
                    <CheckCircleFillIcon
                      size={16}
                      fill="var(--fgColor-success)"
                    />
                  ) : running ? (
                    <Spinner size="small" srText={null} />
                  ) : (
                    <CircleIcon size={16} fill="var(--fgColor-muted)" />
                  )}
                  <Text size="small">{check.name}</Text>
                </Stack>
              );
            })}
          </Stack>
        </div>

        {/* Merge box — shown while not yet merged */}
        {phase !== "merged" && (
          <div style={{ padding: "var(--space-lg)" }}>
            <Stack direction="vertical" gap="normal">
              {phase === "ready" && (
                <Flash variant="success" role="status">
                  All checks have passed. This branch is ready to merge.
                </Flash>
              )}

              <FormControl disabled={isCheckingPhase}>
                <FormControl.Label>Merge method</FormControl.Label>
                <Select
                  block
                  value={mergeMethod}
                  onChange={(e) =>
                    setMergeMethod(e.target.value as MergeMethod)
                  }
                >
                  <Select.Option value="merge-commit">
                    Create a merge commit
                  </Select.Option>
                  <Select.Option value="squash">
                    Squash and merge
                  </Select.Option>
                  <Select.Option value="rebase">
                    Rebase and merge
                  </Select.Option>
                </Select>
              </FormControl>

              <FormControl disabled={isCheckingPhase}>
                <FormControl.Label>Commit headline</FormControl.Label>
                <TextInput
                  block
                  value={commitHeadline}
                  onChange={(e) => setCommitHeadline(e.target.value)}
                />
              </FormControl>

              <FormControl disabled={isCheckingPhase}>
                <FormControl.Label>Extended description</FormControl.Label>
                <Textarea
                  block
                  resize="vertical"
                  value={commitDescription}
                  onChange={(e) => setCommitDescription(e.target.value)}
                  placeholder="Add an optional extended description…"
                  rows={3}
                />
              </FormControl>

              <FormControl disabled={isCheckingPhase}>
                <Checkbox
                  checked={deleteBranch}
                  onChange={(e) => setDeleteBranch(e.target.checked)}
                />
                <FormControl.Label>Delete branch after merge</FormControl.Label>
                <FormControl.Caption>
                  {PR.sourceBranch} will be removed after merging.
                </FormControl.Caption>
              </FormControl>

              <Button
                variant="primary"
                leadingVisual={GitMergeIcon}
                block
                disabled={isCheckingPhase}
                loading={phase === "merging"}
                loadingAnnouncement="Merging pull request…"
                onClick={handleMerge}
              >
                {mergeButtonLabel}
              </Button>

              {isCheckingPhase && (
                <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                  Merging is unavailable until all checks have passed.
                </Text>
              )}
            </Stack>
          </div>
        )}

        {/* Post-merge confirmation */}
        {phase === "merged" && (
          <div style={{ padding: "var(--space-lg)" }}>
            <Stack direction="vertical" gap="normal">
              <Flash variant="success" role="status">
                <Text weight="semibold">Pull request merged successfully.</Text>
              </Flash>

              {deleteBranch && !branchRestored && (
                <Stack direction="horizontal" align="center" gap="condensed">
                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    Branch{" "}
                    <BranchName as="span">{PR.sourceBranch}</BranchName> was
                    deleted.
                  </Text>
                  <Button
                    variant="default"
                    size="small"
                    onClick={() => setBranchRestored(true)}
                  >
                    Restore branch
                  </Button>
                </Stack>
              )}

              {deleteBranch && branchRestored && (
                <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                  Branch{" "}
                  <BranchName as="span">{PR.sourceBranch}</BranchName> was
                  restored.
                </Text>
              )}

              {!deleteBranch && (
                <Stack direction="horizontal" align="center" gap="condensed">
                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    <BranchName as="span">{PR.sourceBranch}</BranchName> is
                    still available.
                  </Text>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => setDeleteBranch(true)}
                  >
                    Delete branch
                  </Button>
                </Stack>
              )}
            </Stack>
          </div>
        )}
      </div>
    </div>
  );
}
