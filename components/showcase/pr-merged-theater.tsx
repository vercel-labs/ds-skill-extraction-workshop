"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Stack,
  Button,
  IconButton,
  TextInput,
  Textarea,
  Select,
  Checkbox,
  FormControl,
  Heading,
  Text,
  StateLabel,
  Label,
  CounterLabel,
  Flash,
  BranchName,
  ProgressBar,
  Spinner,
  useTheme,
} from "@primer/react";
import {
  CheckCircleFillIcon,
  SunIcon,
  MoonIcon,
  GitMergeIcon,
  GitBranchIcon,
  DotFillIcon,
} from "@primer/octicons-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type CheckStatus = "running" | "pass";
type Stage = "checks-running" | "ready" | "merged";
type MergeMethod = "merge" | "squash" | "rebase";

interface CICheck {
  id: string;
  name: string;
  resolveAtMs: number;
}

// ─── Static data (fictional) ─────────────────────────────────────────────────

const CHECKS: CICheck[] = [
  { id: "unit", name: "test / unit", resolveAtMs: 800 },
  { id: "lint", name: "test / lint", resolveAtMs: 1500 },
  { id: "typecheck", name: "test / typecheck", resolveAtMs: 2100 },
  { id: "build", name: "build / staging", resolveAtMs: 2900 },
  { id: "integration", name: "test / integration", resolveAtMs: 3700 },
  { id: "security", name: "security / dep-audit", resolveAtMs: 4500 },
  { id: "e2e", name: "test / e2e", resolveAtMs: 5400 },
  { id: "preview", name: "deploy / preview", resolveAtMs: 6100 },
];

const TOPIC_LABELS = ["infrastructure", "networking", "breaking-change"];

const DEFAULT_HEADLINES: Record<MergeMethod, string> = {
  merge: "Merge pull request #847 from nadia-volkov/feature/edge-routing-failover",
  squash: "Add multi-region failover for edge routing (#847)",
  rebase: "",
};

const BUTTON_LABELS: Record<MergeMethod, string> = {
  merge: "Create a merge commit",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};

// ─── Color mode toggle ───────────────────────────────────────────────────────

function ColorModeToggle() {
  const { resolvedColorMode, setColorMode } = useTheme();
  const isDark =
    resolvedColorMode === "dark" || resolvedColorMode === "night";

  const toggle = useCallback(() => {
    const next = isDark ? "light" : "dark";
    setColorMode(next);
    // Also write to document root so automated tests can assert the resolved mode
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-color-mode", next);
    }
  }, [isDark, setColorMode]);

  return (
    <IconButton
      icon={isDark ? SunIcon : MoonIcon}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      variant="invisible"
      size="small"
      onClick={toggle}
      data-testid="color-mode-toggle"
    />
  );
}

// ─── CI Check row ────────────────────────────────────────────────────────────

function CheckRow({
  check,
  status,
  isNew,
}: {
  check: CICheck;
  status: CheckStatus;
  isNew: boolean;
}) {
  return (
    <Stack
      direction="horizontal"
      gap="condensed"
      align="center"
      className={isNew ? "check-resolve-enter" : undefined}
      style={{ padding: "var(--base-size-16, 1rem) 0" }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color:
            status === "pass"
              ? "var(--fgColor-success, #1a7f37)"
              : "var(--fgColor-muted)",
        }}
        aria-hidden="true"
      >
        {status === "pass" ? (
          <CheckCircleFillIcon size={16} />
        ) : (
          <Spinner size="small" srText={null} />
        )}
      </span>
      <Text size="small" style={{ color: "var(--fgColor-default)" }}>
        {check.name}
      </Text>
      <span style={{ marginLeft: "auto" }}>
        {status === "pass" ? (
          <Text size="small" style={{ color: "var(--fgColor-success, #1a7f37)" }}>
            pass
          </Text>
        ) : (
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            running
          </Text>
        )}
      </span>
    </Stack>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function PrMergedTheater() {
  const [checkStatuses, setCheckStatuses] = useState<Record<string, CheckStatus>>(
    Object.fromEntries(CHECKS.map((c) => [c.id, "running"]))
  );
  const [newlyResolved, setNewlyResolved] = useState<Set<string>>(new Set());
  const [stage, setStage] = useState<Stage>("checks-running");
  const [mergeMethod, setMergeMethod] = useState<MergeMethod>("merge");
  const [commitHeadline, setCommitHeadline] = useState(DEFAULT_HEADLINES.merge);
  const [commitBody, setCommitBody] = useState("");
  const [deleteBranch, setDeleteBranch] = useState(true);
  const [merging, setMerging] = useState(false);

  // Sync commit headline when merge method changes
  useEffect(() => {
    setCommitHeadline(DEFAULT_HEADLINES[mergeMethod]);
  }, [mergeMethod]);

  // Check simulation
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setCheckStatuses(Object.fromEntries(CHECKS.map((c) => [c.id, "pass"])));
      setStage("ready");
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    CHECKS.forEach((check) => {
      timers.push(
        setTimeout(() => {
          setCheckStatuses((prev) => ({ ...prev, [check.id]: "pass" }));
          setNewlyResolved((prev) => new Set([...prev, check.id]));
          timers.push(
            setTimeout(() => {
              setNewlyResolved((prev) => {
                const next = new Set(prev);
                next.delete(check.id);
                return next;
              });
            }, 350)
          );
        }, check.resolveAtMs)
      );
    });

    // Transition to ready after all checks pass
    timers.push(
      setTimeout(() => {
        setStage("ready");
      }, CHECKS[CHECKS.length - 1].resolveAtMs + 100)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const passedCount = Object.values(checkStatuses).filter((s) => s === "pass").length;
  const progress = Math.round((passedCount / CHECKS.length) * 100);

  const handleMerge = useCallback(() => {
    setMerging(true);
    setTimeout(() => {
      setStage("merged");
      setMerging(false);
    }, 1200);
  }, []);

  const mergesReady = stage === "ready";
  const isMerged = stage === "merged";

  return (
    <Stack
      direction="vertical"
      gap="normal"
      padding="normal"
      style={{
        maxWidth: 800,
        margin: "0 auto",
        minHeight: "100vh",
        paddingTop: "var(--base-size-24, 1.5rem)",
        paddingBottom: "var(--base-size-24, 1.5rem)",
      }}
    >
      {/* Page-level toolbar */}
      <Stack direction="horizontal" justify="end">
        <ColorModeToggle />
      </Stack>

      {/* PR Card */}
      <div
        style={{
          border: "1px solid var(--borderColor-default)",
          borderRadius: "var(--borderRadius-large, 12px)",
          backgroundColor: "var(--bgColor-default)",
          boxShadow: "var(--shadow-resting-medium)",
          overflow: "hidden",
        }}
      >
        {/* PR Header */}
        <Stack
          direction="vertical"
          gap="condensed"
          padding="normal"
          style={{
            borderBottom: "1px solid var(--borderColor-muted)",
            paddingBottom: "var(--base-size-16, 1rem)",
          }}
        >
          {/* Title row */}
          <Stack direction="horizontal" gap="condensed" align="start" wrap="wrap">
            <span className="state-capsule-wrap">
              <StateLabel status={isMerged ? "pullMerged" : "pullOpened"}>
                {isMerged ? "Merged" : "Open"}
              </StateLabel>
            </span>
            <Heading
              as="h1"
              variant="medium"
              style={{ flex: 1, minWidth: 0 }}
            >
              Add multi-region failover for edge routing{" "}
              <Text
                as="span"
                size="large"
                style={{ color: "var(--fgColor-muted)" }}
              >
                #847
              </Text>
            </Heading>
          </Stack>

          {/* Branch row */}
          <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
            <span style={{ color: "var(--fgColor-muted)", display: "flex" }} aria-hidden="true">
              <GitBranchIcon size={16} />
            </span>
            <BranchName as="span">feature/edge-routing-failover</BranchName>
            <Text style={{ color: "var(--fgColor-muted)" }}>→</Text>
            <BranchName as="span">main</BranchName>
          </Stack>
        </Stack>

        {/* Metadata row */}
        <Stack
          direction="horizontal"
          gap="condensed"
          padding="normal"
          align="center"
          wrap="wrap"
          style={{
            borderBottom: "1px solid var(--borderColor-muted)",
          }}
        >
          {TOPIC_LABELS.map((label, i) => (
            <Label
              key={label}
              variant={
                i === 2 ? "danger" : i === 1 ? "default" : "accent"
              }
            >
              {label}
            </Label>
          ))}

          <Stack
            direction="horizontal"
            gap="condensed"
            align="center"
            style={{ marginLeft: "auto" }}
          >
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              Commits
            </Text>
            <CounterLabel variant="secondary">12</CounterLabel>

            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              Checks
            </Text>
            <CounterLabel variant={passedCount === CHECKS.length ? "primary" : "secondary"}>
              {passedCount}
            </CounterLabel>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              / {CHECKS.length}
            </Text>

            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              Files
            </Text>
            <CounterLabel variant="secondary">31</CounterLabel>
          </Stack>
        </Stack>

        {/* CI Checks section (hidden after merge) */}
        {!isMerged && (
          <Stack
            direction="vertical"
            gap="none"
            padding="normal"
            style={{ borderBottom: "1px solid var(--borderColor-muted)" }}
          >
            <Stack direction="horizontal" gap="condensed" align="center">
              <Heading as="h2" variant="small">
                Checks
              </Heading>
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                {passedCount} of {CHECKS.length} passing
              </Text>
            </Stack>

            <div style={{ marginTop: "var(--base-size-16, 1rem)" }}>
              <ProgressBar
                progress={progress}
                bg={progress === 100 ? "success.emphasis" : "accent.emphasis"}
                aria-label={`${passedCount} of ${CHECKS.length} checks passing`}
                animated={progress < 100}
              />
            </div>

            {/* Check list */}
            <div
              role="list"
              aria-label="CI checks"
              style={{ marginTop: "var(--base-size-16, 1rem)" }}
            >
              {CHECKS.map((check) => (
                <div
                  key={check.id}
                  role="listitem"
                  style={{
                    borderBottom: "1px solid var(--borderColor-muted)",
                  }}
                >
                  <CheckRow
                    check={check}
                    status={checkStatuses[check.id]}
                    isNew={newlyResolved.has(check.id)}
                  />
                </div>
              ))}
            </div>

            {/* Ready banner */}
            {mergesReady && (
              <div
                style={{ marginTop: "var(--base-size-16, 1rem)" }}
                role="status"
                aria-live="polite"
              >
                <Flash variant="success">
                  <Stack direction="horizontal" gap="condensed" align="center">
                    <CheckCircleFillIcon size={16} />
                    All checks passed — ready to merge
                  </Stack>
                </Flash>
              </div>
            )}
          </Stack>
        )}

        {/* Merge box */}
        {!isMerged && (
          <div
            className="merge-box"
            data-exiting={merging ? "true" : undefined}
            style={{ padding: "var(--base-size-16, 1rem) var(--base-size-24, 1.5rem)" }}
          >
            <Stack direction="vertical" gap="normal">
              <Heading as="h2" variant="small">
                Merge pull request
              </Heading>

              {/* Method picker */}
              <FormControl disabled={!mergesReady || merging}>
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
                  {mergeMethod === "rebase"
                    ? "Each commit is applied individually onto main."
                    : "A new commit is added to record this merge."}
                </FormControl.Caption>
              </FormControl>

              {/* Commit headline (merge or squash only) */}
              {mergeMethod !== "rebase" && (
                <FormControl disabled={!mergesReady || merging}>
                  <FormControl.Label>Commit headline</FormControl.Label>
                  <TextInput
                    value={commitHeadline}
                    onChange={(e) => setCommitHeadline(e.target.value)}
                    block
                  />
                </FormControl>
              )}

              {/* Extended description (merge or squash only) */}
              {mergeMethod !== "rebase" && (
                <FormControl disabled={!mergesReady || merging}>
                  <FormControl.Label>Extended description</FormControl.Label>
                  <Textarea
                    value={commitBody}
                    onChange={(e) => setCommitBody(e.target.value)}
                    resize="vertical"
                    block
                    rows={3}
                    placeholder="Add an optional extended description…"
                  />
                </FormControl>
              )}

              {/* Delete branch toggle */}
              <FormControl disabled={!mergesReady || merging}>
                <Checkbox
                  checked={deleteBranch}
                  onChange={(e) => setDeleteBranch(e.target.checked)}
                />
                <FormControl.Label>Delete branch after merge</FormControl.Label>
                <FormControl.Caption>
                  Removes{" "}
                  <BranchName as="span">
                    feature/edge-routing-failover
                  </BranchName>{" "}
                  after merging.
                </FormControl.Caption>
              </FormControl>

              {/* Merge action */}
              <Stack direction="horizontal" gap="condensed" align="center">
                <Button
                  variant="primary"
                  leadingVisual={GitMergeIcon}
                  disabled={!mergesReady}
                  loading={merging}
                  loadingAnnouncement="Merging pull request"
                  onClick={handleMerge}
                >
                  {BUTTON_LABELS[mergeMethod]}
                </Button>
                {!mergesReady && (
                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    Waiting for checks to complete
                  </Text>
                )}
              </Stack>
            </Stack>
          </div>
        )}

        {/* Post-merge confirmation */}
        {isMerged && (
          <div
            className="merge-confirmation"
            style={{
              padding: "var(--base-size-24, 1.5rem)",
            }}
            role="status"
            aria-live="polite"
          >
            <Stack direction="vertical" gap="normal">
              <Flash variant="success">
                <Stack direction="horizontal" gap="condensed" align="center">
                  <GitMergeIcon size={16} />
                  Pull request #847 was merged into{" "}
                  <BranchName as="span">main</BranchName>
                </Stack>
              </Flash>

              {deleteBranch ? (
                <Stack direction="horizontal" gap="condensed" align="center">
                  <span style={{ color: "var(--fgColor-muted)", display: "flex" }} aria-hidden="true">
                    <DotFillIcon size={16} />
                  </span>
                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    Branch{" "}
                    <BranchName as="span">feature/edge-routing-failover</BranchName>{" "}
                    was deleted.
                  </Text>
                  <Button variant="default" size="small">
                    Restore branch
                  </Button>
                </Stack>
              ) : (
                <Stack direction="horizontal" gap="condensed" align="center">
                  <span style={{ color: "var(--fgColor-muted)", display: "flex" }} aria-hidden="true">
                    <DotFillIcon size={16} />
                  </span>
                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    Branch{" "}
                    <BranchName as="span">feature/edge-routing-failover</BranchName>{" "}
                    is still available.
                  </Text>
                  <Button variant="default" size="small">
                    Delete branch
                  </Button>
                </Stack>
              )}
            </Stack>
          </div>
        )}
      </div>
    </Stack>
  );
}
