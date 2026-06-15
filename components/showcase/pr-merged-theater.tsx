"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
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
  GitBranchIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
} from "@primer/octicons-react";
import styles from "./pr-merged-theater.module.css";

// ---------------------------------------------------------------------------
// Invented data — fictional repo, branches, author, labels, and check names.
// No GitHub mascot names.
// ---------------------------------------------------------------------------
const REPO = "orbital-labs/aurora-console";
const PR_NUMBER = 482;
const PR_TITLE = "Add an on-demand color-mode switch to the merge theater";
const HEAD_BRANCH = "lunar/color-mode-encore";
const BASE_BRANCH = "trunk";
const AUTHOR = "marlowe";
const TOPICS = ["design-system", "accessibility", "motion"];

const COMMITS = 12;
const FILES_CHANGED = 8;

interface CheckDef {
  id: string;
  name: string;
  context: string;
}

const CHECKS: CheckDef[] = [
  { id: "build", name: "build", context: "Compile and bundle the app" },
  { id: "unit", name: "unit-tests", context: "Component and hook specs" },
  { id: "types", name: "typecheck", context: "tsc --noEmit, strict mode" },
  { id: "lint", name: "lint", context: "eslint, zero warnings" },
  { id: "a11y", name: "axe-audit", context: "Automated accessibility sweep" },
  { id: "e2e", name: "e2e-smoke", context: "Headless merge-flow walkthrough" },
];

// Simulation pacing. These are gameplay timers (when each check resolves),
// NOT visual-motion durations — those come from Primer motion tokens in the
// CSS module. Checks land one by one over ~5s; the box opens in the same beat
// the final check turns green, so the panel never claims "all passed" while
// the merge controls still read as blocked.
const FIRST_CHECK_MS = 700;
const CHECK_STEP_MS = 820;
const MERGE_SETTLE_MS = 950;

const MERGE_METHODS = [
  {
    value: "merge",
    action: "Create a merge commit",
    blurb:
      "All commits from this branch will be added to the base branch via a merge commit.",
  },
  {
    value: "squash",
    action: "Squash and merge",
    blurb:
      "The commits from this branch will be combined into one commit in the base branch.",
  },
  {
    value: "rebase",
    action: "Rebase and merge",
    blurb:
      "The commits from this branch will be rebased and added to the base branch.",
  },
] as const;

type MergeMethod = (typeof MERGE_METHODS)[number]["value"];
type Phase = "running" | "ready" | "merging" | "merged";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function PrMergedTheater() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <TopBar />
        <MergeCard />
      </div>
    </main>
  );
}

function TopBar() {
  return (
    <Stack
      as="header"
      direction="horizontal"
      align="center"
      justify="space-between"
      gap="condensed"
      wrap="wrap"
    >
      <Stack direction="horizontal" align="center" gap="condensed">
        <Glyph color="var(--fgColor-muted)">
          <GitPullRequestIcon size={16} />
        </Glyph>
        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
          {REPO}
        </Text>
      </Stack>
      <ColorModeToggle />
    </Stack>
  );
}

// The color-mode control IS a design-system IconButton with a real accessible
// name (which also becomes its tooltip) and a stable test handle. It drives
// Primer's own setColorMode; an effect mirrors the resolved mode onto the
// document root so the PAGE background recolors and the active mode is
// observable in the DOM for an automated test.
function ColorModeToggle() {
  const { resolvedColorMode, setColorMode } = useTheme();
  const isDark = resolvedColorMode === "dark" || resolvedColorMode === "night";

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
      onClick={() => setColorMode(isDark ? "light" : "dark")}
    />
  );
}

// ---------------------------------------------------------------------------
// The pull request panel + merge box
// ---------------------------------------------------------------------------
function MergeCard() {
  const [phase, setPhase] = useState<Phase>("running");
  const [resolved, setResolved] = useState(0);
  const [method, setMethod] = useState<MergeMethod>("merge");
  const [headline, setHeadline] = useState(`${PR_TITLE} (#${PR_NUMBER})`);
  const [description, setDescription] = useState("");
  const [deleteBranch, setDeleteBranch] = useState(true);
  const [branchDeleted, setBranchDeleted] = useState(false);

  // Resolve the checks one by one; the final check opens the merge box in the
  // same state update, so "all passed" and the editable form appear together.
  useEffect(() => {
    if (phase !== "running") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    CHECKS.forEach((_, i) => {
      const isLast = i === CHECKS.length - 1;
      timers.push(
        setTimeout(() => {
          setResolved((n) => Math.max(n, i + 1));
          if (isLast) setPhase((p) => (p === "running" ? "ready" : p));
        }, FIRST_CHECK_MS + i * CHECK_STEP_MS),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const total = CHECKS.length;
  const allGreen = resolved >= total;
  const isMerging = phase === "merging";
  const isMerged = phase === "merged";
  const showForm = phase === "ready" || phase === "merging";
  const pct = Math.round((resolved / total) * 100);

  const activeMethod =
    MERGE_METHODS.find((m) => m.value === method) ?? MERGE_METHODS[0];
  const commitEditable = method !== "rebase";

  const onMerge = () => {
    setPhase("merging");
    setTimeout(() => {
      setBranchDeleted(deleteBranch);
      setPhase("merged");
    }, MERGE_SETTLE_MS);
  };

  return (
    <Stack
      as="section"
      direction="vertical"
      gap="normal"
      aria-label={`Pull request #${PR_NUMBER}`}
      style={{
        width: "100%",
        border: "var(--borderWidth-thin) solid var(--borderColor-default)",
        borderRadius: "var(--borderRadius-large, 12px)",
        background: "var(--bgColor-default)",
        boxShadow: "var(--shadow-resting-medium)",
        padding: "var(--base-size-24, 24px)",
      }}
    >
      {/* Identity: capsule, who-into-what, title + number */}
      <Stack direction="vertical" gap="condensed">
        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          <span
            key={isMerged ? "merged" : "open"}
            className={styles.capsulePop}
          >
            {isMerged ? (
              <StateLabel status="pullMerged">Merged</StateLabel>
            ) : (
              <StateLabel status="pullOpened">Open</StateLabel>
            )}
          </span>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            <Text
              as="span"
              weight="semibold"
              style={{ color: "var(--fgColor-default)" }}
            >
              @{AUTHOR}
            </Text>{" "}
            wants to merge {COMMITS} commits into
          </Text>
          <BranchName as="span">{BASE_BRANCH}</BranchName>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            from
          </Text>
          <BranchName as="span">{HEAD_BRANCH}</BranchName>
        </Stack>

        <Stack direction="horizontal" gap="condensed" align="start">
          <Glyph color="var(--fgColor-muted)" style={{ paddingTop: "var(--base-size-2, 2px)" }}>
            <GitPullRequestIcon size={24} />
          </Glyph>
          <Heading as="h1" variant="medium" style={{ margin: 0, textWrap: "balance" }}>
            {PR_TITLE}{" "}
            <Text
              as="span"
              weight="light"
              style={{ color: "var(--fgColor-muted)" }}
            >
              #{PR_NUMBER}
            </Text>
          </Heading>
        </Stack>
      </Stack>

      {/* Metadata a maintainer scans: topics, running counts, progress */}
      <Stack direction="vertical" gap="condensed">
        <Stack direction="horizontal" gap="condensed" wrap="wrap" align="center">
          {TOPICS.map((topic) => (
            <Label key={topic} variant="accent">
              {topic}
            </Label>
          ))}
        </Stack>

        <Stack direction="horizontal" gap="normal" wrap="wrap" align="center">
          <CountStat label="Commits">
            <CounterLabel>{COMMITS}</CounterLabel>
          </CountStat>
          <CountStat label="Checks">
            <span key={resolved} className={styles.countPop}>
              <CounterLabel variant={allGreen ? "primary" : "secondary"}>
                {resolved}/{total}
              </CounterLabel>
            </span>
          </CountStat>
          <CountStat label="Files changed">
            <CounterLabel>{FILES_CHANGED}</CounterLabel>
          </CountStat>
        </Stack>

        <ProgressBar
          progress={pct}
          aria-label={`${resolved} of ${total} checks passed`}
        />
      </Stack>

      {/* The merge box */}
      <Stack
        direction="vertical"
        gap="normal"
        style={{
          border: "var(--borderWidth-thin) solid var(--borderColor-default)",
          borderRadius: "var(--borderRadius-medium, 8px)",
          background: "var(--bgColor-muted)",
          padding: "var(--base-size-16, 16px)",
        }}
      >
        {isMerged ? (
          <MergedConfirmation
            method={activeMethod.action}
            branchDeleted={branchDeleted}
            onToggleBranch={() => setBranchDeleted((b) => !b)}
          />
        ) : (
          <>
            <ChecksSection resolved={resolved} total={total} allGreen={allGreen} />
            {showForm ? (
              <>
                <Flash variant="success" role="status" className={styles.reveal}>
                  <Stack direction="horizontal" gap="condensed" align="center">
                    <Glyph color="var(--fgColor-success)">
                      <CheckCircleFillIcon size={16} />
                    </Glyph>
                    <Text>
                      All checks have passed. This branch has no conflicts with{" "}
                      {BASE_BRANCH}.
                    </Text>
                  </Stack>
                </Flash>

                <MergeForm
                  method={method}
                  setMethod={setMethod}
                  blurb={activeMethod.blurb}
                  action={activeMethod.action}
                  headline={headline}
                  setHeadline={setHeadline}
                  description={description}
                  setDescription={setDescription}
                  deleteBranch={deleteBranch}
                  setDeleteBranch={setDeleteBranch}
                  commitEditable={commitEditable}
                  isMerging={isMerging}
                  onMerge={onMerge}
                />
              </>
            ) : (
              <Stack direction="vertical" gap="condensed">
                <Button
                  variant="primary"
                  leadingVisual={GitMergeIcon}
                  disabled
                >
                  Merge pull request
                </Button>
                <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                  Merging is blocked until all checks pass.
                </Text>
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------
function ChecksSection({
  resolved,
  total,
  allGreen,
}: {
  resolved: number;
  total: number;
  allGreen: boolean;
}) {
  return (
    <Stack direction="vertical" gap="none">
      <Stack direction="horizontal" gap="condensed" align="center">
        <StatusGlyph done={allGreen} />
        <Text weight="semibold">
          {allGreen ? "All checks have passed" : "Checks are still running"}
        </Text>
        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
          {resolved} of {total} successful
        </Text>
      </Stack>

      <Stack
        as="ul"
        direction="vertical"
        gap="none"
        style={{ listStyle: "none", margin: 0, padding: 0 }}
      >
        {CHECKS.map((check, i) => (
          <CheckRow key={check.id} check={check} done={i < resolved} />
        ))}
      </Stack>
    </Stack>
  );
}

function CheckRow({ check, done }: { check: CheckDef; done: boolean }) {
  return (
    <Stack
      as="li"
      direction="horizontal"
      gap="condensed"
      align="center"
      justify="space-between"
      className={`${styles.checkRow} ${done ? styles.checkLanded : ""}`}
      style={{
        paddingBlock: "var(--base-size-8, 8px)",
        borderTop: "var(--borderWidth-thin) solid var(--borderColor-muted)",
      }}
    >
      <Stack direction="horizontal" gap="condensed" align="center">
        <StatusGlyph done={done} />
        <Stack direction="vertical" gap="none">
          <Text weight="semibold">{check.name}</Text>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            {check.context}
          </Text>
        </Stack>
      </Stack>
      <Text
        size="small"
        style={{
          color: done ? "var(--fgColor-success)" : "var(--fgColor-muted)",
          whiteSpace: "nowrap",
        }}
      >
        {done ? "Successful" : "In progress"}
      </Text>
    </Stack>
  );
}

function MergeForm({
  method,
  setMethod,
  blurb,
  action,
  headline,
  setHeadline,
  description,
  setDescription,
  deleteBranch,
  setDeleteBranch,
  commitEditable,
  isMerging,
  onMerge,
}: {
  method: MergeMethod;
  setMethod: (m: MergeMethod) => void;
  blurb: string;
  action: string;
  headline: string;
  setHeadline: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  deleteBranch: boolean;
  setDeleteBranch: (v: boolean) => void;
  commitEditable: boolean;
  isMerging: boolean;
  onMerge: () => void;
}) {
  return (
    <Stack direction="vertical" gap="normal" className={styles.reveal}>
      <FormControl>
        <FormControl.Label>Merge method</FormControl.Label>
        <Select
          value={method}
          onChange={(e) => setMethod(e.target.value as MergeMethod)}
          block
        >
          {MERGE_METHODS.map((m) => (
            <Select.Option key={m.value} value={m.value}>
              {m.action}
            </Select.Option>
          ))}
        </Select>
        <FormControl.Caption>{blurb}</FormControl.Caption>
      </FormControl>

      <FormControl disabled={!commitEditable}>
        <FormControl.Label>Commit message</FormControl.Label>
        <TextInput
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          block
        />
        {!commitEditable && (
          <FormControl.Caption>
            Rebasing replays each commit as-is, so there is no combined commit
            message to edit.
          </FormControl.Caption>
        )}
      </FormControl>

      <FormControl disabled={!commitEditable}>
        <FormControl.Label>Extended description</FormControl.Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          resize="vertical"
          placeholder="Add an optional extended description"
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
          Removes {HEAD_BRANCH} once the merge completes. You can restore it
          afterward.
        </FormControl.Caption>
      </FormControl>

      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
        <Button
          variant="primary"
          leadingVisual={GitMergeIcon}
          loading={isMerging}
          loadingAnnouncement="Merging pull request"
          onClick={onMerge}
        >
          {action}
        </Button>
        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
          You can edit the commit message before merging.
        </Text>
      </Stack>
    </Stack>
  );
}

function MergedConfirmation({
  method,
  branchDeleted,
  onToggleBranch,
}: {
  method: string;
  branchDeleted: boolean;
  onToggleBranch: () => void;
}) {
  return (
    <Stack direction="vertical" gap="normal" className={styles.reveal}>
      <Stack direction="horizontal" gap="condensed" align="center">
        <Glyph color="var(--fgColor-done)">
          <GitMergeIcon size={24} />
        </Glyph>
        <Stack direction="vertical" gap="none">
          <Text weight="semibold">
            Pull request successfully merged and closed
          </Text>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            {method} into {BASE_BRANCH}.
          </Text>
        </Stack>
      </Stack>

      <Stack
        direction="horizontal"
        gap="condensed"
        align="center"
        justify="space-between"
        wrap="wrap"
        style={{
          borderTop: "var(--borderWidth-thin) solid var(--borderColor-muted)",
          paddingTop: "var(--base-size-12, 12px)",
        }}
      >
        <Stack direction="horizontal" gap="condensed" align="center">
          <Glyph color="var(--fgColor-muted)">
            <GitBranchIcon size={16} />
          </Glyph>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            {branchDeleted ? (
              <>
                You deleted the <BranchName as="span">{HEAD_BRANCH}</BranchName>{" "}
                branch.
              </>
            ) : (
              <>
                The <BranchName as="span">{HEAD_BRANCH}</BranchName> branch can
                be safely deleted.
              </>
            )}
          </Text>
        </Stack>

        {branchDeleted ? (
          <Button leadingVisual={GitBranchIcon} onClick={onToggleBranch}>
            Restore branch
          </Button>
        ) : (
          <Button
            variant="danger"
            leadingVisual={TrashIcon}
            onClick={onToggleBranch}
          >
            Delete branch
          </Button>
        )}
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
function CountStat({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Stack direction="horizontal" gap="condensed" align="center">
      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
        {label}
      </Text>
      {children}
    </Stack>
  );
}

// An octicon's prop surface is closed (no `style`), so color it by wrapping in
// a parent that sets `color`; the SVG inherits via fill="currentColor".
function Glyph({
  color,
  style,
  children,
}: {
  color: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  return (
    <span style={{ display: "inline-flex", color, ...style }}>{children}</span>
  );
}

function StatusGlyph({ done }: { done: boolean }) {
  return (
    <Glyph color={done ? "var(--fgColor-success)" : "var(--fgColor-muted)"}>
      {done ? (
        <CheckCircleFillIcon size={16} />
      ) : (
        <Spinner size="small" srText={null} />
      )}
    </Glyph>
  );
}
