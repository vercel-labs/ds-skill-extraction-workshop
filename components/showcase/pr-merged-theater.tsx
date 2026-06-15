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
  RelativeTime,
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
  MoonIcon,
  SunIcon,
} from "@primer/octicons-react";

/* ---------------------------------------------------------------------------
   Invented fixture data — fictional repo, branches, author, labels, checks.
   No GitHub mascot names.
--------------------------------------------------------------------------- */

const REPO = "aurora-labs/comet-ui";
const PR_NUMBER = 482;
const PR_TITLE = "Stream merge events over the live channel";
const SOURCE_BRANCH = "feat/live-merge-stream";
const TARGET_BRANCH = "main";
const AUTHOR = "marisol-vega";
const COMMIT_COUNT = 7;
const FILES_CHANGED = 14;

const TOPIC_LABELS: { name: string; variant: "accent" | "done" }[] = [
  { name: "streaming", variant: "accent" },
  { name: "live-events", variant: "done" },
];

const CHECK_NAMES = [
  "lint",
  "typecheck",
  "unit · web",
  "unit · server",
  "build · preview",
  "e2e · smoke",
] as const;

/* Simulation pacing only — the cadence of the client-side timer that resolves
   the checks. This is gameplay logic, not visual styling: every CSS duration
   and easing comes from a Primer motion token (see globals.css). */
const CHECK_STAGGER_MS = 900;

type MergeMethod = "merge" | "squash" | "rebase";

const METHOD_LABEL: Record<MergeMethod, string> = {
  merge: "Merge pull request",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};

type Phase = "running" | "ready" | "merged";

/* Map Primer's resolvedColorMode (day|night|light|dark) onto the
   data-color-mode value the primitives theme selectors expect. */
function resolvedToAttr(mode: string | undefined): "light" | "dark" {
  return mode === "night" || mode === "dark" ? "dark" : "light";
}

export function PrMergedTheater() {
  return (
    <Stack
      direction="vertical"
      align="center"
      style={{ padding: "var(--base-size-24, 1.5rem)" }}
    >
      <Stack.Item>
        <div style={{ width: "min(720px, 100%)" }}>
          <Stack direction="vertical" gap="normal">
            <Header />
            <PullRequestPanel />
          </Stack>
        </div>
      </Stack.Item>
    </Stack>
  );
}

function Header() {
  return (
    <Stack direction="horizontal" align="center" justify="space-between">
      <Stack.Item>
        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
          {REPO}
        </Text>
      </Stack.Item>
      <Stack.Item>
        <ColorModeToggle />
      </Stack.Item>
    </Stack>
  );
}

function ColorModeToggle() {
  const { resolvedColorMode, setColorMode } = useTheme();
  const attr = resolvedToAttr(resolvedColorMode);

  // Mirror the design system's resolved color mode onto the document root so
  // the page background (painted by <body> against <html>'s data-color-mode)
  // recolors with the toggle, and so a headless test can read the active mode
  // off the document root instead of inferring it from a screenshot.
  useEffect(() => {
    document.documentElement.setAttribute("data-color-mode", attr);
  }, [attr]);

  const isDark = attr === "dark";

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

function PullRequestPanel() {
  const [phase, setPhase] = useState<Phase>("running");
  const [resolvedCount, setResolvedCount] = useState(0);
  // Whether the merge was performed with "delete branch" selected — drives the
  // post-merge follow-up (restore a deleted branch vs. delete a kept one).
  const [mergedWithDelete, setMergedWithDelete] = useState(true);

  // Resolve the checks one by one over ~6s, then open the merge box.
  useEffect(() => {
    if (resolvedCount >= CHECK_NAMES.length) {
      setPhase("ready");
      return;
    }
    const id = window.setTimeout(
      () => setResolvedCount((n) => n + 1),
      CHECK_STAGGER_MS,
    );
    return () => window.clearTimeout(id);
  }, [resolvedCount]);

  const allPassed = resolvedCount >= CHECK_NAMES.length;

  return (
    <Stack
      direction="vertical"
      gap="normal"
      style={{
        border: "1px solid var(--borderColor-default)",
        borderRadius: "var(--borderRadius-large, 12px)",
        backgroundColor: "var(--bgColor-default)",
        boxShadow: "var(--shadow-resting-medium)",
        padding: "var(--base-size-24, 1.5rem)",
      }}
    >
      <Stack.Item>
        <TitleBlock phase={phase} />
      </Stack.Item>

      <Stack.Item>
        <MetaRow passed={resolvedCount} total={CHECK_NAMES.length} />
      </Stack.Item>

      <Stack.Item>
        <div
          style={{
            borderTop: "1px solid var(--borderColor-muted)",
            paddingTop: "var(--base-size-16, 1rem)",
          }}
        >
          <MergeBox
            phase={phase}
            resolvedCount={resolvedCount}
            allPassed={allPassed}
            mergedWithDelete={mergedWithDelete}
            onMerge={(deleteBranch) => {
              setMergedWithDelete(deleteBranch);
              setPhase("merged");
            }}
          />
        </div>
      </Stack.Item>
    </Stack>
  );
}

function TitleBlock({ phase }: { phase: Phase }) {
  const merged = phase === "merged";
  return (
    <Stack direction="vertical" gap="condensed">
      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
        <Stack.Item>
          <span
            className="theater-capsule"
            data-flipping={merged ? "true" : "false"}
            data-testid="pr-state"
            data-state={merged ? "merged" : "open"}
            style={{ display: "inline-flex" }}
          >
            {merged ? (
              <StateLabel status="pullMerged">Merged</StateLabel>
            ) : (
              <StateLabel status="pullOpened">Open</StateLabel>
            )}
          </span>
        </Stack.Item>
        <Stack.Item>
          <Stack
            direction="horizontal"
            gap="condensed"
            align="center"
            wrap="wrap"
          >
            <BranchName as="span">{SOURCE_BRANCH}</BranchName>
            <Text style={{ color: "var(--fgColor-muted)" }} aria-hidden="true">
              →
            </Text>
            <BranchName as="span">{TARGET_BRANCH}</BranchName>
          </Stack>
        </Stack.Item>
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

      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
        @{AUTHOR} wants to merge {COMMIT_COUNT} commits into{" "}
        <Text as="span" weight="semibold">
          {TARGET_BRANCH}
        </Text>{" "}
        from{" "}
        <Text as="span" weight="semibold">
          {SOURCE_BRANCH}
        </Text>
      </Text>
    </Stack>
  );
}

function MetaRow({ passed, total }: { passed: number; total: number }) {
  return (
    <Stack direction="vertical" gap="condensed">
      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
        {TOPIC_LABELS.map((label) => (
          <Label key={label.name} variant={label.variant}>
            {label.name}
          </Label>
        ))}
      </Stack>

      <Stack direction="horizontal" gap="normal" align="center" wrap="wrap">
        <Count icon={<GitCommitIcon aria-hidden />} label="Commits">
          {COMMIT_COUNT}
        </Count>
        <Count icon={<CheckIcon aria-hidden />} label="Checks">
          {`${passed}/${total}`}
        </Count>
        <Count icon={<FileDiffIcon aria-hidden />} label="Files changed">
          {FILES_CHANGED}
        </Count>
      </Stack>
    </Stack>
  );
}

function Count({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack direction="horizontal" gap="condensed" align="center">
      <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
        {icon}
      </span>
      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
        {label}
      </Text>
      <CounterLabel variant="primary">{children}</CounterLabel>
    </Stack>
  );
}

function MergeBox({
  phase,
  resolvedCount,
  allPassed,
  mergedWithDelete,
  onMerge,
}: {
  phase: Phase;
  resolvedCount: number;
  allPassed: boolean;
  mergedWithDelete: boolean;
  onMerge: (deleteBranch: boolean) => void;
}) {
  if (phase === "merged") {
    return <MergedConfirmation deletedOnMerge={mergedWithDelete} />;
  }

  return (
    <Stack direction="vertical" gap="normal">
      <Stack.Item>
        <ChecksList resolvedCount={resolvedCount} />
      </Stack.Item>

      <Stack.Item>
        <ProgressBar
          progress={Math.round((resolvedCount / CHECK_NAMES.length) * 100)}
          bg="success.emphasis"
          aria-label={`Checks passed: ${resolvedCount} of ${CHECK_NAMES.length}`}
        />
      </Stack.Item>

      {allPassed ? (
        <>
          <Stack.Item>
            <div className="theater-enter">
              <Flash variant="success" role="status" aria-live="polite">
                <Stack direction="horizontal" gap="condensed" align="center">
                  <CheckIcon aria-hidden />
                  <Text weight="semibold">
                    All checks have passed — ready to merge
                  </Text>
                </Stack>
              </Flash>
            </div>
          </Stack.Item>
          <Stack.Item>
            <div className="theater-enter">
              <MergeForm onMerge={onMerge} />
            </div>
          </Stack.Item>
        </>
      ) : (
        <Stack.Item>
          <Stack direction="horizontal" gap="condensed" align="center">
            <Spinner size="small" srText={null} />
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              Checks are still running — merging is blocked until they pass.
            </Text>
          </Stack>
        </Stack.Item>
      )}
    </Stack>
  );
}

function ChecksList({ resolvedCount }: { resolvedCount: number }) {
  return (
    <Timeline clipSidebar>
      {CHECK_NAMES.map((name, index) => {
        const passed = index < resolvedCount;
        const status = passed ? "success" : "running";
        return (
          // Re-key on status so the row remounts when a check lands, replaying
          // the entrance beat once (and only when motion is allowed).
          <Timeline.Item key={`${name}-${status}`} condensed>
            <Timeline.Badge variant={passed ? "success" : undefined}>
              {passed ? (
                <span className="theater-beat" style={{ display: "inline-flex" }}>
                  <CheckIcon aria-hidden />
                </span>
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
                <Text>{name}</Text>
                <Text
                  size="small"
                  style={{
                    color: passed
                      ? "var(--fgColor-success)"
                      : "var(--fgColor-muted)",
                  }}
                >
                  {passed ? "Passed" : "Running…"}
                </Text>
              </Stack>
            </Timeline.Body>
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
}

function MergeForm({ onMerge }: { onMerge: (deleteBranch: boolean) => void }) {
  const [method, setMethod] = useState<MergeMethod>("merge");
  const [headline, setHeadline] = useState(
    `${PR_TITLE} (#${PR_NUMBER})`,
  );
  const [description, setDescription] = useState(
    "Adds a live channel that streams merge events to subscribed clients.",
  );
  const [deleteBranch, setDeleteBranch] = useState(true);

  const showCommitFields = method !== "rebase";

  return (
    <Stack direction="vertical" gap="normal">
      <Stack.Item>
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
            {method === "merge" &&
              "All commits from this branch will be added to the base branch via a merge commit."}
            {method === "squash" &&
              "The commits will be combined into one commit on the base branch."}
            {method === "rebase" &&
              "The commits will be rebased and added to the base branch without a merge commit."}
          </FormControl.Caption>
        </FormControl>
      </Stack.Item>

      {showCommitFields && (
        <>
          <Stack.Item>
            <FormControl>
              <FormControl.Label>Commit headline</FormControl.Label>
              <TextInput
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                block
              />
            </FormControl>
          </Stack.Item>

          <Stack.Item>
            <FormControl>
              <FormControl.Label>Extended description</FormControl.Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                resize="vertical"
                block
              />
              <FormControl.Caption>
                Add an optional extended description for the commit.
              </FormControl.Caption>
            </FormControl>
          </Stack.Item>
        </>
      )}

      <Stack.Item>
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
            The branch will be removed from the repository once the merge lands.
          </FormControl.Caption>
        </FormControl>
      </Stack.Item>

      <Stack.Item>
        <Button
          variant="primary"
          leadingVisual={GitMergeIcon}
          data-testid="merge-button"
          onClick={() => onMerge(deleteBranch)}
        >
          {METHOD_LABEL[method]}
        </Button>
      </Stack.Item>
    </Stack>
  );
}

function MergedConfirmation({ deletedOnMerge }: { deletedOnMerge: boolean }) {
  // The form collapses into a quiet confirmation. The branch follow-up honors
  // the delete choice made on the merge box: a deleted branch can be restored;
  // a kept branch can be deleted.
  const [branchDeleted, setBranchDeleted] = useState(deletedOnMerge);
  const [mergedAt] = useState(() => new Date());

  return (
    <div className="theater-enter">
      <Stack direction="vertical" gap="normal">
        <Stack.Item>
          <Stack direction="horizontal" gap="condensed" align="center">
            <span style={{ display: "inline-flex" }}>
              <GitMergeIcon
                fill="var(--fgColor-done)"
                aria-label="Merged"
                size={24}
              />
            </span>
            <Stack direction="vertical" gap="none">
              <Text weight="semibold">
                Pull request successfully merged and closed
              </Text>
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                @{AUTHOR} merged {COMMIT_COUNT} commits into {TARGET_BRANCH}{" "}
                from {SOURCE_BRANCH}{" "}
                <RelativeTime date={mergedAt} tense="past" format="relative">
                  just now
                </RelativeTime>
              </Text>
            </Stack>
          </Stack>
        </Stack.Item>

        <Stack.Item>
          <Stack
            direction="horizontal"
            gap="normal"
            align="center"
            justify="space-between"
            wrap="wrap"
          >
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              {branchDeleted ? (
                <>
                  The{" "}
                  <Text as="span" weight="semibold">
                    {SOURCE_BRANCH}
                  </Text>{" "}
                  branch was deleted.
                </>
              ) : (
                <>
                  The{" "}
                  <Text as="span" weight="semibold">
                    {SOURCE_BRANCH}
                  </Text>{" "}
                  branch can be safely deleted.
                </>
              )}
            </Text>
            <Button
              variant={branchDeleted ? "default" : "danger"}
              data-testid="branch-action"
              onClick={() => setBranchDeleted((d) => !d)}
            >
              {branchDeleted ? "Restore branch" : "Delete branch"}
            </Button>
          </Stack>
        </Stack.Item>
      </Stack>
    </div>
  );
}
