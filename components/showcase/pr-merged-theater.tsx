"use client";

// PR-merged theater — the encore. A dense, GitHub-style pull-request panel
// whose CI checks resolve over ~6s, then opens an editable merge box that
// flips Open → Merged. Every visual comes from Primer React + @primer/primitives
// tokens; the color-mode toggle drives the design system's own mechanism
// (useTheme().setColorMode) and syncs the resolved mode onto the document root
// so the page background — not just the card — recolors and the mode is
// observable in the DOM.

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
  RelativeTime,
  useTheme,
} from "@primer/react";
import {
  CheckCircleFillIcon,
  CheckIcon,
  DotFillIcon,
  FileDiffIcon,
  GitBranchIcon,
  GitCommitIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
  type Icon,
} from "@primer/octicons-react";
import { useEffect, useRef, useState } from "react";

import styles from "./pr-merged-theater.module.css";

// ---------------------------------------------------------------------------
// Invented data — fictional repo / author / branches / labels / checks.
// ---------------------------------------------------------------------------

const PR = {
  number: 482,
  title: "Cache streaming gateway responses at the edge",
  author: "marlowe-fenn",
  repo: "lumen-labs/aperture",
  base: "trunk",
  head: "cache/streaming-gateway",
  topics: ["performance", "edge-runtime"],
  commits: 7,
  filesChanged: 12,
  // Fixed past timestamp (static so SSR/CSR markup matches); RelativeTime
  // reformats on the client and the text node is the pre-upgrade fallback.
  openedAt: "2026-06-14T07:12:00.000Z",
  reviewers: ["priya-nadig", "dao-vance"] as const,
} as const;

type CheckDef = { id: string; name: string; context: string; at: number };

// Each check resolves at its `at` offset (ms). Last lands ~5.6s; the box
// opens a beat later — the whole sequence runs in roughly six seconds.
const CHECK_DEFS: CheckDef[] = [
  { id: "lint", name: "Lint", context: "quality / eslint", at: 750 },
  { id: "types", name: "Type check", context: "quality / tsc", at: 1600 },
  { id: "unit", name: "Unit tests", context: "test / unit", at: 2550 },
  { id: "integration", name: "Integration tests", context: "test / integration", at: 3650 },
  { id: "build", name: "Build", context: "release / web", at: 4600 },
  { id: "preview", name: "Preview deploy", context: "deploy / preview", at: 5550 },
];
const READY_BEAT = 650; // pause after the last check before the box opens

type Phase = "running" | "ready" | "merged";
type MergeMethod = "merge" | "squash" | "rebase";

const METHOD_LABEL: Record<MergeMethod, string> = {
  merge: "Merge pull request",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};

function methodCaption(method: MergeMethod): string {
  switch (method) {
    case "merge":
      return `All ${PR.commits} commits from this branch will be added to ${PR.base} via a merge commit.`;
    case "squash":
      return `The ${PR.commits} commits from this branch will be combined into one commit on ${PR.base}.`;
    case "rebase":
      return `The ${PR.commits} commits from this branch will be rebased and added to ${PR.base}.`;
  }
}

// ---------------------------------------------------------------------------
// Small inline metadata stat: muted icon + label + count badge.
// ---------------------------------------------------------------------------

function CountStat({
  icon: Glyph,
  label,
  value,
  live,
}: {
  icon: Icon;
  label: string;
  value: number;
  live?: boolean;
}) {
  return (
    <Stack direction="horizontal" gap="condensed" align="center">
      <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
        <Glyph size={16} />
      </span>
      <Text style={{ color: "var(--fgColor-muted)" }}>{label}</Text>
      <CounterLabel className={live ? styles.tnum : undefined}>{value}</CounterLabel>
    </Stack>
  );
}

// ---------------------------------------------------------------------------

export default function PrMergedTheater() {
  const { resolvedColorMode, setColorMode } = useTheme();
  const isDark = resolvedColorMode === "dark" || resolvedColorMode === "night";

  const [passedIds, setPassedIds] = useState<ReadonlySet<string>>(new Set<string>());
  const [phase, setPhase] = useState<Phase>("running");

  // Editable merge-box state.
  const [method, setMethod] = useState<MergeMethod>("merge");
  const [headline, setHeadline] = useState(`${PR.title} (#${PR.number})`);
  const [description, setDescription] = useState("");
  const [deleteBranch, setDeleteBranch] = useState(true);
  // Post-merge branch state — initialised from the pre-merge choice, toggleable.
  const [branchDeleted, setBranchDeleted] = useState(false);

  const mergedRef = useRef<HTMLDivElement>(null);

  const total = CHECK_DEFS.length;
  const passedCount = passedIds.size;
  const headlineMissing = headline.trim() === "";

  // --- Simulate the check progression with timers (no APIs). ---------------
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const def of CHECK_DEFS) {
      timers.push(
        setTimeout(() => {
          setPassedIds((prev) => {
            const next = new Set(prev);
            next.add(def.id);
            return next;
          });
        }, def.at),
      );
    }
    const lastAt = CHECK_DEFS[CHECK_DEFS.length - 1].at;
    timers.push(
      setTimeout(() => setPhase((p) => (p === "running" ? "ready" : p)), lastAt + READY_BEAT),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // --- Sync the resolved color mode onto the document root. ----------------
  // The ThemeProvider only writes data-color-mode onto its own wrapper <div>,
  // so <html>/<body> would keep the static "auto" and never recolor with the
  // toggle. Writing Primer's own data-color-mode attribute on the root makes
  // the page background recolor AND exposes the resolved mode for headless
  // assertions. (data-light-theme/data-dark-theme are already on <html>.)
  useEffect(() => {
    document.documentElement.setAttribute("data-color-mode", isDark ? "dark" : "light");
  }, [isDark]);

  // --- Move focus into the confirmation when the form is replaced. ---------
  useEffect(() => {
    if (phase === "merged") mergedRef.current?.focus();
  }, [phase]);

  function handleMerge() {
    setBranchDeleted(deleteBranch);
    setPhase("merged");
  }

  const allPassed = passedCount === total;

  // Phase-driven card border (semantic tokens; changed instantly, never
  // animated — only opacity/transform animate here).
  const cardBorderColor =
    phase === "merged"
      ? "var(--borderColor-done-emphasis)"
      : phase === "ready"
        ? "var(--borderColor-success-emphasis)"
        : "var(--borderColor-default)";

  const liveMessage =
    phase === "ready"
      ? "All checks passed. This pull request is ready to merge."
      : phase === "merged"
        ? "Pull request successfully merged and closed."
        : "";

  const sectionPadX = "var(--base-size-24, 1.5rem)";
  const sectionPadY = "var(--base-size-16, 1rem)";

  return (
    <main
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        padding: "var(--base-size-32, 2rem) var(--base-size-16, 1rem)",
      }}
    >
      {/* Polite live region: announces the two state transitions that matter,
          decoupled from any visual motion. */}
      <div role="status" aria-live="polite" className={styles.srOnly}>
        {liveMessage}
      </div>

      <Stack direction="vertical" gap="spacious">
        {/* Top bar: repo context + the color-mode control. -------------- */}
        <Stack direction="horizontal" justify="space-between" align="center" gap="condensed">
          <Stack direction="horizontal" gap="condensed" align="center">
            <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
              <GitPullRequestIcon size={16} />
            </span>
            <Text style={{ color: "var(--fgColor-muted)" }}>{PR.repo}</Text>
          </Stack>
          <IconButton
            icon={isDark ? SunIcon : MoonIcon}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            data-testid="color-mode-toggle"
            variant="invisible"
            onClick={() => setColorMode(isDark ? "light" : "dark")}
          />
        </Stack>

        {/* Title block: capsule + heading + the "wants to merge" line. --- */}
        <Stack direction="vertical" gap="condensed">
          <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
            <span
              className={phase === "merged" ? styles.capsuleFlip : undefined}
              style={{ display: "inline-flex" }}
            >
              {phase === "merged" ? (
                <StateLabel status="pullMerged">Merged</StateLabel>
              ) : (
                <StateLabel status="pullOpened">Open</StateLabel>
              )}
            </span>
            <Heading as="h1" variant="large" className={styles.title}>
              {PR.title}{" "}
              <span style={{ color: "var(--fgColor-muted)", fontWeight: 400 }}>
                #{PR.number}
              </span>
            </Heading>
          </Stack>

          <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
            <Text style={{ color: "var(--fgColor-muted)" }}>
              <Text as="span" weight="semibold" style={{ color: "var(--fgColor-default)" }}>
                @{PR.author}
              </Text>{" "}
              wants to merge {PR.commits} commits into
            </Text>
            <BranchName as="span">{PR.base}</BranchName>
            <Text style={{ color: "var(--fgColor-muted)" }}>from</Text>
            <BranchName as="span">{PR.head}</BranchName>
            <Text style={{ color: "var(--fgColor-muted)" }}>·</Text>
            <Text style={{ color: "var(--fgColor-muted)" }}>
              opened{" "}
              <RelativeTime datetime={PR.openedAt} tense="past">
                earlier today
              </RelativeTime>
            </Text>
          </Stack>
        </Stack>

        {/* Metadata row: topic labels (left) + running counts (right). --- */}
        <Stack direction="horizontal" gap="normal" align="center" justify="space-between" wrap="wrap">
          <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
            {PR.topics.map((topic) => (
              <Label key={topic} variant="accent">
                {topic}
              </Label>
            ))}
          </Stack>
          <Stack direction="horizontal" gap="normal" align="center" wrap="wrap">
            <CountStat icon={GitCommitIcon} label="commits" value={PR.commits} />
            <CountStat icon={FileDiffIcon} label="files changed" value={PR.filesChanged} />
            <CountStat icon={CheckIcon} label="checks passed" value={passedCount} live />
          </Stack>
        </Stack>

        {/* The merge box. ------------------------------------------------- */}
        <div
          style={{
            border: `1px solid ${cardBorderColor}`,
            borderRadius: "var(--borderRadius-large, 12px)",
            backgroundColor: "var(--bgColor-default)",
            boxShadow: "var(--shadow-resting-medium)",
            overflow: "hidden",
          }}
        >
          {/* Header strip: review summary on a subtle inset surface. */}
          <div
            style={{
              padding: `${sectionPadY} ${sectionPadX}`,
              backgroundColor: "var(--bgColor-muted)",
              borderBottom: "1px solid var(--borderColor-muted)",
            }}
          >
            <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
              <span style={{ color: "var(--fgColor-success)", display: "inline-flex" }}>
                <CheckCircleFillIcon size={16} />
              </span>
              <Text weight="semibold">{PR.reviewers.length} approving reviews</Text>
              <Text style={{ color: "var(--fgColor-muted)" }}>
                {PR.reviewers.map((r) => `@${r}`).join(", ")}
              </Text>
            </Stack>
          </div>

          {/* Checks wall + progress. */}
          <div style={{ padding: sectionPadX }}>
            <Stack direction="vertical" gap="normal">
              <Stack
                direction="horizontal"
                gap="condensed"
                align="center"
                justify="space-between"
                wrap="wrap"
              >
                <Stack direction="horizontal" gap="condensed" align="center">
                  {allPassed ? (
                    <span style={{ color: "var(--fgColor-success)", display: "inline-flex" }}>
                      <CheckCircleFillIcon size={16} />
                    </span>
                  ) : (
                    <Spinner size="small" srText={null} />
                  )}
                  <Text weight="semibold">
                    {allPassed ? "All checks have passed" : "Checks are still running"}
                  </Text>
                </Stack>
                <Text className={styles.tnum} style={{ color: "var(--fgColor-muted)" }}>
                  {passedCount} of {total} successful
                </Text>
              </Stack>

              <ProgressBar
                progress={(passedCount / total) * 100}
                aria-label={`${passedCount} of ${total} checks passed`}
              />

              <Timeline>
                {CHECK_DEFS.map((check) => {
                  const passed = passedIds.has(check.id);
                  return (
                    <Timeline.Item key={check.id}>
                      <Timeline.Badge
                        variant={passed ? "success" : undefined}
                        className={passed ? styles.checkLand : undefined}
                      >
                        {passed ? <CheckIcon size={16} /> : <DotFillIcon size={16} />}
                      </Timeline.Badge>
                      <Timeline.Body>
                        <Stack
                          direction="horizontal"
                          gap="condensed"
                          align="center"
                          justify="space-between"
                          wrap="wrap"
                        >
                          <Stack direction="horizontal" gap="condensed" align="baseline" wrap="wrap">
                            <Text weight="semibold">{check.name}</Text>
                            <Text style={{ color: "var(--fgColor-muted)" }}>{check.context}</Text>
                          </Stack>
                          {passed ? (
                            <Text style={{ color: "var(--fgColor-success)" }}>Successful</Text>
                          ) : (
                            <Stack direction="horizontal" gap="condensed" align="center">
                              <Spinner size="small" srText={null} />
                              <Text style={{ color: "var(--fgColor-muted)" }}>In progress</Text>
                            </Stack>
                          )}
                        </Stack>
                      </Timeline.Body>
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            </Stack>
          </div>

          {/* Merge action region — running (locked) / ready (editable) / merged. */}
          <div
            style={{
              padding: sectionPadX,
              borderTop: "1px solid var(--borderColor-muted)",
            }}
          >
            {phase === "running" && (
              <Stack direction="vertical" gap="condensed">
                <Stack direction="horizontal" gap="condensed" align="center">
                  <Spinner size="small" srText={null} />
                  <Text weight="semibold">Merging is blocked</Text>
                </Stack>
                <Text style={{ color: "var(--fgColor-muted)" }}>
                  Merging will be enabled once all required checks have passed.
                </Text>
                {/* Genuinely unavailable: disabled removes it from the tab order
                    and assistive tech announces it as unavailable, not actionable. */}
                <div>
                  <Button variant="primary" leadingVisual={GitMergeIcon} disabled>
                    {METHOD_LABEL[method]}
                  </Button>
                </div>
              </Stack>
            )}

            {phase === "ready" && (
              <div className={styles.enter}>
                <Stack direction="vertical" gap="normal">
                  <Flash variant="success">
                    <Stack direction="horizontal" gap="condensed" align="center">
                      <span style={{ color: "var(--fgColor-success)", display: "inline-flex" }}>
                        <CheckCircleFillIcon size={16} />
                      </span>
                      <span>
                        <Text weight="semibold">All checks have passed.</Text> This branch has no
                        conflicts with {PR.base}.
                      </span>
                    </Stack>
                  </Flash>

                  <FormControl>
                    <FormControl.Label>Merge method</FormControl.Label>
                    <Select
                      block
                      value={method}
                      onChange={(e) => setMethod(e.target.value as MergeMethod)}
                    >
                      <Select.Option value="merge">Create a merge commit</Select.Option>
                      <Select.Option value="squash">Squash and merge</Select.Option>
                      <Select.Option value="rebase">Rebase and merge</Select.Option>
                    </Select>
                    <FormControl.Caption>{methodCaption(method)}</FormControl.Caption>
                  </FormControl>

                  <FormControl>
                    <FormControl.Label>Commit message</FormControl.Label>
                    <TextInput
                      block
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      validationStatus={headlineMissing ? "error" : undefined}
                    />
                    {headlineMissing && (
                      <FormControl.Validation variant="error">
                        A commit message is required.
                      </FormControl.Validation>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormControl.Label>Extended description</FormControl.Label>
                    <Textarea
                      block
                      resize="vertical"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add an optional extended description…"
                    />
                    <FormControl.Caption>Leave blank to skip.</FormControl.Caption>
                  </FormControl>

                  <FormControl>
                    <Checkbox
                      checked={deleteBranch}
                      onChange={(e) => setDeleteBranch(e.target.checked)}
                    />
                    <FormControl.Label>
                      Delete <BranchName as="span">{PR.head}</BranchName> after merge
                    </FormControl.Label>
                    <FormControl.Caption>
                      Removes the source branch once the pull request is merged.
                    </FormControl.Caption>
                  </FormControl>

                  <div>
                    <Button
                      variant="primary"
                      leadingVisual={GitMergeIcon}
                      onClick={handleMerge}
                      disabled={headlineMissing}
                    >
                      {METHOD_LABEL[method]}
                    </Button>
                  </div>
                </Stack>
              </div>
            )}

            {phase === "merged" && (
              <div
                ref={mergedRef}
                tabIndex={-1}
                className={`${styles.enter} ${styles.focusRegion}`}
              >
                <Stack direction="vertical" gap="normal">
                  <Stack direction="horizontal" gap="condensed" align="center">
                    <span style={{ color: "var(--fgColor-done)", display: "inline-flex" }}>
                      <GitMergeIcon size={24} />
                    </span>
                    <Stack direction="vertical" gap="none">
                      <Text weight="semibold">Pull request successfully merged and closed</Text>
                      <Text style={{ color: "var(--fgColor-muted)" }}>
                        <Text as="span" weight="semibold" style={{ color: "var(--fgColor-default)" }}>
                          @{PR.author}
                        </Text>{" "}
                        merged {PR.commits} commits into{" "}
                        <BranchName as="span">{PR.base}</BranchName> from{" "}
                        <BranchName as="span">{PR.head}</BranchName>.
                      </Text>
                    </Stack>
                  </Stack>

                  <div
                    style={{
                      borderTop: "1px solid var(--borderColor-muted)",
                      paddingTop: sectionPadY,
                    }}
                  >
                    <Stack
                      direction="horizontal"
                      gap="condensed"
                      align="center"
                      justify="space-between"
                      wrap="wrap"
                    >
                      <Stack direction="horizontal" gap="condensed" align="center">
                        <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
                          <GitBranchIcon size={16} />
                        </span>
                        <Text style={{ color: "var(--fgColor-muted)" }}>
                          {branchDeleted ? (
                            <>
                              The <BranchName as="span">{PR.head}</BranchName> branch was deleted.
                            </>
                          ) : (
                            <>
                              The <BranchName as="span">{PR.head}</BranchName> branch can now be
                              deleted.
                            </>
                          )}
                        </Text>
                      </Stack>
                      <Button
                        variant={branchDeleted ? "default" : "danger"}
                        leadingVisual={branchDeleted ? GitBranchIcon : TrashIcon}
                        onClick={() => setBranchDeleted((v) => !v)}
                      >
                        {branchDeleted ? "Restore branch" : "Delete branch"}
                      </Button>
                    </Stack>
                  </div>
                </Stack>
              </div>
            )}
          </div>
        </div>
      </Stack>
    </main>
  );
}
