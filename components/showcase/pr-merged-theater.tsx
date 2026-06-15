"use client"

import { useState, useEffect, useCallback } from "react"
import {
  useTheme,
  StateLabel,
  Label,
  CounterLabel,
  BranchName,
  ProgressBar,
  Banner,
  Button,
  IconButton,
  ActionMenu,
  ActionList,
  FormControl,
  TextInput,
  Textarea,
  Checkbox,
  Spinner,
  Stack,
  Heading,
  Text,
  BaseStyles,
} from "@primer/react"
import {
  SunIcon,
  MoonIcon,
  CheckCircleFillIcon,
  XCircleFillIcon,
  GitMergeIcon,
  GitCommitIcon,
  GitBranchIcon,
  TrashIcon,
  CheckIcon,
} from "@primer/octicons-react"

type CheckStatus = "pending" | "running" | "pass" | "fail"

interface CiCheck {
  id: string
  name: string
  status: CheckStatus
}

type MergeMethod = "merge" | "squash" | "rebase"

const INITIAL_CHECKS: CiCheck[] = [
  { id: "lint", name: "ci / lint", status: "pending" },
  { id: "typecheck", name: "ci / type-check", status: "pending" },
  { id: "unit", name: "ci / unit-tests", status: "pending" },
  { id: "integration", name: "ci / integration", status: "pending" },
  { id: "security", name: "security / snyk-scan", status: "pending" },
  { id: "staging", name: "deploy / staging-preview", status: "pending" },
]

const CHECK_DELAY_MS = 550

const MERGE_METHOD_LABELS: Record<MergeMethod, string> = {
  merge: "Create a merge commit",
  squash: "Squash and merge",
  rebase: "Rebase and merge",
}

function ColorModeToggle() {
  const { resolvedColorMode, setColorMode } = useTheme()
  const isDark = resolvedColorMode === "night" || resolvedColorMode === "dark"

  const toggle = useCallback(() => {
    setColorMode(isDark ? "day" : "night")
  }, [isDark, setColorMode])

  return (
    <IconButton
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      icon={isDark ? SunIcon : MoonIcon}
      variant="invisible"
      size="medium"
      onClick={toggle}
      data-testid="color-mode-toggle"
    />
  )
}

function CheckRow({ check }: { check: CiCheck }) {
  return (
    <Stack direction="horizontal" align="center" gap="tight" as="li">
      <span
        style={{
          width: 20,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {check.status === "pending" && (
          <span style={{ color: "var(--fgColor-muted)", display: "flex" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <circle cx="8" cy="8" r="4" />
            </svg>
          </span>
        )}
        {check.status === "running" && (
          <Spinner size="small" srText={`${check.name} is running`} />
        )}
        {check.status === "pass" && (
          <span style={{ color: "var(--fgColor-success)", display: "flex" }}>
            <CheckCircleFillIcon size={16} />
          </span>
        )}
        {check.status === "fail" && (
          <span style={{ color: "var(--fgColor-danger)", display: "flex" }}>
            <XCircleFillIcon size={16} />
          </span>
        )}
      </span>
      <Text size="small" style={{ color: "var(--fgColor-default)" }}>
        {check.name}
      </Text>
    </Stack>
  )
}

function MergeMethodPicker({
  method,
  onChange,
  disabled,
}: {
  method: MergeMethod
  onChange: (m: MergeMethod) => void
  disabled: boolean
}) {
  return (
    <ActionMenu>
      <ActionMenu.Button
        disabled={disabled}
        aria-label="Select merge method"
        size="small"
      >
        {MERGE_METHOD_LABELS[method]}
      </ActionMenu.Button>
      <ActionMenu.Overlay>
        <ActionList>
          {(["merge", "squash", "rebase"] as MergeMethod[]).map((m) => (
            <ActionList.Item
              key={m}
              selected={method === m}
              onSelect={() => onChange(m)}
            >
              {MERGE_METHOD_LABELS[m]}
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

export function PrMergedTheater() {
  const { resolvedColorMode, dayScheme, nightScheme } = useTheme()

  const [checks, setChecks] = useState<CiCheck[]>(INITIAL_CHECKS)
  const [mergeReady, setMergeReady] = useState(false)
  const [merged, setMerged] = useState(false)
  const [mergeMethod, setMergeMethod] = useState<MergeMethod>("squash")
  const [headline, setHeadline] = useState(
    "feat(api): add async job queue with retry backoff"
  )
  const [body, setBody] = useState(
    "Resolves the thundering-herd issue on the `/jobs` endpoint by introducing a bounded, priority-aware queue backed by Valkey.\n\nRetries follow an exponential backoff capped at 32 s."
  )
  const [deleteBranch, setDeleteBranch] = useState(true)
  const [branchDeleted, setBranchDeleted] = useState(false)

  // Sync resolved color mode to document root for test observability + page bg
  useEffect(() => {
    if (!resolvedColorMode) return
    const root = document.documentElement
    const isNight = resolvedColorMode === "night" || resolvedColorMode === "dark"
    root.setAttribute("data-color-mode", isNight ? "dark" : "light")
    root.setAttribute("data-light-theme", dayScheme ?? "light")
    root.setAttribute("data-dark-theme", nightScheme ?? "dark")
  }, [resolvedColorMode, dayScheme, nightScheme])

  // Simulate checks resolving one by one
  useEffect(() => {
    let cancelled = false

    const resolveChecks = async () => {
      for (let i = 0; i < INITIAL_CHECKS.length; i++) {
        await new Promise<void>((res) => setTimeout(res, CHECK_DELAY_MS))
        if (cancelled) return
        setChecks((prev) =>
          prev.map((c, idx) =>
            idx === i ? { ...c, status: "running" } : c
          )
        )
        await new Promise<void>((res) =>
          setTimeout(res, Math.round(CHECK_DELAY_MS * 0.6))
        )
        if (cancelled) return
        setChecks((prev) =>
          prev.map((c, idx) =>
            idx === i ? { ...c, status: "pass" } : c
          )
        )
        if (i === INITIAL_CHECKS.length - 1) {
          setMergeReady(true)
        }
      }
    }

    resolveChecks()
    return () => {
      cancelled = true
    }
  }, [])

  const passCount = checks.filter((c) => c.status === "pass").length
  const progress = Math.round((passCount / checks.length) * 100)
  const commitCount = 4
  const filesChanged = 12

  const handleMerge = () => {
    if (!mergeReady) return
    setMerged(true)
    if (deleteBranch) {
      setBranchDeleted(true)
    }
  }

  return (
    <BaseStyles>
      <div
        style={{
          maxWidth: 740,
          margin: "0 auto",
          padding: "24px 16px",
        }}
      >
        {/* Header row: title + color mode toggle */}
        <Stack
          direction="horizontal"
          align="start"
          justify="space-between"
          gap="normal"
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
              <Heading
                as="h1"
                variant="medium"
                style={{ color: "var(--fgColor-default)", margin: 0 }}
              >
                feat(api): add async job queue with retry backoff
              </Heading>
              <Text
                size="large"
                style={{ color: "var(--fgColor-muted)", flexShrink: 0 }}
              >
                #847
              </Text>
            </div>

            {/* PR state + branch info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 8,
              }}
            >
              <StateLabel
                status={merged ? "pullMerged" : "pullOpened"}
                size="small"
              >
                {merged ? "Merged" : "Open"}
              </StateLabel>
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                <BranchName>main</BranchName>
                <span style={{ margin: "0 4px" }}>&larr;</span>
                <BranchName>queue/async-job-retry</BranchName>
              </Text>
              <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                by <strong>zelda-foxtrot</strong>
              </Text>
            </div>
          </div>

          <ColorModeToggle />
        </Stack>

        {/* Topic labels */}
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginTop: 12,
          }}
        >
          <Label variant="success">enhancement</Label>
          <Label variant="accent">backend</Label>
          <Label variant="attention">performance</Label>
        </div>

        {/* Running counts */}
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            marginTop: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: "var(--fgColor-muted)", display: "flex" }}>
              <GitCommitIcon size={14} />
            </span>
            <CounterLabel>{commitCount}</CounterLabel>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              commits
            </Text>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: "var(--fgColor-muted)", display: "flex" }}>
              <CheckIcon size={14} />
            </span>
            <CounterLabel variant={passCount === checks.length ? "primary" : "secondary"}>
              {passCount}/{checks.length}
            </CounterLabel>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              checks
            </Text>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: "var(--fgColor-muted)", display: "flex" }}>
              <GitBranchIcon size={14} />
            </span>
            <CounterLabel>{filesChanged}</CounterLabel>
            <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
              files changed
            </Text>
          </div>
        </div>

        {/* Merge box */}
        {!merged && (
          <div
            style={{
              marginTop: 16,
              border: "1px solid var(--borderColor-default)",
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            {/* Checks section */}
            <div style={{ padding: "16px 16px 12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  size="medium"
                  weight="semibold"
                  style={{ color: "var(--fgColor-default)" }}
                >
                  {mergeReady
                    ? "All checks passed"
                    : passCount === 0
                    ? "Checks running…"
                    : `${passCount} of ${checks.length} checks passed`}
                </Text>
                <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                  {progress}%
                </Text>
              </div>

              <div style={{ marginTop: 8 }}>
                <ProgressBar
                  progress={progress}
                  animated={!mergeReady}
                  aria-label="CI check progress"
                  barSize="small"
                />
              </div>

              <ul
                style={{
                  listStyle: "none",
                  margin: "12px 0 0",
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
                aria-label="CI checks"
              >
                {checks.map((check) => (
                  <CheckRow key={check.id} check={check} />
                ))}
              </ul>
            </div>

            {/* Ready banner */}
            {mergeReady && (
              <div style={{ borderTop: "1px solid var(--borderColor-default)" }}>
                <Banner
                  variant="success"
                  title="Ready to merge"
                  description="All checks have passed. You may merge this pull request."
                  aria-label="Merge readiness notice"
                />
              </div>
            )}

            {/* Merge form */}
            <div
              style={{
                borderTop: "1px solid var(--borderColor-default)",
                padding: "16px",
                opacity: mergeReady ? 1 : 0.55,
                transition: "opacity 0.3s ease",
              }}
            >
              <Stack direction="vertical" gap="normal">
                {/* Merge method */}
                <FormControl>
                  <FormControl.Label>Merge method</FormControl.Label>
                  <MergeMethodPicker
                    method={mergeMethod}
                    onChange={setMergeMethod}
                    disabled={!mergeReady}
                  />
                </FormControl>

                {/* Commit headline */}
                <FormControl disabled={!mergeReady}>
                  <FormControl.Label>Commit headline</FormControl.Label>
                  <TextInput
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    block
                  />
                </FormControl>

                {/* Extended description */}
                <FormControl disabled={!mergeReady}>
                  <FormControl.Label>Extended description</FormControl.Label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    block
                    resize="vertical"
                  />
                </FormControl>

                {/* Delete branch */}
                <FormControl disabled={!mergeReady}>
                  <Checkbox
                    checked={deleteBranch}
                    onChange={(e) => setDeleteBranch(e.target.checked)}
                  />
                  <FormControl.Label>Delete branch after merge</FormControl.Label>
                </FormControl>

                {/* Merge button */}
                <div>
                  <Button
                    variant="primary"
                    disabled={!mergeReady}
                    onClick={handleMerge}
                    leadingVisual={GitMergeIcon}
                  >
                    {MERGE_METHOD_LABELS[mergeMethod]}
                  </Button>
                </div>
              </Stack>
            </div>
          </div>
        )}

        {/* Post-merge confirmation */}
        {merged && (
          <div
            style={{
              marginTop: 16,
              border: "1px solid var(--borderColor-done, var(--color-done-emphasis))",
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span
                  style={{
                    color: "var(--fgColor-done)",
                    display: "flex",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <GitMergeIcon size={20} />
                </span>
                <div>
                  <Text
                    size="large"
                    weight="semibold"
                    style={{ color: "var(--fgColor-default)", display: "block" }}
                  >
                    Pull request merged
                  </Text>
                  <Text
                    size="small"
                    style={{
                      color: "var(--fgColor-muted)",
                      display: "block",
                      marginTop: 2,
                    }}
                  >
                    {headline}
                  </Text>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                {branchDeleted ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                      Branch <BranchName>queue/async-job-retry</BranchName> was deleted.
                    </Text>
                    <Button
                      variant="default"
                      size="small"
                      onClick={() => setBranchDeleted(false)}
                      leadingVisual={GitBranchIcon}
                    >
                      Restore branch
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <Text size="small" style={{ color: "var(--fgColor-muted)" }}>
                      Branch <BranchName>queue/async-job-retry</BranchName> is still active.
                    </Text>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => setBranchDeleted(true)}
                      leadingVisual={TrashIcon}
                    >
                      Delete branch
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseStyles>
  )
}
