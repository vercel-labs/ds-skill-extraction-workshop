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
  Select,
  Spinner,
  StateLabel,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@primer/react";
import {
  CheckCircleIcon,
  GitCommitIcon,
  DotFillIcon,
  FileDiffIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
} from "@primer/octicons-react";
import { useEffect, useState } from "react";
import { useColorModeToggle } from "../../app/color-mode";

// ---- Invented data (no GitHub mascot names) -------------------------------

const REPO = "lumenworks/starfield-ui";
const PR_NUMBER = 482;
const PR_TITLE = "Add aurora gradient tokens to the surface palette";
const SOURCE_BRANCH = "feat/aurora-tokens";
const BASE_BRANCH = "trunk";
const TOPICS = ["design-system", "tokens"];
const COMMIT_COUNT = 7;
const FILES_CHANGED = 14;

type CheckState = "running" | "success";

type Check = {
  id: string;
  name: string;
  context: string;
  state: CheckState;
};

const INITIAL_CHECKS: Check[] = [
  { id: "lint", name: "Lint", context: "Style and formatting", state: "running" },
  { id: "unit", name: "Unit tests", context: "Vitest suite", state: "running" },
  { id: "types", name: "Type check", context: "tsc --noEmit", state: "running" },
  { id: "tokens", name: "Token contract", context: "Primitives diff", state: "running" },
  { id: "visual", name: "Visual review", context: "Snapshot baseline", state: "running" },
  { id: "a11y", name: "Accessibility", context: "Axe sweep", state: "running" },
];

type MergeMethod = "merge" | "squash" | "rebase";

const METHOD_LABEL: Record<MergeMethod, string> = {
  merge: "Merge pull request",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
};

type Phase = "checking" | "ready" | "merged";

// A motion-safe transition: state-change token, dropped under reduced motion.
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return reduced;
}

export function PrMergedTheater() {
  const { resolvedMode, toggle } = useColorModeToggle();
  const reducedMotion = useReducedMotion();

  const [checks, setChecks] = useState<Check[]>(INITIAL_CHECKS);
  const [phase, setPhase] = useState<Phase>("checking");

  // Editable merge box.
  const [method, setMethod] = useState<MergeMethod>("squash");
  const [headline, setHeadline] = useState(
    `${PR_TITLE} (#${PR_NUMBER})`,
  );
  const [description, setDescription] = useState(
    "Introduces aurora.* surface tokens and wires them through the light and dark themes.",
  );
  const [deleteBranch, setDeleteBranch] = useState(true);
  const [branchRemoved, setBranchRemoved] = useState(false);

  const passed = checks.filter((c) => c.state === "success").length;
  const total = checks.length;
  const allGreen = passed === total;

  // Resolve checks one by one over ~6s.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    INITIAL_CHECKS.forEach((check, index) => {
      timers.push(
        setTimeout(
          () => {
            setChecks((prev) =>
              prev.map((c) =>
                c.id === check.id ? { ...c, state: "success" } : c,
              ),
            );
          },
          900 * (index + 1),
        ),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  // Open the merge box once everything is green.
  useEffect(() => {
    if (allGreen && phase === "checking") {
      setPhase("ready");
    }
  }, [allGreen, phase]);

  const transition = reducedMotion
    ? undefined
    : "var(--motion-transition-stateChange)";

  const merged = phase === "merged";

  function handleMerge() {
    setPhase("merged");
    setBranchRemoved(deleteBranch);
  }

  return (
    <Stack
      direction="vertical"
      gap="spacious"
      padding="spacious"
      style={{
        maxWidth: "880px",
        margin: "0 auto",
      }}
    >
      {/* Top bar: identity + color-mode control */}
      <Stack direction="horizontal" justify="space-between" align="center" wrap="wrap">
        <Text style={{ color: "var(--fgColor-muted)", fontWeight: 600 }}>{REPO}</Text>
        <IconButton
          data-testid="color-mode-toggle"
          icon={resolvedMode === "dark" ? SunIcon : MoonIcon}
          aria-label={
            resolvedMode === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          variant="invisible"
          onClick={toggle}
        />
      </Stack>

      {/* Header: title, number, state capsule, branches */}
      <Stack direction="vertical" gap="condensed">
        <Stack direction="horizontal" gap="normal" align="center" wrap="wrap">
          <span
            style={{
              display: "inline-flex",
              transition,
            }}
          >
            <StateLabel status={merged ? "pullMerged" : "pullOpened"}>
              {merged ? "Merged" : "Open"}
            </StateLabel>
          </span>
          <Heading as="h1" variant="medium" style={{ margin: 0 }}>
            {PR_TITLE}{" "}
            <Text style={{ color: "var(--fgColor-muted)", fontWeight: 400 }}>
              #{PR_NUMBER}
            </Text>
          </Heading>
        </Stack>

        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          <Text style={{ color: "var(--fgColor-muted)" }}>
            {merged ? "Merged into" : "Wants to merge into"}
          </Text>
          <BranchName as="span">{BASE_BRANCH}</BranchName>
          <Text style={{ color: "var(--fgColor-muted)" }}>from</Text>
          <BranchName as="span">{SOURCE_BRANCH}</BranchName>
        </Stack>
      </Stack>

      {/* Metadata a maintainer scans: topic labels + running counts */}
      <Stack direction="horizontal" justify="space-between" align="center" wrap="wrap" gap="normal">
        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          {TOPICS.map((topic) => (
            <Label key={topic} variant="accent">
              {topic}
            </Label>
          ))}
        </Stack>
        <Stack direction="horizontal" gap="normal" align="center" wrap="wrap">
          <Text style={{ color: "var(--fgColor-muted)" }}>
            <GitCommitIcon size={16} /> Commits{" "}
            <CounterLabel variant="primary">{COMMIT_COUNT}</CounterLabel>
          </Text>
          <Text style={{ color: "var(--fgColor-muted)" }}>
            <CheckCircleIcon size={16} /> Checks{" "}
            <CounterLabel variant="primary">
              {passed}/{total}
            </CounterLabel>
          </Text>
          <Text style={{ color: "var(--fgColor-muted)" }}>
            <FileDiffIcon size={16} /> Files{" "}
            <CounterLabel variant="primary">{FILES_CHANGED}</CounterLabel>
          </Text>
        </Stack>
      </Stack>

      {/* The merge box */}
      <Stack
        direction="vertical"
        gap="normal"
        padding="normal"
        style={{
          border: "1px solid var(--borderColor-default)",
          borderRadius: "var(--borderRadius-medium)",
          backgroundColor: "var(--bgColor-muted)",
        }}
      >
        {/* Reviews summary */}
        <Stack direction="horizontal" gap="condensed" align="center">
          <span style={{ color: "var(--fgColor-success)", display: "inline-flex" }}>
            <CheckCircleIcon size={16} />
          </span>
          <Text style={{ fontWeight: 600 }}>
            2 approving reviews
          </Text>
          <Text style={{ color: "var(--fgColor-muted)" }}>
            by maintainers
          </Text>
        </Stack>

        {/* CI checks wall + progress */}
        {!merged && (
          <Stack direction="vertical" gap="condensed">
            <ProgressBar
              progress={(passed / total) * 100}
              aria-label={`Checks complete: ${passed} of ${total}`}
              bg={allGreen ? "success.emphasis" : "accent.emphasis"}
            />
            <Stack
              direction="vertical"
              gap="none"
              role="list"
              aria-label="Continuous integration checks"
            >
              {checks.map((check) => {
                const done = check.state === "success";
                return (
                  <Stack
                    key={check.id}
                    direction="horizontal"
                    gap="condensed"
                    align="center"
                    role="listitem"
                    paddingBlock="condensed"
                    style={{
                      borderBottom: "1px solid var(--borderColor-muted)",
                      transition,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{ display: "inline-flex", width: 16, justifyContent: "center" }}
                    >
                      {done ? (
                        <span style={{ color: "var(--fgColor-success)", display: "inline-flex" }}>
                          <CheckCircleIcon size={16} />
                        </span>
                      ) : (
                        <Spinner size="small" srText={null} />
                      )}
                    </span>
                    <Text style={{ fontWeight: 600 }}>{check.name}</Text>
                    <Text style={{ color: "var(--fgColor-muted)" }}>— {check.context}</Text>
                    <span style={{ marginLeft: "auto" }}>
                      <Text
                        style={{
                          color: done ? "var(--fgColor-success)" : "var(--fgColor-muted)",
                        }}
                      >
                        {done ? "Passed" : "Running…"}
                      </Text>
                    </span>
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        )}

        {/* The "ready" cue */}
        {phase === "ready" && (
          <span
            role="status"
            aria-live="polite"
            style={{ display: "block", transition }}
          >
            <Flash variant="success">
              <CheckCircleIcon size={16} /> All checks have passed — this pull request
              is ready to merge.
            </Flash>
          </span>
        )}

        {phase === "checking" && (
          <Flash variant="default">
            <DotFillIcon size={16} /> Checks are still running. Merging is unavailable
            until they pass.
          </Flash>
        )}

        {/* Full editable merge form — only once ready */}
        {phase === "ready" && (
          <Stack direction="vertical" gap="normal">
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
                How the commits from this branch are added to {BASE_BRANCH}.
              </FormControl.Caption>
            </FormControl>

            {method !== "rebase" && (
              <>
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
                    Add any extra context for the commit body.
                  </FormControl.Caption>
                </FormControl>
              </>
            )}

            <FormControl>
              <Checkbox
                checked={deleteBranch}
                onChange={(e) => setDeleteBranch(e.target.checked)}
              />
              <FormControl.Label>Delete branch after merge</FormControl.Label>
              <FormControl.Caption>
                Remove {SOURCE_BRANCH} once the merge completes.
              </FormControl.Caption>
            </FormControl>

            <Stack direction="horizontal">
              <Button
                variant="primary"
                leadingVisual={GitMergeIcon}
                onClick={handleMerge}
              >
                {METHOD_LABEL[method]}
              </Button>
            </Stack>
          </Stack>
        )}

        {/* While checks run, the primary action exists but is genuinely
            unavailable: disabled removes it from the tab order and from the
            accessibility tree as an actionable control. */}
        {phase === "checking" && (
          <Stack direction="horizontal">
            <Button variant="primary" leadingVisual={GitMergeIcon} disabled>
              {METHOD_LABEL[method]}
            </Button>
          </Stack>
        )}

        {/* Merged: quiet confirmation + branch choice honoured */}
        {merged && (
          <Stack direction="vertical" gap="normal">
            <span style={{ display: "block", transition }}>
              <Flash variant="success">
                <GitMergeIcon size={16} /> Pull request successfully merged and closed.
              </Flash>
            </span>
            <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
              <Text style={{ color: "var(--fgColor-muted)" }}>
                {branchRemoved
                  ? `The ${SOURCE_BRANCH} branch was deleted.`
                  : `The ${SOURCE_BRANCH} branch can be safely deleted.`}
              </Text>
              {branchRemoved ? (
                <Button
                  variant="default"
                  leadingVisual={GitPullRequestIcon}
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
            </Stack>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
