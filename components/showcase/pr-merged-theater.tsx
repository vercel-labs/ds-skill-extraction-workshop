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
  StateLabel,
  Stack,
  Text,
  Textarea,
  TextInput,
  Timeline,
  useTheme,
} from "@primer/react";
import {
  CheckCircleFillIcon,
  CheckIcon,
  FileDiffIcon,
  GitBranchIcon,
  GitCommitIcon,
  GitMergeIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
  type Icon,
} from "@primer/octicons-react";

import styles from "./pr-merged-theater.module.css";

/* ---------------------------------------------------------------------------
 * Invented data — fictional repo, branches, people, labels, and check names.
 * ------------------------------------------------------------------------- */

const PR = {
  repo: "lumenfox/aurora-deck",
  number: 482,
  title: "Stream incremental hydration for the deck renderer",
  author: "marlowe-quill",
  base: "main",
  head: "feat/incremental-hydration",
  commits: 7,
  filesChanged: 14,
  topics: [
    { name: "renderer", variant: "accent" as const },
    { name: "performance", variant: "done" as const },
  ],
  reviewers: [
    { handle: "indira-sol", note: "approved these changes" },
    { handle: "bex-ortega", note: "approved these changes" },
  ],
};

type CheckStatus = "running" | "passed";

type Check = {
  id: string;
  name: string;
  context: string;
  status: CheckStatus;
};

const INITIAL_CHECKS: Check[] = [
  { id: "lint", name: "lint", context: "eslint · 2 workflows", status: "running" },
  { id: "types", name: "typecheck", context: "tsc --noEmit", status: "running" },
  { id: "unit", name: "unit", context: "renderer suite", status: "running" },
  { id: "build", name: "build", context: "web · production", status: "running" },
  { id: "bundle", name: "bundle size", context: "diff vs main", status: "running" },
  { id: "e2e", name: "e2e", context: "smoke · chromium", status: "running" },
];

/* Simulation pacing (not visual transition timing): how long the fake CI run
 * takes. Each check resolves one step apart so the room watches the dominoes
 * fall over roughly six seconds. Visual motion timing lives in the CSS module
 * and is driven by Primer motion tokens. */
const STEP_MS = 950;
/* Brief in-flight beat after clicking merge, before the state flips. */
const MERGE_MS = 700;

type MergeMethod = "merge" | "squash" | "rebase";

const METHOD_LABEL: Record<MergeMethod, string> = {
  merge: "Create a merge commit",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};

const METHOD_ICON: Record<MergeMethod, Icon> = {
  merge: GitMergeIcon,
  squash: GitCommitIcon,
  rebase: GitBranchIcon,
};

/* ---------------------------------------------------------------------------
 * Color-mode toggle — drives Primer's own color-mode mechanism (useTheme +
 * the data-color-mode attribute the primitives CSS keys off), and mirrors the
 * resolved mode onto the document root so the whole surface (page background
 * included) recolors and a headless test can assert the flip.
 * ------------------------------------------------------------------------- */

function ColorModeToggle() {
  const { resolvedColorMode, setColorMode } = useTheme();

  // Avoid a hydration mismatch: the first client render must match the server,
  // which has no system-preference knowledge. Resolve only after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark =
    mounted && (resolvedColorMode === "dark" || resolvedColorMode === "night");

  // Keep the document root's resolved color mode in lockstep with the theme.
  // This is what recolors the page background (body reads tokens from <html>)
  // and what a test reads from document.documentElement.
  useEffect(() => {
    if (!resolvedColorMode) return;
    const mode =
      resolvedColorMode === "dark" || resolvedColorMode === "night"
        ? "dark"
        : "light";
    document.documentElement.setAttribute("data-color-mode", mode);
  }, [resolvedColorMode]);

  return (
    <IconButton
      icon={isDark ? SunIcon : MoonIcon}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      data-testid="color-mode-toggle"
      variant="invisible"
      onClick={() => setColorMode(isDark ? "day" : "night")}
    />
  );
}

/* ---------------------------------------------------------------------------
 * Small presentational helpers
 * ------------------------------------------------------------------------- */

function MutedIcon({ icon: IconCmp }: { icon: Icon }) {
  return (
    <span style={{ display: "inline-flex", color: "var(--fgColor-muted)" }}>
      <IconCmp size={16} />
    </span>
  );
}

function CountItem({
  icon,
  label,
  value,
}: {
  icon: Icon;
  label: string;
  value: number | string;
}) {
  return (
    <Stack direction="horizontal" gap="condensed" align="center">
      <MutedIcon icon={icon} />
      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
        {label}
      </Text>
      <CounterLabel>{value}</CounterLabel>
    </Stack>
  );
}

function SectionDivider() {
  return (
    <div
      role="presentation"
      style={{ borderTop: "1px solid var(--borderColor-muted)" }}
    />
  );
}

/* ---------------------------------------------------------------------------
 * Checks wall — a Timeline rail of CI checks resolving one by one.
 * ------------------------------------------------------------------------- */

function ChecksWall({ checks }: { checks: Check[] }) {
  const total = checks.length;
  const passed = checks.filter((c) => c.status === "passed").length;
  const allPassed = passed === total;
  const percent = Math.round((passed / total) * 100);

  return (
    <Stack direction="vertical" gap="normal">
      <Stack direction="horizontal" justify="space-between" align="center" wrap="wrap" gap="condensed">
        <Stack direction="horizontal" gap="condensed" align="center">
          {allPassed ? (
            <span style={{ display: "inline-flex", color: "var(--fgColor-success)" }}>
              <CheckCircleFillIcon size={16} />
            </span>
          ) : (
            <Spinner size="small" srText={null} />
          )}
          <Stack direction="vertical" gap="none">
            <Text weight="semibold">
              {allPassed ? "All checks have passed" : "Checks in progress"}
            </Text>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              {passed} successful of {total} checks
            </Text>
          </Stack>
        </Stack>
        <CounterLabel variant={allPassed ? "primary" : "secondary"}>
          {passed}/{total}
        </CounterLabel>
      </Stack>

      <ProgressBar
        progress={percent}
        bg="success.emphasis"
        aria-label={`Checks passed: ${passed} of ${total}`}
      />

      <Timeline>
        {checks.map((check) => {
          const done = check.status === "passed";
          return (
            <Timeline.Item
              key={check.id}
              className={styles.checkRow}
              data-status={check.status}
            >
              <Timeline.Badge variant={done ? "success" : undefined}>
                {done ? <CheckIcon /> : <Spinner size="small" srText={null} />}
              </Timeline.Badge>
              <Timeline.Body>
                <Stack
                  direction="horizontal"
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                  gap="condensed"
                >
                  <Stack direction="vertical" gap="none">
                    <Text weight="semibold" style={{ color: "var(--fgColor-default)" }}>
                      {check.name}
                    </Text>
                    <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                      {check.context}
                    </Text>
                  </Stack>
                  <Text
                    size="small"
                    style={{
                      color: done
                        ? "var(--fgColor-success)"
                        : "var(--fgColor-muted)",
                    }}
                  >
                    {done ? "Successful" : "In progress"}
                  </Text>
                </Stack>
              </Timeline.Body>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </Stack>
  );
}

/* ---------------------------------------------------------------------------
 * Reviews summary
 * ------------------------------------------------------------------------- */

function Reviews() {
  return (
    <Stack direction="vertical" gap="condensed">
      <Text weight="semibold">Reviews</Text>
      {PR.reviewers.map((reviewer) => (
        <Stack key={reviewer.handle} direction="horizontal" gap="condensed" align="center">
          <span style={{ display: "inline-flex", color: "var(--fgColor-success)" }}>
            <CheckCircleFillIcon size={16} />
          </span>
          <Text>
            <Text as="span" weight="semibold">
              @{reviewer.handle}
            </Text>{" "}
            <Text as="span" style={{ color: "var(--fgColor-muted)" }}>
              {reviewer.note}
            </Text>
          </Text>
        </Stack>
      ))}
    </Stack>
  );
}

/* ---------------------------------------------------------------------------
 * Editable merge box (shown once every check is green)
 * ------------------------------------------------------------------------- */

function MergeForm({
  method,
  setMethod,
  headline,
  setHeadline,
  description,
  setDescription,
  deleteBranch,
  setDeleteBranch,
  merging,
  onMerge,
}: {
  method: MergeMethod;
  setMethod: (m: MergeMethod) => void;
  headline: string;
  setHeadline: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  deleteBranch: boolean;
  setDeleteBranch: (v: boolean) => void;
  merging: boolean;
  onMerge: () => void;
}) {
  const PrimaryIcon = METHOD_ICON[method];
  const writesCommit = method !== "rebase";

  return (
    <form
      className={styles.reveal}
      onSubmit={(event) => {
        event.preventDefault();
        onMerge();
      }}
    >
      <Stack direction="vertical" gap="normal">
        <Flash variant="success" role="status">
          <Stack direction="horizontal" gap="condensed" align="center">
            <CheckCircleFillIcon size={16} />
            <Text>
              All checks have passed — this branch is ready to merge into{" "}
              <BranchName as="span">{PR.base}</BranchName>.
            </Text>
          </Stack>
        </Flash>

        <FormControl>
          <FormControl.Label>Merge method</FormControl.Label>
          <Select
            value={method}
            onChange={(event) => setMethod(event.target.value as MergeMethod)}
            block
          >
            <Select.Option value="merge">Create a merge commit</Select.Option>
            <Select.Option value="squash">Squash and merge</Select.Option>
            <Select.Option value="rebase">Rebase and merge</Select.Option>
          </Select>
        </FormControl>

        {writesCommit ? (
          <>
            <FormControl>
              <FormControl.Label>Commit message</FormControl.Label>
              <TextInput
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                block
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>Extended description</FormControl.Label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                resize="vertical"
                block
                placeholder="Add an optional extended description…"
              />
              <FormControl.Caption>
                Optional. Markdown is supported.
              </FormControl.Caption>
            </FormControl>
          </>
        ) : (
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            Rebase replays the {PR.commits} commits from{" "}
            <BranchName as="span">{PR.head}</BranchName> onto{" "}
            <BranchName as="span">{PR.base}</BranchName> individually — each
            commit keeps its own message.
          </Text>
        )}

        <FormControl>
          <Checkbox
            checked={deleteBranch}
            onChange={(event) => setDeleteBranch(event.target.checked)}
          />
          <FormControl.Label>Delete branch after merge</FormControl.Label>
          <FormControl.Caption>
            Removes <BranchName as="span">{PR.head}</BranchName> from the
            repository once the merge completes.
          </FormControl.Caption>
        </FormControl>

        <Stack direction="horizontal" gap="condensed">
          <Button
            type="submit"
            variant="primary"
            leadingVisual={PrimaryIcon}
            loading={merging}
            loadingAnnouncement="Merging pull request"
          >
            {METHOD_LABEL[method]}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}

/* ---------------------------------------------------------------------------
 * Quiet post-merge confirmation
 * ------------------------------------------------------------------------- */

function MergedConfirmation({
  branchDeleted,
  onDeleteBranch,
  onRestoreBranch,
}: {
  branchDeleted: boolean;
  onDeleteBranch: () => void;
  onRestoreBranch: () => void;
}) {
  return (
    <Stack direction="vertical" gap="normal" className={styles.reveal}>
      <div role="status">
        <Stack direction="horizontal" gap="condensed" align="center">
          <span style={{ display: "inline-flex", color: "var(--fgColor-done)" }}>
            <GitMergeIcon size={24} />
          </span>
          <Stack direction="vertical" gap="none">
            <Text weight="semibold">
              Pull request successfully merged and closed
            </Text>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              @{PR.author} merged {PR.commits} commits into{" "}
              <BranchName as="span">{PR.base}</BranchName> from{" "}
              <BranchName as="span">{PR.head}</BranchName>.
            </Text>
          </Stack>
        </Stack>
      </div>

      <SectionDivider />

      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
        {branchDeleted ? (
          <>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              The <BranchName as="span">{PR.head}</BranchName> branch was
              deleted.
            </Text>
            <Button leadingVisual={GitBranchIcon} onClick={onRestoreBranch}>
              Restore branch
            </Button>
          </>
        ) : (
          <>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              You can safely delete the{" "}
              <BranchName as="span">{PR.head}</BranchName> branch.
            </Text>
            <Button
              variant="danger"
              leadingVisual={TrashIcon}
              onClick={onDeleteBranch}
            >
              Delete branch
            </Button>
          </>
        )}
      </Stack>
    </Stack>
  );
}

/* ---------------------------------------------------------------------------
 * The panel
 * ------------------------------------------------------------------------- */

export function PrMergedTheater() {
  const [checks, setChecks] = useState<Check[]>(INITIAL_CHECKS);
  const [merged, setMerged] = useState(false);
  const [merging, setMerging] = useState(false);

  const [method, setMethod] = useState<MergeMethod>("merge");
  const [headline, setHeadline] = useState(`${PR.title} (#${PR.number})`);
  const [description, setDescription] = useState("");
  const [deleteBranch, setDeleteBranch] = useState(false);
  const [branchDeleted, setBranchDeleted] = useState(false);

  // Resolve the checks one by one over ~6s — the dominoes falling.
  useEffect(() => {
    const timers = INITIAL_CHECKS.map((check, index) =>
      setTimeout(
        () => {
          setChecks((prev) =>
            prev.map((c) =>
              c.id === check.id ? { ...c, status: "passed" } : c,
            ),
          );
        },
        (index + 1) * STEP_MS,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const allPassed = checks.every((c) => c.status === "passed");
  const passedCount = checks.filter((c) => c.status === "passed").length;
  const phase: "running" | "ready" | "merged" = merged
    ? "merged"
    : allPassed
      ? "ready"
      : "running";

  function performMerge() {
    setMerging(true);
    // A short in-flight beat, then the state flips.
    setTimeout(() => {
      setBranchDeleted(deleteBranch);
      setMerged(true);
      setMerging(false);
    }, MERGE_MS);
  }

  return (
    <Stack
      as="main"
      direction="vertical"
      gap="spacious"
      style={{
        maxWidth: "60rem",
        margin: "0 auto",
        padding: "var(--base-size-24, 1.5rem)",
      }}
    >
      {/* Top bar: context + the color-mode control */}
      <Stack direction="horizontal" justify="space-between" align="center" gap="condensed">
        <Stack direction="horizontal" gap="condensed" align="center">
          <MutedIcon icon={GitMergeIcon} />
          <Text weight="semibold" style={{ color: "var(--fgColor-muted)" }}>
            {PR.repo}
          </Text>
        </Stack>
        <ColorModeToggle />
      </Stack>

      {/* The pull request panel */}
      <Stack
        as="section"
        direction="vertical"
        gap="normal"
        aria-label={`Pull request #${PR.number}`}
        style={{
          backgroundColor: "var(--bgColor-default)",
          border: "1px solid var(--borderColor-default)",
          borderRadius: "var(--borderRadius-large, 12px)",
          boxShadow: "var(--shadow-resting-medium)",
          padding: "var(--base-size-24, 1.5rem)",
        }}
      >
        {/* Header: title + number + lifecycle capsule + branches */}
        <Stack direction="vertical" gap="condensed">
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
          <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
            <span
              className={styles.capsule}
              data-merged={merged ? "true" : "false"}
            >
              <StateLabel status={merged ? "pullMerged" : "pullOpened"}>
                {merged ? "Merged" : "Open"}
              </StateLabel>
            </span>
            <Text style={{ color: "var(--fgColor-muted)" }}>
              <Text as="span" weight="semibold">
                @{PR.author}
              </Text>{" "}
              wants to merge {PR.commits} commits into{" "}
              <BranchName as="span">{PR.base}</BranchName> from{" "}
              <BranchName as="span">{PR.head}</BranchName>
            </Text>
          </Stack>
        </Stack>

        <SectionDivider />

        {/* Metadata: topic labels + running counts */}
        <Stack direction="horizontal" justify="space-between" align="center" wrap="wrap" gap="normal">
          <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
            {PR.topics.map((topic) => (
              <Label key={topic.name} variant={topic.variant}>
                {topic.name}
              </Label>
            ))}
          </Stack>
          <Stack direction="horizontal" gap="normal" align="center" wrap="wrap">
            <CountItem icon={GitCommitIcon} label="Commits" value={PR.commits} />
            <CountItem
              icon={CheckIcon}
              label="Checks"
              value={`${passedCount}/${checks.length}`}
            />
            <CountItem
              icon={FileDiffIcon}
              label="Files changed"
              value={PR.filesChanged}
            />
          </Stack>
        </Stack>

        {/* The merge box */}
        <div
          style={{
            border: "1px solid var(--borderColor-default)",
            borderRadius: "var(--borderRadius-medium, 8px)",
            overflow: "hidden",
          }}
        >
          {phase === "merged" ? (
            <div style={{ padding: "var(--base-size-16, 1rem)" }}>
              <MergedConfirmation
                branchDeleted={branchDeleted}
                onDeleteBranch={() => setBranchDeleted(true)}
                onRestoreBranch={() => setBranchDeleted(false)}
              />
            </div>
          ) : (
            <Stack direction="vertical" gap="normal" style={{ padding: "var(--base-size-16, 1rem)" }}>
              <Reviews />
              <SectionDivider />
              <ChecksWall checks={checks} />
              <SectionDivider />
              {phase === "ready" ? (
                <MergeForm
                  method={method}
                  setMethod={setMethod}
                  headline={headline}
                  setHeadline={setHeadline}
                  description={description}
                  setDescription={setDescription}
                  deleteBranch={deleteBranch}
                  setDeleteBranch={setDeleteBranch}
                  merging={merging}
                  onMerge={performMerge}
                />
              ) : (
                <Stack direction="vertical" gap="condensed">
                  <Button variant="primary" leadingVisual={GitMergeIcon} disabled>
                    Merge pull request
                  </Button>
                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    Merging is blocked until all checks pass.
                  </Text>
                </Stack>
              )}
            </Stack>
          )}
        </div>
      </Stack>
    </Stack>
  );
}
