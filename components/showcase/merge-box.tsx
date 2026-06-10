"use client"

import {
  Text,
  Button,
  IconButton,
  Label,
  Flash,
  Select,
  TextInput,
  Textarea,
  Checkbox,
  FormControl,
  Stack,
} from "@primer/react"
import {
  CheckCircleFillIcon,
  XCircleFillIcon,
  SyncIcon,
} from "@primer/octicons-react"

const zone: React.CSSProperties = {
  padding: "1rem",
  borderTop: "var(--borderWidth-thin, 1px) solid var(--borderColor-muted, #d0d7de)",
}

const inlineCode: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "inherit",
}

export function MergeBox() {
  const hasConflicts = true

  return (
    <div
      style={{
        border: "var(--borderWidth-thin, 1px) solid var(--borderColor-default, #d0d7de)",
        borderRadius: "var(--borderRadius-medium, 6px)",
        backgroundColor: "var(--bgColor-default, #ffffff)",
        overflow: "hidden",
      }}
    >
      {/* Zone 1 — Reviews */}
      <div style={{ padding: "1rem" }}>
        <Text
          weight="semibold"
          style={{ display: "block", marginBottom: "0.5rem" }}
        >
          Reviews
        </Text>
        <ReviewRow handle="@monalisa" pillLabel="code owner" pillVariant="accent" />
        <ReviewRow handle="@octocat" pillLabel="maintainer" pillVariant="done" last />
      </div>

      {/* Zone 2 — Checks */}
      <div style={zone}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <Text weight="semibold">Checks</Text>
          <Label variant="accent">5</Label>
        </div>
        <CheckRow status="success" name="CI build" detail="Passing — success" />
        <CheckRow status="success" name="typecheck" detail="Passing" />
        <CheckRow
          status="danger"
          name="skill-audit"
          detail="Failing"
          subDetail="2 token violations"
          showDetails
        />
      </div>

      {/* Zone 3 — Conflict callout */}
      <div style={zone}>
        <Flash variant="danger" style={{ marginBottom: "0.75rem" }}>
          This branch has conflicts that must be resolved. Resolve conflicts in{" "}
          <code style={inlineCode}>references/components.md</code>
          {" "}before merging.
        </Flash>
        <Button variant="danger" size="small">
          Resolve conflicts
        </Button>
      </div>

      {/* Zone 4 — Merge controls */}
      <div style={zone}>
        <Stack direction="vertical" gap="normal">
          <FormControl>
            <FormControl.Label>Merge method</FormControl.Label>
            <Select block>
              <Select.Option value="merge">Create a merge commit</Select.Option>
              <Select.Option value="squash">Squash and merge</Select.Option>
              <Select.Option value="rebase">Rebase and merge</Select.Option>
            </Select>
          </FormControl>

          <FormControl required>
            <FormControl.Label>Commit headline</FormControl.Label>
            <TextInput defaultValue="feat: extract skill from ds/ (#482)" block />
          </FormControl>

          <FormControl>
            <FormControl.Label>Extended description</FormControl.Label>
            <Textarea
              rows={4}
              placeholder="Optional extended description…"
              resize="vertical"
              block
            />
          </FormControl>

          <FormControl layout="horizontal">
            <Checkbox id="delete-branch" defaultChecked />
            <FormControl.Label>Delete branch after merge</FormControl.Label>
            <FormControl.Caption>
              The <code style={inlineCode}>feat/skill-extraction</code> branch will be deleted once merged.
            </FormControl.Caption>
          </FormControl>
        </Stack>

        {/* Footer */}
        <div
          style={{
            borderTop: "var(--borderWidth-thin, 1px) solid var(--borderColor-muted, #d0d7de)",
            paddingTop: "1rem",
            marginTop: "1rem",
          }}
        >
          <Stack direction="horizontal" gap="condensed" justify="end">
            <Button variant="invisible">Cancel</Button>
            <Button variant="primary" disabled={hasConflicts}>
              Merge pull request
            </Button>
          </Stack>
        </div>
      </div>
    </div>
  )
}

function ReviewRow({
  handle,
  pillLabel,
  pillVariant,
  last = false,
}: {
  handle: string
  pillLabel: string
  pillVariant: "accent" | "done"
  last?: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: last ? 0 : "0.5rem",
      }}
    >
      <span style={{ color: "var(--fgColor-success, #1a7f37)", display: "flex", flexShrink: 0 }}>
        <CheckCircleFillIcon size={16} />
      </span>
      <Text style={{ flex: 1 }}>{handle}</Text>
      <Text size="small" style={{ color: "var(--fgColor-muted, #57606a)" }}>
        approved these changes
      </Text>
      <Label variant={pillVariant}>{pillLabel}</Label>
      <IconButton
        icon={SyncIcon}
        aria-label="Re-request review"
        variant="invisible"
        size="small"
      />
    </div>
  )
}

function CheckRow({
  status,
  name,
  detail,
  subDetail,
  showDetails = false,
}: {
  status: "success" | "danger"
  name: string
  detail: string
  subDetail?: string
  showDetails?: boolean
}) {
  const isSuccess = status === "success"
  const Icon = isSuccess ? CheckCircleFillIcon : XCircleFillIcon

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.25rem 0" }}>
      <span
        style={{
          color: isSuccess
            ? "var(--fgColor-success, #1a7f37)"
            : "var(--fgColor-danger, #d1242f)",
          display: "flex",
          flexShrink: 0,
          paddingTop: "2px",
        }}
      >
        <Icon size={16} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text>{name}</Text>{" "}
        <Text
          style={{
            color: isSuccess
              ? "var(--fgColor-default, #1f2328)"
              : "var(--fgColor-danger, #d1242f)",
          }}
        >
          {detail}
        </Text>
        {subDetail && (
          <Text
            as="span"
            size="small"
            style={{ color: "var(--fgColor-muted, #57606a)", display: "block" }}
          >
            {subDetail}
          </Text>
        )}
      </div>
      {showDetails && (
        <Button variant="invisible" size="small">
          Details
        </Button>
      )}
    </div>
  )
}
