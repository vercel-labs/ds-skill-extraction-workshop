#!/usr/bin/env bash
#
# Open an interactive Claude Code session in a worktree, seeded with the
# body of a GitHub issue plus the do-work workflow prompt.
#
# Eliminates the two-step:
#   cd /path/to/worktree
#   claude  (then paste prompt body)
#
# Inspired by the HITL/AFK wrappers in this folder, but deliberately
# simpler — no Docker sandbox, no AI-Gateway auth re-injection. Uses your
# logged-in `claude` and `gh` on the host. Use the sandbox variants
# (run-claude-hitl.sh, run-claude-afk{,-signed}.sh) when isolation
# matters; use this when you just want to fire a session at an issue.
#
# The prompt is composed from ralph/from-issue-prompt.md (the template,
# with {{NUMBER}}, {{TITLE}}, {{BODY}} placeholders) + the issue body
# fetched live from GitHub. The template references the do-work skill,
# which carries the validate-before-commit contract (pnpm verify =
# typecheck + build).
#
# Usage:
#   ./ralph/run-claude-from-issue.sh <issue-number-or-url>
#   ./ralph/run-claude-from-issue.sh 22
#   ./ralph/run-claude-from-issue.sh https://github.com/owner/repo/issues/22
#
# Env knobs (all optional):
#   WORKTREE   Directory to cd into before launching claude.
#              Default: the worktree this script lives in (resolved from $0),
#              so invoking with an absolute path Just Works regardless of $PWD.
#   GH_REPO    Override the repo for `gh issue view` (default: gh infers from cwd).
#   PERM_MODE  --permission-mode value passed to claude. Default: acceptEdits
#              (auto-approve file edits; still prompts on Bash etc.). Set to
#              "default" if you want to babysit every tool call, or "plan" to
#              dry-run without writing.
#   TEMPLATE   Path to the prompt template. Default: <script-dir>/from-issue-prompt.md.
#
# Exit codes: forwards whatever `claude` returns; non-zero on fetch failure.

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <issue-number-or-url>" >&2
  echo "       $0 22" >&2
  echo "       $0 https://github.com/owner/repo/issues/22" >&2
  exit 64  # EX_USAGE
fi

ISSUE="$1"
PERM_MODE="${PERM_MODE:-acceptEdits}"

# Resolve the worktree this script ships inside, so the script works no
# matter where the caller invokes it from. Override with WORKTREE=… if
# you want to point a different checkout at the same issue.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_WORKTREE="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKTREE="${WORKTREE:-$DEFAULT_WORKTREE}"
TEMPLATE="${TEMPLATE:-$SCRIPT_DIR/from-issue-prompt.md}"

if [[ ! -d "$WORKTREE" ]]; then
  echo "Error: WORKTREE does not exist: $WORKTREE" >&2
  exit 66  # EX_NOINPUT
fi

if [[ ! -f "$TEMPLATE" ]]; then
  echo "Error: TEMPLATE not found: $TEMPLATE" >&2
  exit 66  # EX_NOINPUT
fi

for cmd in gh claude jq; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: '$cmd' not on PATH." >&2
    exit 69  # EX_UNAVAILABLE
  fi
done

# Build `gh issue view` args. gh accepts a bare number OR a full URL as
# the first positional, and `--repo` is only needed when ambiguous.
GH_VIEW_ARGS=("$ISSUE" --json title,number,body)
if [[ -n "${GH_REPO:-}" ]]; then
  GH_VIEW_ARGS+=(--repo "$GH_REPO")
fi

if ! ISSUE_JSON="$(gh issue view "${GH_VIEW_ARGS[@]}" 2>&1)"; then
  echo "Error: failed to fetch issue '$ISSUE':" >&2
  echo "$ISSUE_JSON" >&2
  exit 1
fi

NUMBER="$(jq -r '.number' <<<"$ISSUE_JSON")"
TITLE="$(jq -r '.title' <<<"$ISSUE_JSON")"
BODY="$(jq -r '.body' <<<"$ISSUE_JSON")"

if [[ -z "$NUMBER" || "$NUMBER" == "null" || -z "$BODY" || "$BODY" == "null" ]]; then
  echo "Error: issue $ISSUE has empty/missing number or body." >&2
  exit 1
fi

# Compose: read template, swap placeholders via bash parameter expansion.
# ${var//pattern/replacement} does a global string replacement and handles
# multiline BODY safely without sed quoting headaches.
TEMPLATE_CONTENT="$(<"$TEMPLATE")"
PROMPT="${TEMPLATE_CONTENT//\{\{NUMBER\}\}/$NUMBER}"
PROMPT="${PROMPT//\{\{TITLE\}\}/$TITLE}"
PROMPT="${PROMPT//\{\{BODY\}\}/$BODY}"

cd "$WORKTREE"
echo "→ worktree:    $WORKTREE"
echo "→ template:    $TEMPLATE"
echo "→ issue:       #$NUMBER — $TITLE"
echo "→ prompt size: $(wc -c <<<"$PROMPT" | tr -d ' ') chars"
echo "→ perm mode:   $PERM_MODE"
echo
exec claude --permission-mode "$PERM_MODE" "$PROMPT"
