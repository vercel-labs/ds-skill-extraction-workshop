"use client";

import {
  Stack,
  Heading,
  Text,
  StateLabel,
  BranchName,
  Label,
  CounterLabel,
  Button,
  IconButton,
  Flash,
  ProgressBar,
  Spinner,
  FormControl,
  TextInput,
  Textarea,
  Select,
  Checkbox,
} from "@primer/react";
import { useTheme } from "@primer/react";
import {
  SunIcon,
  MoonIcon,
  CheckCircleFillIcon,
  GitCommitIcon,
  FileDiffIcon,
  GitMergeIcon,
  ChecklistIcon,
  DotFillIcon,
} from "@primer/octicons-react";
import { useState, useEffect } from "react";

const CHECKS = [
  { id: "lint", name: "lint / eslint", resolveAt: 800 },
  { id: "typecheck", name: "type-check / tsc", resolveAt: 1600 },
  { id: "unit", name: "unit / vitest", resolveAt: 2600 },
  { id: "build", name: "build / turbopack", resolveAt: 3600 },
  { id: "e2e-chromium", name: "e2e / chromium", resolveAt: 4500 },
  { id: "e2e-firefox", name: "e2e / firefox", resolveAt: 5400 },
  { id: "deploy-preview", name: "deploy / preview", resolveAt: 6200 },
] as const;

type CheckId = (typeof CHECKS)[number]["id"];
type CheckStatus = "pending" | "running" | "pass";
type PRState = "open" | "merging" | "merged";
type MergeMethod = "merge" | "squash" | "rebase";

const INITIAL_STATUSES = Object.fromEntries(
  CHECKS.map((c) => [c.id, "pending" as CheckStatus])
) as Record<CheckId, CheckStatus>;

export function PRMergedTheater() {
  const { resolvedColorMode, setColorMode } = useTheme();

  // Mirror the resolved mode to <html> so:
  // 1. The page background (var(--bgColor-default) on body) recolors with the toggle
  // 2. The active mode is observable on document.documentElement for headless tests
  useEffect(() => {
    if (!resolvedColorMode) return;
    const mode =
      resolvedColorMode === "night" || resolvedColorMode === "dark"
        ? "dark"
        : "light";
    document.documentElement.setAttribute("data-color-mode", mode);
  }, [resolvedColorMode]);

  const isDark =
    resolvedColorMode === "night" || resolvedColorMode === "dark";

  function toggleColorMode() {
    setColorMode(isDark ? "light" : "dark");
  }

  // Check progression — resolves one by one over ~6 seconds
  const [checkStatuses, setCheckStatuses] =
    useState<Record<CheckId, CheckStatus>>(INITIAL_STATUSES);

  useEffect(() => {
    // First check starts running immediately
    setCheckStatuses((prev) => ({ ...prev, [CHECKS[0].id]: "running" }));

    const timers = CHECKS.map((check) =>
      setTimeout(() => {
        setCheckStatuses((prev) => ({ ...prev, [check.id]: "pass" }));
      }, check.resolveAt)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  // Advance the "running" indicator to the next pending check as each one passes
  useEffect(() => {
    for (let i = 0; i < CHECKS.length - 1; i++) {
      if (
        checkStatuses[CHECKS[i].id] === "pass" &&
        checkStatuses[CHECKS[i + 1].id] === "pending"
      ) {
        setCheckStatuses((prev) => ({
          ...prev,
          [CHECKS[i + 1].id]: "running",
        }));
        break;
      }
    }
  }, [checkStatuses]);

  const passedCount = CHECKS.filter(
    (c) => checkStatuses[c.id] === "pass"
  ).length;
  const allPassed = passedCount === CHECKS.length;
  const progress = Math.round((passedCount / CHECKS.length) * 100);

  // PR / merge form state
  const [prState, setPrState] = useState<PRState>("open");
  const [mergeMethod, setMergeMethod] = useState<MergeMethod>("squash");
  const [commitHeadline, setCommitHeadline] = useState(
    "feat: add dark-mode toggle to merge panel"
  );
  const [commitDesc, setCommitDesc] = useState("");
  const [deleteBranch, setDeleteBranch] = useState(true);
  const [branchDeleted, setBranchDeleted] = useState(false);

  function handleMerge() {
    if (prState !== "open" || !allPassed) return;
    setPrState("merging");
    setTimeout(() => {
      setPrState("merged");
      if (deleteBranch) setBranchDeleted(true);
    }, 1200);
  }

  const mergeLabel =
    mergeMethod === "squash"
      ? "Squash and merge"
      : mergeMethod === "rebase"
        ? "Rebase and merge"
        : "Create a merge commit";

  return (
    <div
      style={{
        maxWidth: "var(--breakpoint-medium)",
        margin: "0 auto",
        padding: `var(--base-size-24) var(--base-size-16)`,
      }}
    >
      {/* PR header: title row + branch info + counters + color-mode toggle */}
      <Stack
        direction="horizontal"
        justify="space-between"
        align="start"
        gap="normal"
      >
        <Stack
          direction="vertical"
          gap="condensed"
          style={{ flex: 1, minWidth: 0 }}
        >
          {/* State pill + title + PR number */}
          <Stack
            direction="horizontal"
            gap="condensed"
            align="center"
            wrap="wrap"
          >
            <StateLabel
              status={prState === "merged" ? "pullMerged" : "pullOpened"}
              style={{
                transition: `background-color var(--motion-transition-stateChange), color var(--motion-transition-stateChange)`,
                flexShrink: 0,
              }}
            >
              {prState === "merged" ? "Merged" : "Open"}
            </StateLabel>
            <Heading as="h1" variant="large">
              Add dark-mode toggle to merge panel
            </Heading>
            <Text size="large" style={{ color: "var(--fgColor-muted)" }}>
              #142
            </Text>
          </Stack>

          {/* Branch info */}
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            <Text size="small" weight="semibold">
              algernon-west
            </Text>
            {" wants to merge "}
            <BranchName as="span">feature/dark-mode-toggle</BranchName>
            {" into "}
            <BranchName as="span">main</BranchName>
          </Text>

          {/* Topic labels + running counters */}
          <Stack
            direction="horizontal"
            gap="condensed"
            align="center"
            wrap="wrap"
          >
            <Label variant="accent">enhancement</Label>
            <Label variant="secondary">front-end</Label>
            <Text aria-hidden style={{ color: "var(--fgColor-muted)" }}>
              ·
            </Text>
            <Stack direction="horizontal" gap="tight" align="center">
              <span
                aria-hidden
                style={{ display: "flex", alignItems: "center" }}
              >
                <GitCommitIcon size={14} />
              </span>
              <CounterLabel>5</CounterLabel>
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                commits
              </Text>
            </Stack>
            <Stack direction="horizontal" gap="tight" align="center">
              <span
                aria-hidden
                style={{ display: "flex", alignItems: "center" }}
              >
                <ChecklistIcon size={14} />
              </span>
              <CounterLabel>
                {passedCount}/{CHECKS.length}
              </CounterLabel>
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                checks
              </Text>
            </Stack>
            <Stack direction="horizontal" gap="tight" align="center">
              <span
                aria-hidden
                style={{ display: "flex", alignItems: "center" }}
              >
                <FileDiffIcon size={14} />
              </span>
              <CounterLabel>3</CounterLabel>
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                files changed
              </Text>
            </Stack>
          </Stack>
        </Stack>

        {/* Color-mode toggle — drives the design system's own mechanism */}
        <IconButton
          icon={isDark ? SunIcon : MoonIcon}
          aria-label={
            isDark ? "Switch to light mode" : "Switch to dark mode"
          }
          variant="invisible"
          onClick={toggleColorMode}
          data-testid="color-mode-toggle"
        />
      </Stack>

      {/* Section divider */}
      <hr
        style={{
          border: "none",
          borderTop: `1px solid var(--borderColor-default)`,
          margin: `var(--base-size-16) 0`,
        }}
      />

      {/* Merge section — open/merging state */}
      {prState !== "merged" ? (
        <Stack direction="vertical" gap="normal">
          {/* Reviews summary */}
          <Flash>
            <Stack direction="horizontal" gap="condensed" align="center">
              <span
                aria-hidden
                style={{
                  color: "var(--fgColor-success)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <CheckCircleFillIcon size={16} />
              </span>
              <Text>2 of 2 reviewers approved this pull request.</Text>
            </Stack>
          </Flash>

          {/* CI check wall */}
          <Stack direction="vertical" gap="tight">
            <Heading as="h2" variant="small">
              Checks
            </Heading>
            <Stack
              as="ul"
              direction="vertical"
              gap="tight"
              style={{ listStyle: "none", margin: 0 }}
            >
              {CHECKS.map((check) => {
                const status = checkStatuses[check.id];
                return (
                  <li key={check.id}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: `var(--base-size-8) var(--base-size-12)`,
                        borderRadius: "var(--borderRadius-medium)",
                        border: `1px solid var(--borderColor-default)`,
                        backgroundColor:
                          status === "pass"
                            ? "var(--bgColor-success-muted)"
                            : "var(--bgColor-default)",
                        transition: `background-color var(--motion-transition-stateChange)`,
                      }}
                    >
                      <Text size="small">{check.name}</Text>
                      <span
                        aria-hidden
                        style={{
                          display: "flex",
                          alignItems: "center",
                          color:
                            status === "pass"
                              ? "var(--fgColor-success)"
                              : status === "running"
                                ? "var(--fgColor-attention)"
                                : "var(--fgColor-muted)",
                          transition: `color var(--motion-transition-stateChange)`,
                        }}
                      >
                        {status === "pass" ? (
                          <CheckCircleFillIcon size={16} />
                        ) : status === "running" ? (
                          <Spinner size="small" srText={null} />
                        ) : (
                          <DotFillIcon size={16} />
                        )}
                      </span>
                    </div>
                  </li>
                );
              })}
            </Stack>
          </Stack>

          {/* Determinate progress track */}
          <ProgressBar
            progress={progress}
            bg={allPassed ? "success.emphasis" : "accent.emphasis"}
            aria-label={`${passedCount} of ${CHECKS.length} checks passed`}
          />

          {/* "Ready" cue — appears when all checks pass */}
          {allPassed && (
            <Flash variant="success" role="status">
              <Stack direction="horizontal" gap="condensed" align="center">
                <span
                  aria-hidden
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <CheckCircleFillIcon size={16} />
                </span>
                <Text>All checks passed — ready to merge.</Text>
              </Stack>
            </Flash>
          )}

          {/* Merge form */}
          <Stack direction="vertical" gap="normal">
            <Heading as="h2" variant="small">
              Complete the merge
            </Heading>

            <FormControl>
              <FormControl.Label>Merge method</FormControl.Label>
              <Select
                value={mergeMethod}
                onChange={(e) =>
                  setMergeMethod(e.target.value as MergeMethod)
                }
                block
              >
                <Select.Option value="squash">Squash and merge</Select.Option>
                <Select.Option value="merge">
                  Create a merge commit
                </Select.Option>
                <Select.Option value="rebase">Rebase and merge</Select.Option>
              </Select>
            </FormControl>

            <FormControl>
              <FormControl.Label>Commit headline</FormControl.Label>
              <TextInput
                value={commitHeadline}
                onChange={(e) => setCommitHeadline(e.target.value)}
                block
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>Extended description</FormControl.Label>
              <Textarea
                value={commitDesc}
                onChange={(e) => setCommitDesc(e.target.value)}
                placeholder="Add an optional extended description…"
                resize="vertical"
                block
              />
            </FormControl>

            {/* Checkbox: control first, then label, then caption */}
            <FormControl>
              <Checkbox
                checked={deleteBranch}
                onChange={(e) => setDeleteBranch(e.target.checked)}
              />
              <FormControl.Label>Delete branch after merge</FormControl.Label>
              <FormControl.Caption>
                <BranchName as="span">feature/dark-mode-toggle</BranchName>
                {" will be deleted."}
              </FormControl.Caption>
            </FormControl>

            <Button
              variant="primary"
              leadingVisual={GitMergeIcon}
              disabled={!allPassed}
              loading={prState === "merging"}
              loadingAnnouncement="Merging pull request…"
              onClick={handleMerge}
              block
            >
              {mergeLabel}
            </Button>

            {!allPassed && (
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                Merging is unavailable while checks are still running.
              </Text>
            )}
          </Stack>
        </Stack>
      ) : (
        /* Post-merge confirmation */
        <Stack direction="vertical" gap="normal">
          <Flash variant="success" role="status">
            <Stack direction="horizontal" gap="condensed" align="center">
              <span
                aria-hidden
                style={{ display: "flex", alignItems: "center" }}
              >
                <GitMergeIcon size={16} />
              </span>
              <Text>
                {"Pull request successfully merged. "}
                <Text weight="semibold">{commitHeadline}</Text>
              </Text>
            </Stack>
          </Flash>

          <Stack direction="horizontal" gap="condensed" align="center">
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              {"Branch "}
              <BranchName as="span">feature/dark-mode-toggle</BranchName>
              {branchDeleted ? " was deleted." : " was not deleted."}
            </Text>
            {branchDeleted ? (
              <Button
                variant="invisible"
                size="small"
                onClick={() => setBranchDeleted(false)}
              >
                Restore branch
              </Button>
            ) : (
              <Button
                variant="invisible"
                size="small"
                onClick={() => setBranchDeleted(true)}
              >
                Delete branch
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </div>
  );
}
