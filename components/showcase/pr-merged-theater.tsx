"use client";

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
  Stack,
  StateLabel,
  Text,
  Textarea,
  TextInput,
  Timeline,
  useTheme,
} from "@primer/react";
import {
  CheckCircleFillIcon,
  CheckIcon,
  ClockIcon,
  FileDiffIcon,
  GitBranchIcon,
  GitCommitIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
  XIcon,
  type Icon,
} from "@primer/octicons-react";
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import styles from "./pr-merged-theater.module.css";

type CheckStatus = "pending" | "running" | "success" | "failure";
type Phase = "checking" | "ready" | "merged";
type MergeMethod = "merge" | "squash" | "rebase";

type CheckRun = {
  id: string;
  context: string;
  name: string;
  status: CheckStatus;
};

// --- Invented fixture data: fictional repo, users, branches, checks. ---

const PR = {
  number: 481,
  title: "Add merge-queue orchestration to the deploy pipeline",
  author: "marisol-vega",
  base: "main",
  head: "feat/merge-queue-orchestrator",
  commits: 7,
  filesChanged: 12,
  openedAt: "2026-06-15T09:24:00Z",
  reviewers: ["dmitri-k", "aria-osei"],
} as const;

const INITIAL_CHECKS: CheckRun[] = [
  { id: "lint", context: "lint", name: "eslint", status: "running" },
  { id: "build", context: "build", name: "next build", status: "pending" },
  { id: "unit", context: "unit-tests", name: "vitest", status: "pending" },
  { id: "e2e", context: "end-to-end", name: "playwright", status: "pending" },
  { id: "preview", context: "preview", name: "deploy", status: "pending" },
  { id: "security", context: "security", name: "codeql", status: "pending" },
];

const METHOD_META: Record<
  MergeMethod,
  { action: string; icon: Icon; pastTense: string; caption: string }
> = {
  merge: {
    action: "Merge pull request",
    icon: GitMergeIcon,
    pastTense: "merged",
    caption: `All ${PR.commits} commits from this branch will be added to ${PR.base} via a merge commit.`,
  },
  squash: {
    action: "Squash and merge",
    icon: GitCommitIcon,
    pastTense: "squashed and merged",
    caption: `The ${PR.commits} commits from this branch will be combined into one commit on ${PR.base}.`,
  },
  rebase: {
    action: "Rebase and merge",
    icon: GitBranchIcon,
    pastTense: "rebased and merged",
    caption: `The ${PR.commits} commits from this branch will be rebased onto ${PR.base}.`,
  },
};

// Client-side simulation pacing for the check progression. Per the spec, the
// checks are simulated with timers over "roughly six seconds". These are
// simulation cadences (business logic), NOT visual motion — every CSS
// transition/animation is sourced from Primer's `--motion-*` tokens instead.
const STEP_MS = 900;
const READY_DELAY_MS = 450;

const panelStyle: CSSProperties = {
  backgroundColor: "var(--bgColor-default)",
  border: "1px solid var(--borderColor-default)",
  borderRadius: "var(--borderRadius-large, 12px)",
  boxShadow: "var(--shadow-resting-medium)",
  padding: "var(--base-size-24, 1.5rem)",
};

const mergeBoxStyle: CSSProperties = {
  border: "1px solid var(--borderColor-default)",
  borderRadius: "var(--borderRadius-medium, 8px)",
  padding: "var(--base-size-16, 1rem)",
};

const dividerStyle: CSSProperties = {
  borderTop: "1px solid var(--borderColor-muted)",
  paddingTop: "var(--base-size-16, 1rem)",
};

const muted: CSSProperties = { color: "var(--fgColor-muted)" };

function checkPresentation(status: CheckStatus): {
  variant: "success" | "danger" | undefined;
  glyph: ReactNode;
  label: string;
  color: string;
} {
  switch (status) {
    case "success":
      return {
        variant: "success",
        glyph: <CheckIcon size={16} />,
        label: "Passed",
        color: "var(--fgColor-success)",
      };
    case "failure":
      return {
        variant: "danger",
        glyph: <XIcon size={16} />,
        label: "Failed",
        color: "var(--fgColor-danger)",
      };
    case "running":
      return {
        variant: undefined,
        glyph: <Spinner size="small" srText={null} />,
        label: "Running",
        color: "var(--fgColor-muted)",
      };
    case "pending":
    default:
      return {
        variant: undefined,
        glyph: <ClockIcon size={16} />,
        label: "Queued",
        color: "var(--fgColor-muted)",
      };
  }
}

function CountChip({
  icon: ChipIcon,
  label,
  count,
  testId,
}: {
  icon: Icon;
  label: string;
  count: ReactNode;
  testId?: string;
}) {
  return (
    <Stack direction="horizontal" gap="condensed" align="center">
      <ChipIcon size={16} fill="var(--fgColor-muted)" />
      <Text size="small" style={muted}>
        {label}
      </Text>
      <CounterLabel data-testid={testId}>{count}</CounterLabel>
    </Stack>
  );
}

export function PrMergedTheater() {
  const [checks, setChecks] = useState<CheckRun[]>(INITIAL_CHECKS);
  const [phase, setPhase] = useState<Phase>("checking");
  const [method, setMethod] = useState<MergeMethod>("merge");
  const [headline, setHeadline] = useState(`${PR.title} (#${PR.number})`);
  const [description, setDescription] = useState(
    "Introduces a merge-queue orchestrator so queued pull requests land in order once their required checks pass.",
  );
  const [deleteBranch, setDeleteBranch] = useState(true);
  const [branchDeleted, setBranchDeleted] = useState(false);

  const { resolvedColorMode, setColorMode } = useTheme();
  const isDark = resolvedColorMode === "dark" || resolvedColorMode === "night";

  const total = INITIAL_CHECKS.length;
  const passed = checks.filter((c) => c.status === "success").length;
  const progress = Math.round((passed / total) * 100);
  const merged = phase === "merged";

  // Simulate the check progression: resolve one check per STEP_MS, advancing
  // the next into a "running" state, then reveal the ready cue.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    INITIAL_CHECKS.forEach((_, i) => {
      timers.push(
        setTimeout(
          () => {
            setChecks((prev) =>
              prev.map((c, idx) => {
                if (idx === i) return { ...c, status: "success" };
                if (idx === i + 1) return { ...c, status: "running" };
                return c;
              }),
            );
          },
          (i + 1) * STEP_MS,
        ),
      );
    });
    timers.push(
      setTimeout(() => setPhase("ready"), total * STEP_MS + READY_DELAY_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [total]);

  // Drive the design system's resolved color mode onto the document root so
  // BOTH the page background (resolved against <html>) recolors AND a headless
  // test can read the active mode from `document.documentElement`. The choice
  // itself flows through Primer's `setColorMode`, not a hand-rolled class swap.
  useEffect(() => {
    if (!resolvedColorMode) return;
    const mode =
      resolvedColorMode === "dark" || resolvedColorMode === "night"
        ? "dark"
        : "light";
    document.documentElement.setAttribute("data-color-mode", mode);
  }, [resolvedColorMode]);

  function handleMerge() {
    setBranchDeleted(deleteBranch);
    setPhase("merged");
  }

  const TitleIcon = merged ? GitMergeIcon : GitPullRequestIcon;

  return (
    <main
      style={{
        maxWidth: 940,
        margin: "0 auto",
        padding: "var(--base-size-32, 2rem) var(--base-size-16, 1rem)",
      }}
    >
      <div style={panelStyle}>
        <Stack direction="vertical" gap="normal">
          {/* ---------- Header ---------- */}
          <Stack
            direction="horizontal"
            justify="space-between"
            align="start"
            gap="normal"
          >
            <Stack direction="vertical" gap="condensed">
              <Stack
                direction="horizontal"
                gap="condensed"
                align="center"
                wrap="wrap"
              >
                <TitleIcon
                  size={24}
                  fill={merged ? "var(--fgColor-done)" : "var(--fgColor-success)"}
                />
                <Heading as="h1" variant="medium">
                  {PR.title}
                </Heading>
                <Text size="medium" style={muted}>
                  #{PR.number}
                </Text>
              </Stack>

              <Stack
                direction="horizontal"
                gap="condensed"
                align="center"
                wrap="wrap"
              >
                <span
                  data-testid="pr-state"
                  className={merged ? styles.capsulePop : styles.capsule}
                >
                  <StateLabel status={merged ? "pullMerged" : "pullOpened"}>
                    {merged ? "Merged" : "Open"}
                  </StateLabel>
                </span>
                <Text size="small" style={muted}>
                  <Text
                    as="span"
                    weight="semibold"
                    style={{ color: "var(--fgColor-default)" }}
                  >
                    @{PR.author}
                  </Text>{" "}
                  {merged ? METHOD_META[method].pastTense : "wants to merge"}{" "}
                  {PR.commits} commits into
                </Text>
                <BranchName as="span">{PR.base}</BranchName>
                <Text size="small" style={muted}>
                  from
                </Text>
                <BranchName as="span">{PR.head}</BranchName>
              </Stack>

              <Text size="small" style={muted}>
                Opened{" "}
                <RelativeTime datetime={PR.openedAt} tense="past">
                  on Jun 15, 2026
                </RelativeTime>
              </Text>
            </Stack>

            <IconButton
              data-testid="color-mode-toggle"
              icon={isDark ? SunIcon : MoonIcon}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              variant="invisible"
              onClick={() => setColorMode(isDark ? "light" : "dark")}
            />
          </Stack>

          {/* ---------- Metadata: topic labels + running counts ---------- */}
          <Stack
            direction="horizontal"
            justify="space-between"
            align="center"
            wrap="wrap"
            gap="normal"
          >
            <Stack
              direction="horizontal"
              gap="condensed"
              align="center"
              wrap="wrap"
            >
              <Label variant="accent">deploy-pipeline</Label>
              <Label variant="done">enhancement</Label>
              <Label variant="attention">needs-changelog</Label>
            </Stack>

            <Stack
              direction="horizontal"
              gap="normal"
              align="center"
              wrap="wrap"
            >
              <CountChip
                icon={GitCommitIcon}
                label="Commits"
                count={PR.commits}
              />
              <CountChip
                icon={CheckIcon}
                label="Checks"
                count={`${passed}/${total}`}
                testId="checks-passed"
              />
              <CountChip
                icon={FileDiffIcon}
                label="Files"
                count={PR.filesChanged}
              />
            </Stack>
          </Stack>

          {/* ---------- Merge box ---------- */}
          <div style={mergeBoxStyle}>
            <Stack direction="vertical" gap="normal">
              {!merged && (
                <>
                  {/* Reviews */}
                  <Stack
                    direction="horizontal"
                    gap="condensed"
                    align="center"
                    wrap="wrap"
                  >
                    <CheckCircleFillIcon
                      size={16}
                      fill="var(--fgColor-success)"
                    />
                    <Text weight="semibold">
                      {PR.reviewers.length} approving reviews
                    </Text>
                    <Text size="small" style={muted}>
                      {PR.reviewers.map((r) => `@${r}`).join(" and ")} approved
                      these changes
                    </Text>
                  </Stack>

                  {/* Checks wall + progress */}
                  <div style={dividerStyle}>
                    <Stack direction="vertical" gap="condensed">
                      <Stack
                        direction="horizontal"
                        justify="space-between"
                        align="center"
                      >
                        <Heading as="h2" variant="small">
                          Checks
                        </Heading>
                        <Text size="small" style={muted}>
                          {passed} of {total} checks passed
                        </Text>
                      </Stack>

                      <ProgressBar
                        className={styles.checksProgress}
                        progress={progress}
                        bg="success.emphasis"
                        aria-label={`${passed} of ${total} checks passed`}
                        animated={phase === "checking"}
                      />

                      <Timeline clipSidebar>
                        {checks.map((check) => {
                          const pres = checkPresentation(check.status);
                          const resolved =
                            check.status === "success" ||
                            check.status === "failure";
                          return (
                            <Timeline.Item key={check.id} condensed>
                              <Timeline.Badge
                                variant={pres.variant}
                                className={
                                  resolved ? styles.badgePop : undefined
                                }
                              >
                                {pres.glyph}
                              </Timeline.Badge>
                              <Timeline.Body>
                                <Stack
                                  direction="horizontal"
                                  justify="space-between"
                                  align="center"
                                  gap="condensed"
                                >
                                  <Stack direction="vertical" gap="none">
                                    <Text weight="semibold">
                                      {check.context}
                                    </Text>
                                    <Text size="small" style={muted}>
                                      {check.name}
                                    </Text>
                                  </Stack>
                                  <Text
                                    size="small"
                                    style={{ color: pres.color }}
                                  >
                                    {pres.label}
                                  </Text>
                                </Stack>
                              </Timeline.Body>
                            </Timeline.Item>
                          );
                        })}
                      </Timeline>
                    </Stack>
                  </div>

                  {/* Ready cue */}
                  {phase === "ready" && (
                    <Flash variant="success" role="status">
                      <Stack
                        direction="horizontal"
                        gap="condensed"
                        align="center"
                        wrap="wrap"
                      >
                        <CheckCircleFillIcon
                          size={16}
                          fill="var(--fgColor-success)"
                        />
                        <Text weight="semibold">All checks have passed</Text>
                        <Text style={muted}>
                          {total} successful checks — this branch is ready to
                          merge.
                        </Text>
                      </Stack>
                    </Flash>
                  )}

                  {/* Merge controls */}
                  <div style={dividerStyle}>
                    {phase === "checking" ? (
                      <Text style={muted}>
                        Merging is blocked until all required checks pass.
                      </Text>
                    ) : (
                      <div className={styles.reveal} key="merge-form">
                        <Stack direction="vertical" gap="normal">
                          <FormControl>
                            <FormControl.Label>Merge method</FormControl.Label>
                            <Select
                              block
                              value={method}
                              onChange={(e) =>
                                setMethod(e.target.value as MergeMethod)
                              }
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
                              {METHOD_META[method].caption}
                            </FormControl.Caption>
                          </FormControl>

                          <FormControl>
                            <FormControl.Label>
                              Commit message
                            </FormControl.Label>
                            <TextInput
                              block
                              value={headline}
                              onChange={(e) => setHeadline(e.target.value)}
                            />
                          </FormControl>

                          <FormControl>
                            <FormControl.Label>
                              Extended description
                            </FormControl.Label>
                            <Textarea
                              block
                              resize="vertical"
                              rows={3}
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                            />
                          </FormControl>

                          <FormControl>
                            <Checkbox
                              checked={deleteBranch}
                              onChange={(e) =>
                                setDeleteBranch(e.target.checked)
                              }
                            />
                            <FormControl.Label>
                              Delete branch after merge
                            </FormControl.Label>
                            <FormControl.Caption>
                              Automatically delete the {PR.head} branch once
                              this pull request is merged.
                            </FormControl.Caption>
                          </FormControl>

                          <div style={dividerStyle}>
                            <Stack
                              direction="horizontal"
                              justify="end"
                              gap="condensed"
                            >
                              <Button
                                data-testid="merge-button"
                                variant="primary"
                                leadingVisual={METHOD_META[method].icon}
                                onClick={handleMerge}
                              >
                                {METHOD_META[method].action}
                              </Button>
                            </Stack>
                          </div>
                        </Stack>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Quiet confirmation after merge */}
              {merged && (
                <div
                  className={styles.reveal}
                  role="status"
                  data-testid="merged-confirmation"
                  key="merged-confirmation"
                >
                  <Stack direction="vertical" gap="normal">
                    <Stack
                      direction="horizontal"
                      gap="condensed"
                      align="center"
                    >
                      <GitMergeIcon size={24} fill="var(--fgColor-done)" />
                      <Stack direction="vertical" gap="none">
                        <Text weight="semibold">
                          Pull request successfully merged and closed
                        </Text>
                        <Text size="small" style={muted}>
                          @{PR.author} {METHOD_META[method].pastTense}{" "}
                          {PR.commits} commits into{" "}
                          <BranchName as="span">{PR.base}</BranchName>.
                        </Text>
                      </Stack>
                    </Stack>

                    <div style={dividerStyle}>
                      {branchDeleted ? (
                        <Stack
                          direction="horizontal"
                          gap="condensed"
                          align="center"
                          wrap="wrap"
                        >
                          <Text style={muted}>
                            The <BranchName as="span">{PR.head}</BranchName>{" "}
                            branch was deleted.
                          </Text>
                          <Button
                            variant="default"
                            leadingVisual={GitBranchIcon}
                            onClick={() => setBranchDeleted(false)}
                          >
                            Restore branch
                          </Button>
                        </Stack>
                      ) : (
                        <Stack
                          direction="horizontal"
                          gap="condensed"
                          align="center"
                          wrap="wrap"
                        >
                          <Text style={muted}>
                            You can safely delete the{" "}
                            <BranchName as="span">{PR.head}</BranchName> branch.
                          </Text>
                          <Button
                            variant="danger"
                            leadingVisual={TrashIcon}
                            onClick={() => setBranchDeleted(true)}
                          >
                            Delete branch
                          </Button>
                        </Stack>
                      )}
                    </div>
                  </Stack>
                </div>
              )}
            </Stack>
          </div>
        </Stack>
      </div>
    </main>
  );
}
