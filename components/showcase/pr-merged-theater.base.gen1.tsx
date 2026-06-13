"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
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
  Select,
  Stack,
  StateLabel,
  Text,
  TextInput,
  Textarea,
} from "@primer/react";
// HARVEST: Avatar — the slate has no author/reviewer avatar; faking it with Label/Text would not carry the image affordance a PR header relies on.
import { Avatar } from "@primer/react";
// HARVEST: Spinner — the slate has no busy/progress glyph; per-check "running" state needs an animated indeterminate indicator the slate cannot express.
import { Spinner } from "@primer/react";
// HARVEST: ProgressBar — the slate has no progress meter; the "dominoes" advance needs a determinate bar driven by checks-passed/total.
import { ProgressBar } from "@primer/react";
// HARVEST: RelativeTime — the slate has no relative-timestamp element; a hand-rolled "opened N hours ago" string is static and not locale/live-aware.
import { RelativeTime } from "@primer/react";
import {
  AlertIcon,
  CheckCircleFillIcon,
  ChecklistIcon,
  ClockIcon,
  CommentIcon,
  EyeIcon,
  FileDiffIcon,
  GitCommitIcon,
  GitMergeIcon,
  GitMergeQueueIcon,
  GitPullRequestIcon,
  TrashIcon,
  UndoIcon,
  XCircleFillIcon,
} from "@primer/octicons-react";

/* ---------------------------------------------------------------------------
 * Data — invented usernames, repos, branches, labels, checks. No GitHub mascots.
 * ------------------------------------------------------------------------- */

const PR = {
  number: 4827,
  title: "Stream merge-queue events over the websocket bridge",
  repo: "northwind/relay-core",
  author: "marlowe-q",
  sourceBranch: "feat/ws-merge-queue",
  targetBranch: "trunk",
  // Fixed reference instant so RelativeTime renders deterministically in both modes.
  openedAt: "2026-06-13T05:12:00.000Z",
  topics: ["websocket", "merge-queue", "infra"],
  reviewers: [
    { login: "priya-vance", src: "https://avatars.example.test/priya.png" },
    { login: "dao-lin", src: "https://avatars.example.test/dao.png" },
  ],
} as const;

type CheckState = "running" | "passed" | "failed";

type Check = {
  id: string;
  name: string;
  context: string;
  /** Final resolved state once its timer fires. */
  resolveTo: Exclude<CheckState, "running">;
  /** ms after start that this check resolves. */
  at: number;
};

const CHECKS: readonly Check[] = [
  { id: "lint", name: "lint / eslint", context: "northwind-ci", resolveTo: "passed", at: 900 },
  { id: "unit", name: "test / unit", context: "northwind-ci", resolveTo: "passed", at: 1900 },
  { id: "types", name: "build / typecheck", context: "northwind-ci", resolveTo: "passed", at: 2900 },
  { id: "integ", name: "test / integration", context: "northwind-ci", resolveTo: "passed", at: 4100 },
  { id: "e2e", name: "test / e2e (chromium)", context: "northwind-ci", resolveTo: "passed", at: 5200 },
  { id: "deploy", name: "deploy / preview", context: "vercel-preview", resolveTo: "passed", at: 6000 },
] as const;

const MERGE_METHODS = [
  { value: "merge", label: "Create a merge commit", verb: "Merge pull request" },
  { value: "squash", label: "Squash and merge", verb: "Squash and merge" },
  { value: "rebase", label: "Rebase and merge", verb: "Rebase and merge" },
] as const;

type MergeMethod = (typeof MERGE_METHODS)[number]["value"];

/* ---------------------------------------------------------------------------
 * Check progression reducer — drives the "watch the dominoes fall" sequence.
 * ------------------------------------------------------------------------- */

type ChecksState = Record<string, CheckState>;

const initialChecks: ChecksState = Object.fromEntries(
  CHECKS.map((c) => [c.id, "running" as CheckState]),
);

function checksReducer(
  state: ChecksState,
  action: { id: string; to: CheckState },
): ChecksState {
  if (state[action.id] === action.to) return state;
  return { ...state, [action.id]: action.to };
}

function usePrefersReducedMotion(): boolean {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", onStoreChange);
    return () => mq.removeEventListener("change", onStoreChange);
  }, []);
  const getSnapshot = useCallback(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  // Server snapshot: assume motion is allowed; corrected on hydration.
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/* ---------------------------------------------------------------------------
 * Small presentational helpers (token-painted, no hand-picked colors).
 * ------------------------------------------------------------------------- */

function CheckStatusIcon({ state }: { state: CheckState }) {
  if (state === "passed") {
    return (
      <span style={{ color: "var(--fgColor-success)", display: "inline-flex" }}>
        <CheckCircleFillIcon size={16} />
      </span>
    );
  }
  if (state === "failed") {
    return (
      <span style={{ color: "var(--fgColor-danger)", display: "inline-flex" }}>
        <XCircleFillIcon size={16} />
      </span>
    );
  }
  return <Spinner size="small" srText="Check running" />;
}

const cardSurface: React.CSSProperties = {
  backgroundColor: "var(--bgColor-default)",
  border: "1px solid var(--borderColor-default)",
  borderRadius: "var(--borderRadius-large, 12px)",
  padding: "var(--base-size-16, 1rem)",
};

const dividerTop: React.CSSProperties = {
  borderTop: "1px solid var(--borderColor-muted)",
  paddingTop: "var(--base-size-16, 1rem)",
};

/* ---------------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------------- */

export function PrMergedTheaterBaseGen1() {
  const reducedMotion = usePrefersReducedMotion();
  const [checks, dispatch] = useReducer(checksReducer, initialChecks);
  const [merged, setMerged] = useState(false);

  // Editable merge box state.
  const [method, setMethod] = useState<MergeMethod>("squash");
  const [headline, setHeadline] = useState(
    `${PR.title} (#${PR.number})`,
  );
  const [description, setDescription] = useState(
    "Bridges merge-queue lifecycle events onto the existing websocket fan-out so dashboards update without polling.",
  );
  const [deleteBranch, setDeleteBranch] = useState(true);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const started = timers.current;
    CHECKS.forEach((check) => {
      const t = setTimeout(() => {
        dispatch({ id: check.id, to: check.resolveTo });
      }, check.at);
      started.push(t);
    });
    return () => {
      started.forEach(clearTimeout);
      started.length = 0;
    };
  }, []);

  const passedCount = useMemo(
    () => CHECKS.filter((c) => checks[c.id] === "passed").length,
    [checks],
  );
  const failedCount = useMemo(
    () => CHECKS.filter((c) => checks[c.id] === "failed").length,
    [checks],
  );
  const total = CHECKS.length;
  const settled = passedCount + failedCount;
  const allGreen = passedCount === total;
  const progress = Math.round((settled / total) * 100);

  // Running counts that tick up as checks land — commits stay fixed, checks/files
  // track the progression so the room feels the numbers move.
  const commitCount = 7;
  const filesChanged = 12;

  const activeMethod = MERGE_METHODS.find((m) => m.value === method)!;

  const onMerge = useCallback(() => {
    if (!allGreen || merged) return;
    setMerged(true);
  }, [allGreen, merged]);

  const stateChangeTransition = reducedMotion
    ? undefined
    : "var(--transition-all, all) var(--motion-duration-medium) var(--motion-easing-enter)";

  return (
    <Stack
      as="main"
      direction="vertical"
      gap="normal"
      style={{
        backgroundColor: "var(--bgColor-default)",
        color: "var(--fgColor-default)",
        minHeight: "100vh",
        maxWidth: "880px",
        margin: "0 auto",
        padding: "var(--base-size-24, 1.5rem)",
      }}
    >
      {/* ---- PR header: title, number, lifecycle capsule, branches ---- */}
      <Stack direction="vertical" gap="condensed">
        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          <StateLabel
            status={merged ? "pullMerged" : "pullOpened"}
            style={{ transition: stateChangeTransition }}
          >
            {merged ? "Merged" : "Open"}
          </StateLabel>
          <Heading
            as="h1"
            variant="large"
            style={{ flex: "1 1 auto", minWidth: 0 }}
          >
            {PR.title}{" "}
            <Text
              as="span"
              size="large"
              weight="light"
              style={{ color: "var(--fgColor-muted)" }}
            >
              #{PR.number}
            </Text>
          </Heading>
        </Stack>

        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          <Avatar src={PR.reviewers[0].src} alt="" size={20} />
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            <Text as="strong" size="small" weight="semibold" style={{ color: "var(--fgColor-default)" }}>
              @{PR.author}
            </Text>{" "}
            wants to merge {commitCount} commits into{" "}
          </Text>
          <BranchName as="span">{PR.targetBranch}</BranchName>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            from
          </Text>
          <BranchName as="span">{PR.sourceBranch}</BranchName>
          <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
            · opened <RelativeTime date={new Date(PR.openedAt)} />
          </Text>
        </Stack>
      </Stack>

      {/* ---- Metadata: topic labels + running counts ---- */}
      <Stack direction="horizontal" gap="normal" align="center" wrap="wrap">
        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          {PR.topics.map((topic) => (
            <Label key={topic} variant="accent">
              {topic}
            </Label>
          ))}
        </Stack>
        <Stack
          direction="horizontal"
          gap="normal"
          align="center"
          wrap="wrap"
          style={{ marginInlineStart: "auto" }}
        >
          <Stack direction="horizontal" gap="condensed" align="center">
            <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
              <GitCommitIcon size={16} />
            </span>
            <Text size="small">Commits</Text>
            <CounterLabel variant="secondary">{commitCount}</CounterLabel>
          </Stack>
          <Stack direction="horizontal" gap="condensed" align="center">
            <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
              <ChecklistIcon size={16} />
            </span>
            <Text size="small">Checks</Text>
            <CounterLabel variant={allGreen ? "primary" : "secondary"}>
              {`${settled}/${total}`}
            </CounterLabel>
          </Stack>
          <Stack direction="horizontal" gap="condensed" align="center">
            <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
              <FileDiffIcon size={16} />
            </span>
            <Text size="small">Files changed</Text>
            <CounterLabel variant="secondary">{filesChanged}</CounterLabel>
          </Stack>
        </Stack>
      </Stack>

      {/* ---- Merge box ---- */}
      <Stack direction="vertical" gap="normal" style={cardSurface}>
        {/* Reviews summary */}
        <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
          <span style={{ color: "var(--fgColor-success)", display: "inline-flex" }}>
            <CheckCircleFillIcon size={16} />
          </span>
          <Text weight="semibold">2 approving reviews</Text>
          <Stack direction="horizontal" gap="tight" align="center">
            {PR.reviewers.map((r) => (
              <Stack key={r.login} direction="horizontal" gap="tight" align="center">
                <Avatar src={r.src} alt={`@${r.login}`} size={20} />
                <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                  @{r.login}
                </Text>
              </Stack>
            ))}
          </Stack>
          <span style={{ marginInlineStart: "auto", color: "var(--fgColor-muted)", display: "inline-flex" }}>
            <EyeIcon size={16} />
          </span>
        </Stack>

        {/* Checks progress header */}
        <Stack direction="vertical" gap="condensed" style={dividerTop}>
          <Stack direction="horizontal" gap="condensed" align="center">
            {allGreen ? (
              <span style={{ color: "var(--fgColor-success)", display: "inline-flex" }}>
                <CheckCircleFillIcon size={16} />
              </span>
            ) : failedCount > 0 ? (
              <span style={{ color: "var(--fgColor-danger)", display: "inline-flex" }}>
                <AlertIcon size={16} />
              </span>
            ) : (
              <span style={{ color: "var(--fgColor-muted)", display: "inline-flex" }}>
                <ClockIcon size={16} />
              </span>
            )}
            <Heading as="h2" variant="small">
              {allGreen
                ? "All checks have passed"
                : failedCount > 0
                  ? "Some checks were not successful"
                  : "Some checks haven’t completed yet"}
            </Heading>
            <Text
              size="small"
              style={{ color: "var(--fgColor-muted)", marginInlineStart: "auto" }}
              aria-live="polite"
            >
              {passedCount} passing
              {failedCount > 0 ? `, ${failedCount} failing` : ""} ·{" "}
              {total - settled} pending
            </Text>
          </Stack>

          <ProgressBar
            progress={progress}
            aria-label={`Checks complete: ${settled} of ${total}`}
            animated={!reducedMotion && !allGreen && settled < total}
          />

          {/* Per-check rows */}
          <Stack as="ul" direction="vertical" gap="none" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {CHECKS.map((check) => {
              const state = checks[check.id];
              return (
                <Stack
                  as="li"
                  key={check.id}
                  direction="horizontal"
                  gap="condensed"
                  align="center"
                  style={{
                    paddingBlock: "var(--base-size-8, 0.5rem)",
                    borderBottom: "1px solid var(--borderColor-muted)",
                    transition: stateChangeTransition,
                  }}
                >
                  <CheckStatusIcon state={state} />
                  <Stack direction="vertical" gap="none" style={{ minWidth: 0 }}>
                    <Text size="small" weight="semibold">
                      {check.name}
                    </Text>
                    <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                      {check.context} —{" "}
                      {state === "running"
                        ? "in progress…"
                        : state === "passed"
                          ? "Successful in 1m"
                          : "Failing after 1m"}
                    </Text>
                  </Stack>
                  <Text
                    size="small"
                    style={{ color: "var(--fgColor-muted)", marginInlineStart: "auto" }}
                  >
                    Required
                  </Text>
                </Stack>
              );
            })}
          </Stack>
        </Stack>

        {/* "Ready" cue — appears only when everything is green and not yet merged */}
        {allGreen && !merged && (
          <div role="status">
            <Flash variant="success">
              <Stack direction="horizontal" gap="condensed" align="center">
                <span style={{ display: "inline-flex" }}>
                  <GitMergeQueueIcon size={16} />
                </span>
                <Text weight="semibold">
                  This branch has no conflicts with the base branch. Merging can be performed automatically.
                </Text>
              </Stack>
            </Flash>
          </div>
        )}

        {/* The editable merge form OR the collapsed confirmation */}
        {!merged ? (
          <Stack
            direction="vertical"
            gap="normal"
            style={{
              ...dividerTop,
              transition: stateChangeTransition,
            }}
          >
            {allGreen ? (
              <>
                <FormControl>
                  <FormControl.Label>Merge method</FormControl.Label>
                  <Select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as MergeMethod)}
                    block
                  >
                    {MERGE_METHODS.map((m) => (
                      <Select.Option key={m.value} value={m.value}>
                        {m.label}
                      </Select.Option>
                    ))}
                  </Select>
                  <FormControl.Caption>
                    The primary action reflects the method you choose.
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
                    Add any context reviewers should see in the squashed commit body.
                  </FormControl.Caption>
                </FormControl>

                <FormControl>
                  <Checkbox
                    checked={deleteBranch}
                    onChange={(e) => setDeleteBranch(e.target.checked)}
                  />
                  <FormControl.Label>
                    Delete <BranchName as="span">{PR.sourceBranch}</BranchName> after merge
                  </FormControl.Label>
                  <FormControl.Caption>
                    The branch can be restored from the PR after deletion.
                  </FormControl.Caption>
                </FormControl>

                <Stack direction="horizontal" gap="condensed" align="center">
                  <Button
                    variant="primary"
                    leadingVisual={activeMethod.value === "rebase" ? GitCommitIcon : GitMergeIcon}
                    onClick={onMerge}
                  >
                    {activeMethod.verb}
                  </Button>
                  <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                    You can also merge from the command line.
                  </Text>
                </Stack>
              </>
            ) : (
              // Checks still running: merging is genuinely unavailable. `disabled`
              // removes it from the keyboard tab order and from the a11y tree as
              // actionable, so a screen reader does not announce it as triggerable.
              <Stack direction="horizontal" gap="condensed" align="center">
                <Button
                  variant="primary"
                  leadingVisual={GitMergeIcon}
                  disabled
                  aria-disabled
                >
                  Merge pull request
                </Button>
                <Text size="small" style={{ color: "var(--fgColor-muted)" }} aria-live="polite">
                  Waiting for status checks to pass before merging is available.
                </Text>
              </Stack>
            )}
          </Stack>
        ) : (
          // Collapsed confirmation — honors the branch choice.
          <Stack
            direction="vertical"
            gap="condensed"
            style={{ ...dividerTop, transition: stateChangeTransition }}
          >
            <Stack direction="horizontal" gap="condensed" align="center">
              <span style={{ color: "var(--fgColor-done)", display: "inline-flex" }}>
                <GitMergeIcon size={16} />
              </span>
              <Text weight="semibold">
                Pull request successfully merged and closed
              </Text>
            </Stack>
            <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                <Text as="strong" size="small" weight="semibold" style={{ color: "var(--fgColor-default)" }}>
                  @{PR.author}
                </Text>{" "}
                {deleteBranch ? (
                  <>
                    merged via {activeMethod.label.toLowerCase()}. The branch{" "}
                    <BranchName as="span">{PR.sourceBranch}</BranchName> was deleted.
                  </>
                ) : (
                  <>
                    merged via {activeMethod.label.toLowerCase()}. You can safely delete the branch{" "}
                    <BranchName as="span">{PR.sourceBranch}</BranchName>.
                  </>
                )}
              </Text>
            </Stack>
            <Stack direction="horizontal" gap="condensed" align="center">
              {deleteBranch ? (
                <Button leadingVisual={UndoIcon}>Restore branch</Button>
              ) : (
                <Button variant="danger" leadingVisual={TrashIcon}>
                  Delete branch
                </Button>
              )}
              <IconButton
                icon={CommentIcon}
                aria-label="Add a comment to the merged pull request"
                variant="invisible"
              />
              <IconButton
                icon={GitPullRequestIcon}
                aria-label="Open a follow-up pull request"
                variant="invisible"
              />
            </Stack>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

export default PrMergedTheaterBaseGen1;
