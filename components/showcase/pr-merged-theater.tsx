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
} from "@primer/octicons-react";

// ── Invented data ───────────────────────────────────────────────────────────
const REPO = "lumina/aurora-engine";
const PR_NUMBER = 482;
const PR_TITLE = "Add incremental relighting to the scene compositor";
const SOURCE_BRANCH = "feat/incremental-relight";
const TARGET_BRANCH = "main";
const AUTHOR = "@marin-okafor";
const TOPICS = ["renderer", "performance"];
const COMMIT_COUNT = 12;
const FILES_CHANGED = 8;

const CHECKS = [
  { id: "lint", name: "lint", context: "biome" },
  { id: "typecheck", name: "typecheck", context: "tsc --noEmit" },
  { id: "unit", name: "unit tests", context: "vitest" },
  { id: "build", name: "build", context: "turbopack" },
  { id: "e2e", name: "end-to-end", context: "playwright" },
  { id: "bundle", name: "bundle size", context: "size-limit" },
] as const;

type MergeMethod = "merge" | "squash" | "rebase";

const METHOD_LABEL: Record<MergeMethod, string> = {
  merge: "Merge pull request",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};

const DEFAULT_HEADLINE = `${PR_TITLE} (#${PR_NUMBER})`;

// Map Primer's resolved color mode ('day' | 'night' | 'light' | 'dark') onto
// the two-value attribute the theme CSS selectors key on.
function toAttrMode(resolved: string | undefined): "light" | "dark" {
  return resolved === "night" || resolved === "dark" ? "dark" : "light";
}

export function PrMergedTheater() {
  const { resolvedColorMode, setColorMode } = useTheme();
  const uiMode = toAttrMode(resolvedColorMode);

  // The ThemeProvider only re-themes its own wrapper <div>; the page surface
  // (<body>) paints from tokens resolved against <html data-color-mode>. Mirror
  // the design system's *resolved* mode onto the document root so the whole
  // surface — page background included — recolors, and so a headless test can
  // read the active mode straight off documentElement.
  useEffect(() => {
    document.documentElement.setAttribute("data-color-mode", uiMode);
  }, [uiMode]);

  // ── Check progression ──────────────────────────────────────────────────────
  // Resolve one check at a time so the row reads like dominoes falling. This is
  // pure state (not animation), so it advances identically under
  // prefers-reduced-motion; only the per-row "beat" is gated on motion.
  const [resolvedCount, setResolvedCount] = useState(0);
  const total = CHECKS.length;
  const allGreen = resolvedCount >= total;

  useEffect(() => {
    if (resolvedCount >= total) return;
    const id = window.setTimeout(
      () => setResolvedCount((c) => c + 1),
      resolvedCount === 0 ? 700 : 900,
    );
    return () => window.clearTimeout(id);
  }, [resolvedCount, total]);

  // ── Merge box state ─────────────────────────────────────────────────────────
  const [method, setMethod] = useState<MergeMethod>("merge");
  const [headline, setHeadline] = useState(DEFAULT_HEADLINE);
  const [description, setDescription] = useState("");
  const [deleteBranch, setDeleteBranch] = useState(false);

  const [merged, setMerged] = useState(false);
  // Tracks whether the branch currently exists post-merge (drives restore/delete).
  const [branchRemoved, setBranchRemoved] = useState(false);

  const ready = allGreen && !merged;

  function handleMerge() {
    setMerged(true);
    setBranchRemoved(deleteBranch);
  }

  function toggleColorMode() {
    setColorMode(uiMode === "dark" ? "light" : "dark");
  }

  const progress = Math.round((resolvedCount / total) * 100);

  return (
    <Stack
      direction="vertical"
      gap="normal"
      style={{
        backgroundColor: "var(--bgColor-default)",
        border: "var(--borderWidth-default) solid var(--borderColor-default)",
        borderRadius: "var(--borderRadius-large)",
        padding: "var(--base-size-24)",
        maxWidth: "var(--breakpoint-medium)",
        width: "100%",
      }}
    >
      {/* ── Header: state capsule, title, branches, topics, counts, mode toggle ── */}
      <Stack direction="horizontal" justify="space-between" align="start" gap="normal">
        <Stack direction="vertical" gap="condensed">
          <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
            <span
              key={merged ? "merged" : "open"}
              className="ds-flip"
              style={{ display: "inline-flex" }}
            >
              <StateLabel status={merged ? "pullMerged" : "pullOpened"}>
                {merged ? "Merged" : "Open"}
              </StateLabel>
            </span>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              {REPO}
            </Text>
          </Stack>

          <Heading as="h1" variant="medium">
            {PR_TITLE}{" "}
            <Text
              as="span"
              weight="light"
              style={{ color: "var(--fgColor-muted)" }}
            >
              #{PR_NUMBER}
            </Text>
          </Heading>

          <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              <Text as="span" weight="semibold" style={{ color: "var(--fgColor-default)" }}>
                {AUTHOR}
              </Text>{" "}
              wants to merge {COMMIT_COUNT} commits into
            </Text>
            <BranchName as="span">{TARGET_BRANCH}</BranchName>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              from
            </Text>
            <BranchName as="span">{SOURCE_BRANCH}</BranchName>
          </Stack>
        </Stack>

        <IconButton
          icon={uiMode === "dark" ? SunIcon : MoonIcon}
          aria-label={uiMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          variant="invisible"
          onClick={toggleColorMode}
          data-testid="color-mode-toggle"
        />
      </Stack>

      {/* Topic labels + running counts — the metadata a maintainer scans. */}
      <Stack direction="horizontal" gap="cozy" align="center" wrap="wrap">
        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          {TOPICS.map((topic) => (
            <Label key={topic} variant="accent">
              {topic}
            </Label>
          ))}
        </Stack>
        <Stack direction="horizontal" gap="cozy" align="center" wrap="wrap">
          <CountChip icon={<GitCommitIcon aria-hidden />} label="Commits" count={COMMIT_COUNT} />
          <CountChip
            icon={<CheckIcon aria-hidden />}
            label="Checks passed"
            count={`${resolvedCount}/${total}`}
          />
          <CountChip
            icon={<FileDiffIcon aria-hidden />}
            label="Files changed"
            count={FILES_CHANGED}
          />
        </Stack>
      </Stack>

      {/* ── Merge box ──────────────────────────────────────────────────────────── */}
      <Stack
        direction="vertical"
        gap="normal"
        style={{
          border: "var(--borderWidth-default) solid var(--borderColor-default)",
          borderRadius: "var(--borderRadius-medium)",
          padding: "var(--base-size-16)",
          backgroundColor: "var(--bgColor-default)",
        }}
      >
        {/* Reviews */}
        <Stack direction="vertical" gap="condensed">
          <Heading as="h2" variant="small">
            Reviews
          </Heading>
          <Timeline clipSidebar>
            <Timeline.Item>
              <Timeline.Badge variant="success">
                <CheckIcon aria-hidden />
              </Timeline.Badge>
              <Timeline.Body>
                <Text weight="semibold" style={{ color: "var(--fgColor-default)" }}>
                  @priya-venkat
                </Text>{" "}
                approved these changes
              </Timeline.Body>
            </Timeline.Item>
            <Timeline.Item>
              <Timeline.Badge variant="success">
                <CheckIcon aria-hidden />
              </Timeline.Badge>
              <Timeline.Body>
                <Text weight="semibold" style={{ color: "var(--fgColor-default)" }}>
                  @dolan-reyes
                </Text>{" "}
                approved these changes
              </Timeline.Body>
            </Timeline.Item>
          </Timeline>
        </Stack>

        {/* CI checks wall */}
        <Stack
          direction="vertical"
          gap="condensed"
          style={{
            borderTop: "var(--borderWidth-default) solid var(--borderColor-muted)",
            paddingTop: "var(--base-size-16)",
          }}
        >
          <Stack direction="horizontal" justify="space-between" align="center" gap="condensed">
            <Heading as="h2" variant="small">
              Checks
            </Heading>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              {allGreen
                ? `All ${total} checks passed`
                : `${resolvedCount} of ${total} checks passed`}
            </Text>
          </Stack>

          <ProgressBar
            progress={progress}
            aria-label={`${resolvedCount} of ${total} checks passed`}
          />

          <Stack as="ul" direction="vertical" gap="none" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {CHECKS.map((check, index) => {
              const passed = index < resolvedCount;
              return (
                <Stack
                  as="li"
                  key={check.id}
                  direction="horizontal"
                  gap="condensed"
                  align="center"
                  style={{ paddingTop: "var(--base-size-8)", paddingBottom: "var(--base-size-8)" }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      width: "var(--base-size-16)",
                      justifyContent: "center",
                    }}
                  >
                    {passed ? (
                      <span
                        key="passed"
                        className="ds-beat-in"
                        style={{ display: "inline-flex", color: "var(--fgColor-success)" }}
                      >
                        <CheckCircleFillIcon aria-hidden />
                      </span>
                    ) : (
                      <Spinner size="small" srText={null} />
                    )}
                  </span>
                  <Text weight="semibold" style={{ color: "var(--fgColor-default)" }}>
                    {check.name}
                  </Text>
                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    {check.context}
                  </Text>
                  <Text
                    size="small"
                    style={{
                      marginInlineStart: "auto",
                      color: passed ? "var(--fgColor-success)" : "var(--fgColor-muted)",
                    }}
                  >
                    {passed ? "Passed" : "In progress"}
                  </Text>
                </Stack>
              );
            })}
          </Stack>
        </Stack>

        {/* Merge controls */}
        <Stack
          direction="vertical"
          gap="normal"
          style={{
            borderTop: "var(--borderWidth-default) solid var(--borderColor-muted)",
            paddingTop: "var(--base-size-16)",
          }}
        >
          {merged ? (
            <MergedConfirmation
              method={method}
              branchRemoved={branchRemoved}
              onRestore={() => setBranchRemoved(false)}
              onDelete={() => setBranchRemoved(true)}
            />
          ) : ready ? (
            <Stack direction="vertical" gap="normal" className="ds-reveal">
              <Flash variant="success" role="status">
                <Stack direction="horizontal" gap="condensed" align="center">
                  <CheckCircleFillIcon aria-hidden />
                  <Text weight="semibold">
                    All checks have passed — this branch is ready to merge.
                  </Text>
                </Stack>
              </Flash>

              <FormControl>
                <FormControl.Label>Merge method</FormControl.Label>
                <Select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as MergeMethod)}
                  block
                >
                  <Select.Option value="merge">Create a merge commit</Select.Option>
                  <Select.Option value="squash">Squash and merge</Select.Option>
                  <Select.Option value="rebase">Rebase and merge</Select.Option>
                </Select>
                <FormControl.Caption>
                  {method === "merge"
                    ? "All commits from this branch will be added to the base branch via a merge commit."
                    : method === "squash"
                      ? "The commits from this branch will be combined into one commit on the base branch."
                      : "The commits from this branch will be rebased and added to the base branch."}
                </FormControl.Caption>
              </FormControl>

              <FormControl>
                <FormControl.Label>Commit message</FormControl.Label>
                <TextInput
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  block
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>Extended description</FormControl.Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  resize="vertical"
                  placeholder="Add an optional extended description…"
                  block
                />
              </FormControl>

              <FormControl>
                <Checkbox
                  checked={deleteBranch}
                  onChange={(e) => setDeleteBranch(e.target.checked)}
                />
                <FormControl.Label>
                  Delete{" "}
                  <Text as="span" weight="semibold">
                    {SOURCE_BRANCH}
                  </Text>{" "}
                  after merge
                </FormControl.Label>
                <FormControl.Caption>
                  Keeps the branch list tidy. You can restore the branch later if you need it.
                </FormControl.Caption>
              </FormControl>

              <Stack direction="horizontal" gap="condensed">
                <Button
                  variant="primary"
                  leadingVisual={GitMergeIcon}
                  onClick={handleMerge}
                >
                  {METHOD_LABEL[method]}
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Stack direction="horizontal" gap="condensed" align="center" justify="space-between">
              <Stack direction="horizontal" gap="condensed" align="center">
                <Spinner size="small" srText={null} />
                <Text style={{ color: "var(--fgColor-muted)" }}>
                  Merging unlocks when every check is green.
                </Text>
              </Stack>
              <Button variant="primary" leadingVisual={GitMergeIcon} disabled>
                {METHOD_LABEL[method]}
              </Button>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}

function CountChip({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number | string;
}) {
  return (
    <Stack direction="horizontal" gap="condensed" align="center">
      <span style={{ display: "inline-flex", color: "var(--fgColor-muted)" }}>{icon}</span>
      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
        {label}
      </Text>
      <CounterLabel>{count}</CounterLabel>
    </Stack>
  );
}

function MergedConfirmation({
  method,
  branchRemoved,
  onRestore,
  onDelete,
}: {
  method: MergeMethod;
  branchRemoved: boolean;
  onRestore: () => void;
  onDelete: () => void;
}) {
  return (
    <Stack direction="vertical" gap="condensed" className="ds-reveal">
      <Stack direction="horizontal" gap="condensed" align="center">
        <span style={{ display: "inline-flex", color: "var(--fgColor-done)" }}>
          <GitMergeIcon aria-hidden />
        </span>
        <Text weight="semibold" style={{ color: "var(--fgColor-default)" }}>
          Pull request successfully merged and closed
        </Text>
      </Stack>
      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
        {AUTHOR} merged {COMMIT_COUNT} commits into{" "}
        <BranchName as="span">{TARGET_BRANCH}</BranchName> via {METHOD_LABEL[method].toLowerCase()}.
      </Text>

      <Stack
        direction="horizontal"
        gap="condensed"
        align="center"
        justify="space-between"
        wrap="wrap"
        style={{
          borderTop: "var(--borderWidth-default) solid var(--borderColor-muted)",
          paddingTop: "var(--base-size-16)",
        }}
      >
        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
          {branchRemoved ? (
            <>
              The{" "}
              <Text as="span" weight="semibold" style={{ color: "var(--fgColor-default)" }}>
                {SOURCE_BRANCH}
              </Text>{" "}
              branch was deleted.
            </>
          ) : (
            <>
              The{" "}
              <Text as="span" weight="semibold" style={{ color: "var(--fgColor-default)" }}>
                {SOURCE_BRANCH}
              </Text>{" "}
              branch can now be safely deleted.
            </>
          )}
        </Text>
        {branchRemoved ? (
          <Button variant="default" leadingVisual={GitBranchIcon} onClick={onRestore}>
            Restore branch
          </Button>
        ) : (
          <Button variant="danger" leadingVisual={TrashIcon} onClick={onDelete}>
            Delete branch
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
