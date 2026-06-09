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
EXAMPLES_FROM=""
FOUNDATIONS_FROM=""

usage() {
  echo "usage: scaffold.sh <slug> --components <n1,n2,...> --ds-package <name> [--ds-version <v>] [--scope project|user] [--examples-from <dir>] [--foundations-from <dir>]" >&2
  exit 2
}

[[ $# -lt 1 || "$1" == --* ]] && usage
SLUG="$1"; shift

while [[ $# -gt 0 ]]; do
  case "$1" in
    --components)    COMPONENTS="${2:-}"; shift 2 ;;
    --ds-package)    DS_PACKAGE="${2:-}"; shift 2 ;;
    --ds-version)    DS_VERSION="${2:-}"; shift 2 ;;
    --scope)         SCOPE="${2:-}"; shift 2 ;;
    --examples-from) EXAMPLES_FROM="${2:-}"; shift 2 ;;
    --foundations-from) FOUNDATIONS_FROM="${2:-}"; shift 2 ;;
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

# STEP 3b — Composition exemplars (additive, fallback to no-op when empty).
# When --examples-from <dir> is passed AND that dir contains *.md files,
# copy each to references/examples/<basename>.md and generate index.md.
# When the flag is absent or the dir is empty, omit references/examples/
# entirely — per references/persist.md, empty examples/ is the correct
# empty state, not an empty index pointing at nothing.
EXAMPLE_COUNT=0
if [[ -n "$EXAMPLES_FROM" && -d "$EXAMPLES_FROM" ]]; then
  shopt -s nullglob
  EX_FILES=("$EXAMPLES_FROM"/*.md)
  shopt -u nullglob
  if [[ ${#EX_FILES[@]} -gt 0 ]]; then
    mkdir -p "${PERSIST_PATH}/references/examples"
    INDEX_LINES=()
    INDEX_LINES+=("# Examples")
    INDEX_LINES+=("")
    INDEX_LINES+=("Composition exemplars lifted from the reference project. Each file is verbatim; see references/reference-project.md for the lift recipe.")
    INDEX_LINES+=("")
    for src in "${EX_FILES[@]}"; do
      base="$(basename "$src")"
      dest="${PERSIST_PATH}/references/examples/${base}"
      cp "$src" "$dest"
      WRITTEN+=("$dest")
      EXAMPLE_COUNT=$((EXAMPLE_COUNT + 1))
      # Extract the first bullet under "## What to copy" as the index summary.
      # Bullets continuing on indented lines are truncated to their first line
      # by design — the index is a one-liner per file.
      summary="$(awk '
        /^## What to copy[[:space:]]*$/ { in_section=1; next }
        in_section && /^## / { in_section=0 }
        in_section && /^-[[:space:]]/ {
          sub(/^-[[:space:]]+/, "")
          print
          exit
        }
      ' "$src")"
      if [[ -z "$summary" ]]; then
        summary="[VERIFY] no \"What to copy\" first bullet found in ${base}"
      fi
      slug="${base%.md}"
      INDEX_LINES+=("- [${slug}](./${base}) — ${summary}")
    done
    INDEX_PATH="${PERSIST_PATH}/references/examples/index.md"
    printf '%s\n' "${INDEX_LINES[@]}" > "$INDEX_PATH"
    WRITTEN+=("$INDEX_PATH")
  fi
fi

# STEP 3c — Foundation pages (additive, fallback to no-op when empty).
# When --foundations-from <dir> is passed AND that dir contains *.md files,
# copy each to references/foundations/<canonical>.md (applying the slug map
# below) and generate index.md. When the flag is absent or the dir is empty,
# omit references/foundations/ entirely — per references/persist.md, empty
# foundations/ is the correct empty state, not an empty index pointing at
# nothing.
#
# Slug→canonical-name map. The agent writes scratch files named after the
# URL's last path segment (e.g. color-usage.md, layout.md). The scaffolder
# applies this map to derive the canonical destination filename so the
# produced skill's foundation files have stable, predictable basenames
# regardless of which DS's docs nav surfaced them. Unmapped segments fall
# through to the raw segment as filename. See references/persist.md
# (Foundations split rule) for the prose contract this case mirrors.
canonical_foundation_name() {
  local stem="$1"
  case "$stem" in
    color|color-usage|colors)              echo "colors" ;;
    typography|type)                       echo "typography" ;;
    spacing|layout|space)                  echo "spacing-layout" ;;
    icons|iconography)                     echo "icons" ;;
    responsive|breakpoints)                echo "responsive" ;;
    dark-mode|theming|theme|color-modes)   echo "theming" ;;
    *)                                     echo "$stem" ;;
  esac
}

FOUNDATION_COUNT=0
if [[ -n "$FOUNDATIONS_FROM" && -d "$FOUNDATIONS_FROM" ]]; then
  shopt -s nullglob
  FD_FILES=("$FOUNDATIONS_FROM"/*.md)
  shopt -u nullglob
  if [[ ${#FD_FILES[@]} -gt 0 ]]; then
    mkdir -p "${PERSIST_PATH}/references/foundations"
    FD_INDEX_LINES=()
    FD_INDEX_LINES+=("# Foundations")
    FD_INDEX_LINES+=("")
    FD_INDEX_LINES+=("Foundation pages extracted from the DS docs site. One file per accepted+crawled URL; see references/foundation-extraction.md for the per-URL iteration contract.")
    FD_INDEX_LINES+=("")
    for src in "${FD_FILES[@]}"; do
      base="$(basename "$src" .md)"
      canonical="$(canonical_foundation_name "$base")"
      dest_base="${canonical}.md"
      dest="${PERSIST_PATH}/references/foundations/${dest_base}"
      cp "$src" "$dest"
      WRITTEN+=("$dest")
      FOUNDATION_COUNT=$((FOUNDATION_COUNT + 1))
      # Extract the first bullet under "## What this covers" as the index
      # summary. Mirrors the examples flow above. Bullets continuing on
      # indented lines are truncated to their first line by design — the
      # index is a one-liner per file.
      summary="$(awk '
        /^## What this covers[[:space:]]*$/ { in_section=1; next }
        in_section && /^## / { in_section=0 }
        in_section && /^-[[:space:]]/ {
          sub(/^-[[:space:]]+/, "")
          print
          exit
        }
      ' "$src")"
      if [[ -z "$summary" ]]; then
        summary="[VERIFY] no \"What this covers\" first bullet found in ${dest_base}"
      fi
      FD_INDEX_LINES+=("- [${canonical}](./${dest_base}) — ${summary}")
    done
    FD_INDEX_PATH="${PERSIST_PATH}/references/foundations/index.md"
    printf '%s\n' "${FD_INDEX_LINES[@]}" > "$FD_INDEX_PATH"
    WRITTEN+=("$FD_INDEX_PATH")
  fi
fi

# STEP 4 — NO STAMP. Plain Markdown only, per locked Q6.

echo "SCAFFOLD_RESULT=OK"
echo "PERSIST_PATH=${PERSIST_PATH}"
echo "EXAMPLES_WRITTEN=${EXAMPLE_COUNT}"
echo "FOUNDATIONS_WRITTEN=${FOUNDATION_COUNT}"
echo "FILES_WRITTEN=${#WRITTEN[@]}"
for p in "${WRITTEN[@]}"; do
  echo "- ${p}"
done
exit 0
