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
  CheckIcon,
  FileDiffIcon,
  GitCommitIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
} from "@primer/octicons-react";

/* ── Invented fixture data (no real GitHub names / mascots) ──────────────── */
const REPO = "lumen-labs/aurora";
const PR_NUMBER = 482;
const PR_TITLE = "Stream large exports without buffering the whole file";
const SOURCE_BRANCH = "feat/streaming-export";
const TARGET_BRANCH = "main";
const AUTHOR = "marigold-dev";
const COMMIT_COUNT = 7;
const FILES_CHANGED = 12;

const TOPIC_LABELS: { name: string; variant: "accent" | "success" | "done" }[] =
  [
    { name: "enhancement", variant: "accent" },
    { name: "performance", variant: "done" },
    { name: "reviewed", variant: "success" },
  ];

type CheckStatus = "running" | "success";
type Check = { id: string; name: string; context: string; status: CheckStatus };

const INITIAL_CHECKS: Check[] = [
  { id: "build", name: "build", context: "compile / bundle", status: "running" },
  { id: "unit", name: "test", context: "unit suite", status: "running" },
  { id: "lint", name: "lint", context: "static analysis", status: "running" },
  {
    id: "integration",
    name: "test",
    context: "integration suite",
    status: "running",
  },
  {
    id: "preview",
    name: "deploy",
    context: "preview environment",
    status: "running",
  },
];

/* Simulation cadence — app logic (not a styling value): the checks resolve
   one-by-one over roughly six seconds. */
const FIRST_DELAY_MS = 900;
const STEP_MS = 1100;

type MergeMethod = "merge" | "squash" | "rebase";
const MERGE_METHODS: { value: MergeMethod; option: string; action: string }[] = [
  { value: "merge", option: "Create a merge commit", action: "Merge pull request" },
  { value: "squash", option: "Squash and merge", action: "Squash and merge" },
  { value: "rebase", option: "Rebase and merge", action: "Rebase and merge" },
];

const card: React.CSSProperties = {
  border: "1px solid var(--borderColor-default)",
  borderRadius: "var(--borderRadius-medium, 8px)",
  backgroundColor: "var(--bgColor-default)",
  boxShadow: "var(--shadow-resting-medium)",
  overflow: "hidden",
};

const section: React.CSSProperties = {
  padding: "var(--base-size-16, 16px)",
};

const divider: React.CSSProperties = {
  borderTop: "1px solid var(--borderColor-muted)",
};

export function PrMergedTheater() {
  const { resolvedColorMode, setColorMode } = useTheme();
  const isDark = resolvedColorMode === "dark" || resolvedColorMode === "night";

  // Mirror the design system's resolved color mode onto the document root so
  // the page background (which sits OUTSIDE the ThemeProvider's wrapper div)
  // recolors through Primer tokens too — not just the card. This also makes
  // the active mode observable to a headless test via
  // document.documentElement[data-color-mode].
  useEffect(() => {
    if (!resolvedColorMode) return;
    document.documentElement.setAttribute(
      "data-color-mode",
      isDark ? "dark" : "light",
    );
  }, [resolvedColorMode, isDark]);

  const [checks, setChecks] = useState<Check[]>(INITIAL_CHECKS);
  const [merged, setMerged] = useState(false);
  const [branchExists, setBranchExists] = useState(true);

  // Editable merge box state.
  const [method, setMethod] = useState<MergeMethod>("merge");
  const [headline, setHeadline] = useState(
    `Merge pull request #${PR_NUMBER} from ${SOURCE_BRANCH}`,
  );
  const [description, setDescription] = useState("");
  const [deleteBranch, setDeleteBranch] = useState(false);

  useEffect(() => {
    const timers = INITIAL_CHECKS.map((c, i) =>
      setTimeout(
        () =>
          setChecks((prev) =>
            prev.map((x) =>
              x.id === c.id ? { ...x, status: "success" } : x,
            ),
          ),
        FIRST_DELAY_MS + i * STEP_MS,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const passed = checks.filter((c) => c.status === "success").length;
  const total = checks.length;
  const ready = passed === total;

  const activeMethod =
    MERGE_METHODS.find((m) => m.value === method) ?? MERGE_METHODS[0];

  const handleMerge = () => {
    setMerged(true);
    if (deleteBranch) setBranchExists(false);
  };

  return (
    <Stack
      as="main"
      direction="vertical"
      gap="normal"
      padding="spacious"
      style={{ maxWidth: 820, marginInline: "auto", width: "100%" }}
    >
      {/* Top bar: page heading + color-mode control */}
      <Stack direction="horizontal" justify="space-between" align="center">
        <Text style={{ color: "var(--fgColor-muted)" }} size="small">
          {REPO}
        </Text>
        <IconButton
          data-testid="color-mode-toggle"
          icon={isDark ? SunIcon : MoonIcon}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          variant="invisible"
          onClick={() => setColorMode(isDark ? "light" : "dark")}
        />
      </Stack>

      {/* PR header */}
      <Stack direction="vertical" gap="condensed">
        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          <span className={merged ? "theater-beat" : undefined}>
            <StateLabel status={merged ? "pullMerged" : "pullOpened"}>
              {merged ? "Merged" : "Open"}
            </StateLabel>
          </span>
          <Heading as="h1" variant="medium">
            {PR_TITLE}{" "}
            <Text style={{ color: "var(--fgColor-muted)", fontWeight: 400 }}>
              #{PR_NUMBER}
            </Text>
          </Heading>
        </Stack>

        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            <Text weight="semibold" style={{ color: "var(--fgColor-default)" }}>
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

        {/* Topic labels + running counts */}
        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          {TOPIC_LABELS.map((l) => (
            <Label key={l.name} variant={l.variant}>
              {l.name}
            </Label>
          ))}
          <span
            aria-hidden
            style={{
              width: 1,
              alignSelf: "stretch",
              backgroundColor: "var(--borderColor-muted)",
              marginInline: "var(--base-size-8, 8px)",
            }}
          />
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            <GitCommitIcon size={16} aria-hidden /> Commits{" "}
            <CounterLabel variant="primary">{COMMIT_COUNT}</CounterLabel>
          </Text>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            <CheckIcon size={16} aria-hidden /> Checks{" "}
            <CounterLabel variant={ready ? "primary" : "secondary"}>
              {passed}/{total}
            </CounterLabel>
          </Text>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            <FileDiffIcon size={16} aria-hidden /> Files changed{" "}
            <CounterLabel variant="secondary">{FILES_CHANGED}</CounterLabel>
          </Text>
        </Stack>
      </Stack>

      {/* Merge box */}
      <div style={card} className="theater-statechange">
        {/* CI checks wall */}
        <div style={section}>
          <Stack direction="vertical" gap="condensed">
            <Stack
              direction="horizontal"
              justify="space-between"
              align="center"
            >
              <Heading as="h2" variant="small">
                {ready ? "All checks have passed" : "Checks in progress"}
              </Heading>
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                {passed} of {total} successful
              </Text>
            </Stack>

            <ProgressBar
              progress={(passed / total) * 100}
              animated={!ready}
              aria-label={`Checks passed: ${passed} of ${total}`}
            />

            <Timeline clipSidebar>
              {checks.map((c) => {
                const done = c.status === "success";
                return (
                  <Timeline.Item key={c.id} condensed>
                    <Timeline.Badge
                      variant={done ? "success" : undefined}
                      className={done ? "theater-land" : undefined}
                    >
                      {done ? (
                        <CheckIcon aria-hidden />
                      ) : (
                        <Spinner size="small" srText={null} />
                      )}
                    </Timeline.Badge>
                    <Timeline.Body>
                      <Text weight="semibold">{c.name}</Text>{" "}
                      <Text style={{ color: "var(--fgColor-muted)" }}>
                        / {c.context}
                      </Text>
                      {" — "}
                      <Text
                        size="small"
                        style={{
                          color: done
                            ? "var(--fgColor-success)"
                            : "var(--fgColor-muted)",
                        }}
                      >
                        {done ? "Successful" : "In progress…"}
                      </Text>
                    </Timeline.Body>
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </Stack>
        </div>

        {/* Merge controls */}
        <div style={{ ...section, ...divider }}>
          {merged ? (
            <MergedConfirmation
              method={activeMethod.action}
              branchExists={branchExists}
              onToggleBranch={() => setBranchExists((b) => !b)}
            />
          ) : ready ? (
            <ReadyMergeBox
              method={method}
              onMethod={setMethod}
              headline={headline}
              onHeadline={setHeadline}
              description={description}
              onDescription={setDescription}
              deleteBranch={deleteBranch}
              onDeleteBranch={setDeleteBranch}
              actionLabel={activeMethod.action}
              onMerge={handleMerge}
            />
          ) : (
            <Stack direction="vertical" gap="condensed">
              <Stack direction="horizontal" gap="condensed" align="center">
                <Spinner size="small" srText={null} />
                <Text weight="semibold">Merging is blocked</Text>
              </Stack>
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                Required status checks must pass before this pull request can be
                merged.
              </Text>
              {/* Genuinely unavailable: disabled removes it from the tab order
                  and from the SR's actionable surface. */}
              <Button
                variant="primary"
                leadingVisual={GitMergeIcon}
                disabled
              >
                Merge pull request
              </Button>
            </Stack>
          )}
        </div>
      </div>
    </Stack>
  );
}

/* ── Ready: the full, editable merge box ─────────────────────────────────── */
function ReadyMergeBox({
  method,
  onMethod,
  headline,
  onHeadline,
  description,
  onDescription,
  deleteBranch,
  onDeleteBranch,
  actionLabel,
  onMerge,
}: {
  method: MergeMethod;
  onMethod: (m: MergeMethod) => void;
  headline: string;
  onHeadline: (v: string) => void;
  description: string;
  onDescription: (v: string) => void;
  deleteBranch: boolean;
  onDeleteBranch: (v: boolean) => void;
  actionLabel: string;
  onMerge: () => void;
}) {
  return (
    <Stack direction="vertical" gap="normal" className="theater-enter">
      {/* The "ready" cue — announced politely, not just shown. */}
      <Flash variant="success" role="status" aria-live="polite">
        <CheckIcon size={16} aria-hidden /> All checks have passed — this branch
        is ready to merge.
      </Flash>

      <FormControl>
        <FormControl.Label>Merge method</FormControl.Label>
        <Select
          value={method}
          onChange={(e) => onMethod(e.target.value as MergeMethod)}
          block
        >
          {MERGE_METHODS.map((m) => (
            <Select.Option key={m.value} value={m.value}>
              {m.option}
            </Select.Option>
          ))}
        </Select>
        <FormControl.Caption>
          Choose how the commits from this branch are added to {TARGET_BRANCH}.
        </FormControl.Caption>
      </FormControl>

      <FormControl>
        <FormControl.Label>Commit headline</FormControl.Label>
        <TextInput
          value={headline}
          onChange={(e) => onHeadline(e.target.value)}
          block
        />
      </FormControl>

      <FormControl>
        <FormControl.Label>Extended description</FormControl.Label>
        <Textarea
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          resize="vertical"
          placeholder="Add an optional extended description…"
          block
        />
      </FormControl>

      <FormControl>
        <Checkbox
          checked={deleteBranch}
          onChange={(e) => onDeleteBranch(e.target.checked)}
        />
        <FormControl.Label>
          Delete {SOURCE_BRANCH} after merge
        </FormControl.Label>
        <FormControl.Caption>
          The branch is removed once the pull request is merged.
        </FormControl.Caption>
      </FormControl>

      <Stack direction="horizontal" gap="condensed" align="center">
        <Button
          variant="primary"
          leadingVisual={GitMergeIcon}
          onClick={onMerge}
        >
          {actionLabel}
        </Button>
        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
          You can also merge from the command line.
        </Text>
      </Stack>
    </Stack>
  );
}

/* ── Merged: quiet confirmation that honors the branch choice ────────────── */
function MergedConfirmation({
  method,
  branchExists,
  onToggleBranch,
}: {
  method: string;
  branchExists: boolean;
  onToggleBranch: () => void;
}) {
  return (
    <Stack direction="vertical" gap="condensed" className="theater-enter">
      <Stack direction="horizontal" gap="condensed" align="center">
        <span style={{ color: "var(--fgColor-done)" }}>
          <GitMergeIcon size={16} aria-hidden />
        </span>
        <Text weight="semibold">Pull request successfully merged and closed</Text>
      </Stack>
      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
        The commits from {SOURCE_BRANCH} were added to {TARGET_BRANCH} via{" "}
        {method.toLowerCase()}.
      </Text>

      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
        {branchExists ? (
          <>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              You can safely delete the branch{" "}
              <BranchName as="span">{SOURCE_BRANCH}</BranchName>.
            </Text>
            <Button
              variant="danger"
              leadingVisual={TrashIcon}
              onClick={onToggleBranch}
            >
              Delete branch
            </Button>
          </>
        ) : (
          <>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              The branch{" "}
              <BranchName as="span">{SOURCE_BRANCH}</BranchName> was deleted.
            </Text>
            <Button leadingVisual={GitPullRequestIcon} onClick={onToggleBranch}>
              Restore branch
            </Button>
          </>
        )}
      </Stack>
    </Stack>
  );
}
