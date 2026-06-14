"use client";

import { useCallback, useEffect, useState } from "react";
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
} from "@primer/react";
import {
  CheckCircleFillIcon,
  CheckIcon,
  GitMergeIcon,
  MoonIcon,
  SunIcon,
  XCircleFillIcon,
} from "@primer/octicons-react";
import { useTheme } from "@primer/react";

type MergeMethod = "merge" | "squash" | "rebase";

type CheckStatus = "pending" | "running" | "passed" | "failed";

interface CICheck {
  id: string;
  name: string;
  status: CheckStatus;
}

const INITIAL_CHECKS: CICheck[] = [
  { id: "lint", name: "Lint / eslint", status: "pending" },
  { id: "types", name: "Type check / tsc", status: "pending" },
  { id: "unit", name: "Unit tests / jest", status: "pending" },
  { id: "e2e", name: "E2E / playwright", status: "pending" },
  { id: "build", name: "Build / turbo", status: "pending" },
  { id: "security", name: "Security scan / trivy", status: "pending" },
];

// Each check resolves roughly every 900 ms
const CHECK_INTERVAL_MS = 900;

type Phase = "checking" | "ready" | "merging" | "merged";

function CheckRow({ check }: { check: CICheck }) {
  return (
    <Stack direction="horizontal" align="center" gap="condensed">
      <span
        aria-hidden="true"
        style={{ width: 20, display: "flex", alignItems: "center", flexShrink: 0 }}
      >
        {check.status === "passed" && (
          <span style={{ color: "var(--fgColor-success)" }}>
            <CheckCircleFillIcon size={16} />
          </span>
        )}
        {check.status === "failed" && (
          <span style={{ color: "var(--fgColor-danger)" }}>
            <XCircleFillIcon size={16} />
          </span>
        )}
        {(check.status === "pending" || check.status === "running") && (
          <Spinner size="small" srText={null} />
        )}
      </span>
      <Text size="small">{check.name}</Text>
      <Text
        size="small"
        style={{ color: "var(--fgColor-muted)", marginLeft: "auto" }}
      >
        {check.status === "passed" && "passed"}
        {check.status === "failed" && "failed"}
        {check.status === "running" && "running…"}
        {check.status === "pending" && "queued"}
      </Text>
    </Stack>
  );
}

function ColorModeToggle() {
  const { colorMode, setColorMode } = useTheme();
  const isDark = colorMode === "night" || colorMode === "dark";

  const toggle = useCallback(() => {
    const next = isDark ? "day" : "night";
    setColorMode(next);
    // Update the data-color-mode attribute so the resolved mode is observable
    // in the DOM for automated tests that can't inspect ThemeProvider state.
    document.documentElement.setAttribute(
      "data-color-mode",
      next === "night" ? "dark" : "light"
    );
  }, [isDark, setColorMode]);

  return (
    <IconButton
      icon={isDark ? SunIcon : MoonIcon}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      variant="invisible"
      size="medium"
      onClick={toggle}
      data-testid="color-mode-toggle"
    />
  );
}

export function PrMergedTheater() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [checks, setChecks] = useState<CICheck[]>(INITIAL_CHECKS);
  const [mergeMethod, setMergeMethod] = useState<MergeMethod>("squash");
  const [commitHeadline, setCommitHeadline] = useState(
    "feat(auth): replace JWT with short-lived session tokens (#142)"
  );
  const [commitBody, setCommitBody] = useState(
    "Migrates the auth layer from symmetric JWTs to server-issued\nshort-lived session tokens, scoped per device. Resolves the\ncompliance requirement raised in the security review."
  );
  const [deleteBranch, setDeleteBranch] = useState(true);
  const [branchDeleted, setBranchDeleted] = useState(false);
  const [merging, setMerging] = useState(false);

  const passedCount = checks.filter((c) => c.status === "passed").length;
  const totalChecks = checks.length;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    checks.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setChecks((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], status: "running" };
            return next;
          });
        }, i * CHECK_INTERVAL_MS + 300)
      );
      timers.push(
        setTimeout(() => {
          setChecks((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], status: "passed" };
            return next;
          });
          if (i === checks.length - 1) {
            setPhase("ready");
          }
        }, (i + 1) * CHECK_INTERVAL_MS + 300)
      );
    });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mergeLabel =
    mergeMethod === "merge"
      ? "Merge pull request"
      : mergeMethod === "squash"
        ? "Squash and merge"
        : "Rebase and merge";

  function handleMerge() {
    setMerging(true);
    setPhase("merging");
    setTimeout(() => {
      setPhase("merged");
      setMerging(false);
      if (deleteBranch) {
        setBranchDeleted(true);
      }
    }, 1400);
  }

  const panelStyle = {
    border: "1px solid var(--borderColor-default)",
    borderRadius: "var(--borderRadius-medium, 6px)",
    padding: "16px",
    backgroundColor: "var(--bgColor-subtle)",
  };

  return (
    <Stack
      direction="vertical"
      gap="normal"
      style={{
        maxWidth: 780,
        margin: "0 auto",
        padding: "24px 16px",
      }}
    >
      {/* Top bar */}
      <Stack direction="horizontal" align="center" justify="space-between">
        <Text
          size="small"
          style={{ color: "var(--fgColor-muted)", fontFamily: "monospace" }}
        >
          shipworkshop / atlas-runtime
        </Text>
        <ColorModeToggle />
      </Stack>

      {/* PR title row */}
      <Stack direction="vertical" gap="condensed">
        <Stack direction="horizontal" align="center" gap="condensed" wrap="wrap">
          <StateLabel
            status={phase === "merged" ? "pullMerged" : "pullOpened"}
            size="small"
          >
            {phase === "merged" ? "Merged" : "Open"}
          </StateLabel>
          <Heading as="h1" style={{ fontSize: "1.25rem" }}>
            Replace JWT auth with short-lived session tokens
          </Heading>
          <Text style={{ color: "var(--fgColor-muted)" }}>#142</Text>
        </Stack>

        {/* Branch row */}
        <Stack direction="horizontal" align="center" gap="condensed" wrap="wrap">
          <BranchName as="span">feat/session-tokens</BranchName>
          <Text style={{ color: "var(--fgColor-muted)" }}>→</Text>
          <BranchName as="span">main</BranchName>
        </Stack>

        {/* Topic labels + counts */}
        <Stack direction="horizontal" align="center" gap="condensed" wrap="wrap">
          <Label variant="accent">security</Label>
          <Label variant="attention">auth</Label>
          <Label variant="done">backend</Label>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginLeft: 8,
            }}
          >
            <CounterLabel variant="secondary">{passedCount}</CounterLabel>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              / {totalChecks} checks
            </Text>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <CounterLabel variant="secondary">7</CounterLabel>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              commits
            </Text>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <CounterLabel variant="secondary">14</CounterLabel>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              files changed
            </Text>
          </span>
        </Stack>
      </Stack>

      {/* CI checks panel */}
      <Stack direction="vertical" gap="condensed" style={panelStyle}>
        <Stack direction="horizontal" align="center" justify="space-between">
          <Text weight="semibold">
            {phase === "checking"
              ? "Checks running…"
              : phase === "ready"
                ? "All checks passed"
                : phase === "merging"
                  ? "Merging…"
                  : "Merged"}
          </Text>
          {phase === "checking" && <Spinner size="small" srText="Checks running" />}
          {phase === "ready" && (
            <span style={{ color: "var(--fgColor-success)" }}>
              <CheckCircleFillIcon size={16} />
            </span>
          )}
        </Stack>

        <ProgressBar
          progress={(passedCount / totalChecks) * 100}
          aria-label="CI checks progress"
          bg="success.emphasis"
          barSize="small"
        />

        <Stack direction="vertical" gap="tight">
          {checks.map((c) => (
            <CheckRow key={c.id} check={c} />
          ))}
        </Stack>
      </Stack>

      {/* Ready flash */}
      {phase === "ready" && (
        <Flash variant="success">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <CheckIcon size={16} />
            All checks passed — this branch is ready to merge.
          </span>
        </Flash>
      )}

      {/* Merge box — editable while ready or merging */}
      {(phase === "ready" || phase === "merging") && (
        <Stack direction="vertical" gap="normal" style={panelStyle}>
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
              value={commitBody}
              onChange={(e) => setCommitBody(e.target.value)}
              rows={4}
              resize="vertical"
              block
            />
          </FormControl>

          <FormControl layout="horizontal">
            <Checkbox
              checked={deleteBranch}
              onChange={(e) => setDeleteBranch(e.target.checked)}
            />
            <FormControl.Label>Delete branch after merge</FormControl.Label>
            <FormControl.Caption>
              <Text as="code">feat/session-tokens</Text> will be removed from
              the remote.
            </FormControl.Caption>
          </FormControl>

          <Button
            variant="primary"
            leadingVisual={GitMergeIcon}
            loading={merging}
            loadingAnnouncement="Merging pull request"
            onClick={handleMerge}
            disabled={phase === "merging"}
            block
          >
            {mergeLabel}
          </Button>
        </Stack>
      )}

      {/* Post-merge confirmation */}
      {phase === "merged" && (
        <Stack direction="vertical" gap="condensed" style={panelStyle}>
          <Flash variant="success">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <GitMergeIcon size={16} />
              Pull request successfully merged and closed.
            </span>
          </Flash>

          {branchDeleted ? (
            <Stack direction="horizontal" align="center" gap="condensed" wrap="wrap">
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                Branch <Text as="code">feat/session-tokens</Text> was deleted.
              </Text>
              <Button variant="default" size="small">
                Restore branch
              </Button>
            </Stack>
          ) : (
            <Stack direction="horizontal" align="center" gap="condensed" wrap="wrap">
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                Branch <Text as="code">feat/session-tokens</Text> is still
                available.
              </Text>
              <Button variant="danger" size="small">
                Delete branch
              </Button>
            </Stack>
          )}
        </Stack>
      )}

      {/* Blocked merge box — shown while checks are still running */}
      {phase === "checking" && (
        <Stack direction="vertical" gap="condensed" style={panelStyle}>
          <Button
            variant="primary"
            leadingVisual={GitMergeIcon}
            inactive
            block
            aria-label="Merge pull request — waiting for checks"
          >
            Merge pull request
          </Button>
          <Text
            size="small"
            style={{ color: "var(--fgColor-muted)", textAlign: "center" }}
          >
            Waiting for status checks to pass before merging
          </Text>
        </Stack>
      )}
    </Stack>
  );
}
