#!/usr/bin/env bash
# scripts/scaffold.sh — Phase 3 writer. Slug-collision check FIRST (exit 75 = ASK).
# Creates the skill tree as stubs; calling agent fills content. NO stamp per v1 spec.
# See references/persist.md.

set -euo pipefail

SLUG=""
COMPONENTS=""
DS_PACKAGE=""
DS_VERSION=""
SCOPE="project"

usage() {
  echo "usage: scaffold.sh <slug> --components <n1,n2,...> --ds-package <name> [--ds-version <v>] [--scope project|user]" >&2
  exit 2
}

[[ $# -lt 1 || "$1" == --* ]] && usage
SLUG="$1"; shift

while [[ $# -gt 0 ]]; do
  case "$1" in
    --components) COMPONENTS="${2:-}"; shift 2 ;;
    --ds-package) DS_PACKAGE="${2:-}"; shift 2 ;;
    --ds-version) DS_VERSION="${2:-}"; shift 2 ;;
    --scope)      SCOPE="${2:-}"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; usage ;;
  esac
done

[[ -z "$COMPONENTS" ]] && { echo "missing --components" >&2; usage; }
[[ -z "$DS_PACKAGE" ]] && { echo "missing --ds-package" >&2; usage; }
[[ "$SCOPE" != "project" && "$SCOPE" != "user" ]] && { echo "--scope must be project|user" >&2; exit 2; }

if [[ "$SCOPE" == "user" ]]; then
  PERSIST_PATH="${HOME}/.claude/skills/${SLUG}"
else
  PERSIST_PATH="$(pwd)/.claude/skills/${SLUG}"
fi

# STEP 1 — Slug-collision check FIRST. Never silently suffix.
if [[ -e "$PERSIST_PATH" ]]; then
  echo "SLUG_COLLISION=${PERSIST_PATH}"
  exit 75
fi

IFS=',' read -r -a COMP_ARR <<< "$COMPONENTS"
COMP_COUNT="${#COMP_ARR[@]}"
[[ "$COMP_COUNT" -lt 1 ]] && { echo "--components must list at least one name" >&2; exit 2; }

if [[ -n "$DS_VERSION" ]]; then
  VERSION_LINE="- version: \`${DS_VERSION}\`"
else
  VERSION_LINE="- version: [VERIFY] not pinned"
fi

# STEP 2 — Create directory tree.
mkdir -p "${PERSIST_PATH}/references"
WRITTEN=()

write_file() {
  local path="$1"; local body="$2"
  mkdir -p "$(dirname "$path")"
  printf '%s\n' "$body" > "$path"
  WRITTEN+=("$path")
}

# STEP 3 — Write template-stub content. Calling agent fills bodies per skill-template.md.

write_file "${PERSIST_PATH}/SKILL.md" "<!-- scaffold-stub: replace with extracted content per references/skill-template.md -->
---
name: ${SLUG}
description: [VERIFY] one-paragraph dispatch description for the ${SLUG} design-system skill. Replace before shipping.
---

<!-- Calling agent: fill Mission, Scope, Components, Tokens, Anti-patterns, Routing table,
     and the STOP block per references/skill-template.md. SKILL.md alone is insufficient. -->
"

write_file "${PERSIST_PATH}/AGENTS.md" "<!-- scaffold-stub: replace with extracted content per references/skill-template.md -->
# AGENTS — ${SLUG}

Cross-agent stub. Any agent touching this skill reads SKILL.md first, then the per-domain
files in references/. Letter-to-future-agents + Common Agent Failure Modes go here.
"

if [[ "$COMP_COUNT" -ge 10 ]]; then
  mkdir -p "${PERSIST_PATH}/references/components"
  for name in "${COMP_ARR[@]}"; do
    write_file "${PERSIST_PATH}/references/components/${name}.md" "<!-- scaffold-stub: replace with extracted content per references/skill-template.md -->
# ${name}

- package: \`${DS_PACKAGE}\`
${VERSION_LINE}

## Best Practices

- [VERIFY] No rules extracted yet
"
  done
else
  BODY="<!-- scaffold-stub: replace with extracted content per references/skill-template.md -->
# Components — ${SLUG}

- package: \`${DS_PACKAGE}\`
${VERSION_LINE}
"
  for name in "${COMP_ARR[@]}"; do
    BODY+="

## ${name}

### Best Practices

- [VERIFY] No rules extracted yet
"
  done
  write_file "${PERSIST_PATH}/references/components.md" "$BODY"
fi

write_file "${PERSIST_PATH}/references/tokens.md" "<!-- scaffold-stub: replace with extracted content per references/skill-template.md -->
# Tokens — ${SLUG}

## Color

## Space

## Type
"

write_file "${PERSIST_PATH}/references/anti-patterns.md" "<!-- scaffold-stub: replace with extracted content per references/skill-template.md -->
# Anti-patterns — ${SLUG}

| Bad | Good | Why |
|-----|------|-----|
"

# STEP 4 — NO STAMP. Plain Markdown only, per locked Q6.

echo "SCAFFOLD_RESULT=OK"
echo "PERSIST_PATH=${PERSIST_PATH}"
echo "FILES_WRITTEN=${#WRITTEN[@]}"
for p in "${WRITTEN[@]}"; do
  echo "- ${p}"
done
exit 0
