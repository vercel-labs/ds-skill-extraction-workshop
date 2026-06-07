#!/usr/bin/env bash
# scripts/check-skill-docs.sh — Phase 3 post-emit consistency check. Runs after
# scaffold.sh + content fill. Assertions: routing resolves, components covered,
# slugs resolve (component/* in components dir, token/* as `### token/<slug>`
# subsections in token files, anything else in anti-patterns.md), scope
# guardrail present. [VERIFY] markers and foundation-rule tallies reported
# informationally. See SKILL.md reflexive audit section.
#
# Self-vs-produced split. The same script runs against both the meta-skill
# (`.claude/skills/extract-ds-skill/`) and any produced DS skill the meta-skill
# emits. Auto-detect picks the mode by basename: target dir named
# `extract-ds-skill` => meta-skill self-mode; anything else => produced-skill
# mode. Meta-mode runs the self-checks below (NO_HARDCODED_PATHS, etc.) which
# only make sense against the meta-skill's own files. Produced-mode runs the
# existing post-emit consistency checks against the produced skill.

set -euo pipefail

[[ $# -ge 1 ]] || { echo "usage: check-skill-docs.sh <skill-path>" >&2; exit 2; }
SKILL_PATH="${1%/}"
SKILL_MD="$SKILL_PATH/SKILL.md"
[[ -d "$SKILL_PATH" ]] || { echo "error: skill path missing: $SKILL_PATH" >&2; exit 2; }
[[ -f "$SKILL_MD" ]]   || { echo "error: SKILL.md missing: $SKILL_MD"   >&2; exit 2; }

# Mode auto-detect: basename `extract-ds-skill` => meta-skill self-mode.
SKILL_BASENAME="$(basename "$SKILL_PATH")"
if [[ "$SKILL_BASENAME" == "extract-ds-skill" ]]; then
  MODE="meta"
else
  MODE="produced"
fi
echo "MODE=$MODE"

COMPONENT_DIR="$SKILL_PATH/references/components"
COMPONENTS_MD="$SKILL_PATH/references/components.md"
ANTI="$SKILL_PATH/references/anti-patterns.md"
TOKENS_MD="$SKILL_PATH/references/tokens.md"
TOKENS_DIR="$SKILL_PATH/references/tokens"
FAILED=0

# Collect every file that might hold a `### token/<slug>` subsection: tokens.md
# (single-family DS) and tokens/<family>.md (multi-family DS). Either or both
# may be absent.
TOKEN_FILES=()
[[ -f "$TOKENS_MD" ]] && TOKEN_FILES+=("$TOKENS_MD")
if [[ -d "$TOKENS_DIR" ]]; then
  while IFS= read -r f; do TOKEN_FILES+=("$f"); done \
    < <(find "$TOKENS_DIR" -type f -name '*.md')
fi

# Produced-skill checks (1-7). These assert the shape of a produced DS skill
# (routing table, per-component files, token subsections, scope guardrail) and
# only make sense against a skill the meta-skill emits — they do NOT apply to
# the meta-skill itself, whose surface is the extraction recipe, not a DS
# adapter. Skip them entirely in meta-skill self-mode.
if [[ "$MODE" == "produced" ]]; then

  # 1. Routing table resolves — every file path in the second column exists.
  ROUTING_MISSING=()
  in=0
  while IFS= read -r line; do
    [[ "$line" =~ ^##[[:space:]]+When[[:space:]]+to[[:space:]]+Load[[:space:]]+References ]] && { in=1; continue; }
    [[ $in -eq 1 && "$line" =~ ^##[[:space:]] ]] && in=0
    [[ $in -eq 1 && "$line" =~ ^\| ]] || continue
    col2="$(awk -F'|' '{print $3}' <<<"$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
    [[ -z "$col2" || "$col2" =~ ^-+$ || "$col2" =~ [Ff]iles?[[:space:]]+to[[:space:]]+load ]] && continue
    while IFS= read -r p; do
      [[ -n "$p" && ! -e "$SKILL_PATH/$p" ]] && ROUTING_MISSING+=("$p")
    done < <(grep -oE '[A-Za-z0-9_./-]+\.(md|sh)' <<<"$col2" || true)
  done < "$SKILL_MD"
  if [[ ${#ROUTING_MISSING[@]} -eq 0 ]]; then echo "ROUTING_TABLE=PASS"
  else echo "ROUTING_TABLE=FAIL missing=${ROUTING_MISSING[*]}"; FAILED=1; fi

  # 2. Every cited component has a per-component file OR a section in components.md.
  CITED=()
  while IFS= read -r n; do CITED+=("$n"); done < <(
    grep -rhoE '\(\.?/?components/[A-Za-z0-9_-]+\.md\)' "$SKILL_PATH" 2>/dev/null \
      | sed 's#.*/##;s#\.md)##' | sort -u)
  COMPONENT_MISSING=()
  for n in "${CITED[@]+"${CITED[@]}"}"; do
    [[ -z "$n" ]] && continue
    [[ -f "$COMPONENT_DIR/$n.md" ]] && continue
    [[ -f "$COMPONENTS_MD" ]] && grep -qiE "^##[[:space:]]+$n([[:space:]]|$)" "$COMPONENTS_MD" && continue
    COMPONENT_MISSING+=("$n")
  done
  if [[ ${#COMPONENT_MISSING[@]} -eq 0 ]]; then echo "COMPONENT_FILES=PASS"
  else echo "COMPONENT_FILES=FAIL missing=${COMPONENT_MISSING[*]}"; FAILED=1; fi

  # 3. Universal coverage — every component file has "## Best Practices".
  BP_MISSING=()
  if [[ -d "$COMPONENT_DIR" ]]; then
    while IFS= read -r f; do
      grep -qE '^##[[:space:]]+Best[[:space:]]+Practices[[:space:]]*$' "$f" || BP_MISSING+=("$f")
    done < <(find "$COMPONENT_DIR" -type f -name '*.md')
  fi
  if [[ ${#BP_MISSING[@]} -eq 0 ]]; then echo "BEST_PRACTICES_COVERAGE=PASS"
  else echo "BEST_PRACTICES_COVERAGE=FAIL missing=${BP_MISSING[*]}"; FAILED=1; fi

  # 4. Every component/token/asset slug resolves in anti-patterns.md, inline in
  #    the component dir (component/*), or as a `### token/<slug>` subsection in
  #    any token file (token/*).
  UNRESOLVED=()
  while IFS= read -r slug; do
    [[ -z "$slug" ]] && continue
    [[ -f "$ANTI" ]] && grep -qF "$slug" "$ANTI" && continue
    [[ "${slug%%/*}" == "component" ]] && grep -rqF "$slug" "$COMPONENT_DIR" 2>/dev/null && continue
    if [[ "${slug%%/*}" == "token" && ${#TOKEN_FILES[@]} -gt 0 ]]; then
      resolved=0
      for f in "${TOKEN_FILES[@]}"; do
        grep -qE "^###[[:space:]]+${slug}([[:space:]]|$)" "$f" && { resolved=1; break; }
      done
      [[ $resolved -eq 1 ]] && continue
    fi
    UNRESOLVED+=("$slug")
  done < <(grep -rhoE '\b(component|token|asset)/[a-z0-9][a-z0-9-]*' "$SKILL_PATH" 2>/dev/null | sort -u)
  if [[ ${#UNRESOLVED[@]} -eq 0 ]]; then echo "SLUG_RESOLUTION=PASS"
  else echo "SLUG_RESOLUTION=FAIL unresolved=${UNRESOLVED[*]}"; FAILED=1; fi

  # 5. [VERIFY] markers — informational only; never fails the check.
  VERIFY_COUNT=$(grep -rcE '\[VERIFY\]' "$SKILL_PATH" 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')
  echo "VERIFY_MARKERS=$VERIFY_COUNT"
  echo "VERIFY_LOCATIONS="
  grep -rnE '\[VERIFY\]' "$SKILL_PATH" 2>/dev/null \
    | awk -F: '{print "- " $1 ":" $2}' || true

  # 6. Foundation-rule tally — informational only; counts `### token/<slug>`
  #    subsections across all token files and how many carry an inline [VERIFY]
  #    marker. A zero count is valid (the user did not pass a foundation URL).
  FOUNDATION_TOTAL=0
  FOUNDATION_VERIFY=0
  if [[ ${#TOKEN_FILES[@]} -gt 0 ]]; then
    for f in "${TOKEN_FILES[@]}"; do
      while IFS= read -r heading; do
        [[ -z "$heading" ]] && continue
        FOUNDATION_TOTAL=$((FOUNDATION_TOTAL + 1))
        # Count [VERIFY] markers between this heading and the next ### / EOF.
        awk -v h="$heading" '
          $0 ~ "^###[[:space:]]+"h"([[:space:]]|$)" { in_block=1; next }
          in_block && /^###[[:space:]]/ { in_block=0 }
          in_block && /\[VERIFY\]/ { print; exit }
        ' "$f" | grep -q . && FOUNDATION_VERIFY=$((FOUNDATION_VERIFY + 1))
      done < <(grep -oE '^###[[:space:]]+token/[a-z0-9][a-z0-9-]*' "$f" \
        | sed -E 's/^###[[:space:]]+//')
    done
  fi
  FOUNDATION_CITED=$((FOUNDATION_TOTAL - FOUNDATION_VERIFY))
  echo "FOUNDATION_RULES=$FOUNDATION_TOTAL cited=$FOUNDATION_CITED verify=$FOUNDATION_VERIFY"

  # 7. Scope guardrail present in SKILL.md (verbatim substring).
  if grep -qF "In scope: tokens, assets, component descriptions, component APIs." "$SKILL_MD"; then
    echo "SCOPE_GUARDRAIL=PASS"
  else
    echo "SCOPE_GUARDRAIL=FAIL"; FAILED=1
  fi

fi  # end produced-mode checks

# 8. NO_HARDCODED_PATHS (meta-skill self-mode only). Every filesystem path,
#    GitHub URL, or DS-specific package name in the meta-skill must live
#    INSIDE a labeled illustrative block (a heading starting with "Worked
#    example", "Example output", or "Example shape"). Prescription text uses
#    placeholders only — see references/reference-project.md (when present)
#    and the Hardcoding rule for the placeholder vocabulary.
#
#    An illustrative block opens at a heading line matching the patterns above
#    at depth N and closes at the next heading line at depth <= N. Lines
#    between are inside the block. The check walks each file with an awk
#    state machine and reports any leaks outside such a block.
if [[ "$MODE" == "meta" ]]; then
  HARDCODE_LEAKS=()
  while IFS= read -r f; do
    [[ -z "$f" ]] && continue
    while IFS= read -r leak; do
      [[ -n "$leak" ]] && HARDCODE_LEAKS+=("$leak")
    done < <(awk '
      function is_example_heading(line,    title) {
        if (line !~ /^#+[[:space:]]/) return 0
        # Strip the leading hashes + whitespace to inspect the title.
        title = line
        sub(/^#+[[:space:]]+/, "", title)
        if (title ~ /^Worked example[[:space:]:—-]/) return 1
        if (title ~ /^Example output[[:space:]:—-]/) return 1
        if (title ~ /^Example shape[[:space:]:—-]/) return 1
        return 0
      }
      function heading_depth(line,    n) {
        n = 0
        while (substr(line, n+1, 1) == "#") n++
        return n
      }
      # Track fenced-code blocks so a `### ...` line inside a fence is not
      # mistaken for a structural heading. Toggling on a bare ``` line is
      # sufficient — markdown allows ```lang fences but the closing fence is
      # always a bare ```. Lines inside a fence inherit the surrounding
      # in_block state, which is what we want (a fence inside a worked
      # example block is still "in_block"; a fence outside is "outside").
      /^```/ {
        in_fence = !in_fence
        # In-fence content inherits the surrounding in_block flag for the
        # leak scan, but we never re-evaluate headings inside a fence.
        if (in_block) next
        # Outside an illustrative block, fenced content is still scanned
        # (so e.g. a ``` block in prescription text that names @primer/foo
        # leaks the same way bare prose does).
        next
      }
      in_fence {
        if (in_block) next
        # Fenced content outside an example block — fall through to the
        # leak-scan body below.
      }
      !in_fence && /^#+[[:space:]]/ {
        depth = heading_depth($0)
        if (in_block && depth <= block_depth) {
          in_block = 0
          block_depth = 0
        }
        if (!in_block && is_example_heading($0)) {
          in_block = 1
          block_depth = depth
        }
        next
      }
      {
        if (in_block) next
        leak = ""
        # Filesystem paths (any /Users/, /home/, ~/, workshop-repo).
        if (match($0, /\/Users\/[A-Za-z0-9._/-]+/)) {
          leak = substr($0, RSTART, RLENGTH)
        } else if (match($0, /\/home\/[A-Za-z0-9._/-]+/)) {
          leak = substr($0, RSTART, RLENGTH)
        } else if (match($0, /~\/[A-Za-z0-9._/-]+/)) {
          # ~/.claude/skills/<slug>/ is allowed (canonical user-scope path
          # already documented in persist.md and SKILL.md). Anything else
          # under ~/ that names a host-specific dir is a leak.
          candidate = substr($0, RSTART, RLENGTH)
          if (candidate !~ /^~\/\.claude\/skills\//) leak = candidate
        } else if (match($0, /ds-skill-extraction-workshop\/[A-Za-z0-9._/-]*/)) {
          leak = substr($0, RSTART, RLENGTH)
        } else if (match($0, /github\.com\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+/)) {
          leak = substr($0, RSTART, RLENGTH)
        } else if (match($0, /@(primer|shadcn|mui|geist|chakra-ui|radix-ui)\/[A-Za-z0-9._-]+/)) {
          leak = substr($0, RSTART, RLENGTH)
        } else if (match($0, /primer\.style\/[A-Za-z0-9._/#?=&-]*/)) {
          leak = substr($0, RSTART, RLENGTH)
        }
        if (leak != "") printf "%s:%d:%s\n", FILENAME, NR, leak
      }
    ' "$f")
  done < <(find "$SKILL_PATH" -type f -name '*.md' -not -path "$SKILL_PATH/scripts/tests/*")

  if [[ ${#HARDCODE_LEAKS[@]} -eq 0 ]]; then
    echo "NO_HARDCODED_PATHS=PASS"
  else
    echo "NO_HARDCODED_PATHS=FAIL"
    for entry in "${HARDCODE_LEAKS[@]}"; do
      # entry is FILE:LINE:LEAK; reformat for the failure message.
      file_part="${entry%%:*}"
      rest="${entry#*:}"
      line_part="${rest%%:*}"
      leak_part="${rest#*:}"
      echo "  hardcoded path/URL outside illustrative block at $file_part:$line_part — '$leak_part' — move into a '### Example output —' / '### Worked example —' block or replace with a placeholder per the Hardcoding rule"
    done
    FAILED=1
  fi
fi

if [[ $FAILED -eq 0 ]]; then echo "CHECK_RESULT=PASS"; exit 0
else echo "CHECK_RESULT=FAIL"; exit 1; fi
