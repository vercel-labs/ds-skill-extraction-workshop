#!/usr/bin/env bash
# scripts/tests/run-tests.sh — fixture-based tests for scripts/check-skill-docs.sh.
#
# Each fixture is a minimal skill layout under fixtures/<case>/extract-ds-skill/
# (or fixtures/<case>/produced-skill/ for produced-mode tests). The driver runs
# the script against each fixture, asserts the expected exit code, asserts the
# expected tally line (e.g. `NO_HARDCODED_PATHS=PASS|FAIL`), and for FAIL
# fixtures asserts the failure message names the right file and line.
#
# Usage:  bash scripts/tests/run-tests.sh
# Exit:   0 = all pass; 1 = at least one assertion failed.

set -uo pipefail

# Resolve repo paths from this script's location so it works from any CWD.
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
CHECK="$SKILL_DIR/check-skill-docs.sh"
FIXTURES="$SCRIPT_DIR/fixtures"

[[ -x "$CHECK" || -f "$CHECK" ]] || { echo "error: check script missing: $CHECK" >&2; exit 2; }
[[ -d "$FIXTURES" ]] || { echo "error: fixtures dir missing: $FIXTURES" >&2; exit 2; }

PASS=0
FAIL=0

# Run the check against a fixture and assert exit code, tally line, optional
# substring in failure output. Usage:
#   assert <name> <fixture-path> <expected-exit> <tally-grep> [fail-substring]
assert() {
  local name="$1" fixture="$2" want_exit="$3" tally="$4" fail_sub="${5:-}"
  local out got_exit=0
  out="$(bash "$CHECK" "$fixture" 2>&1)" || got_exit=$?
  local err=""
  if [[ "$got_exit" -ne "$want_exit" ]]; then
    err="  exit got=$got_exit want=$want_exit"
  fi
  if ! grep -qE "^${tally}$" <<<"$out"; then
    err+=$'\n  tally line not found: '"$tally"
  fi
  if [[ -n "$fail_sub" ]] && ! grep -qF "$fail_sub" <<<"$out"; then
    err+=$'\n  expected failure substring not found: '"$fail_sub"
  fi
  if [[ -z "$err" ]]; then
    echo "PASS  $name"
    PASS=$((PASS + 1))
  else
    echo "FAIL  $name"
    echo "$err"
    echo "  --- script output ---"
    echo "$out" | sed 's/^/  /'
    echo "  ---"
    FAIL=$((FAIL + 1))
  fi
}

# Test 1: pass-fixture — every hardcoded path lives inside a labeled
# illustrative block. NO_HARDCODED_PATHS must report PASS and the script
# must exit 0.
assert "pass-no-hardcoded-paths exits 0 with PASS tally" \
  "$FIXTURES/pass-no-hardcoded-paths/extract-ds-skill" \
  0 "NO_HARDCODED_PATHS=PASS"

# Test 2: fail-fixture — a GitHub URL leaks into prescription text outside
# any labeled block. NO_HARDCODED_PATHS must report FAIL, the script must
# exit non-zero, and the failure message must name the leaked file and line.
assert "fail-no-hardcoded-paths exits non-zero with FAIL tally" \
  "$FIXTURES/fail-no-hardcoded-paths/extract-ds-skill" \
  1 "NO_HARDCODED_PATHS=FAIL" \
  "SKILL.md:8"

# Test 3: meta-mode auto-detect. Pass fixture is named extract-ds-skill,
# script must announce MODE=meta.
assert "pass-fixture auto-detects meta-mode" \
  "$FIXTURES/pass-no-hardcoded-paths/extract-ds-skill" \
  0 "MODE=meta"

# Test 4: produced-mode auto-detect skips NO_HARDCODED_PATHS entirely.
# Build a tiny on-the-fly produced-skill fixture (basename != extract-ds-skill)
# that contains a github.com URL in prescription text. Self-check would FAIL
# in meta-mode; produced-mode should NOT emit a NO_HARDCODED_PATHS line at
# all (the check is meta-mode only).
PRODUCED_TMP="$(mktemp -d)"
trap 'rm -rf "$PRODUCED_TMP"' EXIT
mkdir -p "$PRODUCED_TMP/test-produced-skill/references/components"
cat >"$PRODUCED_TMP/test-produced-skill/SKILL.md" <<'EOF'
---
name: test-produced-skill
description: Tiny produced-skill fixture for the run-tests harness.
---

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| button asks | references/components/button.md | per-component file |

This prescription text leaks <https://github.com/example/repo> on purpose;
the produced-mode check must NOT scan for that pattern.

In scope: tokens, assets, component descriptions, component APIs.
EOF
cat >"$PRODUCED_TMP/test-produced-skill/references/components/button.md" <<'EOF'
# Button

## Best Practices

- One bullet so the BEST_PRACTICES_COVERAGE check passes.
EOF

out_produced="$(bash "$CHECK" "$PRODUCED_TMP/test-produced-skill" 2>&1)" || true
if grep -qE '^NO_HARDCODED_PATHS=' <<<"$out_produced"; then
  echo "FAIL  produced-mode must NOT emit NO_HARDCODED_PATHS tally"
  echo "  --- script output ---"
  echo "$out_produced" | sed 's/^/  /'
  echo "  ---"
  FAIL=$((FAIL + 1))
else
  echo "PASS  produced-mode skips NO_HARDCODED_PATHS"
  PASS=$((PASS + 1))
fi
if grep -qE '^MODE=produced$' <<<"$out_produced"; then
  echo "PASS  produced-fixture auto-detects produced-mode"
  PASS=$((PASS + 1))
else
  echo "FAIL  produced-fixture should report MODE=produced"
  FAIL=$((FAIL + 1))
fi

echo
echo "PASSED=$PASS FAILED=$FAIL"
[[ "$FAIL" -eq 0 ]]
