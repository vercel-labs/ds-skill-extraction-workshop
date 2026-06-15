"use client";

import { useEffect, useRef, useState } from "react";
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
  DotFillIcon,
  GitBranchIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  HistoryIcon,
  MoonIcon,
  ShieldCheckIcon,
  StopwatchIcon,
  SunIcon,
  TrashIcon,
  WorkflowIcon,
} from "@primer/octicons-react";

type CheckStatus = "pending" | "running" | "passed";
type MergeMethod = "merge" | "squash" | "rebase";

const CI_CHECKS: { id: string; name: string; Icon: typeof WorkflowIcon }[] = [
  { id: "build", name: "CI / build", Icon: WorkflowIcon },
  { id: "test-unit", name: "CI / test:unit", Icon: WorkflowIcon },
  { id: "test-integration", name: "CI / test:integration", Icon: WorkflowIcon },
  { id: "lint", name: "CI / lint", Icon: WorkflowIcon },
  { id: "e2e", name: "CI / e2e", Icon: WorkflowIcon },
  { id: "security", name: "Security scan", Icon: ShieldCheckIcon },
  { id: "deploy-preview", name: "Deploy preview", Icon: GitBranchIcon },
  { id: "coverage", name: "Coverage gate", Icon: StopwatchIcon },
];

const RESOLVE_INTERVAL_MS = 700;

export function PRMergedTheater() {
  const { setColorMode, resolvedColorMode } = useTheme();
  const isDark = resolvedColorMode === "night";

  const [checkStatuses, setCheckStatuses] = useState<
    Record<string, CheckStatus>
  >(() => Object.fromEntries(CI_CHECKS.map((c) => [c.id, "pending"])));
  const [checksComplete, setChecksComplete] = useState(false);

  const [prMerged, setPrMerged] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeMethod, setMergeMethod] = useState<MergeMethod>("merge");
  const [commitHeadline, setCommitHeadline] = useState(
    "feat: add dark-mode toggle to pull-request panel (#42)"
  );
  const [commitBody, setCommitBody] = useState("");
  const [deleteBranch, setDeleteBranch] = useState(true);
  const [branchDeleted, setBranchDeleted] = useState(false);

  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  useEffect(() => {
    const ids = CI_CHECKS.map((c) => c.id);
    const timers: ReturnType<typeof setTimeout>[] = [];

    ids.forEach((id, i) => {
      timers.push(
        setTimeout(() => {
          setCheckStatuses((prev) => ({ ...prev, [id]: "running" }));
        }, i * RESOLVE_INTERVAL_MS),
        setTimeout(() => {
          setCheckStatuses((prev) => ({ ...prev, [id]: "passed" }));
          if (i === ids.length - 1) setChecksComplete(true);
        }, (i + 1) * RESOLVE_INTERVAL_MS - 50)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const passedCount = Object.values(checkStatuses).filter(
    (s) => s === "passed"
  ).length;
  const progressPercent = Math.round((passedCount / CI_CHECKS.length) * 100);

  function handleToggleColorMode() {
    const next = isDark ? "day" : "night";
    setColorMode(next);
    document.documentElement.setAttribute(
      "data-color-mode",
      next === "night" ? "dark" : "light"
    );
  }

  function handleMerge() {
    setIsMerging(true);
    setTimeout(
      () => {
        setIsMerging(false);
        setPrMerged(true);
        if (deleteBranch) setBranchDeleted(true);
      },
      reducedMotion.current ? 0 : 900
    );
  }

  const mergeButtonLabel =
    mergeMethod === "squash"
      ? "Squash and merge"
      : mergeMethod === "rebase"
        ? "Rebase and merge"
        : "Merge pull request";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bgColor-default)",
        padding: "var(--base-size-24)",
      }}
    >
      <div style={{ maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>

        {/* Page toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--base-size-24)",
          }}
        >
          <Stack direction="horizontal" align="center" gap="condensed">
            <GitPullRequestIcon
              size={20}
              fill="var(--fgColor-muted)"
            />
            <Text
              size="small"
              style={{
                color: "var(--fgColor-muted)",
                fontFamily: "var(--fontStack-monospace)",
              }}
            >
              axelight / radiance
            </Text>
          </Stack>
          <IconButton
            icon={isDark ? SunIcon : MoonIcon}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            variant="invisible"
            size="medium"
            data-testid="color-mode-toggle"
            onClick={handleToggleColorMode}
          />
        </div>

        {/* PR title and state capsule */}
        <Stack direction="horizontal" align="start" gap="normal" style={{ marginBottom: "var(--base-size-8)" }}>
          <div style={{ flexShrink: 0, paddingTop: 2 }}>
            <StateLabel
              status={prMerged ? "pullMerged" : "pullOpened"}
              size="small"
            >
              {prMerged ? "Merged" : "Open"}
            </StateLabel>
          </div>
          <div>
            <Heading as="h1" variant="large">
              Add dark-mode toggle with system-preference detection
            </Heading>
            <div style={{ marginTop: "var(--base-size-4)" }}>
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                #42{" "}
              </Text>
              <BranchName as="span">feature/dark-mode-toggle</BranchName>
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                {" → "}
              </Text>
              <BranchName as="span">main</BranchName>
            </div>
          </div>
        </Stack>

        {/* Metadata row: topic labels + counters */}
        <Stack
          direction="horizontal"
          align="center"
          gap="condensed"
          wrap="wrap"
          style={{ marginBottom: "var(--base-size-24)" }}
        >
          <Label variant="accent">design-system</Label>
          <Label variant="done">accessibility</Label>
          <Label variant="attention">dx</Label>
          <div
            style={{
              width: 1,
              height: 16,
              backgroundColor: "var(--borderColor-default)",
              margin: "0 var(--base-size-4)",
            }}
          />
          <Stack direction="horizontal" align="center" gap="tight">
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              Commits
            </Text>
            <CounterLabel variant="primary">3</CounterLabel>
          </Stack>
          <Stack direction="horizontal" align="center" gap="tight">
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              Checks
            </Text>
            <CounterLabel variant={checksComplete ? "primary" : "secondary"}>
              {passedCount}/{CI_CHECKS.length}
            </CounterLabel>
          </Stack>
          <Stack direction="horizontal" align="center" gap="tight">
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              Files
            </Text>
            <CounterLabel variant="primary">7</CounterLabel>
          </Stack>
        </Stack>

        {/* Main body */}
        <Stack direction="vertical" gap="normal">

          {/* CI check wall — hidden after merge */}
          {!prMerged && (
            <div
              style={{
                border: "1px solid var(--borderColor-default)",
                borderRadius: "var(--borderRadius-medium)",
                overflow: "hidden",
              }}
            >
              {/* Check wall header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "var(--bgColor-subtle)",
                  padding: "var(--base-size-12) var(--base-size-16)",
                  borderBottom: "1px solid var(--borderColor-default)",
                }}
              >
                <Text size="small" weight="semibold">
                  {checksComplete
                    ? "All checks passed"
                    : `${passedCount} / ${CI_CHECKS.length} checks passing`}
                </Text>
                {!checksComplete && <Spinner size="small" srText={null} />}
              </div>

              {/* Progress bar */}
              <div
                style={{
                  padding: "var(--base-size-8) var(--base-size-16)",
                  borderBottom: "1px solid var(--borderColor-default)",
                  backgroundColor: "var(--bgColor-subtle)",
                }}
              >
                <ProgressBar
                  progress={progressPercent}
                  bg={checksComplete ? "success.emphasis" : "accent.emphasis"}
                  animated={!reducedMotion.current}
                  barSize="small"
                  aria-label="CI checks progress"
                />
              </div>

              {/* Individual checks */}
              {CI_CHECKS.map(({ id, name, Icon }, i) => {
                const status = checkStatuses[id];
                return (
                  <div
                    key={id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--base-size-8)",
                      padding: "10px var(--base-size-16)",
                      borderBottom:
                        i < CI_CHECKS.length - 1
                          ? "1px solid var(--borderColor-muted)"
                          : undefined,
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {status === "passed" && (
                        <CheckCircleFillIcon
                          size={16}
                          fill="var(--fgColor-success)"
                        />
                      )}
                      {status === "running" && (
                        <Spinner size="small" srText={null} />
                      )}
                      {status === "pending" && (
                        <DotFillIcon
                          size={16}
                          fill="var(--fgColor-muted)"
                        />
                      )}
                    </div>
                    <Icon size={16} fill="var(--fgColor-muted)" />
                    <Text
                      size="small"
                      style={{
                        fontFamily: "var(--fontStack-monospace)",
                        color:
                          status === "passed"
                            ? "var(--fgColor-default)"
                            : "var(--fgColor-muted)",
                        flexGrow: 1,
                      }}
                    >
                      {name}
                    </Text>
                    <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                      {status === "passed"
                        ? "Passed"
                        : status === "running"
                          ? "In progress"
                          : "Queued"}
                    </Text>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ready banner */}
          {checksComplete && !prMerged && (
            <Flash variant="success" role="status" aria-live="polite">
              <Stack direction="horizontal" align="center" gap="condensed">
                <CheckCircleFillIcon size={16} fill="currentColor" />
                <span>All checks passed — this branch is ready to merge.</span>
              </Stack>
            </Flash>
          )}

          {/* Merge box */}
          {!prMerged && (
            <div
              style={{
                border: `1px solid ${checksComplete ? "var(--borderColor-success)" : "var(--borderColor-default)"}`,
                borderRadius: "var(--borderRadius-medium)",
                overflow: "hidden",
                opacity: checksComplete ? 1 : 0.65,
                transition: reducedMotion.current
                  ? undefined
                  : "opacity var(--animation-duration-fast) var(--animation-easing-default), border-color var(--animation-duration-fast) var(--animation-easing-default)",
              }}
            >
              <div
                style={{
                  backgroundColor: "var(--bgColor-subtle)",
                  padding: "var(--base-size-12) var(--base-size-16)",
                  borderBottom: "1px solid var(--borderColor-default)",
                }}
              >
                <Heading as="h2" variant="small">
                  Merge pull request
                </Heading>
              </div>

              <div style={{ padding: "var(--base-size-16)" }}>
                <Stack direction="vertical" gap="normal">
                  <FormControl>
                    <FormControl.Label>Merge method</FormControl.Label>
                    <Select
                      value={mergeMethod}
                      onChange={(e) =>
                        setMergeMethod(e.target.value as MergeMethod)
                      }
                      disabled={!checksComplete}
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
                    <FormControl.Label>Commit headline</FormControl.Label>
                    <TextInput
                      value={commitHeadline}
                      onChange={(e) => setCommitHeadline(e.target.value)}
                      disabled={!checksComplete}
                      block
                    />
                  </FormControl>

                  <FormControl>
                    <FormControl.Label>Extended description</FormControl.Label>
                    <Textarea
                      value={commitBody}
                      onChange={(e) => setCommitBody(e.target.value)}
                      disabled={!checksComplete}
                      placeholder="Add an optional extended description…"
                      resize="vertical"
                      block
                    />
                  </FormControl>

                  <FormControl layout="horizontal">
                    <Checkbox
                      checked={deleteBranch}
                      onChange={(e) => setDeleteBranch(e.target.checked)}
                      disabled={!checksComplete}
                    />
                    <FormControl.Label>
                      Delete branch after merge
                    </FormControl.Label>
                    <FormControl.Caption>
                      feature/dark-mode-toggle will be removed after merging.
                    </FormControl.Caption>
                  </FormControl>

                  <Button
                    variant="primary"
                    leadingVisual={GitMergeIcon}
                    inactive={!checksComplete}
                    loading={isMerging}
                    loadingAnnouncement="Merging pull request"
                    onClick={checksComplete ? handleMerge : undefined}
                  >
                    {mergeButtonLabel}
                  </Button>
                </Stack>
              </div>
            </div>
          )}

          {/* Post-merge confirmation */}
          {prMerged && (
            <div
              style={{
                border: "1px solid var(--borderColor-default)",
                borderRadius: "var(--borderRadius-medium)",
                padding: "var(--base-size-24)",
                textAlign: "center",
              }}
            >
              <Stack direction="vertical" align="center" gap="normal">
                <StateLabel status="pullMerged">Merged</StateLabel>
                <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                  Pull request #42 was merged into{" "}
                  <BranchName as="span">main</BranchName>
                </Text>

                {branchDeleted ? (
                  <Stack direction="horizontal" align="center" gap="condensed">
                    <TrashIcon size={16} fill="var(--fgColor-muted)" />
                    <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                      Branch{" "}
                      <BranchName as="span">feature/dark-mode-toggle</BranchName>{" "}
                      was deleted.
                    </Text>
                    <Button
                      variant="invisible"
                      leadingVisual={HistoryIcon}
                      size="small"
                      onClick={() => setBranchDeleted(false)}
                    >
                      Restore branch
                    </Button>
                  </Stack>
                ) : (
                  <Button
                    variant="default"
                    leadingVisual={TrashIcon}
                    size="small"
                    onClick={() => setBranchDeleted(true)}
                  >
                    Delete branch
                  </Button>
                )}
              </Stack>
            </div>
          )}

        </Stack>
      </div>
    </div>
  );
}
