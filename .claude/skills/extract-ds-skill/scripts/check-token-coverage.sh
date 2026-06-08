#!/usr/bin/env bash
# scripts/check-token-coverage.sh — assert the lifted @import set covers every
# var(--X) the produced/scratch code-block surfaces consume. See
# references/anti-patterns.md Layer C (wiring/css-prose-summary) and the Phase 2
# hard gate in references/validate.md.
#
# Exit codes: 0 PASS or NOOP (tally line on stdout names which), 1 FAIL (per-var
# MISSING rows on stdout), 2 usage error.

set -euo pipefail

usage() {
  echo "Usage: check-token-coverage.sh <ds-package-root> <wiring-scratch-or-skill-dir>" >&2
  exit 2
}

[[ "${1:-}" == "-h" || "${1:-}" == "--help" ]] && usage
[[ $# -lt 2 ]] && usage

DS_ROOT="$1"
TARGET="$2"

[[ -d "$DS_ROOT" ]] || { echo "ERROR: ds-package-root not a directory: $DS_ROOT" >&2; exit 2; }
[[ -d "$TARGET" ]] || { echo "ERROR: target not a directory: $TARGET" >&2; exit 2; }

# Normalize DS_ROOT: strip trailing slash AND resolve symlinks to the
# physical path. pnpm installs scoped packages as symlinks
# (`node_modules/@scope/pkg` → `.pnpm/<scope+pkg>@<ver>/node_modules/@scope/pkg`).
# BSD `grep -r`/`-R` both REFUSE to follow a symlink given as the top-level
# directory argument (a long-standing quirk; the man page claims `-R` follows
# but in practice it doesn't for the arg itself, only for symlinks discovered
# during recursion). Resolving with `cd && pwd -P` dereferences the symlink so
# grep recurses into the real directory. GNU grep's behavior is unchanged
# because the path is already physical.
DS_ROOT="${DS_ROOT%/}"
DS_ROOT="$(cd "$DS_ROOT" && pwd -P)"

# Derive package name from DS_ROOT/package.json for the MISSING-row `@pkg/...` prefix.
# Falls back to empty when package.json is absent or node is unavailable; the prefix is
# cosmetic — the failure row is still actionable without it.
PKG_NAME=""
if [[ -f "$DS_ROOT/package.json" ]]; then
  if command -v node >/dev/null 2>&1; then
    PKG_NAME=$(node -p "JSON.parse(require('fs').readFileSync('$DS_ROOT/package.json','utf8')).name" 2>/dev/null || true)
  else
    PKG_NAME=$(grep -E '"name"[[:space:]]*:' "$DS_ROOT/package.json" | head -1 | sed -E 's/.*"name"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/' || true)
  fi
fi

# Detect mode by which root file is present.
if [[ -f "$TARGET/SKILL.md" ]]; then
  MODE="produced"
elif [[ -f "$TARGET/wiring-extracted.md" ]]; then
  MODE="scratch"
else
  echo "ERROR: target has neither SKILL.md nor wiring-extracted.md: $TARGET" >&2
  exit 2
fi

TMPDIR_LOCAL=$(mktemp -d)
trap 'rm -rf "$TMPDIR_LOCAL"' EXIT
CONSUMPTION="$TMPDIR_LOCAL/consumption"
IMPORTS="$TMPDIR_LOCAL/imports"
FAILS="$TMPDIR_LOCAL/fails"
: > "$CONSUMPTION"; : > "$IMPORTS"; : > "$FAILS"

# scan_section — extract var(--X) names from fenced code blocks bounded by a
# section heading, into CONSUMPTION as "--X<TAB><file>:<line>" rows. The section
# starts at a line matching `<heading_pattern>` and ends at the next `^## ` H2
# (so nested H3 subheadings like `### Companion CSS — <path>` stay inside the
# section). When `heading_pattern` is the empty string, the WHOLE file's fenced
# blocks are scanned.
scan_section() {
  local f="$1"
  local heading_pattern="$2"
  [[ -f "$f" ]] || return 0
  awk -v pat="$heading_pattern" -v fp="$f" '
    BEGIN { in_section = (pat == "") ? 1 : 0; in_block = 0 }
    pat != "" && $0 ~ pat { in_section = 1; in_block = 0; next }
    pat != "" && in_section && /^## / { in_section = 0; in_block = 0; next }
    in_section && /^```/ { in_block = !in_block; next }
    in_section && in_block {
      line = $0
      while (match(line, /var\(--[A-Za-z0-9_-]+/)) {
        token = substr(line, RSTART+4, RLENGTH-4)
        print token "\t" fp ":" NR
        line = substr(line, RSTART+RLENGTH)
      }
    }
  ' "$f" >> "$CONSUMPTION"
}

# extract_imports — pull `@import "..."` lines from fenced CSS blocks immediately
# following a `<heading_pattern>` subheading, into IMPORTS. Each subheading owns
# the FIRST fenced block after it. Multiple subheadings in the same file all get
# processed.
extract_imports() {
  local f="$1"
  local heading_pattern="$2"
  [[ -f "$f" ]] || return 0
  awk -v pat="$heading_pattern" '
    $0 ~ pat { in_section = 1; in_block = 0; next }
    in_section && /^```/ {
      if (in_block) { in_block = 0; in_section = 0 }
      else { in_block = 1 }
      next
    }
    in_section && in_block { print $0 }
  ' "$f" | grep -E '^[[:space:]]*@import' >> "$IMPORTS" || true
}

if [[ "$MODE" == "produced" ]]; then
  # Setup section is bounded by `## Setup` ... next `## `. References/examples and
  # references/components scan the file fully — by produced-skill contract, the
  # only fenced blocks in those files are `## Composition (verbatim)` (examples)
  # and `## Composition examples` (components). Scanning the whole file picks up
  # both without needing per-section logic. References/tokens.md,
  # references/foundations/*.md, references/anti-patterns.md are EXCLUDED.
  scan_section "$TARGET/SKILL.md" '^## Setup[[:space:]]*$'
  if [[ -d "$TARGET/references/examples" ]]; then
    for f in "$TARGET/references/examples/"*.md; do
      [[ -f "$f" ]] || continue
      [[ "$(basename "$f")" == "index.md" ]] && continue
      scan_section "$f" ''
    done
  fi
  if [[ -d "$TARGET/references/components" ]]; then
    for f in "$TARGET/references/components/"*.md; do
      [[ -f "$f" ]] || continue
      [[ "$(basename "$f")" == "index.md" ]] && continue
      scan_section "$f" ''
    done
  fi
  extract_imports "$TARGET/SKILL.md" '^### Companion CSS'
else
  # Scratch mode. wiring-extracted.md carries `## Root entry file (verbatim)`
  # and one or more `## Companion CSS file (verbatim) — <path>`. Examples live
  # under examples/. Scan all fenced blocks of the wiring file; restrict imports
  # extraction to Companion CSS subheadings.
  scan_section "$TARGET/wiring-extracted.md" ''
  if [[ -d "$TARGET/examples" ]]; then
    for f in "$TARGET/examples/"*.md; do
      [[ -f "$f" ]] || continue
      scan_section "$f" ''
    done
  fi
  extract_imports "$TARGET/wiring-extracted.md" '^## Companion CSS file \(verbatim\)'
fi

# NOOP — no var(--X) consumption found anywhere (Tailwind-style apps).
if [[ ! -s "$CONSUMPTION" ]]; then
  echo "TOKEN_COVERAGE=NOOP"
  exit 0
fi

# Suffix-match for @import coverage. Strip a leading `dist/css/` or `css/` from
# the definer's path so the suffix matches @import lines that reference the file
# under either layout convention. Falls through to the raw relative path
# otherwise.
suffix_for_match() {
  local rel="$1"
  case "$rel" in
    dist/css/*) printf '%s' "${rel#dist/css/}" ;;
    css/*)      printf '%s' "${rel#css/}" ;;
    *)          printf '%s' "$rel" ;;
  esac
}

UNIQUE_VARS=$(awk -F'\t' '{print $1}' "$CONSUMPTION" | sort -u)
TOKENS_CONSUMED=$(printf '%s\n' "$UNIQUE_VARS" | grep -c . || true)
TOKENS_COVERED=0
FAIL=false

while IFS= read -r var; do
  [[ -z "$var" ]] && continue
  varname="${var#--}"
  first_use=$(awk -F'\t' -v v="$var" '$1==v{print $2; exit}' "$CONSUMPTION")
  # A var may be defined in MULTIPLE files (e.g. a semantic surface token
  # defined separately in light, dark, and contrast-variant theme files).
  # Coverage holds if ANY of those files is @import'd by one of the lifted
  # Companion CSS blocks. Collect every definer, check each against IMPORTS,
  # mark covered on the first match.
  #
  # DS_ROOT has already been resolved to its physical path at the top of the
  # script (see `pwd -P` normalization), so plain `-r` is correct here — the
  # grep target is always a real directory by the time we get here.
  definer_files=$(grep -rEl "^[[:space:]]*--${varname}:" "$DS_ROOT" 2>/dev/null || true)
  if [[ -z "$definer_files" ]]; then
    echo "MISSING: $var consumed in $first_use, NOT DEFINED in $DS_ROOT (no file under DS package root carries --${varname}:)" >> "$FAILS"
    FAIL=true
    continue
  fi
  covered=false
  while IFS= read -r definer; do
    [[ -z "$definer" ]] && continue
    definer_relative="${definer#$DS_ROOT/}"
    match_suffix=$(suffix_for_match "$definer_relative")
    if grep -qF "$match_suffix" "$IMPORTS"; then
      covered=true
      break
    fi
  done <<< "$definer_files"
  if $covered; then
    TOKENS_COVERED=$((TOKENS_COVERED + 1))
  else
    # Report the FIRST definer path in the MISSING row — it's the most likely
    # canonical home and the easiest pointer for the user to act on. Other
    # definers exist but aren't imported either; surfacing all of them would
    # only add noise.
    first_definer=$(printf '%s\n' "$definer_files" | head -1)
    first_relative="${first_definer#$DS_ROOT/}"
    pretty_path="${PKG_NAME:+${PKG_NAME}/}${first_relative}"
    echo "MISSING: $var consumed in $first_use, defined in $pretty_path, NOT imported by any lifted CSS file" >> "$FAILS"
    FAIL=true
  fi
done <<< "$UNIQUE_VARS"

echo "TOKENS_CONSUMED=$TOKENS_CONSUMED"
echo "TOKENS_COVERED=$TOKENS_COVERED"

if $FAIL; then
  cat "$FAILS"
  echo "TOKEN_COVERAGE=FAIL"
  exit 1
fi

echo "TOKEN_COVERAGE=PASS"
exit 0
