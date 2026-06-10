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

usage() {
  echo "usage: check-skill-docs.sh <skill-path> [--ds-package-root <path>]" >&2
  exit 2
}

DS_PACKAGE_ROOT=""
ARGS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --ds-package-root)   [[ -n "${2:-}" ]] || usage; DS_PACKAGE_ROOT="$2"; shift 2 ;;
    --ds-package-root=*) DS_PACKAGE_ROOT="${1#*=}"; shift ;;
    -h|--help)           usage ;;
    *)                   ARGS+=("$1"); shift ;;
  esac
done
[[ ${#ARGS[@]} -ge 1 ]] || usage
SKILL_PATH="${ARGS[0]%/}"
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
# (single-family DS), tokens/<family>.md (multi-family DS), and any
# foundations/<page>.md (one per accepted+crawled foundation URL). Either or
# all may be absent. The slug namespace stays `token/<slug>`; only the file
# location expands when foundation extraction is in scope.
FOUNDATIONS_DIR="$SKILL_PATH/references/foundations"
TOKEN_FILES=()
[[ -f "$TOKENS_MD" ]] && TOKEN_FILES+=("$TOKENS_MD")
if [[ -d "$TOKENS_DIR" ]]; then
  while IFS= read -r f; do TOKEN_FILES+=("$f"); done \
    < <(find "$TOKENS_DIR" -type f -name '*.md')
fi
if [[ -d "$FOUNDATIONS_DIR" ]]; then
  while IFS= read -r f; do TOKEN_FILES+=("$f"); done \
    < <(find "$FOUNDATIONS_DIR" -type f -name '*.md' -not -name 'index.md')
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

  # 10. FOUNDATIONS_INDEX (produced-skill mode only). When
  #     references/foundations/*.md exists, references/foundations/index.md
  #     must also exist AND reference every sibling foundation file by its
  #     basename (sans .md). Per references/persist.md (Foundations split
  #     rule), the index is co-required with per-file foundations — a partial
  #     scaffold that writes foundation files without the index is the
  #     failure mode this check surfaces immediately. Empty
  #     references/foundations/ (no per-file *.md and no index.md) is a valid
  #     empty state (no foundation URL was passed) and the check passes
  #     silently. Mirrors EXAMPLES_INDEX exactly.
  FOUNDATIONS_INDEX="$FOUNDATIONS_DIR/index.md"
  if [[ -d "$FOUNDATIONS_DIR" ]]; then
    FD_FILES=()
    while IFS= read -r f; do
      [[ -n "$f" ]] && FD_FILES+=("$f")
    done < <(find "$FOUNDATIONS_DIR" -type f -name '*.md' -not -name 'index.md' 2>/dev/null | sort)

    if [[ ${#FD_FILES[@]} -eq 0 ]]; then
      # Empty foundations/ dir — valid empty state. Index presence is not required.
      echo "FOUNDATIONS_INDEX=PASS"
    elif [[ ! -f "$FOUNDATIONS_INDEX" ]]; then
      echo "FOUNDATIONS_INDEX=FAIL"
      echo "  references/foundations/ ships ${#FD_FILES[@]} foundation file(s) but references/foundations/index.md is missing — per references/persist.md (Foundations split rule), the index is co-required with per-file foundations"
      FAILED=1
    else
      MISSING_FROM_FD_INDEX=()
      for fd in "${FD_FILES[@]}"; do
        basename_no_ext="$(basename "$fd" .md)"
        if ! grep -qE "(\[${basename_no_ext}\]\(\.?/?${basename_no_ext}\.md\)|${basename_no_ext}\.md)" "$FOUNDATIONS_INDEX"; then
          MISSING_FROM_FD_INDEX+=("${basename_no_ext}")
        fi
      done
      if [[ ${#MISSING_FROM_FD_INDEX[@]} -eq 0 ]]; then
        echo "FOUNDATIONS_INDEX=PASS"
      else
        echo "FOUNDATIONS_INDEX=FAIL"
        echo "  references/foundations/index.md does not reference: ${MISSING_FROM_FD_INDEX[*]} — per references/persist.md (Foundations split rule), the index must list every sibling foundation file by basename"
        FAILED=1
      fi
    fi
  else
    # No foundations/ dir at all — valid empty state for skills without a foundation URL.
    echo "FOUNDATIONS_INDEX=PASS"
  fi

  # 11. TOKEN_COVERAGE (produced-skill mode, opt-in via --ds-package-root). When
  #     the caller passes --ds-package-root <path>, run check-token-coverage.sh
  #     against this produced skill. The script collects every var(--X) consumed
  #     in the produced code-block surfaces (Setup, examples/*.md Composition
  #     (verbatim), components/*.md Composition examples) and asserts each
  #     consumed token's defining file is @import'd by one of the lifted
  #     Companion CSS blocks. When --ds-package-root is absent, the check NOOPs
  #     — the DS package root is not derivable from the produced skill alone,
  #     so the gate is opt-in. See references/anti-patterns.md Layer C
  #     (wiring/css-prose-summary) and references/validate.md (Reference-project
  #     extraction step 5) for the matching Phase 2 hard gate.
  if [[ -n "$DS_PACKAGE_ROOT" ]]; then
    COVERAGE_SCRIPT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/check-token-coverage.sh"
    if [[ ! -f "$COVERAGE_SCRIPT" ]]; then
      echo "TOKEN_COVERAGE=FAIL"
      echo "  check-token-coverage.sh missing at $COVERAGE_SCRIPT"
      FAILED=1
    else
      COVERAGE_EXIT=0
      COVERAGE_OUT="$(bash "$COVERAGE_SCRIPT" "$DS_PACKAGE_ROOT" "$SKILL_PATH" 2>&1)" || COVERAGE_EXIT=$?
      COVERAGE_TALLY="$(grep -E '^TOKEN_COVERAGE=' <<<"$COVERAGE_OUT" | tail -1 || true)"
      # Surface the sub-script's TOKENS_* counters and MISSING rows as
      # supplementary info, indented; the TOKEN_COVERAGE= tally is emitted
      # separately at column 1 so callers grepping ^TOKEN_COVERAGE= find it.
      # `|| true` absorbs grep's exit 1 when no non-tally lines exist (NOOP case).
      { grep -vE '^TOKEN_COVERAGE=' <<<"$COVERAGE_OUT" | sed 's/^/  /'; } || true
      if [[ -n "$COVERAGE_TALLY" ]]; then
        echo "$COVERAGE_TALLY"
      else
        echo "TOKEN_COVERAGE=FAIL"
        echo "  check-token-coverage.sh produced no TOKEN_COVERAGE= tally line (exit=$COVERAGE_EXIT)"
        FAILED=1
      fi
      if [[ "$COVERAGE_EXIT" -ne 0 ]]; then FAILED=1; fi
    fi
  else
    echo "TOKEN_COVERAGE=NOOP (--ds-package-root not provided)"
  fi

  # 12. SHELL_INVARIANTS (produced-skill mode only). Setup is descriptive
  #     ("here is how it is wired") and is read once at greenfield wiring time;
  #     `## Hard rules` is the gate that fires at every emit. When Setup ships
  #     ANY of (a) a root-entry-file code block with a provider mount, (b) a
  #     `### Companion CSS` subheading, (c) a `### Foundation wiring`
  #     subheading, the produced SKILL.md MUST emit at least one Hard Rule
  #     whose body names body/root/provider/wrap/theme/color-scheme/surface
  #     vocabulary AND references a token shape (`var(--name)` or the
  #     `<surface-*>` placeholder when the rule is a template fragment). The
  #     gate prevents the canonical "card painted, body unpainted" mode-
  #     mismatch bug: a downstream agent editing an existing consumer-app
  #     shell never re-grounds Setup invariants, so any invariant living only
  #     in Setup prose is invisible at emit time. See references/anti-patterns.md
  #     Layer C `shell/unpainted-body`, `shell/mode-attribute-no-theme-import`,
  #     `shell/provider-missing-content-wrap`, references/validate.md (Shell-
  #     invariant extraction step), and references/skill-template.md (Hard
  #     rules bullet).
  #
  #     The awk walker tracks Setup + Hard rules section state, detects trigger
  #     constructs anywhere in Setup (provider mount in any code fence, Companion
  #     CSS / Foundation wiring subheadings), and counts Hard-rule lines outside
  #     fences that match shell vocab + token shape. Cross-check resolves each
  #     cited `shell/<slug>` against the produced anti-patterns.md — same
  #     resolution discipline as the existing token/* / component/* cross-check
  #     in Section 4 SLUG_RESOLUTION. The meta-skill's own anti-patterns.md
  #     Layer C definitions are documentation for the slug registry, not a
  #     fallback resolution target — a reader of the produced skill must find
  #     each cited slug in that skill's own anti-patterns.md.
  SI_AWK_OUT="$(awk '
    BEGIN {
      in_setup = 0; setup_depth = 0
      in_hardrules = 0; hardrules_depth = 0
      in_fence = 0
      setup_present = 0
      trigger_provider = 0
      trigger_companion_css = 0
      trigger_foundation_wiring = 0
      shell_count = 0
    }
    function heading_depth(line,    n) {
      n = 0
      while (substr(line, n+1, 1) == "#") n++
      return n
    }
    /^```/ {
      in_fence = !in_fence
      next
    }
    !in_fence && /^#+[[:space:]]+/ {
      depth = heading_depth($0)
      if (in_setup && depth <= setup_depth) { in_setup = 0; setup_depth = 0 }
      if (in_hardrules && depth <= hardrules_depth) { in_hardrules = 0; hardrules_depth = 0 }
      title = $0
      sub(/^#+[[:space:]]+/, "", title)
      sub(/[[:space:]]+$/, "", title)
      if (!in_setup && title == "Setup") {
        in_setup = 1; setup_depth = depth; setup_present = 1
      }
      if (!in_hardrules && title == "Hard rules") {
        in_hardrules = 1; hardrules_depth = depth
      }
      if (in_setup) {
        if (title ~ /^Companion CSS/) trigger_companion_css = 1
        if (title ~ /^Foundation wiring/) trigger_foundation_wiring = 1
      }
      next
    }
    in_setup {
      if (match($0, /<[A-Z][A-Za-z0-9]*Provider([^A-Za-z0-9]|$)/)) trigger_provider = 1
    }
    !in_fence && in_hardrules {
      has_shell = ($0 ~ /(body|root|html|provider|mount|wrap|theme|colorMode|color-scheme|surface)/)
      has_token = ($0 ~ /var\(--[a-zA-Z0-9_-]+\)/) || ($0 ~ /<surface[a-zA-Z0-9_-]*>/)
      if (has_shell && has_token) shell_count++
    }
    END {
      trigger = (trigger_provider || trigger_companion_css || trigger_foundation_wiring) ? 1 : 0
      printf "setup_present=%d trigger=%d shell_count=%d\n", setup_present, trigger, shell_count
    }
  ' "$SKILL_MD")"

  SI_SETUP_PRESENT=0
  SI_TRIGGER=0
  SI_COUNT=0
  for kv in $SI_AWK_OUT; do
    case "$kv" in
      setup_present=*) SI_SETUP_PRESENT="${kv#setup_present=}" ;;
      trigger=*)       SI_TRIGGER="${kv#trigger=}" ;;
      shell_count=*)   SI_COUNT="${kv#shell_count=}" ;;
    esac
  done

  # Cross-check: each cited shell/<slug> resolves to a row in the produced
  # anti-patterns.md. Same resolution discipline as the existing token/* and
  # component/* cross-checks (Section 4 SLUG_RESOLUTION) — the produced
  # skill's anti-patterns.md is the canonical resolution target so a reader
  # of the produced skill can find the rule without grepping the meta-skill
  # repo. The meta-skill's anti-patterns.md Layer C definitions are
  # documentation for the slug registry, not a fallback resolution target.
  SHELL_UNRESOLVED=()
  while IFS= read -r slug; do
    [[ -z "$slug" ]] && continue
    [[ -f "$ANTI" ]] && grep -qF "$slug" "$ANTI" && continue
    SHELL_UNRESOLVED+=("$slug")
  done < <(grep -rhoE '\bshell/[a-z0-9][a-z0-9-]*' "$SKILL_PATH" 2>/dev/null | sort -u)

  SHELL_INVARIANTS_FAIL=0
  SHELL_INVARIANTS_REASONS=()
  if [[ "$SI_TRIGGER" -eq 1 && "$SI_COUNT" -eq 0 ]]; then
    SHELL_INVARIANTS_FAIL=1
    SHELL_INVARIANTS_REASONS+=("Setup section ships a wiring construct (provider mount, Companion CSS subheading, or Foundation wiring subheading) but '## Hard rules' contains no line matching shell vocabulary (body|root|html|provider|wrap|theme|color-scheme|surface) AND a token shape (var(--...) or <surface-*>) — promote at least one shell invariant per references/validate.md (Shell-invariant extraction step); see shell/unpainted-body, shell/mode-attribute-no-theme-import, shell/provider-missing-content-wrap")
  fi
  if [[ ${#SHELL_UNRESOLVED[@]} -gt 0 ]]; then
    SHELL_INVARIANTS_FAIL=1
    SHELL_INVARIANTS_REASONS+=("cited shell/<slug> did not resolve to a row in produced anti-patterns.md: ${SHELL_UNRESOLVED[*]}")
  fi

  if [[ "$SHELL_INVARIANTS_FAIL" -eq 0 ]]; then
    echo "SHELL_INVARIANTS=PASS"
  else
    echo "SHELL_INVARIANTS=FAIL"
    for r in "${SHELL_INVARIANTS_REASONS[@]}"; do
      echo "  $r"
    done
    FAILED=1
  fi

  # 13. DESIGN_CRAFT (produced-skill mode only). Every produced skill ships
  #     references/design-craft.md — the DS-agnostic design-craft reference —
  #     copied VERBATIM by scripts/scaffold.sh from the meta-skill's
  #     assets/design-craft.md (cp, never regenerated; see
  #     references/persist.md Design-craft materialization and
  #     references/anti-patterns.md craft/regenerated-not-copied). When the
  #     file is present: (a) the produced SKILL.md must carry a table row
  #     pointing at it, and (b) the file must be byte-identical to the
  #     canonical asset, resolved from this script's own location. The byte
  #     check SKIPs informationally when the canonical asset is not
  #     resolvable (a produced skill audited on a machine without the
  #     meta-skill). When the file is ABSENT the check reports SKIP, not
  #     FAIL — absence is valid only on the explicit Phase 1 opt-out
  #     (scaffold.sh --no-design-craft); an unexpected SKIP on the default
  #     path means the scaffold copy was lost, and the agent re-runs
  #     scripts/scaffold.sh (or re-copies the asset) before closing.
  DC_FILE="$SKILL_PATH/references/design-craft.md"
  DC_CANONICAL="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/../assets/design-craft.md"
  if [[ ! -f "$DC_FILE" ]]; then
    echo "DESIGN_CRAFT=SKIP (references/design-craft.md absent — valid only on explicit Phase 1 opt-out; scaffold.sh ships it by default)"
  else
    DC_FAILS=()
    if ! grep -qE '^\|.*references/design-craft\.md' "$SKILL_MD"; then
      DC_FAILS+=("SKILL.md carries no routing-table row pointing at references/design-craft.md — add the fixed design-craft row per references/skill-template.md (Routing table)")
    fi
    if [[ -f "$DC_CANONICAL" ]]; then
      if ! cmp -s "$DC_CANONICAL" "$DC_FILE"; then
        DC_FAILS+=("references/design-craft.md differs from the canonical assets/design-craft.md — the file ships verbatim (cp), never regenerated or paraphrased (craft/regenerated-not-copied); re-copy it from the meta-skill")
      fi
    else
      echo "DESIGN_CRAFT_DIFF=SKIP (canonical asset not resolvable at $DC_CANONICAL)"
    fi
    if [[ ${#DC_FAILS[@]} -eq 0 ]]; then
      echo "DESIGN_CRAFT=PASS"
    else
      echo "DESIGN_CRAFT=FAIL"
      for r in "${DC_FAILS[@]}"; do
        echo "  $r"
      done
      FAILED=1
    fi
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
        # (so e.g. a ``` block in prescription text that names @mui/foo
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
        } else if (match($0, /@(shadcn|mui|geist|chakra-ui|radix-ui)\/[A-Za-z0-9._-]+/)) {
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
      echo "  single-DS bias in $file_part — only $count_part distinct hostname(s) cited ($hosts_part) — see [[Meta-Skill Must Be DS-Agnostic — No Embedded DS-Specific Examples]]; worked examples must span ≥2 distinct DSs (≥2 distinct hostnames)"
    done
    FAILED=1
  fi

  # 10. HANDOFF_EMISSION (meta-skill self-mode only). The three-phase skill must
  #     emit a handoff doc at each phase close AND hard-stop the session at the
  #     Phase 1 and Phase 2 cutoffs so a fresh session can resume via the
  #     explicit `validate:` / `persist:` parameter without burning context on
  #     the prior phase. See references/anti-patterns.md state/handoff-skipped
  #     and state/inline-phase-transition for the rule definitions, and
  #     PRD-phase-cutoffs.md for the full contract.
  #
  #     Assertion shape (≈11 substring checks per PRD Change D, split into
  #     ~14 micro-greps so failure messages name the missing thing directly):
  #       (1-3) Handoff-write prose — phase-N.md mentioned in SKILL.md (one
  #             check per phase).
  #       (4-5) Hard-stop prose — Phase 1 and Phase 2 close sections each
  #             contain EXIT + their resume keyword (validate: / persist:).
  #             Section-scoped via awk so a stray "EXIT" elsewhere doesn't
  #             mask a missing cutoff.
  #       (6-7) Resume-parameter prose — `validate:` and `persist:` keywords
  #             appear in SKILL.md (global, covers the "Resume from a prior
  #             phase" top-of-skill section).
  #       (8)   Dryrun-label derivation — `dryrun-NN` filename prefix pattern
  #             AND the `.claude/worktrees/dryrun-` cwd-derivation reference
  #             both appear in SKILL.md.
  #       (9-11) Per-phase template headers in references/{discovery,validate,
  #             persist}.md.
  #
  #     The SKILL.md portion fires only when SKILL.md carries the full
  #     three-phase structure (a Phase 1 section header is the proxy), so
  #     minimal meta-mode test fixtures that don't reproduce the full skill
  #     don't trip it. Per-reference-doc checks fire only when the doc exists,
  #     so partial skeletons skip rather than fail (mirrors the
  #     WORKED_EXAMPLE_DS_BIAS posture on missing inputs).
  HANDOFF_FAILS=()
  SM="$SKILL_PATH/SKILL.md"
  if [[ -f "$SM" ]] && grep -q "^## Phase 1: Discovery summary" "$SM"; then
    # (1-3) Handoff-write prose: phase-N.md substring presence (one per phase).
    for phaseN in 1 2 3; do
      if ! grep -qF "phase-${phaseN}.md" "$SM"; then
        HANDOFF_FAILS+=("SKILL.md|missing handoff-write reference 'phase-${phaseN}.md' — state/handoff-skipped")
      fi
    done

    # (4) Hard-stop prose, Phase 1: section contains EXIT + validate:.
    #     Section extracted via awk from "### Phase 1 close" to the next
    #     heading of equal-or-higher level (## or ###).
    p1_section=$(awk '/^### Phase 1 close/{flag=1; next} flag && /^(### |## )/{flag=0} flag' "$SM")
    if [[ -z "$p1_section" ]]; then
      HANDOFF_FAILS+=("SKILL.md|missing '### Phase 1 close' section — state/inline-phase-transition")
    else
      if ! grep -qF "EXIT" <<<"$p1_section"; then
        HANDOFF_FAILS+=("SKILL.md|Phase 1 close section missing literal 'EXIT' cutoff token — state/inline-phase-transition")
      fi
      if ! grep -qF "validate:" <<<"$p1_section"; then
        HANDOFF_FAILS+=("SKILL.md|Phase 1 close section missing 'validate:' resume keyword in cutoff message — state/inline-phase-transition")
      fi
    fi

    # (5) Hard-stop prose, Phase 2: section contains EXIT + persist:.
    p2_section=$(awk '/^### Phase 2 close/{flag=1; next} flag && /^(### |## )/{flag=0} flag' "$SM")
    if [[ -z "$p2_section" ]]; then
      HANDOFF_FAILS+=("SKILL.md|missing '### Phase 2 close' section — state/inline-phase-transition")
    else
      if ! grep -qF "EXIT" <<<"$p2_section"; then
        HANDOFF_FAILS+=("SKILL.md|Phase 2 close section missing literal 'EXIT' cutoff token — state/inline-phase-transition")
      fi
      if ! grep -qF "persist:" <<<"$p2_section"; then
        HANDOFF_FAILS+=("SKILL.md|Phase 2 close section missing 'persist:' resume keyword in cutoff message — state/inline-phase-transition")
      fi
    fi

    # (6-7) Resume-parameter prose: validate: and persist: keywords appear
    #       globally (covers the "Resume from a prior phase" top-of-skill
    #       section, which describes the parameter shape itself).
    if ! grep -qF "validate:" "$SM"; then
      HANDOFF_FAILS+=("SKILL.md|missing 'validate:' resume keyword (Resume from a prior phase section) — state/inline-phase-transition")
    fi
    if ! grep -qF "persist:" "$SM"; then
      HANDOFF_FAILS+=("SKILL.md|missing 'persist:' resume keyword (Resume from a prior phase section) — state/inline-phase-transition")
    fi

    # (8) Dryrun-label derivation: filename prefix pattern + cwd-derivation
    #     reference. Both must appear so the label rules are documented.
    if ! grep -qE "dryrun-[0-9]+" "$SM"; then
      HANDOFF_FAILS+=("SKILL.md|missing 'dryrun-NN' filename-prefix pattern (Handoff filename labeling section) — state/handoff-skipped")
    fi
    if ! grep -qF ".claude/worktrees/dryrun-" "$SM"; then
      HANDOFF_FAILS+=("SKILL.md|missing '.claude/worktrees/dryrun-' cwd-derivation reference — state/handoff-skipped")
    fi
  fi
  # (9-11) Per-phase template headers in the per-phase reference docs.
  for triple in "discovery.md|1" "validate.md|2" "persist.md|3"; do
    refname="${triple%%|*}"
    phaseN="${triple##*|}"
    refpath="$SKILL_PATH/references/$refname"
    if [[ -f "$refpath" ]]; then
      header="## Handoff document — phase-${phaseN}.md template"
      if ! grep -qF "$header" "$refpath"; then
        HANDOFF_FAILS+=("references/$refname|missing section '$header' — state/handoff-skipped")
      fi
    fi
  done

  if [[ ${#HANDOFF_FAILS[@]} -eq 0 ]]; then
    echo "HANDOFF_EMISSION=PASS"
  else
    echo "HANDOFF_EMISSION=FAIL"
    for entry in "${HANDOFF_FAILS[@]}"; do
      file_part="${entry%%|*}"
      msg_part="${entry#*|}"
      echo "  $file_part: $msg_part"
    done
    FAILED=1
  fi

  # 11b. HANDOFF_COMPLETENESS (meta-skill self-mode only). The Phase 1 handoff
  #     must carry component shape and a non-hedged out-of-scope verdict. Two
  #     hard fails, applied to two targets:
  #       1. The template anchor in references/discovery.md — scanned against
  #          the FENCED code blocks only (the ```...``` blocks) so prose that
  #          legitimately discusses the banned hedge is not flagged.
  #       2. Any emitted handoff under .extract-ds-skill-scratch/handoffs/
  #          (relative to cwd — the worktree root during a real run) — scanned
  #          whole-file (an emitted handoff is the document, not a template in a
  #          fence). Skipped silently when the dir is absent (fixtures, fresh
  #          checkout, or before any Phase 1 run).
  #     The two fails:
  #       (a) state/handoff-missing-component-shape — a `## Decisions` heading
  #           but no `## Components proposed` heading. Phase 2 would inherit
  #           component names without shape and re-read node_modules.
  #       (b) state/handoff-out-of-scope-deferred — the substring `if confirmed`.
  #           Foundation sub-page scope must be a Phase 1 verdict, not a hedge
  #           deferred to Phase 2.
  #     The template scan is guarded on references/discovery.md presence so
  #     partial meta-mode fixtures (SKILL.md only) skip rather than fail. See
  #     references/anti-patterns.md state/handoff-missing-component-shape and
  #     state/handoff-out-of-scope-deferred, and PRD-phase-1-handoff-completeness.md.
  HC_FAILS=()
  DISCOVERY_MD="$SKILL_PATH/references/discovery.md"
  if [[ -f "$DISCOVERY_MD" ]]; then
    # Extract only lines inside fenced code blocks (toggle on any ``` line).
    FENCED="$(awk '
      /^```/ { in_fence = !in_fence; next }
      in_fence { print }
    ' "$DISCOVERY_MD")"

    if grep -qE '^##[[:space:]]+Decisions([[:space:]]|$)' <<<"$FENCED" \
       && ! grep -qE '^##[[:space:]]+Components proposed([[:space:]]|$)' <<<"$FENCED"; then
      HC_FAILS+=("references/discovery.md|handoff template has a '## Decisions' block but no '## Components proposed' section — Phase 2 would inherit component names without shape and re-read node_modules (state/handoff-missing-component-shape)")
    fi

    if grep -qF "if confirmed" <<<"$FENCED"; then
      HC_FAILS+=("references/discovery.md|handoff template anchor contains the hedge 'if confirmed' — foundation sub-page scope must be a Phase 1 verdict, tagged [in-scope]/[out-of-scope: sibling-<topic>-skill], not deferred to Phase 2 (state/handoff-out-of-scope-deferred)")
    fi
  fi

  # Emitted handoffs: scan each .extract-ds-skill-scratch/handoffs/*.md whole.
  # The `## Decisions` guard naturally scopes the component-shape check to
  # Phase-1-shaped handoffs (Phase 2 handoffs have no `## Decisions` block).
  HANDOFF_DIR=".extract-ds-skill-scratch/handoffs"
  if [[ -d "$HANDOFF_DIR" ]]; then
    for hf in "$HANDOFF_DIR"/*.md; do
      [[ -e "$hf" ]] || continue
      if grep -qE '^##[[:space:]]+Decisions([[:space:]]|$)' "$hf" \
         && ! grep -qE '^##[[:space:]]+Components proposed([[:space:]]|$)' "$hf"; then
        HC_FAILS+=("$hf|emitted handoff has a '## Decisions' block but no '## Components proposed' section — Phase 2 inherits component names without shape and re-reads node_modules (state/handoff-missing-component-shape)")
      fi
      if grep -qF "if confirmed" "$hf"; then
        HC_FAILS+=("$hf|emitted handoff contains the hedge 'if confirmed' — foundation sub-page scope must be a Phase 1 verdict, tagged [in-scope]/[out-of-scope: sibling-<topic>-skill] (state/handoff-out-of-scope-deferred)")
      fi
    done
  fi

  if [[ ${#HC_FAILS[@]} -eq 0 ]]; then
    echo "HANDOFF_COMPLETENESS=PASS"
  else
    echo "HANDOFF_COMPLETENESS=FAIL"
    for entry in "${HC_FAILS[@]}"; do
      file_part="${entry%%|*}"
      msg_part="${entry#*|}"
      echo "  $file_part: $msg_part"
    done
    FAILED=1
  fi

  # 12. SHAPE_7_PRESENT (meta-skill self-mode only). The seventh Geist rule
  #     shape (Anti-substitution) must appear as a section in
  #     references/component-extraction.md. Without it, source prose like
  #     "use X, not Y" or "experimental Y reserved for..." falls through the
  #     first six shapes and is silently dropped during Phase 2 rule
  #     extraction — the defect documented by the
  #     component/anti-substitution-dropped Layer C slug in anti-patterns.md.
  #
  #     Guarded on the file's presence so partial meta-mode test fixtures
  #     (which ship only SKILL.md) skip the check rather than fail it. The
  #     check IS unconditional against the live meta-skill, which always
  #     ships references/component-extraction.md.
  COMP_EXTRACTION="$SKILL_PATH/references/component-extraction.md"
  if [[ -f "$COMP_EXTRACTION" ]]; then
    if grep -qE '^### Shape 7 — Anti-substitution' "$COMP_EXTRACTION"; then
      echo "SHAPE_7_PRESENT=PASS"
    else
      echo "SHAPE_7_PRESENT=FAIL"
      echo "  references/component-extraction.md: missing '### Shape 7 — Anti-substitution' section — anti-substitution prose ('use X, not Y') would fall through the six existing shapes and drop during Phase 2 extraction"
      FAILED=1
    fi
  fi

  # 13. OTHER_REEXPORTS_CONTRACT (meta-skill self-mode only). The produced
  #     skill template must document the '## Other re-exports' section as a
  #     required-section bullet, so Phase 3 materializes the unannotated
  #     re-export tier surfaced by the Phase 1 discovery handoff. Absence
  #     trips the component/reexport-tier-invisible Layer C slug. Same
  #     partial-skeleton-skip posture as SHAPE_7_PRESENT above.
  SKILL_TEMPLATE="$SKILL_PATH/references/skill-template.md"
  if [[ -f "$SKILL_TEMPLATE" ]]; then
    if grep -qE '^- \*\*Other re-exports\*\*' "$SKILL_TEMPLATE"; then
      echo "OTHER_REEXPORTS_CONTRACT=PASS"
    else
      echo "OTHER_REEXPORTS_CONTRACT=FAIL"
      echo "  references/skill-template.md: missing '- **Other re-exports**' required-section bullet — re-exports outside the proposing set would disappear from the produced components.md (component/reexport-tier-invisible)"
      FAILED=1
    fi
  fi
fi

if [[ $FAILED -eq 0 ]]; then echo "CHECK_RESULT=PASS"; exit 0
else echo "CHECK_RESULT=FAIL"; exit 1; fi
