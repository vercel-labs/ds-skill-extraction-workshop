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

# Test 5: pass-fixture — foundation-extraction worked examples span ≥2
# distinct DS hostnames. WORKED_EXAMPLE_DS_BIAS must report PASS and the
# script must exit 0.
assert "pass-worked-example-ds-bias exits 0 with PASS tally" \
  "$FIXTURES/pass-worked-example-ds-bias/extract-ds-skill" \
  0 "WORKED_EXAMPLE_DS_BIAS=PASS"

# Test 6: fail-fixture — foundation-extraction worked examples only cite
# one DS hostname. WORKED_EXAMPLE_DS_BIAS must report FAIL, the script
# must exit non-zero, and the failure message must name the offending file.
assert "fail-worked-example-ds-bias exits non-zero with FAIL tally" \
  "$FIXTURES/fail-worked-example-ds-bias/extract-ds-skill" \
  1 "WORKED_EXAMPLE_DS_BIAS=FAIL" \
  "fail-worked-example-ds-bias/extract-ds-skill/references/foundation-extraction.md"

# Test 7: produced-mode skips WORKED_EXAMPLE_DS_BIAS entirely. The on-the-fly
# produced fixture from Test 4 has no references/foundation-extraction.md,
# and even if it did, produced-mode must NOT emit the tally line at all.
if grep -qE '^WORKED_EXAMPLE_DS_BIAS=' <<<"$out_produced"; then
  echo "FAIL  produced-mode must NOT emit WORKED_EXAMPLE_DS_BIAS tally"
  echo "  --- script output ---"
  echo "$out_produced" | sed 's/^/  /'
  echo "  ---"
  FAIL=$((FAIL + 1))
else
  echo "PASS  produced-mode skips WORKED_EXAMPLE_DS_BIAS"
  PASS=$((PASS + 1))
fi

# Test 8: WIRING_NOT_SYNTHESIZED pass-fixture — Setup section cites a
# reference-project file path. Tally must PASS, script must exit 0.
assert "pass-wiring-file-citation exits 0 with PASS tally" \
  "$FIXTURES/pass-wiring-file-citation/produced-skill" \
  0 "WIRING_NOT_SYNTHESIZED=PASS"

# Test 9: WIRING_NOT_SYNTHESIZED pass-fixture — Setup section cites a docs
# URL instead. Tally must PASS, script must exit 0.
assert "pass-wiring-url-citation exits 0 with PASS tally" \
  "$FIXTURES/pass-wiring-url-citation/produced-skill" \
  0 "WIRING_NOT_SYNTHESIZED=PASS"

# Test 10: WIRING_NOT_SYNTHESIZED no-op — Setup section has no JSX wrapper
# or CSS-root snippet at all. Tally must PASS, script must exit 0.
assert "pass-wiring-no-wrapper exits 0 with PASS tally" \
  "$FIXTURES/pass-wiring-no-wrapper/produced-skill" \
  0 "WIRING_NOT_SYNTHESIZED=PASS"

# Test 11: WIRING_NOT_SYNTHESIZED fail-fixture — Setup section embeds a
# JSX wrapper with no citation. Tally must FAIL, script must exit non-zero,
# and the failure message must name the SKILL.md line of the first wrapper.
assert "fail-wiring-uncited exits non-zero with FAIL tally" \
  "$FIXTURES/fail-wiring-uncited/produced-skill" \
  1 "WIRING_NOT_SYNTHESIZED=FAIL" \
  "fail-wiring-uncited/produced-skill/SKILL.md:17"

# Test 12: meta-mode skips WIRING_NOT_SYNTHESIZED entirely. Running the
# script against the meta-skill itself must NOT emit the tally line — the
# check is produced-skill-mode only because the meta-skill's worked examples
# ARE the synthesis source (checking them would be circular).
out_meta_self="$(bash "$CHECK" "$SKILL_DIR" 2>&1)" || true
if grep -qE '^WIRING_NOT_SYNTHESIZED=' <<<"$out_meta_self"; then
  echo "FAIL  meta-mode must NOT emit WIRING_NOT_SYNTHESIZED tally"
  echo "  --- script output ---"
  echo "$out_meta_self" | sed 's/^/  /'
  echo "  ---"
  FAIL=$((FAIL + 1))
else
  echo "PASS  meta-mode skips WIRING_NOT_SYNTHESIZED"
  PASS=$((PASS + 1))
fi

# Test 13: produced-mode DOES emit WIRING_NOT_SYNTHESIZED. Re-use the
# on-the-fly produced fixture from Test 4 — its SKILL.md has no Setup
# section so the check is a no-op (PASS), but the tally line MUST appear.
if grep -qE '^WIRING_NOT_SYNTHESIZED=' <<<"$out_produced"; then
  echo "PASS  produced-mode emits WIRING_NOT_SYNTHESIZED tally"
  PASS=$((PASS + 1))
else
  echo "FAIL  produced-mode must emit WIRING_NOT_SYNTHESIZED tally"
  echo "  --- script output ---"
  echo "$out_produced" | sed 's/^/  /'
  echo "  ---"
  FAIL=$((FAIL + 1))
fi

# Test 14: EXAMPLES_INDEX pass-fixture — produced skill ships 3 composition
# exemplars plus an index that references each by basename. Tally must PASS,
# script must exit 0.
assert "pass-multi-example exits 0 with PASS tally" \
  "$FIXTURES/pass-multi-example/produced-skill" \
  0 "EXAMPLES_INDEX=PASS"

# Test 15: EXAMPLES_INDEX fail-fixture — produced skill ships 2 example files
# but no index.md. Tally must FAIL, script must exit non-zero, and the failure
# message must name the missing index path.
assert "fail-missing-examples-index exits non-zero with FAIL tally" \
  "$FIXTURES/fail-missing-examples-index/produced-skill" \
  1 "EXAMPLES_INDEX=FAIL" \
  "references/examples/index.md is missing"

# Test 16: meta-mode skips EXAMPLES_INDEX entirely. The produced-mode-only
# check must NOT emit the tally line when run against the meta-skill itself.
if grep -qE '^EXAMPLES_INDEX=' <<<"$out_meta_self"; then
  echo "FAIL  meta-mode must NOT emit EXAMPLES_INDEX tally"
  echo "  --- script output ---"
  echo "$out_meta_self" | sed 's/^/  /'
  echo "  ---"
  FAIL=$((FAIL + 1))
else
  echo "PASS  meta-mode skips EXAMPLES_INDEX"
  PASS=$((PASS + 1))
fi

# Test 17: produced-mode emits EXAMPLES_INDEX even when references/examples/
# is absent (re-use the on-the-fly produced fixture from Test 4 — no examples
# dir, so the check is a no-op PASS, but the tally line MUST appear).
if grep -qE '^EXAMPLES_INDEX=' <<<"$out_produced"; then
  echo "PASS  produced-mode emits EXAMPLES_INDEX tally"
  PASS=$((PASS + 1))
else
  echo "FAIL  produced-mode must emit EXAMPLES_INDEX tally"
  echo "  --- script output ---"
  echo "$out_produced" | sed 's/^/  /'
  echo "  ---"
  FAIL=$((FAIL + 1))
fi

# Test 18: FOUNDATIONS_INDEX pass-fixture — produced skill ships 3 foundation
# pages plus an index that references each by basename. Tally must PASS,
# script must exit 0.
assert "pass-multi-foundation-pages exits 0 with PASS tally" \
  "$FIXTURES/pass-multi-foundation-pages/produced-skill" \
  0 "FOUNDATIONS_INDEX=PASS"

# Test 19: FOUNDATIONS_INDEX fail-fixture — produced skill ships 2 foundation
# files but no index.md. Tally must FAIL, script must exit non-zero, and the
# failure message must name the missing index path.
assert "fail-missing-foundations-index exits non-zero with FAIL tally" \
  "$FIXTURES/fail-missing-foundations-index/produced-skill" \
  1 "FOUNDATIONS_INDEX=FAIL" \
  "references/foundations/index.md is missing"

# Test 20: meta-mode skips FOUNDATIONS_INDEX entirely. The produced-mode-only
# check must NOT emit the tally line when run against the meta-skill itself.
if grep -qE '^FOUNDATIONS_INDEX=' <<<"$out_meta_self"; then
  echo "FAIL  meta-mode must NOT emit FOUNDATIONS_INDEX tally"
  echo "  --- script output ---"
  echo "$out_meta_self" | sed 's/^/  /'
  echo "  ---"
  FAIL=$((FAIL + 1))
else
  echo "PASS  meta-mode skips FOUNDATIONS_INDEX"
  PASS=$((PASS + 1))
fi

# Test 21: produced-mode emits FOUNDATIONS_INDEX even when
# references/foundations/ is absent (re-use Test 4's on-the-fly produced
# fixture — no foundations dir, so the check is a no-op PASS, but the tally
# line MUST appear).
if grep -qE '^FOUNDATIONS_INDEX=' <<<"$out_produced"; then
  echo "PASS  produced-mode emits FOUNDATIONS_INDEX tally"
  PASS=$((PASS + 1))
else
  echo "FAIL  produced-mode must emit FOUNDATIONS_INDEX tally"
  echo "  --- script output ---"
  echo "$out_produced" | sed 's/^/  /'
  echo "  ---"
  FAIL=$((FAIL + 1))
fi

echo
echo "PASSED=$PASS FAILED=$FAIL"
[[ "$FAIL" -eq 0 ]]
