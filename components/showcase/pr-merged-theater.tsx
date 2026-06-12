"use client";

import {
  BranchName,
  Button,
  Heading,
  IconButton,
  Stack,
  StateLabel,
  Text,
} from "@primer/react";
import {
  CheckCircleIcon,
  CheckIcon,
  DotFillIcon,
  GitMergeIcon,
  KebabHorizontalIcon,
  TrashIcon,
} from "@primer/octicons-react";
import { useEffect, useMemo, useRef, useState } from "react";

type CheckStatus = "running" | "success";

type Check = {
  id: string;
  name: string;
  context: string;
  durationMs: number;
};

const CHECKS: Check[] = [
  { id: "build-amd64", context: "build", name: "package · linux-amd64", durationMs: 700 },
  { id: "build-arm64", context: "build", name: "package · linux-arm64", durationMs: 1400 },
  { id: "lint", context: "lint", name: "eslint", durationMs: 2100 },
  { id: "typecheck", context: "test", name: "typecheck", durationMs: 2800 },
  { id: "unit", context: "test", name: "unit", durationMs: 3500 },
  { id: "integration", context: "test", name: "integration", durationMs: 4200 },
  { id: "e2e", context: "test", name: "e2e · playwright", durationMs: 5000 },
  { id: "security", context: "security", name: "advisory scan", durationMs: 5800 },
];

type PrState = "open" | "merging" | "merged";

export function PrMergedTheater() {
  const [statuses, setStatuses] = useState<Record<string, CheckStatus>>(() =>
    Object.fromEntries(CHECKS.map((c) => [c.id, "running" as CheckStatus])),
  );
  const [prState, setPrState] = useState<PrState>("open");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = CHECKS.map((c) =>
      setTimeout(() => {
        setStatuses((prev) => ({ ...prev, [c.id]: "success" }));
      }, c.durationMs),
    );
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const allGreen = useMemo(
    () => CHECKS.every((c) => statuses[c.id] === "success"),
    [statuses],
  );
  const passedCount = useMemo(
    () => CHECKS.filter((c) => statuses[c.id] === "success").length,
    [statuses],
  );
  const runningCount = CHECKS.length - passedCount;

  const handleMerge = () => {
    if (!allGreen || prState !== "open") return;
    setPrState("merging");
    setTimeout(() => setPrState("merged"), 1200);
  };

  return (
    <main
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "var(--base-size-32, 32px) var(--base-size-24, 24px)",
      }}
    >
      <Stack direction="vertical" gap="spacious">
        <PrHeader state={prState} />
        {prState === "merged" ? (
          <MergedPanel />
        ) : (
          <MergePanel
            statuses={statuses}
            allGreen={allGreen}
            passedCount={passedCount}
            runningCount={runningCount}
            merging={prState === "merging"}
            onMerge={handleMerge}
          />
        )}
      </Stack>
    </main>
  );
}

function PrHeader({ state }: { state: PrState }) {
  const merged = state === "merged";
  return (
    <Stack direction="vertical" gap="condensed">
      <Stack direction="horizontal" gap="condensed" align="start" justify="space-between">
        <Stack direction="vertical" gap="none">
          <Heading as="h1" variant="large">
            Restore orbit resync after eclipse window{" "}
            <Text size="large" weight="normal" style={{ color: "var(--fgColor-muted)" }}>
              #4821
            </Text>
          </Heading>
        </Stack>
        <IconButton
          icon={KebabHorizontalIcon}
          aria-label="Pull request actions"
          variant="invisible"
        />
      </Stack>
      <Stack direction="horizontal" gap="normal" align="center" wrap="wrap">
        <StateLabel status={merged ? "pullMerged" : "pullOpened"}>
          {merged ? "Merged" : "Open"}
        </StateLabel>
        <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
          <Text weight="semibold" style={{ color: "var(--fgColor-default)" }}>
            silvabarrett
          </Text>{" "}
          {merged ? "merged 1 commit into" : "wants to merge 1 commit into"}{" "}
          <BranchName as="span">main</BranchName> from{" "}
          <BranchName as="span">feat/orbit-resync</BranchName>
        </Text>
      </Stack>
    </Stack>
  );
}

function CardSurface({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid var(--borderColor-default)",
        borderRadius: "var(--borderRadius-large, 12px)",
        background: "var(--bgColor-default)",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function SectionDivider() {
  return (
    <div
      role="presentation"
      style={{
        height: 1,
        background: "var(--borderColor-muted)",
        width: "100%",
      }}
    />
  );
}

function MergePanel({
  statuses,
  allGreen,
  passedCount,
  runningCount,
  merging,
  onMerge,
}: {
  statuses: Record<string, CheckStatus>;
  allGreen: boolean;
  passedCount: number;
  runningCount: number;
  merging: boolean;
  onMerge: () => void;
}) {
  return (
    <CardSurface>
      <Stack direction="vertical" gap="none">
        <ReviewsRow />
        <SectionDivider />
        <ChecksRow
          statuses={statuses}
          allGreen={allGreen}
          passedCount={passedCount}
          runningCount={runningCount}
        />
        <SectionDivider />
        <MergeControls allGreen={allGreen} merging={merging} onMerge={onMerge} />
      </Stack>
    </CardSurface>
  );
}

function ReviewsRow() {
  return (
    <div style={{ padding: "var(--base-size-16, 16px) var(--base-size-24, 24px)" }}>
      <Stack direction="horizontal" gap="condensed" align="center">
        <span style={{ color: "var(--fgColor-success)", display: "inline-flex" }}>
          <CheckCircleIcon size={16} aria-label="Approved" />
        </span>
        <Stack direction="vertical" gap="none">
          <Text weight="semibold">Changes approved</Text>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            2 approving reviews from @havencole and @rhea-noor
          </Text>
        </Stack>
      </Stack>
    </div>
  );
}

function ChecksRow({
  statuses,
  allGreen,
  passedCount,
  runningCount,
}: {
  statuses: Record<string, CheckStatus>;
  allGreen: boolean;
  passedCount: number;
  runningCount: number;
}) {
  const headline = allGreen
    ? "All checks have passed"
    : runningCount === 1
      ? "1 check still running"
      : `${runningCount} checks still running`;
  const subline = allGreen
    ? `${passedCount} successful checks`
    : `${passedCount} of ${CHECKS.length} successful`;
  const iconColor = allGreen ? "var(--fgColor-success)" : "var(--fgColor-muted)";

  return (
    <div style={{ padding: "var(--base-size-16, 16px) var(--base-size-24, 24px)" }}>
      <Stack direction="vertical" gap="normal">
        <Stack direction="horizontal" gap="condensed" align="center" aria-live="polite">
          <span style={{ color: iconColor, display: "inline-flex" }}>
            {allGreen ? (
              <CheckCircleIcon size={16} aria-label="All checks passed" />
            ) : (
              <RunningGlyph />
            )}
          </span>
          <Stack direction="vertical" gap="none">
            <Text weight="semibold">{headline}</Text>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              {subline}
            </Text>
          </Stack>
        </Stack>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gap: 4,
          }}
        >
          {CHECKS.map((c) => (
            <CheckRow key={c.id} check={c} status={statuses[c.id]} />
          ))}
        </ul>
      </Stack>
    </div>
  );
}

function CheckRow({ check, status }: { check: Check; status: CheckStatus }) {
  const running = status === "running";
  return (
    <li
      style={{
        display: "grid",
        gridTemplateColumns: "20px 1fr auto",
        gap: 12,
        alignItems: "center",
        padding: "6px 0",
      }}
    >
      <span
        style={{
          color: running ? "var(--fgColor-attention)" : "var(--fgColor-success)",
          display: "inline-flex",
        }}
      >
        {running ? (
          <DotFillIcon size={16} aria-label="Running" />
        ) : (
          <CheckIcon size={16} aria-label="Passed" />
        )}
      </span>
      <Stack direction="horizontal" gap="condensed" align="baseline" wrap="wrap">
        <Text weight="semibold">{check.context}</Text>
        <Text style={{ color: "var(--fgColor-muted)" }}>/ {check.name}</Text>
      </Stack>
      <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
        {running ? "in progress" : "successful"}
      </Text>
    </li>
  );
}

function RunningGlyph() {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 12,
        height: 12,
        borderRadius: "50%",
        border: "2px solid var(--fgColor-attention)",
        borderTopColor: "transparent",
        animation: "pr-spin 0.9s linear infinite",
      }}
    >
      <style>{`@keyframes pr-spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}

function MergeControls({
  allGreen,
  merging,
  onMerge,
}: {
  allGreen: boolean;
  merging: boolean;
  onMerge: () => void;
}) {
  return (
    <div style={{ padding: "var(--base-size-16, 16px) var(--base-size-24, 24px)" }}>
      <Stack direction="horizontal" gap="normal" align="center" justify="space-between" wrap="wrap">
        <Stack direction="horizontal" gap="condensed" align="center">
          <span
            style={{
              color: allGreen ? "var(--fgColor-success)" : "var(--fgColor-muted)",
              display: "inline-flex",
            }}
          >
            <GitMergeIcon size={16} />
          </span>
          <Stack direction="vertical" gap="none">
            <Text weight="semibold">
              {allGreen
                ? "This branch is ready to merge"
                : "Merging is blocked while checks run"}
            </Text>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              {allGreen
                ? "Merging will close the pull request and update main."
                : "The merge button becomes available once every required check passes."}
            </Text>
          </Stack>
        </Stack>
        <Button
          variant="primary"
          leadingVisual={GitMergeIcon}
          onClick={onMerge}
          loading={merging}
          loadingAnnouncement="Merging pull request"
          disabled={!allGreen}
        >
          {merging ? "Merging…" : "Merge pull request"}
        </Button>
      </Stack>
    </div>
  );
}

function MergedPanel() {
  return (
    <CardSurface>
      <div style={{ padding: "var(--base-size-16, 16px) var(--base-size-24, 24px)" }}>
        <Stack
          direction="horizontal"
          gap="normal"
          align="center"
          justify="space-between"
          wrap="wrap"
        >
          <Stack direction="horizontal" gap="condensed" align="center">
            <span style={{ color: "var(--fgColor-done)", display: "inline-flex" }}>
              <GitMergeIcon size={16} aria-label="Merged" />
            </span>
            <Stack direction="vertical" gap="none">
              <Text weight="semibold">Pull request successfully merged and closed</Text>
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                You're all set — the <BranchName as="span">feat/orbit-resync</BranchName>{" "}
                branch can now be safely deleted.
              </Text>
            </Stack>
          </Stack>
          <Button variant="default" leadingVisual={TrashIcon}>
            Delete branch
          </Button>
        </Stack>
      </div>
    </CardSurface>
  );
}

