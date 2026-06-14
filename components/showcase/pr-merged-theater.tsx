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
  Stack,
  StateLabel,
  Text,
  Textarea,
  TextInput,
  useTheme,
} from "@primer/react";
import {
  CheckCircleFillIcon,
  DotFillIcon,
  GitBranchIcon,
  GitMergeIcon,
  MoonIcon,
  StackCheckIcon,
  SunIcon,
  SyncIcon,
  TrashIcon,
} from "@primer/octicons-react";

type CheckStatus = "pending" | "running" | "pass";
type Phase = "running" | "ready" | "merging" | "merged";
type MergeMethod = "merge" | "squash" | "rebase";
type BranchState = "deleted" | "active";

interface CiCheck {
  id: string;
  name: string;
  status: CheckStatus;
}

const INITIAL_CHECKS: CiCheck[] = [
  { id: "lint", name: "Code quality / eslint", status: "pending" },
  { id: "unit", name: "Unit tests (Node 20)", status: "pending" },
  { id: "typecheck", name: "Type checking (tsc)", status: "pending" },
  { id: "integration", name: "Integration tests (Postgres)", status: "pending" },
  { id: "build", name: "Build artifacts (production)", status: "pending" },
  { id: "preview", name: "Deploy preview (staging)", status: "pending" },
];

// [startRunningMs, passMs] from component mount
const CHECK_TIMING: [number, number][] = [
  [400, 900],
  [800, 1700],
  [1200, 2500],
  [1900, 3300],
  [2600, 4500],
  [3600, 6000],
];

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export default function PrMergedTheater() {
  const { setColorMode, resolvedColorMode } = useTheme();
  const [phase, setPhase] = useState<Phase>("running");
  const [checks, setChecks] = useState<CiCheck[]>(INITIAL_CHECKS);
  const [mergeMethod, setMergeMethod] = useState<MergeMethod>("merge");
  const [commitTitle, setCommitTitle] = useState(
    "feat(auth): add device trust verification on login"
  );
  const [commitDesc, setCommitDesc] = useState(
    "Adds a trust-this-device checkbox to the login flow.\nTrusted devices skip MFA for 30 days.\n\nCloses #847"
  );
  const [deleteBranch, setDeleteBranch] = useState(true);
  const [branchState, setBranchState] = useState<BranchState | null>(null);
  const reducedMotion = useReducedMotion();

  // Simulate check progression
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    CHECK_TIMING.forEach(([runAt, passAt], idx) => {
      timers.push(
        setTimeout(() => {
          setChecks((prev) =>
            prev.map((c, i): CiCheck =>
              i === idx ? { ...c, status: "running" } : c
            )
          );
        }, runAt)
      );
      timers.push(
        setTimeout(() => {
          setChecks((prev) => {
            const next: CiCheck[] = prev.map((c, i): CiCheck =>
              i === idx ? { ...c, status: "pass" } : c
            );
            if (next.every((c) => c.status === "pass")) {
              setPhase("ready");
            }
            return next;
          });
        }, passAt)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  const passCount = checks.filter((c) => c.status === "pass").length;
  const progressPercent = (passCount / checks.length) * 100;

  const mergeLabel = {
    merge: "Create a merge commit",
    squash: "Squash and merge",
    rebase: "Rebase and merge",
  }[mergeMethod];

  const handleMerge = useCallback(() => {
    if (phase !== "ready") return;
    setPhase("merging");
    const delay = reducedMotion ? 0 : 1500;
    setTimeout(() => {
      setPhase("merged");
      setBranchState(deleteBranch ? "deleted" : "active");
    }, delay);
  }, [phase, reducedMotion, deleteBranch]);

  const handleToggleColorMode = useCallback(() => {
    const next = resolvedColorMode === "night" ? "day" : "night";
    setColorMode(next);
    // Sync document root so headless tests can observe the resolved mode
    document.documentElement.setAttribute("data-color-mode", next);
  }, [resolvedColorMode, setColorMode]);

  const stateTransition = reducedMotion
    ? undefined
    : "var(--motion-transition-stateChange)";
  const enterTransition = reducedMotion
    ? undefined
    : "var(--motion-transition-enter)";

  const isDark = resolvedColorMode === "night";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bgColor-default)",
        color: "var(--fgColor-default)",
      }}
    >
      {/* Page header */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: `var(--base-size-16, 1rem) var(--base-size-24, 1.5rem)`,
        }}
      >
        <IconButton
          icon={isDark ? SunIcon : MoonIcon}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          variant="invisible"
          data-testid="color-mode-toggle"
          onClick={handleToggleColorMode}
        />
      </div>

      {/* Centered panel */}
      <div
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: `0 var(--base-size-16, 1rem) var(--base-size-32, 2rem)`,
        }}
      >
        <div
          style={{
            border: "1px solid var(--borderColor-default)",
            borderRadius: "var(--borderRadius-large, 12px)",
            backgroundColor: "var(--bgColor-default)",
            boxShadow: "var(--shadow-resting-medium)",
            overflow: "hidden",
          }}
        >
          {/* PR header section */}
          <div style={{ padding: `var(--base-size-24, 1.5rem)` }}>
            <Stack direction="vertical" gap="condensed">
              {/* State capsule */}
              <div style={{ transition: stateTransition }}>
                <StateLabel
                  status={phase === "merged" ? "pullMerged" : "pullOpened"}
                >
                  {phase === "merged" ? "Merged" : "Open"}
                </StateLabel>
              </div>

              {/* PR title */}
              <Heading as="h1" variant="medium">
                feat(auth): add device trust verification on login{" "}
                <Text
                  as="span"
                  size="medium"
                  weight="normal"
                  style={{ color: "var(--fgColor-muted)" }}
                >
                  #847
                </Text>
              </Heading>

              {/* Branch info */}
              <Stack
                direction="horizontal"
                gap="condensed"
                align="center"
                wrap="wrap"
              >
                <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                  <GitBranchIcon size={14} />
                </Text>
                <BranchName as="span">main</BranchName>
                <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                  ←
                </Text>
                <BranchName as="span">feat/device-trust-login</BranchName>
              </Stack>

              {/* Topic labels */}
              <Stack
                direction="horizontal"
                gap="condensed"
                align="center"
                wrap="wrap"
              >
                <Label variant="accent">security</Label>
                <Label variant="attention">authentication</Label>
                <Label variant="secondary">backend</Label>
              </Stack>

              {/* Count badges */}
              <Stack
                direction="horizontal"
                gap="normal"
                align="center"
                wrap="wrap"
              >
                <Stack direction="horizontal" gap="tight" align="center">
                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    commits
                  </Text>
                  <CounterLabel variant="secondary">4</CounterLabel>
                </Stack>
                <Stack direction="horizontal" gap="tight" align="center">
                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    checks
                  </Text>
                  <CounterLabel
                    variant={
                      passCount === checks.length ? "primary" : "secondary"
                    }
                  >
                    {passCount}/{checks.length}
                  </CounterLabel>
                </Stack>
                <Stack direction="horizontal" gap="tight" align="center">
                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    files changed
                  </Text>
                  <CounterLabel variant="secondary">12</CounterLabel>
                </Stack>
              </Stack>
            </Stack>
          </div>

          <div
            style={{ borderTop: "1px solid var(--borderColor-muted)" }}
            role="separator"
          />

          {/* CI checks section */}
          <div style={{ padding: `var(--base-size-24, 1.5rem)` }}>
            <Stack direction="vertical" gap="normal">
              <Heading as="h2" variant="small">
                Checks
              </Heading>

              <ProgressBar
                progress={progressPercent}
                animated={!reducedMotion}
                bg="success.emphasis"
                aria-label={`${passCount} of ${checks.length} checks passing`}
              />

              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--base-size-8, 0.5rem)",
                }}
              >
                {checks.map((check) => (
                  <li key={check.id}>
                    <Stack
                      direction="horizontal"
                      align="center"
                      justify="space-between"
                    >
                      <Stack
                        direction="horizontal"
                        gap="condensed"
                        align="center"
                      >
                        {check.status === "pass" && (
                          <span style={{ color: "var(--fgColor-success)", transition: stateTransition, display: "flex" }}>
                            <CheckCircleFillIcon size={16} />
                          </span>
                        )}
                        {check.status === "running" && (
                          <span
                            className="spin-icon"
                            style={{
                              color: "var(--fgColor-attention)",
                              animation: "spin var(--motion-duration-long) linear infinite",
                              display: "flex",
                            }}
                          >
                            <SyncIcon size={16} />
                          </span>
                        )}
                        {check.status === "pending" && (
                          <span style={{ color: "var(--fgColor-muted)", display: "flex" }}>
                            <DotFillIcon size={16} />
                          </span>
                        )}
                        <Text size="small">{check.name}</Text>
                      </Stack>
                      <Text
                        size="small"
                        style={{ color: "var(--fgColor-muted)" }}
                      >
                        {check.status === "pass"
                          ? "Passed"
                          : check.status === "running"
                            ? "Running…"
                            : "Queued"}
                      </Text>
                    </Stack>
                  </li>
                ))}
              </ul>

              {/* Ready flash */}
              {phase !== "running" && (
                <div style={{ transition: enterTransition }}>
                  <Flash
                    variant="success"
                    role="status"
                    aria-live="polite"
                  >
                    <Stack
                      direction="horizontal"
                      gap="condensed"
                      align="center"
                    >
                      <StackCheckIcon size={16} />
                      All checks passed — ready to merge
                    </Stack>
                  </Flash>
                </div>
              )}
            </Stack>
          </div>

          {/* Merge box */}
          {(phase === "ready" || phase === "merging") && (
            <>
              <div
                style={{ borderTop: "1px solid var(--borderColor-muted)" }}
                role="separator"
              />
              <div style={{ padding: `var(--base-size-24, 1.5rem)` }}>
                <Stack direction="vertical" gap="normal">
                  <Heading as="h2" variant="small">
                    Merge pull request
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
                  </FormControl>

                  <FormControl>
                    <FormControl.Label>Commit title</FormControl.Label>
                    <TextInput
                      value={commitTitle}
                      onChange={(e) => setCommitTitle(e.target.value)}
                      block
                    />
                  </FormControl>

                  <FormControl>
                    <FormControl.Label>Commit description</FormControl.Label>
                    <Textarea
                      value={commitDesc}
                      onChange={(e) => setCommitDesc(e.target.value)}
                      resize="vertical"
                      rows={4}
                      block
                    />
                  </FormControl>

                  <FormControl>
                    <Checkbox
                      checked={deleteBranch}
                      onChange={(e) => setDeleteBranch(e.target.checked)}
                    />
                    <FormControl.Label>Delete branch after merge</FormControl.Label>
                    <FormControl.Caption>
                      Removes{" "}
                      <BranchName as="span">feat/device-trust-login</BranchName>{" "}
                      after merging
                    </FormControl.Caption>
                  </FormControl>

                  <Stack direction="horizontal" justify="end">
                    <Button
                      variant="primary"
                      leadingVisual={GitMergeIcon}
                      loading={phase === "merging"}
                      loadingAnnouncement="Merging pull request"
                      onClick={handleMerge}
                    >
                      {mergeLabel}
                    </Button>
                  </Stack>
                </Stack>
              </div>
            </>
          )}

          {/* Merged confirmation */}
          {phase === "merged" && (
            <>
              <div
                style={{ borderTop: "1px solid var(--borderColor-muted)" }}
                role="separator"
              />
              <div style={{ padding: `var(--base-size-24, 1.5rem)` }}>
                <Stack direction="vertical" gap="normal">
                  <Stack
                    direction="horizontal"
                    gap="condensed"
                    align="center"
                  >
                    <span style={{ color: "var(--fgColor-done)", display: "flex" }}>
                      <GitMergeIcon size={16} />
                    </span>
                    <Text weight="semibold">
                      Pull request successfully merged and closed
                    </Text>
                  </Stack>

                  {branchState === "deleted" && (
                    <Stack
                      direction="horizontal"
                      gap="condensed"
                      align="center"
                      wrap="wrap"
                    >
                      <Text
                        size="small"
                        style={{ color: "var(--fgColor-muted)" }}
                      >
                        Branch{" "}
                        <BranchName as="span">feat/device-trust-login</BranchName>{" "}
                        was deleted.
                      </Text>
                      <Button
                        size="small"
                        variant="default"
                        leadingVisual={GitBranchIcon}
                        onClick={() => setBranchState("active")}
                      >
                        Restore branch
                      </Button>
                    </Stack>
                  )}

                  {branchState === "active" && (
                    <Stack
                      direction="horizontal"
                      gap="condensed"
                      align="center"
                      wrap="wrap"
                    >
                      <Text
                        size="small"
                        style={{ color: "var(--fgColor-muted)" }}
                      >
                        Branch{" "}
                        <BranchName as="span">feat/device-trust-login</BranchName>{" "}
                        is still active.
                      </Text>
                      <Button
                        size="small"
                        variant="danger"
                        leadingVisual={TrashIcon}
                        onClick={() => setBranchState("deleted")}
                      >
                        Delete branch
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
