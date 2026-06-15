"use client";

import { useState, useEffect } from "react";
import {
  Stack,
  Heading,
  Text,
  StateLabel,
  Label,
  CounterLabel,
  Flash,
  ProgressBar,
  Button,
  IconButton,
  FormControl,
  Select,
  TextInput,
  Textarea,
  Checkbox,
  BranchName,
  Spinner,
  useTheme,
} from "@primer/react";
import {
  GitMergeIcon,
  CheckCircleFillIcon,
  XCircleFillIcon,
  DotFillIcon,
  MoonIcon,
  SunIcon,
  GitPullRequestIcon,
} from "@primer/octicons-react";

type CheckStatus = "pending" | "running" | "passed" | "failed";
type MergeMethod = "merge" | "squash" | "rebase";
type PrState = "open" | "merged";

interface CiCheck {
  id: string;
  name: string;
  status: CheckStatus;
}

const INITIAL_CHECKS: CiCheck[] = [
  { id: "lint", name: "lint / eslint", status: "pending" },
  { id: "types", name: "build / typecheck", status: "pending" },
  { id: "unit", name: "test / unit (ubuntu)", status: "pending" },
  { id: "e2e", name: "test / e2e (chromium)", status: "pending" },
  { id: "deploy", name: "deploy / preview", status: "pending" },
  { id: "security", name: "security / snyk", status: "pending" },
];

const CHECK_RUN_MS = [600, 1200, 2100, 3100, 4300, 5500];
const CHECK_PASS_MS = [900, 1500, 2400, 3400, 4600, 5800];

function CheckIcon({ status }: { status: CheckStatus }) {
  if (status === "passed") {
    return (
      <CheckCircleFillIcon
        size={16}
        fill="var(--fgColor-success, var(--color-success-fg))"
      />
    );
  }
  if (status === "failed") {
    return (
      <XCircleFillIcon
        size={16}
        fill="var(--fgColor-danger, var(--color-danger-fg))"
      />
    );
  }
  if (status === "running") {
    return <Spinner size="small" srText={null} />;
  }
  return (
    <DotFillIcon
      size={16}
      fill="var(--fgColor-muted, var(--color-fg-muted))"
    />
  );
}

function ColorModeToggle() {
  const { colorMode, resolvedColorMode, setColorMode } = useTheme();

  const isDark =
    resolvedColorMode === "night" || resolvedColorMode === "dark";

  function toggle() {
    setColorMode(isDark ? "day" : "night");
  }

  return (
    <IconButton
      icon={isDark ? SunIcon : MoonIcon}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      data-testid="color-mode-toggle"
      onClick={toggle}
      variant="invisible"
      size="medium"
    />
  );
}

export function PrMergedTheater() {
  const [checks, setChecks] = useState<CiCheck[]>(() =>
    INITIAL_CHECKS.map((c) => ({ ...c }))
  );
  const [prState, setPrState] = useState<PrState>("open");
  const [mergeMethod, setMergeMethod] = useState<MergeMethod>("merge");
  const [commitHeadline, setCommitHeadline] = useState(
    "feat(api): add rate-limit headers to all endpoints (#42)"
  );
  const [commitBody, setCommitBody] = useState(
    "Adds X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset\nheaders to every API response so clients can back off gracefully."
  );
  const [deleteBranch, setDeleteBranch] = useState(true);
  const [branchDeleted, setBranchDeleted] = useState(false);
  const [merging, setMerging] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    INITIAL_CHECKS.forEach((check, i) => {
      const runAt = prefersReduced ? 0 : CHECK_RUN_MS[i];
      const passAt = prefersReduced ? 0 : CHECK_PASS_MS[i];

      if (!prefersReduced) {
        timers.push(
          setTimeout(() => {
            setChecks((prev) =>
              prev.map((c) =>
                c.id === check.id ? { ...c, status: "running" } : c
              )
            );
          }, runAt)
        );
      }

      timers.push(
        setTimeout(() => {
          setChecks((prev) =>
            prev.map((c) =>
              c.id === check.id ? { ...c, status: "passed" } : c
            )
          );
        }, passAt)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [prefersReduced]);

  const passedCount = checks.filter((c) => c.status === "passed").length;
  const allPassed = passedCount === checks.length;
  const progress = Math.round((passedCount / checks.length) * 100);

  async function handleMerge() {
    setMerging(true);
    await new Promise<void>((r) => setTimeout(r, 1200));
    setPrState("merged");
    setBranchDeleted(deleteBranch);
    setMerging(false);
  }

  const mergeLabel =
    mergeMethod === "merge"
      ? "Merge pull request"
      : mergeMethod === "squash"
      ? "Squash and merge"
      : "Rebase and merge";

  if (prState === "merged") {
    return (
      <div
        style={{
          maxWidth: 780,
          margin: "0 auto",
          padding: "40px 16px",
        }}
      >
        <Stack direction="vertical" gap="normal">
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <ColorModeToggle />
          </div>

          <Stack direction="horizontal" gap="normal" align="start">
            <StateLabel status="pullMerged">Merged</StateLabel>
            <Stack direction="vertical" gap="none">
              <Heading as="h1" variant="large">
                feat(api): add rate-limit headers to all endpoints
              </Heading>
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                <strong>alovelace</strong> merged commit{" "}
                <code
                  style={{
                    fontSize: "0.75em",
                    color: "var(--fgColor-muted)",
                  }}
                >
                  a1b2c3d
                </code>{" "}
                into <BranchName as="span">main</BranchName>
              </Text>
            </Stack>
          </Stack>

          <Flash variant="success" role="status" aria-live="polite">
            <Stack direction="horizontal" gap="condensed" align="center">
              <GitMergeIcon size={16} />
              <span>Pull request successfully merged and closed.</span>
            </Stack>
          </Flash>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 16,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "var(--borderColor-default)",
              borderRadius: 6,
            }}
          >
            {branchDeleted ? (
              <>
                <Text
                  size="small"
                  style={{
                    color: "var(--fgColor-muted)",
                    flexGrow: 1,
                  }}
                >
                  Branch{" "}
                  <BranchName as="span">feature/rate-limit-headers</BranchName>{" "}
                  was deleted.
                </Text>
                <Button size="small">Restore branch</Button>
              </>
            ) : (
              <>
                <Text
                  size="small"
                  style={{
                    color: "var(--fgColor-muted)",
                    flexGrow: 1,
                  }}
                >
                  Branch{" "}
                  <BranchName as="span">feature/rate-limit-headers</BranchName>{" "}
                  is still available.
                </Text>
                <Button size="small" variant="danger">
                  Delete branch
                </Button>
              </>
            )}
          </div>
        </Stack>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 780,
        margin: "0 auto",
        padding: "40px 16px",
      }}
    >
      <Stack direction="vertical" gap="normal">
        {/* Color mode toggle */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <ColorModeToggle />
        </div>

        {/* PR title + state */}
        <Stack direction="vertical" gap="condensed">
          <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
            <StateLabel status="pullOpened">Open</StateLabel>
            <Heading as="h1" variant="large">
              feat(api): add rate-limit headers to all endpoints{" "}
              <Text
                size="medium"
                weight="normal"
                style={{ color: "var(--fgColor-muted)" }}
              >
                #42
              </Text>
            </Heading>
          </Stack>

          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            <strong>alovelace</strong> wants to merge into{" "}
            <BranchName as="span">main</BranchName>
            {" from "}
            <BranchName as="span">feature/rate-limit-headers</BranchName>
          </Text>
        </Stack>

        {/* Labels + counters */}
        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          <Label variant="accent">api</Label>
          <Label variant="attention">needs-review</Label>
          <Label variant="done">enhancement</Label>

          <Stack
            direction="horizontal"
            gap="normal"
            style={{ marginLeft: 8 }}
          >
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              Commits <CounterLabel variant="primary">3</CounterLabel>
            </Text>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              Checks{" "}
              <CounterLabel variant="primary">{passedCount}</CounterLabel>
              <span style={{ color: "var(--fgColor-muted)" }}>
                /{checks.length}
              </span>
            </Text>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              Files changed <CounterLabel variant="primary">7</CounterLabel>
            </Text>
          </Stack>
        </Stack>

        {/* Merge box */}
        <div
          style={{
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "var(--borderColor-default)",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          {/* CI checks section */}
          <div
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomStyle: "solid",
              borderBottomColor: "var(--borderColor-default)",
            }}
          >
            <Stack direction="horizontal" gap="condensed" align="center">
              {!allPassed && passedCount > 0 && (
                <Spinner size="small" srText="Checks running" />
              )}
              {allPassed && (
                <CheckCircleFillIcon
                  size={16}
                  fill="var(--fgColor-success)"
                />
              )}
              {!allPassed && passedCount === 0 && (
                <DotFillIcon size={16} fill="var(--fgColor-muted)" />
              )}
              <Text size="small" weight="semibold">
                {allPassed
                  ? `All ${checks.length} checks passed`
                  : passedCount > 0
                  ? `${passedCount} / ${checks.length} checks passed`
                  : "Checks are waiting to run"}
              </Text>
            </Stack>

            <div style={{ marginTop: 12, marginBottom: 12 }}>
              <ProgressBar
                progress={progress}
                aria-label="CI checks progress"
                barSize="small"
                bg={allPassed ? "success.emphasis" : "accent.emphasis"}
              />
            </div>

            <Stack direction="vertical" gap="none">
              {checks.map((check) => (
                <div
                  key={check.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 8px",
                    borderRadius: 4,
                    backgroundColor:
                      check.status === "running"
                        ? "var(--bgColor-neutral-muted)"
                        : "transparent",
                    transition: prefersReduced
                      ? "none"
                      : "background-color 200ms ease",
                  }}
                >
                  <CheckIcon status={check.status} />
                  <code
                    style={{
                      fontSize: "0.8em",
                      color: "var(--fgColor-default)",
                      flexGrow: 1,
                    }}
                  >
                    {check.name}
                  </code>
                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    {check.status === "passed"
                      ? "Passed"
                      : check.status === "running"
                      ? "Running…"
                      : check.status === "failed"
                      ? "Failed"
                      : "Queued"}
                  </Text>
                </div>
              ))}
            </Stack>
          </div>

          {/* Ready flash */}
          {allPassed && (
            <Flash variant="success" role="status" aria-live="polite">
              <Stack direction="horizontal" gap="condensed" align="center">
                <CheckCircleFillIcon size={16} />
                <Text size="small" weight="semibold">
                  This branch has no conflicts with the base branch and all
                  checks have passed.
                </Text>
              </Stack>
            </Flash>
          )}

          {/* Merge form */}
          <div
            style={{ padding: 16 }}
            aria-disabled={!allPassed ? "true" : undefined}
          >
            <Stack direction="vertical" gap="normal">
              <FormControl disabled={!allPassed}>
                <FormControl.Label>Merge method</FormControl.Label>
                <Select
                  value={mergeMethod}
                  onChange={(e) =>
                    setMergeMethod(e.target.value as MergeMethod)
                  }
                  block
                >
                  <Select.Option value="merge">
                    Create a merge commit
                  </Select.Option>
                  <Select.Option value="squash">Squash and merge</Select.Option>
                  <Select.Option value="rebase">
                    Rebase and merge
                  </Select.Option>
                </Select>
              </FormControl>

              <FormControl disabled={!allPassed}>
                <FormControl.Label>Commit headline</FormControl.Label>
                <TextInput
                  value={commitHeadline}
                  onChange={(e) => setCommitHeadline(e.target.value)}
                  block
                />
              </FormControl>

              <FormControl disabled={!allPassed}>
                <FormControl.Label>
                  Extended description (optional)
                </FormControl.Label>
                <Textarea
                  value={commitBody}
                  onChange={(e) => setCommitBody(e.target.value)}
                  resize="vertical"
                  block
                  rows={3}
                />
              </FormControl>

              <FormControl disabled={!allPassed}>
                <Checkbox
                  checked={deleteBranch}
                  onChange={(e) => setDeleteBranch(e.target.checked)}
                />
                <FormControl.Label>Delete branch after merge</FormControl.Label>
              </FormControl>

              <Stack direction="vertical" gap="condensed">
                <div>
                  <Button
                    variant="primary"
                    leadingVisual={GitMergeIcon}
                    onClick={handleMerge}
                    disabled={!allPassed}
                    inactive={!allPassed}
                    loading={merging}
                    loadingAnnouncement={`${mergeLabel} in progress`}
                    aria-disabled={!allPassed}
                  >
                    {mergeLabel}
                  </Button>
                </div>

                {!allPassed && (
                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    Merging is blocked — waiting for all checks to pass.
                  </Text>
                )}
              </Stack>
            </Stack>
          </div>
        </div>
      </Stack>
    </div>
  );
}
