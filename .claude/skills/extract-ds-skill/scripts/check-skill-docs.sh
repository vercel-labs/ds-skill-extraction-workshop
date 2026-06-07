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
  #    `grep -rcE` exits 1 when no file in the tree matches; under `set -o
  #    pipefail` that aborts the whole script. Suppress with `|| true` so the
  #    informational check never silently kills the post-emit run.
  VERIFY_COUNT=$( (grep -rcE '\[VERIFY\]' "$SKILL_PATH" 2>/dev/null || true) | awk -F: '{s+=$2} END {print s+0}')
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

  # 8. WIRING_NOT_SYNTHESIZED (produced-skill mode only). The produced SKILL.md
  #    Setup section MUST cite the source of any JSX wrapper or CSS-root snippet
  #    it embeds — a reference-project file path OR a docs URL. Uncited wrappers
  #    indicate the wiring was synthesized from memory rather than lifted, which
  #    is the failure mode references/reference-project.md is designed to
  #    prevent. The meta-skill itself is exempt (its worked examples ARE the
  #    synthesis source).
  #
  #    Detection. Walk the Setup section (heading whose title is exactly
  #    "Setup", at any depth, until the next sibling-or-higher heading). Inside
  #    the section, code-fence content is scanned for:
  #      - JSX wrappers: `<XxxProvider`, `<BaseStyles`, `<CssBaseline`,
  #        `<MantineProvider`, `<AppRouterCacheProvider`, `<InitColorSchemeScript`,
  #        `<ThemeProvider`, `<ChakraProvider`, `<RadixProvider`, `<Toaster`.
  #      - CSS-root snippets: `:root`, `color-scheme:`, `data-color-mode`,
  #        `html, body`, `html,body`.
  #    A citation is satisfied by ANY of these lines anywhere in the section:
  #      - `Source:` followed by `path/with/.ext` (the reference-project file-
  #        path form documented in references/reference-project.md), OR
  #      - an http(s) URL (`https?://...`) — the docs-URL fallback.
  #    Missing citation → FAIL with `<file>:<line>` of the first detected
  #    wrapper/snippet line, pointing at the citation requirement.
  WIRING_RESULT="$(awk -v skill_md="$SKILL_MD" '
    BEGIN {
      in_setup = 0
      setup_depth = 0
      in_fence = 0
      wrapper_file = ""
      wrapper_line = 0
      wrapper_text = ""
      cited = 0
    }
    function heading_depth(line,    n) {
      n = 0
      while (substr(line, n+1, 1) == "#") n++
      return n
    }
    function is_setup_heading(line,    title) {
      if (line !~ /^#+[[:space:]]+/) return 0
      title = line
      sub(/^#+[[:space:]]+/, "", title)
      sub(/[[:space:]]+$/, "", title)
      return (title == "Setup")
    }
    # Toggle fence state regardless of section — but only the in_setup
    # transitions matter for detection.
    /^```/ {
      in_fence = !in_fence
      next
    }
    # Heading handling — only outside fences.
    !in_fence && /^#+[[:space:]]+/ {
      depth = heading_depth($0)
      if (in_setup && depth <= setup_depth) {
        in_setup = 0
        setup_depth = 0
      }
      if (!in_setup && is_setup_heading($0)) {
        in_setup = 1
        setup_depth = depth
      }
      next
    }
    # Only scan inside the Setup section.
    in_setup {
      # Citation detection — scan the whole section, in or out of fence.
      # "Source:" followed by a file-path-like token (must contain "/" and
      # a recognizable extension).
      if ($0 ~ /Source:.*\/[-A-Za-z0-9._\/]+\.(tsx|jsx|ts|js|css|scss|sass|html|md|mjs|cjs)/) {
        cited = 1
      }
      if ($0 ~ /https?:\/\//) {
        cited = 1
      }
      # Wrapper/snippet detection — only first occurrence wins (for FAIL message).
      # POSIX awk has no `\b`; use an explicit boundary character class instead.
      if (wrapper_file == "") {
        leak = ""
        if (match($0, /<(ThemeProvider|BaseStyles|CssBaseline|MantineProvider|AppRouterCacheProvider|InitColorSchemeScript|ChakraProvider|RadixProvider|Toaster)([^A-Za-z0-9]|$)/)) {
          # Trim the trailing boundary char so the FAIL message names the wrapper, not the punctuation.
          leak = substr($0, RSTART, RLENGTH)
          sub(/[^A-Za-z0-9]$/, "", leak)
        } else if (match($0, /<[A-Z][A-Za-z0-9]*Provider([^A-Za-z0-9]|$)/)) {
          leak = substr($0, RSTART, RLENGTH)
          sub(/[^A-Za-z0-9]$/, "", leak)
        } else if ($0 ~ /:root[[:space:]]*\{/) {
          leak = ":root"
        } else if ($0 ~ /color-scheme[[:space:]]*:/) {
          leak = "color-scheme"
        } else if ($0 ~ /data-color-mode/) {
          leak = "data-color-mode"
        } else if ($0 ~ /^[[:space:]]*html[[:space:]]*,[[:space:]]*body[[:space:]]*\{/) {
          leak = "html, body"
        }
        if (leak != "") {
          wrapper_file = skill_md
          wrapper_line = NR
          wrapper_text = leak
        }
      }
    }
    END {
      if (wrapper_file == "") {
        print "NOOP"
      } else if (cited) {
        print "PASS"
      } else {
        printf "FAIL %s:%d:%s\n", wrapper_file, wrapper_line, wrapper_text
      }
    }
  ' "$SKILL_MD")"

  case "$WIRING_RESULT" in
    NOOP|PASS)
      echo "WIRING_NOT_SYNTHESIZED=PASS"
      ;;
    FAIL*)
      payload="${WIRING_RESULT#FAIL }"
      file_part="${payload%%:*}"
      rest="${payload#*:}"
      line_part="${rest%%:*}"
      text_part="${rest#*:}"
      echo "WIRING_NOT_SYNTHESIZED=FAIL"
      echo "  uncited wiring in Setup section at $file_part:$line_part — '$text_part' — JSX wrappers and CSS-root snippets MUST cite either a reference-project file path (Source: <reference-project> @ <file>:line) OR a docs URL; see references/reference-project.md (Output contract + Fallback)"
      FAILED=1
      ;;
  esac

  # 9. EXAMPLES_INDEX (produced-skill mode only). When references/examples/*.md
  #    exists, references/examples/index.md must also exist AND reference every
  #    sibling example file by its basename (sans .md). Per
  #    references/reference-project.md (Composition exemplar extraction), the
  #    index is co-required with per-file exemplars — a partial scaffold that
  #    writes example files without the index is the failure mode this check
  #    surfaces immediately. Empty references/examples/ (no per-file *.md and
  #    no index.md) is a valid empty state and the check passes silently.
  EXAMPLES_DIR="$SKILL_PATH/references/examples"
  EXAMPLES_INDEX="$EXAMPLES_DIR/index.md"
  if [[ -d "$EXAMPLES_DIR" ]]; then
    EX_FILES=()
    while IFS= read -r f; do
      [[ -n "$f" ]] && EX_FILES+=("$f")
    done < <(find "$EXAMPLES_DIR" -type f -name '*.md' -not -name 'index.md' 2>/dev/null | sort)

    if [[ ${#EX_FILES[@]} -eq 0 ]]; then
      # Empty examples/ dir — valid empty state. Index presence is not required.
      echo "EXAMPLES_INDEX=PASS"
    elif [[ ! -f "$EXAMPLES_INDEX" ]]; then
      echo "EXAMPLES_INDEX=FAIL"
      echo "  references/examples/ ships ${#EX_FILES[@]} example file(s) but references/examples/index.md is missing — per references/persist.md (Examples split rule), the index is co-required with per-file exemplars"
      FAILED=1
    else
      MISSING_FROM_INDEX=()
      for ex in "${EX_FILES[@]}"; do
        basename_no_ext="$(basename "$ex" .md)"
        # Index must reference each basename by name. Accept either the markdown-
        # link form `[<basename>](./<basename>.md)` or a bare mention of the
        # filename — the scaffolder writes the link form, but a hand-edited
        # index that lists `<basename>.md` plainly is also acceptable.
        if ! grep -qE "(\[${basename_no_ext}\]\(\.?/?${basename_no_ext}\.md\)|${basename_no_ext}\.md)" "$EXAMPLES_INDEX"; then
          MISSING_FROM_INDEX+=("${basename_no_ext}")
        fi
      done
      if [[ ${#MISSING_FROM_INDEX[@]} -eq 0 ]]; then
        echo "EXAMPLES_INDEX=PASS"
      else
        echo "EXAMPLES_INDEX=FAIL"
        echo "  references/examples/index.md does not reference: ${MISSING_FROM_INDEX[*]} — per references/persist.md (Examples split rule), the index must list every sibling example file by basename"
        FAILED=1
      fi
    fi
  else
    # No examples/ dir at all — valid empty state for reference-project-less skills.
    echo "EXAMPLES_INDEX=PASS"
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
        if (match($0, /\/Users\/[-A-Za-z0-9._\/]+/)) {
          leak = substr($0, RSTART, RLENGTH)
        } else if (match($0, /\/home\/[-A-Za-z0-9._\/]+/)) {
          leak = substr($0, RSTART, RLENGTH)
        } else if (match($0, /~\/[-A-Za-z0-9._\/]+/)) {
          # ~/.claude/skills/<slug>/ is allowed (canonical user-scope path
          # already documented in persist.md and SKILL.md). Anything else
          # under ~/ that names a host-specific dir is a leak.
          candidate = substr($0, RSTART, RLENGTH)
          if (candidate !~ /^~\/\.claude\/skills\//) leak = candidate
        } else if (match($0, /ds-skill-extraction-workshop\/[-A-Za-z0-9._\/]*/)) {
          leak = substr($0, RSTART, RLENGTH)
        } else if (match($0, /github\.com\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+/)) {
          leak = substr($0, RSTART, RLENGTH)
        } else if (match($0, /@(primer|shadcn|mui|geist|chakra-ui|radix-ui)\/[A-Za-z0-9._-]+/)) {
          leak = substr($0, RSTART, RLENGTH)
        } else if (match($0, /primer\.style\/[-A-Za-z0-9._\/#?=&]*/)) {
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

  # 9. WORKED_EXAMPLE_DS_BIAS (meta-skill self-mode only). Worked examples in
  #    references/foundation-extraction.md (and references/reference-project.md
  #    when present) must span ≥2 distinct DSs — distinct hostnames in the
  #    cited URLs are the proxy. Single-DS bias trips the check because the
  #    meta-skill is DS-agnostic; if the only examples come from one DS, a
  #    reader infers the skill is hardwired to that DS. The fail message links
  #    to the inherited claim note.
  BIAS_FILES=()
  [[ -f "$SKILL_PATH/references/foundation-extraction.md" ]] \
    && BIAS_FILES+=("$SKILL_PATH/references/foundation-extraction.md")
  [[ -f "$SKILL_PATH/references/reference-project.md" ]] \
    && BIAS_FILES+=("$SKILL_PATH/references/reference-project.md")

  BIAS_FAILS=()
  for f in "${BIAS_FILES[@]+"${BIAS_FILES[@]}"}"; do
    [[ -z "$f" ]] && continue
    # Extract hostnames from every http(s) URL in the file. Strip protocol,
    # then everything after the first `/` or whitespace, then any `www.` prefix.
    HOSTS_RAW=$(grep -oE 'https?://[A-Za-z0-9._-]+' "$f" 2>/dev/null \
      | sed -E 's#^https?://##; s#^www\.##' \
      | sort -u)
    if [[ -z "$HOSTS_RAW" ]]; then
      # No URLs in this file — nothing to assess. A file with no worked-
      # example URLs cannot trip single-DS bias.
      continue
    fi
    HOST_COUNT=$(printf '%s\n' "$HOSTS_RAW" | grep -c .)
    if [[ "$HOST_COUNT" -lt 2 ]]; then
      BIAS_FAILS+=("$f:$HOST_COUNT:$(printf '%s' "$HOSTS_RAW" | tr '\n' ',' | sed 's/,$//')")
    fi
  done

  if [[ ${#BIAS_FAILS[@]} -eq 0 ]]; then
    echo "WORKED_EXAMPLE_DS_BIAS=PASS"
  else
    echo "WORKED_EXAMPLE_DS_BIAS=FAIL"
    for entry in "${BIAS_FAILS[@]}"; do
      file_part="${entry%%:*}"
      rest="${entry#*:}"
      count_part="${rest%%:*}"
      hosts_part="${rest#*:}"
      echo "  single-DS bias in $file_part — only $count_part distinct hostname(s) cited ($hosts_part) — see [[Meta-Skill Must Be DS-Agnostic — No Embedded Primer Examples]]; worked examples must span ≥2 distinct DSs (≥2 distinct hostnames)"
    done
    FAILED=1
  fi
fi

if [[ $FAILED -eq 0 ]]; then echo "CHECK_RESULT=PASS"; exit 0
else echo "CHECK_RESULT=FAIL"; exit 1; fi
