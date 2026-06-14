"use client";

import { useEffect, useState } from "react";
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
  Timeline,
  useTheme,
} from "@primer/react";
import {
  BeakerIcon,
  ChecklistIcon,
  CheckCircleFillIcon,
  CheckIcon,
  CodescanIcon,
  FileDiffIcon,
  GitBranchIcon,
  GitCommitIcon,
  GitMergeIcon,
  MoonIcon,
  PackageIcon,
  RocketIcon,
  ShieldCheckIcon,
  SunIcon,
  TrashIcon,
  UndoIcon,
  type Icon,
} from "@primer/octicons-react";

/* ---------------------------------------------------------------------------
   Invented PR data — fictional repo / author / branches / check names.
--------------------------------------------------------------------------- */
const PR = {
  number: 2487,
  title: "Add merge-method picker and live check theater",
  author: "lila-okonkwo",
  base: "main",
  head: "feat/merge-theater",
  commits: 8,
  filesChanged: 14,
  topics: ["design-system", "frontend", "motion"],
  reviewers: ["marcus-vu", "priya-nair"],
} as const;

type CheckDef = { id: string; name: string; context: string; icon: Icon };

const CHECKS: CheckDef[] = [
  { id: "lint", name: "lint / eslint + prettier", context: "Static analysis", icon: CodescanIcon },
  { id: "unit", name: "test / unit", context: "aurora-ui · node 20", icon: BeakerIcon },
  { id: "integration", name: "test / integration", context: "aurora-ui · node 20", icon: ChecklistIcon },
  { id: "build", name: "build / production bundle", context: "next · turbopack", icon: PackageIcon },
  { id: "security", name: "security / dependency audit", context: "advisory database", icon: ShieldCheckIcon },
  { id: "preview", name: "deploy / preview", context: "aurora-ui.preview.app", icon: RocketIcon },
];

const TOTAL = CHECKS.length;

// Simulation cadence: one check resolves per tick so the row "watches the
// dominoes fall" over ~6s. This is logic timing for the requested client-side
// simulation, not a visual transition (those read their duration/easing from
// the Primer motion tokens via the CSS classes in globals.css).
const CHECK_INTERVAL_MS = 950;

type MergeMethod = "merge" | "squash" | "rebase";

const MERGE_METHOD: Record<MergeMethod, { primaryLabel: string; icon: Icon }> = {
  merge: { primaryLabel: "Merge pull request", icon: GitMergeIcon },
  squash: { primaryLabel: "Squash and merge", icon: GitCommitIcon },
  rebase: { primaryLabel: "Rebase and merge", icon: GitBranchIcon },
};

function Divider() {
  return (
    <div
      role="presentation"
      style={{ borderTop: "1px solid var(--borderColor-muted)" }}
    />
  );
}

function CountChip({ icon: ChipIcon, label, value, live }: {
  icon: Icon;
  label: string;
  value: number;
  live?: boolean;
}) {
  return (
    <Stack direction="horizontal" gap="condensed" align="center">
      <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
        <ChipIcon size={16} aria-hidden />
      </span>
      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
        {label}
      </Text>
      <CounterLabel
        style={live ? { fontVariantNumeric: "tabular-nums" } : undefined}
      >
        {value}
      </CounterLabel>
    </Stack>
  );
}

export function PrMergedTheater() {
  const { resolvedColorMode, setColorMode } = useTheme();

  // Color-mode toggle — driven through the design system's own mechanism
  // (`useTheme().setColorMode`). The resolved mode is mirrored onto the
  // document root so the page background (not just the card) recolors and a
  // headless test can read the flip off <html data-color-mode>.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark =
    mounted && (resolvedColorMode === "dark" || resolvedColorMode === "night");

  useEffect(() => {
    if (!resolvedColorMode) return;
    const normalized =
      resolvedColorMode === "dark" || resolvedColorMode === "night"
        ? "dark"
        : "light";
    document.documentElement.setAttribute("data-color-mode", normalized);
  }, [resolvedColorMode]);

  const toggleColorMode = () => setColorMode(isDark ? "light" : "dark");

  // Check progression.
  const [resolved, setResolved] = useState(0);
  useEffect(() => {
    const timers = CHECKS.map((_, i) =>
      setTimeout(() => setResolved(i + 1), CHECK_INTERVAL_MS * (i + 1)),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const allPassed = resolved >= TOTAL;
  const progress = Math.round((resolved / TOTAL) * 100);

  // Merge box state.
  const [merged, setMerged] = useState(false);
  const [mergeMethod, setMergeMethod] = useState<MergeMethod>("merge");
  const [headline, setHeadline] = useState(`${PR.title} (#${PR.number})`);
  const [description, setDescription] = useState("");
  const [deleteBranchChecked, setDeleteBranchChecked] = useState(true);
  const [branchDeleted, setBranchDeleted] = useState(false);

  const phase: "running" | "ready" | "merged" = merged
    ? "merged"
    : allPassed
      ? "ready"
      : "running";

  const handleMerge = () => {
    setBranchDeleted(deleteBranchChecked);
    setMerged(true);
  };

  const method = MERGE_METHOD[mergeMethod];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bgColor-muted)",
        padding: "var(--base-size-32, 2rem) var(--base-size-16, 1rem)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <main style={{ width: "100%", maxWidth: 896 }}>
        <Stack direction="vertical" gap="normal">
          {/* ---- Header: state + title + color-mode toggle ---- */}
          <Stack direction="vertical" gap="normal">
            <Stack
              direction="horizontal"
              gap="normal"
              align="start"
              justify="space-between"
              wrap="nowrap"
            >
              <Stack direction="vertical" gap="condensed">
                <Stack
                  direction="horizontal"
                  gap="condensed"
                  align="center"
                  wrap="wrap"
                >
                  <StateLabel
                    status={phase === "merged" ? "pullMerged" : "pullOpened"}
                    className={phase === "merged" ? "prTheater-flip" : undefined}
                  >
                    {phase === "merged" ? "Merged" : "Open"}
                  </StateLabel>
                  <Heading as="h1" variant="large">
                    {PR.title}{" "}
                    <Text
                      as="span"
                      weight="normal"
                      style={{ color: "var(--fgColor-muted)" }}
                    >
                      #{PR.number}
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
                    {PR.author} wants to merge {PR.commits} commits into
                  </Text>
                  <BranchName as="span">{PR.base}</BranchName>
                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    from
                  </Text>
                  <BranchName as="span">{PR.head}</BranchName>
                </Stack>
              </Stack>

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

            {/* ---- Topic labels + running counts ---- */}
            <Stack
              direction="horizontal"
              gap="normal"
              align="center"
              justify="space-between"
              wrap="wrap"
            >
              <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
                {PR.topics.map((topic) => (
                  <Label key={topic} variant="accent">
                    {topic}
                  </Label>
                ))}
              </Stack>
              <Stack direction="horizontal" gap="normal" align="center" wrap="wrap">
                <CountChip icon={GitCommitIcon} label="Commits" value={PR.commits} />
                <CountChip icon={CheckIcon} label="Checks" value={resolved} live />
                <CountChip icon={FileDiffIcon} label="Files" value={PR.filesChanged} />
              </Stack>
            </Stack>
          </Stack>

          {/* ---- The merge box ---- */}
          <div
            style={{
              backgroundColor: "var(--bgColor-default)",
              border: "1px solid var(--borderColor-default)",
              borderRadius: "var(--borderRadius-large, 12px)",
              boxShadow: "var(--shadow-resting-medium)",
              padding: "var(--base-size-24, 1.5rem)",
            }}
          >
            <Stack direction="vertical" gap="normal">
              {/* Reviews summary */}
              <Stack direction="horizontal" gap="condensed" align="center">
                <span style={{ color: "var(--fgColor-success)", display: "inline-flex" }}>
                  <CheckCircleFillIcon size={16} aria-hidden />
                </span>
                <Stack direction="vertical" gap="none">
                  <Text size="small" weight="semibold">
                    {PR.reviewers.length} approving reviews
                  </Text>
                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    Reviewed by {PR.reviewers.join(" and ")}
                  </Text>
                </Stack>
              </Stack>

              <Divider />

              {/* Checks header + progress + wall */}
              <Stack direction="vertical" gap="condensed">
                <Stack
                  direction="horizontal"
                  gap="condensed"
                  align="center"
                  justify="space-between"
                >
                  <Stack direction="horizontal" gap="condensed" align="center">
                    <Heading as="h2" variant="small">
                      Checks
                    </Heading>
                    <CounterLabel>{TOTAL}</CounterLabel>
                  </Stack>
                  <Text
                    size="small"
                    style={{
                      color: "var(--fgColor-muted)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {resolved} of {TOTAL} successful
                  </Text>
                </Stack>

                <ProgressBar
                  progress={progress}
                  bg="success.emphasis"
                  barSize="small"
                  animated={!allPassed}
                  aria-label={`Checks progress: ${resolved} of ${TOTAL} passed`}
                />

                <Timeline>
                  {CHECKS.map((check, i) => {
                    const passed = i < resolved;
                    const ToolIcon = check.icon;
                    return (
                      <Timeline.Item
                        key={check.id}
                        className={passed ? "prTheater-beat" : undefined}
                      >
                        <Timeline.Badge variant={passed ? "success" : undefined}>
                          {passed ? (
                            <CheckIcon size={16} aria-hidden />
                          ) : (
                            <Spinner size="small" srText={null} />
                          )}
                        </Timeline.Badge>
                        <Timeline.Body>
                          <Stack
                            direction="horizontal"
                            gap="condensed"
                            align="center"
                            justify="space-between"
                          >
                            <Stack
                              direction="horizontal"
                              gap="condensed"
                              align="center"
                            >
                              <span
                                style={{
                                  color: "var(--fgColor-muted)",
                                  display: "inline-flex",
                                }}
                              >
                                <ToolIcon size={16} aria-hidden />
                              </span>
                              <Stack direction="vertical" gap="none">
                                <Text size="small" weight="semibold">
                                  {check.name}
                                </Text>
                                <Text
                                  size="small"
                                  style={{ color: "var(--fgColor-muted)" }}
                                >
                                  {check.context}
                                </Text>
                              </Stack>
                            </Stack>
                            <Text
                              size="small"
                              weight={passed ? "semibold" : "normal"}
                              style={{
                                color: passed
                                  ? "var(--fgColor-success)"
                                  : "var(--fgColor-muted)",
                              }}
                            >
                              {passed ? "Successful" : "In progress…"}
                            </Text>
                          </Stack>
                        </Timeline.Body>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
              </Stack>

              <Divider />

              {/* Merge controls — one of three states */}
              {phase === "running" && (
                <Stack direction="vertical" gap="condensed">
                  <Stack direction="horizontal" gap="condensed" align="center">
                    <Spinner size="small" srText={null} />
                    <Stack direction="vertical" gap="none">
                      <Text weight="semibold">Checks haven&apos;t finished yet</Text>
                      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                        Merging unlocks automatically once every required check
                        passes.
                      </Text>
                    </Stack>
                  </Stack>
                  <div>
                    <Button
                      variant="primary"
                      leadingVisual={GitMergeIcon}
                      disabled
                    >
                      Merge pull request
                    </Button>
                  </div>
                </Stack>
              )}

              {phase === "ready" && (
                <Stack direction="vertical" gap="normal" className="prTheater-reveal">
                  <Flash variant="success" role="status">
                    <Stack direction="horizontal" gap="condensed" align="center">
                      <CheckCircleFillIcon size={16} aria-hidden />
                      <Text weight="semibold">All checks have passed</Text>
                      <Text size="small">
                        This branch has no conflicts with {PR.base}.
                      </Text>
                    </Stack>
                  </Flash>

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
                    <FormControl.Caption>
                      Choose how the commits from {PR.head} are added to{" "}
                      {PR.base}.
                    </FormControl.Caption>
                  </FormControl>

                  <FormControl>
                    <FormControl.Label>Commit message</FormControl.Label>
                    <TextInput
                      block
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                    />
                  </FormControl>

                  <FormControl>
                    <FormControl.Label>Extended description</FormControl.Label>
                    <Textarea
                      block
                      resize="vertical"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add an optional extended description…"
                    />
                  </FormControl>

                  <FormControl>
                    <Checkbox
                      checked={deleteBranchChecked}
                      onChange={(e) => setDeleteBranchChecked(e.target.checked)}
                    />
                    <FormControl.Label>
                      Delete branch after merge
                    </FormControl.Label>
                    <FormControl.Caption>
                      Removes {PR.head} once the merge completes.
                    </FormControl.Caption>
                  </FormControl>

                  <div>
                    <Button
                      variant="primary"
                      leadingVisual={method.icon}
                      onClick={handleMerge}
                    >
                      {method.primaryLabel}
                    </Button>
                  </div>
                </Stack>
              )}

              {phase === "merged" && (
                <Stack direction="vertical" gap="normal" className="prTheater-reveal">
                  <Stack direction="horizontal" gap="condensed" align="center">
                    <span style={{ color: "var(--fgColor-done)", display: "inline-flex" }}>
                      <GitMergeIcon size={24} aria-hidden />
                    </span>
                    <Stack direction="vertical" gap="none">
                      <Text weight="semibold">
                        Pull request successfully merged and closed
                      </Text>
                      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                        {PR.author} merged {PR.commits} commits into {PR.base}{" "}
                        from {PR.head}.
                      </Text>
                    </Stack>
                  </Stack>

                  <Divider />

                  <Stack
                    direction="horizontal"
                    gap="normal"
                    align="center"
                    justify="space-between"
                    wrap="wrap"
                  >
                    {branchDeleted ? (
                      <>
                        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                          The <BranchName as="span">{PR.head}</BranchName> branch
                          was deleted.
                        </Text>
                        <Button
                          variant="default"
                          leadingVisual={UndoIcon}
                          onClick={() => setBranchDeleted(false)}
                        >
                          Restore branch
                        </Button>
                      </>
                    ) : (
                      <>
                        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                          You can safely delete the{" "}
                          <BranchName as="span">{PR.head}</BranchName> branch now.
                        </Text>
                        <Button
                          variant="danger"
                          leadingVisual={TrashIcon}
                          onClick={() => setBranchDeleted(true)}
                        >
                          Delete branch
                        </Button>
                      </>
                    )}
                  </Stack>
                </Stack>
              )}
            </Stack>
          </div>
        </Stack>
      </main>
    </div>
  );
}
