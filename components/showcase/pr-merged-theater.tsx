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
  Select,
  Spinner,
  Stack,
  StateLabel,
  Text,
  Textarea,
  TextInput,
  useTheme,
} from "@primer/react";
import {
  CheckCircleFillIcon,
  CircleIcon,
  GitMergeIcon,
  MoonIcon,
  SunIcon,
} from "@primer/octicons-react";
import { useEffect, useState } from "react";

// Fictional data only — no GitHub mascot names
const PR = {
  number: 2847,
  title: "feat: migrate batch processor to async queue pipeline",
  base: "main",
  head: "feature/async-queue-pipeline",
  labels: ["performance", "infrastructure"] as const,
  commits: 7,
  files: 14,
} as const;

const CHECKS = [
  "ci / unit-tests",
  "ci / integration-tests",
  "lint / eslint",
  "ci / build",
  "security / codeql",
  "ci / e2e",
] as const;

// ~900 ms between each check landing — 6 checks ≈ 5.4 s total
const CHECK_INTERVAL_MS = 900;

type PRStage = "open" | "merging" | "merged";
type MergeMethod = "squash" | "merge" | "rebase";

const MERGE_LABELS: Record<MergeMethod, string> = {
  squash: "Squash and merge",
  merge: "Create a merge commit",
  rebase: "Rebase and merge",
};

const COMMIT_HEADLINES: Record<MergeMethod, string> = {
  squash: `${PR.title} (#${PR.number})`,
  merge: `Merge branch '${PR.head}' into main`,
  rebase: PR.title,
};

export function PrMergedTheater() {
  const { resolvedColorMode, setColorMode } = useTheme();

  const [stage, setStage] = useState<PRStage>("open");
  const [resolvedChecks, setResolvedChecks] = useState(0);
  const [mergeMethod, setMergeMethod] = useState<MergeMethod>("squash");
  const [headline, setHeadline] = useState(COMMIT_HEADLINES.squash);
  const [body, setBody] = useState("");
  const [deleteBranch, setDeleteBranch] = useState(false);
  const [branchDeleted, setBranchDeleted] = useState(false);

  // Drive CI check progression
  useEffect(() => {
    if (stage !== "open" || resolvedChecks >= CHECKS.length) return;
    const id = setTimeout(
      () => setResolvedChecks((n) => n + 1),
      CHECK_INTERVAL_MS
    );
    return () => clearTimeout(id);
  }, [stage, resolvedChecks]);

  // Sync <html data-color-mode> so body background also recolors
  useEffect(() => {
    if (!resolvedColorMode) return;
    const isDark =
      resolvedColorMode === "night" || resolvedColorMode === "dark";
    document.documentElement.setAttribute(
      "data-color-mode",
      isDark ? "dark" : "light"
    );
  }, [resolvedColorMode]);

  // Update commit headline when merge method changes
  useEffect(() => {
    setHeadline(COMMIT_HEADLINES[mergeMethod]);
  }, [mergeMethod]);

  const isDark =
    resolvedColorMode === "night" || resolvedColorMode === "dark";
  const allPassed = resolvedChecks === CHECKS.length;
  const progress = Math.round((resolvedChecks / CHECKS.length) * 100);

  function toggleMode() {
    setColorMode(isDark ? "day" : "night");
  }

  function handleMerge() {
    if (stage !== "open") return;
    setStage("merging");
    setTimeout(() => {
      setStage("merged");
      if (deleteBranch) setBranchDeleted(true);
    }, 1500);
  }

  return (
    <Stack
      direction="vertical"
      gap="spacious"
      style={{
        maxWidth: 768,
        margin: "0 auto",
        padding: "var(--base-size-16, 1rem)",
      }}
    >
      {/* ── PR header ── */}
      <Stack direction="horizontal" justify="space-between" align="start">
        <Stack direction="vertical" gap="condensed" style={{ flex: 1, minWidth: 0, marginRight: "var(--base-size-16, 1rem)" }}>
          <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
            <StateLabel
              status={stage === "merged" ? "pullMerged" : "pullOpened"}
              size="small"
              style={{
                flexShrink: 0,
                transition: "background-color var(--motion-transition-stateChange)",
              }}
            >
              {stage === "merged" ? "Merged" : "Open"}
            </StateLabel>
            <Heading as="h1" variant="medium" style={{ margin: 0 }}>
              {PR.title}
            </Heading>
          </Stack>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            <strong>#{PR.number}</strong>
            {" · "}
            <BranchName as="span">{PR.head}</BranchName>
            {" → "}
            <BranchName as="span">{PR.base}</BranchName>
          </Text>
          <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
            {PR.labels.map((lbl) => (
              <Label key={lbl} variant="accent">
                {lbl}
              </Label>
            ))}
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              <CounterLabel variant="secondary">{PR.commits}</CounterLabel>{" "}
              commits
            </Text>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              <CounterLabel variant={allPassed ? "primary" : "secondary"}>
                {resolvedChecks}/{CHECKS.length}
              </CounterLabel>{" "}
              checks
            </Text>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              <CounterLabel variant="secondary">{PR.files}</CounterLabel> files
            </Text>
          </Stack>
        </Stack>
        <IconButton
          icon={isDark ? SunIcon : MoonIcon}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          variant="invisible"
          size="small"
          onClick={toggleMode}
          data-testid="color-mode-toggle"
          tooltipDirection="sw"
        />
      </Stack>

      {/* ── CI check wall ── */}
      <Stack
        direction="vertical"
        gap="condensed"
        style={{
          padding: "var(--base-size-16, 1rem)",
          backgroundColor: "var(--bgColor-muted)",
          borderRadius: "var(--borderRadius-medium, 8px)",
          border: "1px solid var(--borderColor-default)",
        }}
      >
        <Stack direction="horizontal" justify="space-between" align="center">
          <Text weight="semibold" size="small">
            {allPassed
              ? "All checks passed"
              : `${resolvedChecks} / ${CHECKS.length} checks passing`}
          </Text>
          {!allPassed && <Spinner size="small" srText={null} />}
        </Stack>
        <ProgressBar
          progress={progress}
          bg={allPassed ? "success.emphasis" : "accent.emphasis"}
          animated
          aria-label="CI checks progress"
        />
        <Stack
          as="ul"
          direction="vertical"
          gap="none"
          style={{ listStyle: "none", margin: 0, padding: 0 }}
        >
          {CHECKS.map((name, i) => {
            const done = i < resolvedChecks;
            const running = i === resolvedChecks && !allPassed;
            return (
              <Stack
                as="li"
                key={name}
                direction="horizontal"
                gap="condensed"
                align="center"
                padding="tight"
                style={{
                  opacity: done || running ? 1 : 0.45,
                  transition: "opacity var(--motion-transition-stateChange)",
                }}
              >
                {done ? (
                  <span
                    style={{
                      display: "flex",
                      color: "var(--fgColor-success)",
                    }}
                  >
                    <CheckCircleFillIcon size={16} />
                  </span>
                ) : running ? (
                  <Spinner size="small" srText={null} />
                ) : (
                  <span
                    style={{ display: "flex", color: "var(--fgColor-muted)" }}
                  >
                    <CircleIcon size={16} />
                  </span>
                )}
                <Text
                  size="small"
                  style={{
                    color: done
                      ? "var(--fgColor-default)"
                      : "var(--fgColor-muted)",
                    transition:
                      "color var(--motion-transition-stateChange)",
                  }}
                >
                  {name}
                </Text>
              </Stack>
            );
          })}
        </Stack>
      </Stack>

      {/* ── Ready cue ── */}
      {allPassed && stage === "open" && (
        <Flash variant="success" role="status" aria-live="polite">
          <Stack direction="horizontal" gap="condensed" align="center">
            <span style={{ display: "flex", color: "inherit" }}>
              <CheckCircleFillIcon size={16} />
            </span>
            <span>All checks passed — ready to merge.</span>
          </Stack>
        </Flash>
      )}

      {/* ── Merge box (open + merging) ── */}
      {(stage === "open" || stage === "merging") && (
        <Stack
          direction="vertical"
          gap="normal"
          style={{
            border: "1px solid var(--borderColor-default)",
            borderRadius: "var(--borderRadius-medium, 8px)",
            padding: "var(--base-size-16, 1rem)",
            backgroundColor: "var(--bgColor-default)",
          }}
        >
          <FormControl>
            <FormControl.Label>Merge method</FormControl.Label>
            <Select
              value={mergeMethod}
              onChange={(e) => setMergeMethod(e.target.value as MergeMethod)}
              disabled={!allPassed || stage === "merging"}
              block
            >
              <Select.Option value="squash">Squash and merge</Select.Option>
              <Select.Option value="merge">Create a merge commit</Select.Option>
              <Select.Option value="rebase">Rebase and merge</Select.Option>
            </Select>
          </FormControl>

          <FormControl disabled={!allPassed || stage === "merging"}>
            <FormControl.Label>Commit headline</FormControl.Label>
            <TextInput
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              block
            />
          </FormControl>

          <FormControl disabled={!allPassed || stage === "merging"}>
            <FormControl.Label>Extended description</FormControl.Label>
            <Textarea
              resize="vertical"
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Optional extended commit message…"
              block
            />
            <FormControl.Caption>
              Optional — separate paragraphs with a blank line.
            </FormControl.Caption>
          </FormControl>

          <FormControl disabled={!allPassed || stage === "merging"}>
            <Checkbox
              checked={deleteBranch}
              onChange={(e) => setDeleteBranch(e.target.checked)}
              disabled={!allPassed || stage === "merging"}
            />
            <FormControl.Label>Delete branch after merge</FormControl.Label>
            <FormControl.Caption>
              Branch{" "}
              <BranchName as="span">{PR.head}</BranchName> will be removed.
            </FormControl.Caption>
          </FormControl>

          <Button
            variant="primary"
            leadingVisual={GitMergeIcon}
            onClick={handleMerge}
            disabled={!allPassed}
            loading={stage === "merging"}
            loadingAnnouncement="Merging pull request"
            block
          >
            {MERGE_LABELS[mergeMethod]}
          </Button>

          {!allPassed && (
            <Text
              size="small"
              style={{
                color: "var(--fgColor-muted)",
                textAlign: "center",
              }}
            >
              Merge is blocked — waiting for all checks to complete.
            </Text>
          )}
        </Stack>
      )}

      {/* ── Post-merge confirmation ── */}
      {stage === "merged" && (
        <Stack direction="vertical" gap="normal">
          <Flash variant="success" role="alert">
            <Stack direction="horizontal" gap="condensed" align="center">
              <span style={{ display: "flex", color: "inherit" }}>
                <GitMergeIcon size={16} />
              </span>
              <span>
                Pull request <strong>#{PR.number}</strong> merged
                successfully.
                {branchDeleted && (
                  <>
                    {" "}
                    Branch{" "}
                    <BranchName as="span">{PR.head}</BranchName> was deleted.
                  </>
                )}
              </span>
            </Stack>
          </Flash>
          {branchDeleted ? (
            <Button
              variant="default"
              size="small"
              onClick={() => setBranchDeleted(false)}
            >
              Restore branch
            </Button>
          ) : (
            <Button
              variant="default"
              size="small"
              onClick={() => setBranchDeleted(true)}
            >
              Delete branch
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}
