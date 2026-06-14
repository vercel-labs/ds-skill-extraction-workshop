"use client";

import {
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
  TextInput,
  Textarea,
  BranchName,
} from "@primer/react";
import {
  CheckCircleFillIcon,
  ClockIcon,
  CommentIcon,
  FileDiffIcon,
  GitCommitIcon,
  GitMergeIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
} from "@primer/octicons-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useColorModeControl } from "@/app/providers";

// ---------------------------------------------------------------------------
// Invented data — fictional repo, branches, labels, check names. No GitHub
// mascot names, no real org/user handles.
// ---------------------------------------------------------------------------

const PR = {
  title: "Stream telemetry batches through the new ingest pipeline",
  number: 4827,
  author: "@marlowe-vex",
  sourceBranch: "feat/ingest-pipeline",
  targetBranch: "trunk",
  topics: ["telemetry", "performance", "needs-changelog"],
  commits: 9,
  filesChanged: 17,
};

type CheckStatus = "pending" | "success";

type Check = {
  id: string;
  name: string;
  context: string;
  status: CheckStatus;
};

const INITIAL_CHECKS: Check[] = [
  { id: "lint", name: "Lint and format", context: "quill-ci", status: "pending" },
  { id: "unit", name: "Unit tests", context: "quill-ci", status: "pending" },
  { id: "types", name: "Type check", context: "quill-ci", status: "pending" },
  { id: "build", name: "Build artifacts", context: "quill-ci", status: "pending" },
  { id: "e2e", name: "End-to-end suite", context: "atlas-runner", status: "pending" },
  { id: "deploy", name: "Preview deploy", context: "atlas-runner", status: "pending" },
];

type MergeMethod = "merge" | "squash" | "rebase";

const MERGE_METHOD_LABEL: Record<MergeMethod, string> = {
  merge: "Merge pull request",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};

type Phase = "running" | "ready" | "merged";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function PrMergedTheater() {
  const [checks, setChecks] = useState<Check[]>(INITIAL_CHECKS);
  const [phase, setPhase] = useState<Phase>("running");

  // Merge box form state.
  const [method, setMethod] = useState<MergeMethod>("merge");
  const [headline, setHeadline] = useState(
    `${PR.title} (#${PR.number})`,
  );
  const [description, setDescription] = useState(
    "Batches ingest events and flushes them on a fixed cadence, cutting write amplification on the hot path.",
  );
  const [deleteBranch, setDeleteBranch] = useState(true);
  // Captured at merge time so the confirmation honors the choice made then.
  const [branchWasDeleted, setBranchWasDeleted] = useState(false);

  const reduced = usePrefersReducedMotion();

  // Resolve the checks one by one over ~6 seconds — dominoes, not fireworks.
  useEffect(() => {
    const order = INITIAL_CHECKS.map((c) => c.id);
    const timers: ReturnType<typeof setTimeout>[] = [];
    order.forEach((id, index) => {
      timers.push(
        setTimeout(
          () => {
            setChecks((prev) =>
              prev.map((c) =>
                c.id === id ? { ...c, status: "success" } : c,
              ),
            );
          },
          900 * (index + 1),
        ),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  const passed = checks.filter((c) => c.status === "success").length;
  const total = checks.length;
  const allGreen = passed === total;

  // The moment everything is green, open the merge box.
  useEffect(() => {
    if (allGreen && phase === "running") {
      setPhase("ready");
    }
  }, [allGreen, phase]);

  const transition = reduced
    ? undefined
    : "var(--motion-transition-stateChange, 0.2s ease)";

  return (
    <Stack
      direction="vertical"
      gap="normal"
      padding="spacious"
      style={{
        maxWidth: "920px",
        marginInline: "auto",
        minHeight: "100vh",
      }}
    >
      <PageBar />

      <Stack
        as="section"
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
        <PrHeader phase={phase} transition={transition} />

        <MetadataRow passed={passed} total={total} transition={transition} />

        <div
          style={{
            height: "1px",
            backgroundColor: "var(--borderColor-muted)",
          }}
        />

        {phase === "merged" ? (
          <MergedConfirmation
            branchWasDeleted={branchWasDeleted}
            onToggleBranch={() => setBranchWasDeleted((v) => !v)}
          />
        ) : (
          <MergeBox
            phase={phase}
            checks={checks}
            passed={passed}
            total={total}
            transition={transition}
            method={method}
            setMethod={setMethod}
            headline={headline}
            setHeadline={setHeadline}
            description={description}
            setDescription={setDescription}
            deleteBranch={deleteBranch}
            setDeleteBranch={setDeleteBranch}
            onMerge={() => {
              setBranchWasDeleted(deleteBranch);
              setPhase("merged");
            }}
          />
        )}
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Top bar — color-mode toggle (the DS's own control + mechanism).
// ---------------------------------------------------------------------------

function PageBar() {
  const { mode, toggle } = useColorModeControl();

  // Reflect the *resolved* mode so the label/icon describe what flipping does.
  const [systemDark, setSystemDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const resolved = mode === "auto" ? (systemDark ? "dark" : "light") : mode;
  const goingToDark = resolved === "light";

  return (
    <Stack direction="horizontal" align="center" justify="space-between">
      <Text size="small" weight="semibold" style={{ color: "var(--fgColor-muted)" }}>
        quill-labs / ingest-core
      </Text>
      <IconButton
        data-testid="color-mode-toggle"
        icon={goingToDark ? MoonIcon : SunIcon}
        aria-label={
          goingToDark ? "Switch to dark mode" : "Switch to light mode"
        }
        variant="invisible"
        onClick={toggle}
      />
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// PR header — title, number, branches, lifecycle capsule.
// ---------------------------------------------------------------------------

function PrHeader({
  phase,
  transition,
}: {
  phase: Phase;
  transition?: string;
}) {
  const merged = phase === "merged";
  return (
    <Stack direction="vertical" gap="condensed">
      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
        <span style={{ transition, display: "inline-flex" }}>
          <StateLabel status={merged ? "pullMerged" : "pullOpened"}>
            {merged ? "Merged" : "Open"}
          </StateLabel>
        </span>
        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
          {PR.author} wants to merge {PR.commits} commits
        </Text>
      </Stack>

      <Heading as="h1" variant="large">
        {PR.title}{" "}
        <Text
          as="span"
          weight="light"
          style={{ color: "var(--fgColor-muted)" }}
        >
          #{PR.number}
        </Text>
      </Heading>

      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
        <BranchName as="span">{PR.sourceBranch}</BranchName>
        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
          into
        </Text>
        <BranchName as="span">{PR.targetBranch}</BranchName>
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Metadata row — topic labels + running counts.
// ---------------------------------------------------------------------------

function MetadataRow({
  passed,
  total,
  transition,
}: {
  passed: number;
  total: number;
  transition?: string;
}) {
  return (
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
        <CountChip icon={<GitCommitIcon />} label="Commits">
          {PR.commits}
        </CountChip>
        <CountChip icon={<CheckCircleFillIcon />} label="Checks passing">
          <span style={{ transition }}>
            {passed}/{total}
          </span>
        </CountChip>
        <CountChip icon={<FileDiffIcon />} label="Files changed">
          {PR.filesChanged}
        </CountChip>
      </Stack>
    </Stack>
  );
}

function CountChip({
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
      <span aria-hidden="true" style={{ color: "var(--fgColor-muted)" }}>
        {icon}
      </span>
      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
        {label}
      </Text>
      <CounterLabel variant="primary">{children}</CounterLabel>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Merge box — checks wall + (when ready) the editable merge form.
// ---------------------------------------------------------------------------

function MergeBox({
  phase,
  checks,
  passed,
  total,
  transition,
  method,
  setMethod,
  headline,
  setHeadline,
  description,
  setDescription,
  deleteBranch,
  setDeleteBranch,
  onMerge,
}: {
  phase: Phase;
  checks: Check[];
  passed: number;
  total: number;
  transition?: string;
  method: MergeMethod;
  setMethod: (m: MergeMethod) => void;
  headline: string;
  setHeadline: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  deleteBranch: boolean;
  setDeleteBranch: (v: boolean) => void;
  onMerge: () => void;
}) {
  const ready = phase === "ready";
  const progress = Math.round((passed / total) * 100);

  return (
    <Stack direction="vertical" gap="normal">
      {/* Reviews summary */}
      <Stack direction="horizontal" gap="condensed" align="center">
        <span aria-hidden="true" style={{ color: "var(--fgColor-muted)" }}>
          <CommentIcon />
        </span>
        <Text size="medium">
          2 approving reviews from code owners
        </Text>
      </Stack>

      {/* Checks progress */}
      <Stack
        direction="vertical"
        gap="condensed"
        style={{
          border: "1px solid var(--borderColor-muted)",
          borderRadius: "var(--borderRadius-medium, 8px)",
          padding: "var(--base-size-16, 1rem)",
        }}
      >
        <Stack direction="horizontal" align="center" justify="space-between">
          <Text weight="semibold">
            {ready ? "All checks have passed" : "Checks are running"}
          </Text>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            {passed} of {total} successful
          </Text>
        </Stack>

        <ProgressBar
          progress={progress}
          aria-label={`${passed} of ${total} checks passed`}
          aria-valuetext={`${passed} of ${total} checks passed`}
          bg={ready ? "success.emphasis" : "accent.emphasis"}
        />

        <Stack as="ul" direction="vertical" gap="none" style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {checks.map((check) => (
            <CheckRow key={check.id} check={check} transition={transition} />
          ))}
        </Stack>
      </Stack>

      {/* The "ready" cue — quiet success banner, announced politely. */}
      {ready && (
        <span style={{ transition }}>
          <Flash variant="success" role="status">
            <Stack direction="horizontal" gap="condensed" align="center">
              <span aria-hidden="true" style={{ display: "inline-flex" }}>
                <CheckCircleFillIcon />
              </span>
              <Text>
                This branch is ready to merge.
              </Text>
            </Stack>
          </Flash>
        </span>
      )}

      {/* The editable merge form — only present once ready. */}
      {ready ? (
        <Stack
          as="form"
          direction="vertical"
          gap="normal"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            onMerge();
          }}
          style={{ transition }}
        >
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
              All commits from this branch will be added to the base branch.
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
              Add an optional extended description for the merge commit.
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
              Removes {PR.sourceBranch} once the pull request is merged.
            </FormControl.Caption>
          </FormControl>

          <Stack direction="horizontal" gap="condensed" align="center">
            <Button
              type="submit"
              variant="primary"
              leadingVisual={GitMergeIcon}
            >
              {MERGE_METHOD_LABEL[method]}
            </Button>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              You can also merge from the command line.
            </Text>
          </Stack>
        </Stack>
      ) : (
        // While checks run, merging is genuinely unavailable: the control is
        // disabled (out of the tab order, not announced as actionable).
        <Stack direction="horizontal" gap="condensed" align="center">
          <Button
            variant="primary"
            leadingVisual={GitMergeIcon}
            disabled
            aria-disabled="true"
          >
            Merge pull request
          </Button>
          <Stack direction="horizontal" gap="condensed" align="center">
            <Spinner size="small" srText={null} />
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              Waiting for status checks to pass…
            </Text>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}

function CheckRow({
  check,
  transition,
}: {
  check: Check;
  transition?: string;
}) {
  const done = check.status === "success";
  return (
    <Stack
      as="li"
      direction="horizontal"
      gap="condensed"
      align="center"
      style={{
        paddingBlock: "var(--base-size-8, 0.5rem)",
        borderTop: "1px solid var(--borderColor-muted)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          transition,
          color: done
            ? "var(--fgColor-success)"
            : "var(--fgColor-muted)",
        }}
      >
        {done ? <CheckCircleFillIcon /> : <ClockIcon />}
      </span>
      <Text weight="semibold">{check.name}</Text>
      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
        {check.context}
      </Text>
      <span style={{ marginInlineStart: "auto" }}>
        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
          {done ? "Successful" : "In progress"}
        </Text>
      </span>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Merged confirmation — quiet, honors the delete-branch choice.
// ---------------------------------------------------------------------------

function MergedConfirmation({
  branchWasDeleted,
  onToggleBranch,
}: {
  branchWasDeleted: boolean;
  onToggleBranch: () => void;
}) {
  return (
    <Stack direction="vertical" gap="normal">
      <Stack direction="horizontal" gap="condensed" align="center">
        <span aria-hidden="true" style={{ color: "var(--fgColor-done)" }}>
          <GitMergeIcon />
        </span>
        <Text>
          Pull request successfully merged and closed.
        </Text>
      </Stack>

      <Stack
        direction="horizontal"
        gap="condensed"
        align="center"
        justify="space-between"
        wrap="wrap"
        style={{
          border: "1px solid var(--borderColor-muted)",
          borderRadius: "var(--borderRadius-medium, 8px)",
          padding: "var(--base-size-16, 1rem)",
        }}
      >
        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
          {branchWasDeleted ? (
            <>
              The <BranchName as="span">{PR.sourceBranch}</BranchName> branch
              was deleted.
            </>
          ) : (
            <>
              The <BranchName as="span">{PR.sourceBranch}</BranchName> branch
              can now be deleted.
            </>
          )}
        </Text>
        {branchWasDeleted ? (
          <Button leadingVisual={GitMergeIcon} onClick={onToggleBranch}>
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
