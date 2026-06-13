"use client";

// PR-merged theater (encore). A dense, alive GitHub-style pull request panel
// staged entirely client-side: CI checks resolve one by one over ~6s, the
// running counts tick up, and the moment everything is green the merge box
// opens into its full editable form. Click merge and the capsule flips
// Open -> Merged, the box collapses to a confirmation, and the branch choice
// is honored.
//
// Every component is from @primer/react root + @primer/octicons-react.
// Color, lifecycle, and motion come from the design system's semantic tokens;
// no hand-picked colors, durations, or easings live in this file.

import { useEffect, useMemo, useState } from "react";
import {
  BranchName,
  Button,
  Checkbox,
  CounterLabel,
  Flash,
  FormControl,
  Heading,
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
} from "@primer/react";
import {
  CheckIcon,
  CheckCircleIcon,
  FileDiffIcon,
  GitBranchIcon,
  GitCommitIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  TrashIcon,
} from "@primer/octicons-react";

// ---------------------------------------------------------------------------
// Invented data — fictional repo, branches, labels, check names, reviewers.
// ---------------------------------------------------------------------------

const REPO = "aurora-labs/flightdeck";
const PR_TITLE = "Add a semantic merge-method picker to the release flow";
const PR_NUMBER = 2148;
const AUTHOR = "marlowe-quinn";
const BASE_BRANCH = "main";
const HEAD_BRANCH = "feat/merge-method-picker";
const COMMIT_COUNT = 8;
const FILES_CHANGED = 12;
const APPROVALS = 2;

const TOPICS = ["enhancement", "design-system", "needs-review"];

type CheckStatus = "pending" | "success";

type Check = {
  id: string;
  name: string;
  context: string;
  duration: string;
};

const CHECKS: Check[] = [
  { id: "lint", name: "lint", context: "biome / code-style", duration: "18s" },
  { id: "unit", name: "unit-tests", context: "vitest / packages", duration: "1m 4s" },
  { id: "types", name: "typecheck", context: "tsc / --noEmit", duration: "42s" },
  { id: "build", name: "build", context: "turbopack / bundle", duration: "1m 21s" },
  { id: "e2e", name: "e2e-smoke", context: "playwright / chromium", duration: "2m 7s" },
  { id: "preview", name: "preview-deploy", context: "flightdeck / staging", duration: "55s" },
];

type Phase = "running" | "ready" | "merged";
type MergeMethod = "merge" | "squash" | "rebase";

const METHOD_LABEL: Record<MergeMethod, string> = {
  merge: "Merge pull request",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};

// Stagger the check resolution so the room watches the dominoes fall.
const FIRST_CHECK_DELAY = 700;
const CHECK_STEP = 900;

export function PrMergedTheater() {
  const [phase, setPhase] = useState<Phase>("running");
  const [checks, setChecks] = useState<Record<string, CheckStatus>>(() =>
    Object.fromEntries(CHECKS.map((c) => [c.id, "pending"])),
  );

  // Editable merge box state.
  const [method, setMethod] = useState<MergeMethod>("merge");
  const [headline, setHeadline] = useState(
    `Add a semantic merge-method picker to the release flow (#${PR_NUMBER})`,
  );
  const [description, setDescription] = useState(
    "Wires the release flow to the design system's picker and form controls so the merge method, commit message, and branch cleanup are all chosen in one place.",
  );
  const [deleteBranch, setDeleteBranch] = useState(true);

  // Post-merge branch state — initialized from the delete-branch choice.
  const [branchRemoved, setBranchRemoved] = useState(false);

  // Drive the check progression with timers, then flip to "ready".
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    CHECKS.forEach((check, index) => {
      timers.push(
        setTimeout(
          () =>
            setChecks((prev) => ({ ...prev, [check.id]: "success" })),
          FIRST_CHECK_DELAY + index * CHECK_STEP,
        ),
      );
    });
    timers.push(
      setTimeout(
        () => setPhase("ready"),
        FIRST_CHECK_DELAY + CHECKS.length * CHECK_STEP,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const passed = useMemo(
    () => CHECKS.filter((c) => checks[c.id] === "success").length,
    [checks],
  );
  const total = CHECKS.length;
  const progress = Math.round((passed / total) * 100);
  const allGreen = passed === total;

  function handleMerge() {
    setBranchRemoved(deleteBranch);
    setPhase("merged");
  }

  return (
    <main
      style={{
        maxWidth: "var(--breakpoint-medium, 768px)",
        margin: "0 auto",
        padding: "var(--base-size-32, 2rem) var(--base-size-16, 1rem)",
      }}
    >
      <Stack direction="vertical" gap="normal">
        {/* ---- Title row + lifecycle capsule -------------------------- */}
        <Stack direction="vertical" gap="normal">
          <div
            style={{
              display: "flex",
              gap: "var(--base-size-8, 0.5rem)",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <Heading as="h1" variant="large">
              {PR_TITLE}{" "}
              <Text
                as="span"
                weight="light"
                style={{ color: "var(--fgColor-muted)" }}
              >
                #{PR_NUMBER}
              </Text>
            </Heading>
            {phase === "merged" ? (
              <span key="merged" className="theater-flip">
                <StateLabel status="pullMerged">Merged</StateLabel>
              </span>
            ) : (
              <StateLabel status="pullOpened">Open</StateLabel>
            )}
          </div>

          {/* Branch / author summary line. */}
          <Text style={{ color: "var(--fgColor-muted)" }}>
            <Text as="span" weight="semibold" style={{ color: "var(--fgColor-default)" }}>
              {AUTHOR}
            </Text>{" "}
            wants to merge {COMMIT_COUNT} commits into{" "}
            <BranchName as="span">{BASE_BRANCH}</BranchName> from{" "}
            <BranchName as="span">{HEAD_BRANCH}</BranchName>{" "}
            in {REPO}
          </Text>

          {/* Topic labels (metadata badges). */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--base-size-8, 0.5rem)",
            }}
          >
            {TOPICS.map((topic) => (
              <Label key={topic} variant="accent">
                {topic}
              </Label>
            ))}
          </div>

          {/* Running counts. */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--base-size-16, 1rem)",
            }}
          >
            <CountStat icon={<GitCommitIcon size={16} aria-hidden />} label="Commits">
              {COMMIT_COUNT}
            </CountStat>
            <CountStat icon={<CheckIcon size={16} aria-hidden />} label="Checks passing">
              {passed}
            </CountStat>
            <CountStat icon={<FileDiffIcon size={16} aria-hidden />} label="Files changed">
              {FILES_CHANGED}
            </CountStat>
          </div>
        </Stack>

        {/* ---- Merge box ---------------------------------------------- */}
        <section
          aria-label="Merge box"
          style={{
            border: "1px solid var(--borderColor-default)",
            borderRadius: "var(--borderRadius-large, 12px)",
            boxShadow: "var(--shadow-resting-medium)",
            backgroundColor: "var(--bgColor-default)",
            overflow: "hidden",
          }}
        >
          {/* Reviews summary. */}
          <Row>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--base-size-8, 0.5rem)" }}>
              <span style={{ color: "var(--fgColor-success, var(--fgColor-default))", display: "inline-flex" }}>
                <CheckCircleIcon size={16} aria-hidden />
              </span>
              <Text weight="semibold">{APPROVALS} approving reviews</Text>
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                Reviewers signed off on the latest changes.
              </Text>
            </div>
          </Row>

          {/* Wall of CI checks. */}
          <Row>
            <Stack direction="vertical" gap="normal">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "var(--base-size-8, 0.5rem)",
                  flexWrap: "wrap",
                }}
              >
                <Heading as="h2" variant="small">
                  {allGreen ? "All checks have passed" : "Some checks haven't completed yet"}
                </Heading>
                <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                  {passed} of {total} successful
                </Text>
              </div>

              <ProgressBar
                progress={progress}
                aria-label={`${passed} of ${total} checks passed`}
              />

              <Timeline>
                {CHECKS.map((check) => {
                  const status = checks[check.id];
                  const done = status === "success";
                  return (
                    <Timeline.Item
                      key={check.id}
                      condensed
                      className={done ? "theater-landed" : undefined}
                    >
                      {done ? (
                        <Timeline.Badge variant="success">
                          <CheckIcon aria-hidden />
                        </Timeline.Badge>
                      ) : (
                        <Timeline.Badge>
                          <Spinner size="small" srText={null} />
                        </Timeline.Badge>
                      )}
                      <Timeline.Body>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            justifyContent: "space-between",
                            gap: "var(--base-size-8, 0.5rem)",
                            flexWrap: "wrap",
                          }}
                        >
                          <Text weight="semibold" style={{ color: "var(--fgColor-default)" }}>
                            {check.name}
                          </Text>
                          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                            {done ? `Successful in ${check.duration}` : "In progress…"}
                          </Text>
                        </div>
                        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                          {check.context}
                        </Text>
                      </Timeline.Body>
                    </Timeline.Item>
                  );
                })}
              </Timeline>

              {/* Polite live progress for SR users while checks run. */}
              {phase === "running" && (
                <span className="visually-hidden" role="status" aria-live="polite">
                  {passed} of {total} checks passed
                </span>
              )}
            </Stack>
          </Row>

          {/* Merge controls — state dependent. */}
          <Row last>
            {phase === "running" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--base-size-8, 0.5rem)",
                  flexWrap: "wrap",
                }}
              >
                <Spinner size="small" srText={null} />
                <Text style={{ color: "var(--fgColor-muted)" }}>
                  Merging will be available once all checks pass.
                </Text>
                <div style={{ marginInlineStart: "auto" }}>
                  <Button
                    variant="primary"
                    leadingVisual={GitMergeIcon}
                    disabled
                  >
                    Merge pull request
                  </Button>
                </div>
              </div>
            )}

            {phase === "ready" && (
              <div className="theater-open">
                <Stack direction="vertical" gap="normal">
                  <Flash variant="success" role="status">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--base-size-8, 0.5rem)" }}>
                      <CheckCircleIcon size={16} aria-hidden />
                      <span>
                        Ready to merge — all checks have passed and this branch
                        has no conflicts with {BASE_BRANCH}.
                      </span>
                    </span>
                  </Flash>

                  <FormControl>
                    <FormControl.Label>Merge method</FormControl.Label>
                    <Select
                      value={method}
                      onChange={(e) => setMethod(e.target.value as MergeMethod)}
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
                      All commits from this branch will be added to {BASE_BRANCH}.
                    </FormControl.Caption>
                  </FormControl>

                  <FormControl>
                    <FormControl.Label>Commit headline</FormControl.Label>
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
                      block
                    />
                    <FormControl.Caption>
                      Add any context reviewers should see in the commit body.
                    </FormControl.Caption>
                  </FormControl>

                  <FormControl>
                    <Checkbox
                      checked={deleteBranch}
                      onChange={(e) => setDeleteBranch(e.target.checked)}
                    />
                    <FormControl.Label>
                      Delete branch after merge
                    </FormControl.Label>
                    <FormControl.Caption>
                      Removes {HEAD_BRANCH} once it has been merged into {BASE_BRANCH}.
                    </FormControl.Caption>
                  </FormControl>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant="primary"
                      leadingVisual={GitMergeIcon}
                      onClick={handleMerge}
                    >
                      {METHOD_LABEL[method]}
                    </Button>
                  </div>
                </Stack>
              </div>
            )}

            {phase === "merged" && (
              <div className="theater-open">
                <Stack direction="vertical" gap="normal">
                  <Flash role="status">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--base-size-8, 0.5rem)" }}>
                      <GitMergeIcon size={16} aria-hidden />
                      <span>
                        Pull request successfully merged and closed via{" "}
                        {method === "merge"
                          ? "a merge commit"
                          : method === "squash"
                            ? "squash and merge"
                            : "rebase and merge"}
                        .
                      </span>
                    </span>
                  </Flash>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "var(--base-size-8, 0.5rem)",
                      flexWrap: "wrap",
                    }}
                  >
                    <Text style={{ color: "var(--fgColor-muted)" }}>
                      {branchRemoved ? (
                        <>
                          The <BranchName as="span">{HEAD_BRANCH}</BranchName> branch was deleted.
                        </>
                      ) : (
                        <>
                          The <BranchName as="span">{HEAD_BRANCH}</BranchName> branch can now be safely deleted.
                        </>
                      )}
                    </Text>
                    {branchRemoved ? (
                      <Button
                        leadingVisual={GitBranchIcon}
                        onClick={() => setBranchRemoved(false)}
                      >
                        Restore branch
                      </Button>
                    ) : (
                      <Button
                        variant="danger"
                        leadingVisual={TrashIcon}
                        onClick={() => setBranchRemoved(true)}
                      >
                        Delete branch
                      </Button>
                    )}
                  </div>
                </Stack>
              </div>
            )}
          </Row>
        </section>
      </Stack>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Small local layout helpers — token-painted, DS-agnostic plumbing.
// ---------------------------------------------------------------------------

function Row({
  children,
  last,
}: {
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      style={{
        padding: "var(--base-size-16, 1rem)",
        borderBottom: last ? "none" : "1px solid var(--borderColor-muted)",
      }}
    >
      {children}
    </div>
  );
}

function CountStat({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--base-size-8, 0.5rem)" }}>
      <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>{icon}</span>
      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
        {label}
      </Text>
      <CounterLabel>{children}</CounterLabel>
    </span>
  );
}
