#!/usr/bin/env bash
# scripts/verify-citations.sh — mechanical citation verification for produced skills.
# Every file:line cite in produced prose must (Layer 1) resolve to a real file and
# in-range line numbers, and (coverage + Layer 2, when a claims file is present) be
# backed by a CITE row whose must-contain snippet actually appears in the cited range.
# See references/validate.md (Citation-verification step) for the contract.
#
# Usage: verify-citations.sh <target-dir> [--claims <file>] [--package <ds-pkg>]... [--consumer-root <dir>]
#   <target-dir>      produced skill dir, the Phase 2 scratch dir, or any dir of .md files
#   --claims          claims file (default: <consumer-root>/.extract-ds-skill-scratch/claims.txt when present)
#   --package         DS package name for resolving bare dist/... cites (repeatable; auto-derived
#                     from full-form node_modules/... cites in the same target otherwise)
#   --consumer-root   directory holding node_modules/ (default: cwd)
#
# Output contract (greppable):
#   CITES_CHECKED=prose:<n> claimed:<n> skipped=upstream:<n> repo:<n> url:<n>
#   CITE_MISS=<file>:<line> -> <source-path>:<line-spec> reason=<unresolved|line-out-of-range|drift|uncovered>
#   CITATION_VERIFICATION=PASS | FAIL | NONE (<reason>)
# Exit codes: 0 = PASS or NONE; 1 = FAIL (>=1 CITE_MISS); 2 = usage/IO error.

set -euo pipefail

usage() { echo "Usage: verify-citations.sh <target-dir> [--claims <file>] [--package <ds-pkg>]... [--consumer-root <dir>]" >&2; exit 2; }
[[ "${1:-}" == "-h" || "${1:-}" == "--help" ]] && usage || true

TARGET=""; CLAIMS_FILE=""; ROOT="."
PKGS=()   # candidate package names for bare dist/... resolution
EXPECT=""
for a in "$@"; do
  if [[ -n "$EXPECT" ]]; then
    case "$EXPECT" in
      claims) CLAIMS_FILE="$a" ;;
      package) PKGS+=("$a") ;;
      root) ROOT="$a" ;;
    esac
    EXPECT=""; continue
  fi
  case "$a" in
    --claims) EXPECT="claims" ;;
    --package) EXPECT="package" ;;
    --consumer-root) EXPECT="root" ;;
    --*) echo "ERROR: unknown flag: $a" >&2; usage ;;
    *) [[ -n "$TARGET" ]] && usage; TARGET="$a" ;;
  esac
done
[[ -n "$EXPECT" ]] && { echo "ERROR: --$EXPECT requires a value" >&2; exit 2; }
[[ -z "$TARGET" ]] && usage
[[ -d "$TARGET" ]] || { echo "ERROR: target dir not found: $TARGET" >&2; exit 2; }
[[ -d "$ROOT" ]] || { echo "ERROR: consumer root not found: $ROOT" >&2; exit 2; }

# Without a node_modules tree there is nothing to resolve against — emit NONE and
# stand down rather than drowning a source-less audit in false unresolved misses.
if [[ ! -d "$ROOT/node_modules" ]]; then
  echo "CITES_CHECKED=prose:0 claimed:0 skipped=upstream:0 repo:0 url:0"
  echo "CITATION_VERIFICATION=NONE (no node_modules under $ROOT - resolution target absent)"
  exit 0
fi

# Claims-file auto-detect (same scratch posture as validate.sh).
if [[ -z "$CLAIMS_FILE" && -f "$ROOT/.extract-ds-skill-scratch/claims.txt" ]]; then
  CLAIMS_FILE="$ROOT/.extract-ds-skill-scratch/claims.txt"
fi
if [[ -n "$CLAIMS_FILE" && ! -f "$CLAIMS_FILE" ]]; then
  echo "ERROR: claims file not found: $CLAIMS_FILE" >&2; exit 2
fi

# Cite-token shapes (see references/validate.md):
#   in-scope    node_modules/<...>.<ext>:N[,N|-N]*   and bare   dist/<...>.<ext>:N[,N|-N]*
#   skipped     owner/repo@ref:path cites, bare upstream packages/|src/ paths, URLs
CITE_RE='(node_modules|dist)/[A-Za-z0-9@._/-]+\.(ts|tsx|js|jsx|mjs|cjs|css|scss|json):[0-9]+([,-][0-9]+)*'

MD_FILES=()
while IFS= read -r f; do MD_FILES+=("$f"); done \
  < <(find "$TARGET" -type f -name '*.md' ! -name 'design-craft.md' | sort)

# ---------- Parse CITE rows from the claims file ----------
# Row grammar: CITE:node_modules/<path>:<line>[-<endline>]|<must-contain substring>
CITE_PATHS=(); CITE_STARTS=(); CITE_ENDS=(); CITE_SNIPS=(); CITE_SRCS=()
N_CITE_ROWS=0
HAVE_CLAIMS=false
if [[ -n "$CLAIMS_FILE" ]]; then
  HAVE_CLAIMS=true
  ROW_LINENO=0
  while IFS= read -r row || [[ -n "$row" ]]; do
    ROW_LINENO=$((ROW_LINENO + 1))
    case "$row" in
      CITE:*) ;;
      *) continue ;;
    esac
    body="${row#CITE:}"
    left="${body%%|*}"
    if [[ "$left" == "$body" ]]; then
      echo "ERROR: $CLAIMS_FILE:$ROW_LINENO — CITE row has no |snippet separator: $row" >&2; exit 2
    fi
    snippet="${body#*|}"
    spec="${left##*:}"
    path="${left%:*}"
    if [[ "$path" != node_modules/* ]]; then
      echo "ERROR: $CLAIMS_FILE:$ROW_LINENO — CITE rows must be node_modules/-prefixed: $row" >&2; exit 2
    fi
    if ! [[ "$spec" =~ ^[0-9]+(-[0-9]+)?$ ]]; then
      echo "ERROR: $CLAIMS_FILE:$ROW_LINENO — CITE line spec must be N or N-M: $row" >&2; exit 2
    fi
    if [[ -z "$snippet" ]]; then
      echo "ERROR: $CLAIMS_FILE:$ROW_LINENO — CITE row has an empty snippet: $row" >&2; exit 2
    fi
    s="${spec%%-*}"; e="${spec##*-}"
    CITE_PATHS+=("$path"); CITE_STARTS+=("$s"); CITE_ENDS+=("$e")
    CITE_SNIPS+=("$snippet"); CITE_SRCS+=("$CLAIMS_FILE:$ROW_LINENO")
    N_CITE_ROWS=$((N_CITE_ROWS + 1))
  done < "$CLAIMS_FILE"
fi

# ---------- Candidate packages for bare dist/... resolution ----------
# Auto-derive from full-form node_modules/ tokens in the target, union --package flags.
SEEN_PKG=":"
for p in ${PKGS[@]+"${PKGS[@]}"}; do SEEN_PKG="${SEEN_PKG}${p}:"; done
if [[ ${#MD_FILES[@]} -gt 0 ]]; then
  while IFS= read -r tok; do
    rest="${tok#node_modules/}"
    case "$rest" in
      @*) pkg="$(printf '%s' "$rest" | cut -d/ -f1-2)" ;;
      *)  pkg="${rest%%/*}" ;;
    esac
    [[ -z "$pkg" ]] && continue
    case "$SEEN_PKG" in *":$pkg:"*) ;; *) PKGS+=("$pkg"); SEEN_PKG="${SEEN_PKG}${pkg}:" ;; esac
  done < <(grep -ohE "$CITE_RE" "${MD_FILES[@]}" 2>/dev/null | grep -E '^node_modules/' | sed -E 's/:[0-9,-]+$//' || true)
fi

# ---------- Line-count cache (awk counts a final unterminated line, wc -l does not) ----------
LC_KEYS=(); LC_VALS=()
line_count() {
  local f="$1" i
  i=0
  while [[ $i -lt ${#LC_KEYS[@]} ]]; do
    if [[ "${LC_KEYS[$i]}" == "$f" ]]; then echo "${LC_VALS[$i]}"; return 0; fi
    i=$((i + 1))
  done
  local n
  n="$(awk 'END{print NR}' "$f")"
  LC_KEYS+=("$f"); LC_VALS+=("$n")
  echo "$n"
}

MISSES=()
N_PROSE=0; N_UPSTREAM=0; N_REPO=0; N_URL=0

# ---------- Per-file prose scan: Layer 1 resolution + coverage ----------
for md in ${MD_FILES[@]+"${MD_FILES[@]}"}; do
  # Skip-class counts (informational — visible under-coverage, never resolved here).
  n=$({ grep -oE '(^|[^/A-Za-z0-9_.@-])(packages|src)/[A-Za-z0-9_./-]+\.[a-z]+:[0-9]+' "$md" 2>/dev/null || true; } | wc -l | tr -d ' ')
  N_UPSTREAM=$((N_UPSTREAM + n))
  n=$({ grep -oE '[A-Za-z0-9._-]+/[A-Za-z0-9._-]+@[A-Za-z0-9._-]+' "$md" 2>/dev/null || true; } | { grep -vE '^node_modules/' || true; } | wc -l | tr -d ' ')
  N_REPO=$((N_REPO + n))
  n=$({ grep -oE 'https?://[^ )`]+' "$md" 2>/dev/null || true; } | wc -l | tr -d ' ')
  N_URL=$((N_URL + n))

  while IFS= read -r hit; do
    [[ -z "$hit" ]] && continue
    mdline="${hit%%:*}"
    tok="${hit#*:}"
    spec="${tok##*:}"
    src="${tok%:*}"
    N_PROSE=$((N_PROSE + 1))

    # Resolve to a real path under the consumer root.
    resolved=""
    if [[ "$src" == node_modules/* ]]; then
      [[ -f "$ROOT/$src" ]] && resolved="$src"
    else
      for pkg in ${PKGS[@]+"${PKGS[@]}"}; do
        if [[ -f "$ROOT/node_modules/$pkg/$src" ]]; then resolved="node_modules/$pkg/$src"; break; fi
      done
    fi
    if [[ -z "$resolved" ]]; then
      MISSES+=("CITE_MISS=$md:$mdline -> $src:$spec reason=unresolved")
      continue
    fi

    total="$(line_count "$ROOT/$resolved")"

    # Expand the spec into comma segments; each segment is N or N-M.
    for seg in $(printf '%s' "$spec" | tr ',' ' '); do
      s="${seg%%-*}"; e="${seg##*-}"
      if [[ "$s" -lt 1 || "$e" -lt "$s" || "$e" -gt "$total" ]]; then
        MISSES+=("CITE_MISS=$md:$mdline -> $resolved:$seg reason=line-out-of-range")
      elif $HAVE_CLAIMS; then
        # Coverage: a single line needs a CITE row containing it; a range needs
        # at least one intersecting CITE row (the snippet anchors the block).
        covered=false
        i=0
        while [[ $i -lt $N_CITE_ROWS ]]; do
          if [[ "${CITE_PATHS[$i]}" == "$resolved" && "${CITE_STARTS[$i]}" -le "$e" && "${CITE_ENDS[$i]}" -ge "$s" ]]; then
            covered=true; break
          fi
          i=$((i + 1))
        done
        if ! $covered; then
          MISSES+=("CITE_MISS=$md:$mdline -> $resolved:$seg reason=uncovered")
        fi
      fi
    done
  done < <(grep -onE "$CITE_RE" "$md" 2>/dev/null || true)
done

# ---------- Layer 2: every CITE row's snippet appears in its cited range ----------
i=0
while [[ $i -lt $N_CITE_ROWS ]]; do
  path="${CITE_PATHS[$i]}"; s="${CITE_STARTS[$i]}"; e="${CITE_ENDS[$i]}"
  snippet="${CITE_SNIPS[$i]}"; rowsrc="${CITE_SRCS[$i]}"
  if [[ ! -f "$ROOT/$path" ]]; then
    MISSES+=("CITE_MISS=$rowsrc -> $path:$s-$e reason=unresolved")
  else
    total="$(line_count "$ROOT/$path")"
    if [[ "$s" -lt 1 || "$e" -lt "$s" || "$e" -gt "$total" ]]; then
      MISSES+=("CITE_MISS=$rowsrc -> $path:$s-$e reason=line-out-of-range")
    elif ! sed -n "${s},${e}p" "$ROOT/$path" | grep -qF "$snippet"; then
      MISSES+=("CITE_MISS=$rowsrc -> $path:$s-$e reason=drift")
    fi
  fi
  i=$((i + 1))
done

# ---------- Report ----------
echo "CITES_CHECKED=prose:$N_PROSE claimed:$N_CITE_ROWS skipped=upstream:$N_UPSTREAM repo:$N_REPO url:$N_URL"
for m in ${MISSES[@]+"${MISSES[@]}"}; do echo "$m"; done
if [[ ${#MISSES[@]} -gt 0 ]]; then
  echo "CITATION_VERIFICATION=FAIL"
  exit 1
elif ! $HAVE_CLAIMS; then
  echo "CITATION_VERIFICATION=NONE (resolution-only PASS - no claims file)"
  exit 0
else
  echo "CITATION_VERIFICATION=PASS"
  exit 0
fi
