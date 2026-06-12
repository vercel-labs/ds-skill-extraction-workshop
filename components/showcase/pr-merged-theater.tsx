"use client";

import {
  BranchName,
  Button,
  Checkbox,
  CounterLabel,
  Flash,
  FormControl,
  Heading,
  Label,
  Select,
  Stack,
  StateLabel,
  Text,
  TextInput,
  Textarea,
} from "@primer/react";
import {
  CheckCircleFillIcon,
  CheckIcon,
  ClockIcon,
  CommentIcon,
  DotFillIcon,
  EyeIcon,
  FileDiffIcon,
  GitBranchIcon,
  GitCommitIcon,
  GitMergeIcon,
} from "@primer/octicons-react";
import { useEffect, useRef, useState } from "react";

type CheckStatus = "running" | "success";

type Check = {
  id: string;
  name: string;
  context: string;
  duration: string;
  status: CheckStatus;
};

type MergeMethod = "merge" | "squash" | "rebase";

type Phase = "running" | "ready" | "merged";

const INITIAL_CHECKS: ReadonlyArray<Omit<Check, "status">> = [
  { id: "lint", name: "lint", context: "ci / lint", duration: "12s" },
  { id: "typecheck", name: "typecheck", context: "ci / typecheck", duration: "26s" },
  { id: "unit", name: "unit-tests", context: "ci / unit", duration: "41s" },
  { id: "integration", name: "integration", context: "ci / integration", duration: "1m 04s" },
  { id: "e2e", name: "e2e (chromium)", context: "ci / e2e", duration: "1m 38s" },
  { id: "bundle", name: "bundle-size", context: "ci / bundle", duration: "18s" },
  { id: "snapshot", name: "visual-snapshots", context: "ci / visual", duration: "47s" },
  { id: "deploy", name: "preview-deploy", context: "ci / deploy", duration: "1m 12s" },
];

const RESOLVE_INTERVAL_MS = 700;

const MERGE_BUTTON_LABEL: Record<MergeMethod, string> = {
  merge: "Create a merge commit",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};

const cardSurfaceStyle = {
  backgroundColor: "var(--bgColor-default)",
  border: "1px solid var(--borderColor-default)",
  borderRadius: "var(--borderRadius-large, 12px)",
} as const;

const sectionDividerStyle = {
  borderTop: "1px solid var(--borderColor-muted)",
} as const;

const mutedColor = { color: "var(--fgColor-muted)" } as const;

export function PrMergedTheater() {
  const [checks, setChecks] = useState<Check[]>(() =>
    INITIAL_CHECKS.map((c) => ({ ...c, status: "running" as CheckStatus })),
  );
  const [phase, setPhase] = useState<Phase>("running");
  const [beat, setBeat] = useState(false);
  const [justResolved, setJustResolved] = useState<string | null>(null);

  const [method, setMethod] = useState<MergeMethod>("squash");
  const [commitHeadline, setCommitHeadline] = useState(
    "Fold MergeBox into PullRequestPanel (#1247)",
  );
  const [commitBody, setCommitBody] = useState(
    "* Collapse review summary and CI status into a single shell\n* Hoist merge-method picker out of the dropdown\n* Restore branch action after merge\n",
  );
  const [deleteBranch, setDeleteBranch] = useState(true);
  const [branchExists, setBranchExists] = useState(true);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    INITIAL_CHECKS.forEach((check, index) => {
      const t = setTimeout(() => {
        setChecks((prev) =>
          prev.map((c) => (c.id === check.id ? { ...c, status: "success" } : c)),
        );
        setJustResolved(check.id);
        setTimeout(() => {
          setJustResolved((cur) => (cur === check.id ? null : cur));
        }, 400);
      }, (index + 1) * RESOLVE_INTERVAL_MS);
      timers.current.push(t);
    });
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  const passed = checks.filter((c) => c.status === "success").length;
  const total = checks.length;
  const allGreen = passed === total;
  const pctFilled = (passed / total) * 100;

  useEffect(() => {
    if (allGreen && phase === "running") {
      setPhase("ready");
    }
  }, [allGreen, phase]);

  function handleMerge() {
    if (phase !== "ready") return;
    setPhase("merged");
    setBeat(true);
    setTimeout(() => setBeat(false), 320);
    if (deleteBranch) setBranchExists(false);
  }

  const stateStatus = phase === "merged" ? "pullMerged" : "pullOpened";
  const stateLabel = phase === "merged" ? "Merged" : "Open";

  return (
    <main
      style={{
        maxWidth: 1024,
        margin: "0 auto",
        padding:
          "var(--base-size-32, 2rem) var(--base-size-24, 1.5rem)",
      }}
    >
      <Stack direction="vertical" gap="spacious">
        <PrHeader
          phase={phase}
          stateStatus={stateStatus}
          stateLabel={stateLabel}
          beat={beat}
        />

        <PrMetadata
          commits={12}
          checksPassed={passed}
          checksTotal={total}
          filesChanged={8}
        />

        <section style={{ ...cardSurfaceStyle }} aria-label="Merge box">
          <ReviewsSection />

          <ChecksSection
            checks={checks}
            passed={passed}
            total={total}
            pctFilled={pctFilled}
            allGreen={allGreen}
            phase={phase}
            justResolved={justResolved}
          />

          {phase !== "merged" && (
            <MergeControls
              phase={phase}
              method={method}
              onMethodChange={setMethod}
              commitHeadline={commitHeadline}
              onCommitHeadlineChange={setCommitHeadline}
              commitBody={commitBody}
              onCommitBodyChange={setCommitBody}
              deleteBranch={deleteBranch}
              onDeleteBranchChange={setDeleteBranch}
              onMerge={handleMerge}
              allGreen={allGreen}
            />
          )}

          {phase === "merged" && (
            <MergedConfirmation
              branchExists={branchExists}
              onToggleBranch={() => setBranchExists((b) => !b)}
            />
          )}
        </section>
      </Stack>
    </main>
  );
}

function PrHeader({
  phase,
  stateStatus,
  stateLabel,
  beat,
}: {
  phase: Phase;
  stateStatus: "pullOpened" | "pullMerged";
  stateLabel: string;
  beat: boolean;
}) {
  return (
    <Stack direction="vertical" gap="condensed">
      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
        <span
          className="pr-state-beat"
          data-beat={beat ? "on" : "off"}
          aria-live="polite"
        >
          <StateLabel status={stateStatus}>{stateLabel}</StateLabel>
        </span>
        <Heading
          as="h1"
          variant="large"
          style={{ marginRight: "var(--base-size-8, 0.5rem)" }}
        >
          Fold MergeBox into PullRequestPanel{" "}
          <Text size="large" weight="normal" style={mutedColor}>
            #1247
          </Text>
        </Heading>
      </Stack>

      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
        <Text style={mutedColor}>
          <Text weight="semibold" style={{ color: "var(--fgColor-default)" }}>
            mira-okafor
          </Text>{" "}
          wants to merge 12 commits into
        </Text>
        <BranchName as="span">trunk</BranchName>
        <Text style={mutedColor}>from</Text>
        <BranchName as="span">mira/pr-panel-fold</BranchName>
        {phase === "merged" && (
          <Text style={mutedColor}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              <GitMergeIcon size={14} />
              merged just now
            </span>
          </Text>
        )}
      </Stack>
    </Stack>
  );
}

function PrMetadata({
  commits,
  checksPassed,
  checksTotal,
  filesChanged,
}: {
  commits: number;
  checksPassed: number;
  checksTotal: number;
  filesChanged: number;
}) {
  return (
    <Stack direction="vertical" gap="condensed">
      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
        <Text size="small" weight="semibold" style={mutedColor}>
          Labels
        </Text>
        <Label variant="accent">area: pr-panel</Label>
        <Label variant="done">refactor</Label>
        <Label variant="attention">needs-review</Label>
        <Label variant="success">ready-to-ship</Label>
      </Stack>

      <Stack
        direction="horizontal"
        gap="normal"
        align="center"
        wrap="wrap"
        style={{ paddingTop: "var(--base-size-4, 0.25rem)" }}
      >
        <MetaCount icon={<GitCommitIcon size={16} />} label="Commits">
          <CounterLabel variant="secondary">{commits}</CounterLabel>
        </MetaCount>
        <MetaCount icon={<CheckIcon size={16} />} label="Checks">
          <CounterLabel variant={checksPassed === checksTotal ? "primary" : "secondary"}>
            {checksPassed}/{checksTotal}
          </CounterLabel>
        </MetaCount>
        <MetaCount icon={<FileDiffIcon size={16} />} label="Files changed">
          <CounterLabel variant="secondary">{filesChanged}</CounterLabel>
        </MetaCount>
        <MetaCount icon={<CommentIcon size={16} />} label="Conversations">
          <CounterLabel variant="secondary">4</CounterLabel>
        </MetaCount>
        <MetaCount icon={<EyeIcon size={16} />} label="Reviewers">
          <CounterLabel variant="secondary">3</CounterLabel>
        </MetaCount>
      </Stack>
    </Stack>
  );
}

function MetaCount({
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
      <span style={mutedColor}>{icon}</span>
      <Text size="small" weight="medium">
        {label}
      </Text>
      {children}
    </Stack>
  );
}

function ReviewsSection() {
  return (
    <Stack
      direction="vertical"
      gap="condensed"
      style={{
        padding:
          "var(--base-size-16, 1rem) var(--base-size-24, 1.5rem)",
      }}
    >
      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
        <CheckCircleFillIcon size={16} fill="var(--fgColor-success, currentColor)" />
        <Text weight="semibold">2 approving reviews</Text>
        <Text style={mutedColor}>· lucia-petrov, jonas-vermeer</Text>
      </Stack>
      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
        <span style={mutedColor}>
          <EyeIcon size={16} />
        </span>
        <Text>1 review pending</Text>
        <Text style={mutedColor}>· awaiting review from</Text>
        <Label variant="secondary">design-systems</Label>
      </Stack>
    </Stack>
  );
}

function ChecksSection({
  checks,
  passed,
  total,
  pctFilled,
  allGreen,
  phase,
  justResolved,
}: {
  checks: Check[];
  passed: number;
  total: number;
  pctFilled: number;
  allGreen: boolean;
  phase: Phase;
  justResolved: string | null;
}) {
  const summaryIcon = allGreen ? (
    <CheckCircleFillIcon size={16} fill="var(--fgColor-success, currentColor)" />
  ) : (
    <ClockIcon size={16} />
  );

  return (
    <Stack
      direction="vertical"
      gap="condensed"
      style={{
        ...sectionDividerStyle,
        padding:
          "var(--base-size-16, 1rem) var(--base-size-24, 1.5rem)",
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
          <span style={allGreen ? undefined : mutedColor}>{summaryIcon}</span>
          <Text weight="semibold">
            {allGreen
              ? "All checks have passed"
              : `Some checks haven't completed yet`}
          </Text>
          <Text style={mutedColor}>
            · {passed} of {total} successful
          </Text>
        </Stack>
        <Text size="small" style={mutedColor} aria-live="polite">
          {allGreen
            ? "Finished in 6s"
            : `Running… ${Math.round(pctFilled)}%`}
        </Text>
      </Stack>

      <div
        role="progressbar"
        aria-valuenow={passed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Check progress"
        style={{
          height: "4px",
          width: "100%",
          backgroundColor: "var(--borderColor-muted)",
          borderRadius: "var(--borderRadius-full, 999px)",
          overflow: "hidden",
        }}
      >
        <div
          className="pr-progress-fill"
          style={{
            height: "100%",
            width: `${pctFilled}%`,
            backgroundColor: allGreen
              ? "var(--bgColor-success-emphasis, var(--fgColor-success))"
              : "var(--bgColor-accent-emphasis, var(--fgColor-accent))",
          }}
        />
      </div>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
        }}
        aria-label="CI checks"
      >
        {checks.map((c) => (
          <li
            key={c.id}
            className="pr-check-row"
            data-just-resolved={justResolved === c.id ? "on" : "off"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--base-size-8, 0.5rem)",
              padding:
                "var(--base-size-8, 0.5rem) var(--base-size-8, 0.5rem)",
              borderRadius: "var(--borderRadius-medium, 6px)",
            }}
          >
            <CheckRowIcon status={c.status} />
            <Text weight="semibold">{c.name}</Text>
            <Text size="small" style={mutedColor}>
              · {c.context}
            </Text>
            <span style={{ marginLeft: "auto" }}>
              <Text size="small" style={mutedColor}>
                {c.status === "success" ? c.duration : "running…"}
              </Text>
            </span>
          </li>
        ))}
      </ul>

      {allGreen && phase !== "merged" && (
        <div className="pr-fade-in">
          <Flash variant="success" role="status">
            <Stack direction="horizontal" gap="condensed" align="center">
              <CheckCircleFillIcon size={16} />
              <Text weight="semibold">Ready to merge.</Text>
              <Text style={mutedColor}>
                All checks have passed and reviewers approved.
              </Text>
            </Stack>
          </Flash>
        </div>
      )}
    </Stack>
  );
}

function CheckRowIcon({ status }: { status: CheckStatus }) {
  if (status === "success") {
    return (
      <CheckCircleFillIcon
        size={16}
        fill="var(--fgColor-success, currentColor)"
        aria-label="passed"
      />
    );
  }
  return (
    <span style={mutedColor} aria-label="running">
      <DotFillIcon size={16} />
    </span>
  );
}

function MergeControls({
  phase,
  method,
  onMethodChange,
  commitHeadline,
  onCommitHeadlineChange,
  commitBody,
  onCommitBodyChange,
  deleteBranch,
  onDeleteBranchChange,
  onMerge,
  allGreen,
}: {
  phase: Phase;
  method: MergeMethod;
  onMethodChange: (m: MergeMethod) => void;
  commitHeadline: string;
  onCommitHeadlineChange: (v: string) => void;
  commitBody: string;
  onCommitBodyChange: (v: string) => void;
  deleteBranch: boolean;
  onDeleteBranchChange: (v: boolean) => void;
  onMerge: () => void;
  allGreen: boolean;
}) {
  const ready = phase === "ready";
  const disabled = !ready;

  return (
    <Stack
      direction="vertical"
      gap="normal"
      style={{
        ...sectionDividerStyle,
        padding:
          "var(--base-size-16, 1rem) var(--base-size-24, 1.5rem)",
      }}
    >
      <Stack
        direction="horizontal"
        gap="condensed"
        align="center"
        wrap="wrap"
      >
        <GitMergeIcon size={20} />
        <Heading as="h2" variant="small">
          {ready ? "Ready to merge" : "Merging is blocked"}
        </Heading>
        <Text style={mutedColor}>
          {ready
            ? "Choose a merge method and edit the commit message before merging."
            : "Waiting for required checks to finish."}
        </Text>
      </Stack>

      <FormControl disabled={disabled}>
        <FormControl.Label>Merge method</FormControl.Label>
        <Select
          value={method}
          onChange={(e) => onMethodChange(e.target.value as MergeMethod)}
          block
        >
          <Select.Option value="merge">Create a merge commit</Select.Option>
          <Select.Option value="squash">Squash and merge</Select.Option>
          <Select.Option value="rebase">Rebase and merge</Select.Option>
        </Select>
        <FormControl.Caption>
          {method === "merge" &&
            "All commits from this branch will be added to trunk via a merge commit."}
          {method === "squash" &&
            "The 12 commits from this branch will be combined into one commit on trunk."}
          {method === "rebase" &&
            "The 12 commits from this branch will be rebased and added to trunk."}
        </FormControl.Caption>
      </FormControl>

      {method !== "rebase" && (
        <Stack direction="vertical" gap="normal">
          <FormControl disabled={disabled}>
            <FormControl.Label>Commit headline</FormControl.Label>
            <TextInput
              block
              value={commitHeadline}
              onChange={(e) => onCommitHeadlineChange(e.target.value)}
            />
          </FormControl>

          <FormControl disabled={disabled}>
            <FormControl.Label>Extended description</FormControl.Label>
            <Textarea
              block
              resize="vertical"
              rows={5}
              value={commitBody}
              onChange={(e) => onCommitBodyChange(e.target.value)}
            />
            <FormControl.Caption>
              Add an optional extended description. Supports Markdown.
            </FormControl.Caption>
          </FormControl>
        </Stack>
      )}

      <FormControl disabled={disabled}>
        <Checkbox
          checked={deleteBranch}
          onChange={(e) => onDeleteBranchChange(e.target.checked)}
        />
        <FormControl.Label>Delete branch after merge</FormControl.Label>
        <FormControl.Caption>
          Removes <code>mira/pr-panel-fold</code> from the repository once
          merged. You can restore it later from the branch history.
        </FormControl.Caption>
      </FormControl>

      <Stack direction="horizontal" gap="condensed" justify="end" align="center">
        <Button variant="invisible" disabled={disabled}>
          Cancel
        </Button>
        <Button
          variant="primary"
          leadingVisual={GitMergeIcon}
          onClick={onMerge}
          inactive={!ready}
          aria-disabled={!ready}
          loadingAnnouncement="Waiting for checks"
        >
          {allGreen ? MERGE_BUTTON_LABEL[method] : "Waiting for checks…"}
        </Button>
      </Stack>
    </Stack>
  );
}

function MergedConfirmation({
  branchExists,
  onToggleBranch,
}: {
  branchExists: boolean;
  onToggleBranch: () => void;
}) {
  return (
    <Stack
      direction="vertical"
      gap="condensed"
      className="pr-fade-in"
      style={{
        ...sectionDividerStyle,
        padding:
          "var(--base-size-16, 1rem) var(--base-size-24, 1.5rem)",
      }}
    >
      <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
        <GitMergeIcon size={20} />
        <Heading as="h2" variant="small">
          Pull request successfully merged and closed
        </Heading>
      </Stack>

      <Text style={mutedColor}>
        You&rsquo;re all set — the <code>mira/pr-panel-fold</code> changes are
        now part of <code>trunk</code>.
      </Text>

      <Stack
        direction="horizontal"
        gap="condensed"
        align="center"
        justify="space-between"
        wrap="wrap"
        style={{
          marginTop: "var(--base-size-8, 0.5rem)",
        }}
      >
        <Stack direction="horizontal" gap="condensed" align="center">
          <GitBranchIcon size={16} />
          <Text weight="semibold">
            {branchExists
              ? "The branch mira/pr-panel-fold is still around."
              : "The branch mira/pr-panel-fold was deleted."}
          </Text>
        </Stack>
        <Button
          variant={branchExists ? "danger" : "default"}
          onClick={onToggleBranch}
        >
          {branchExists ? "Delete branch" : "Restore branch"}
        </Button>
      </Stack>
    </Stack>
  );
}

