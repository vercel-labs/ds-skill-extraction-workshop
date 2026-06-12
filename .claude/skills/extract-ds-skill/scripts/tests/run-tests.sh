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
META_SKILL_ROOT="$(cd -- "$SKILL_DIR/.." && pwd)"
CHECK="$SKILL_DIR/check-skill-docs.sh"
COVERAGE="$SKILL_DIR/check-token-coverage.sh"
FIXTURES="$SCRIPT_DIR/fixtures"

[[ -x "$CHECK" || -f "$CHECK" ]] || { echo "error: check script missing: $CHECK" >&2; exit 2; }
[[ -x "$COVERAGE" || -f "$COVERAGE" ]] || { echo "error: coverage script missing: $COVERAGE" >&2; exit 2; }
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

# Like assert(), but runs the check from a given working directory. The emitted-
# handoff scan in HANDOFF_COMPLETENESS resolves .extract-ds-skill-scratch/handoffs/
# relative to cwd (the worktree root during a real run), so exercising that path
# requires controlling cwd. Usage:
#   assert_cwd <name> <cwd> <skill-path> <expected-exit> <tally-grep> [fail-substring]
assert_cwd() {
  local name="$1" cwd="$2" fixture="$3" want_exit="$4" tally="$5" fail_sub="${6:-}"
  local out got_exit=0
  out="$(cd "$cwd" && bash "$CHECK" "$fixture" 2>&1)" || got_exit=$?
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
trap 'rm -rf "$PRODUCED_TMP" "${CLAIMS_TMP:-}" "${PROBE_TMP:-}"' EXIT
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

# ---------- check-token-coverage.sh fixtures ----------
#
# These exercise the standalone token-coverage script. Each fixture pairs a
# fake DS package root (with token-defining CSS files under dist/css/) with
# a fake produced-skill that consumes some var(--X) tokens. The script asserts
# the lifted @import set covers every consumed token.

# Run the coverage script against (ds-pkg, target) and assert exit code, tally,
# and optional failure substring. Usage:
#   assert_coverage <name> <ds-pkg> <target> <want-exit> <tally-grep> [fail-sub]
assert_coverage() {
  local name="$1" ds="$2" target="$3" want_exit="$4" tally="$5" fail_sub="${6:-}"
  local out got_exit=0
  out="$(bash "$COVERAGE" "$ds" "$target" 2>&1)" || got_exit=$?
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

# Test 22: scoped-css-complete — the lifted @import set includes the file
# that defines every consumed var(--X). TOKEN_COVERAGE must report PASS and
# the script must exit 0.
assert_coverage "scoped-css-complete exits 0 with PASS tally" \
  "$FIXTURES/scoped-css-complete/ds-pkg" \
  "$FIXTURES/scoped-css-complete/produced-skill" \
  0 "TOKEN_COVERAGE=PASS"

# Test 23: scoped-css-incomplete — the exemplar consumes --borderRadius-large
# but the lifted @import set omits the radius.css file that defines it.
# TOKEN_COVERAGE must report FAIL, exit non-zero, and the failure row must name
# the consumed var, the defining @pkg path, and the "NOT imported" clause.
assert_coverage "scoped-css-incomplete exits non-zero with FAIL tally" \
  "$FIXTURES/scoped-css-incomplete/ds-pkg" \
  "$FIXTURES/scoped-css-incomplete/produced-skill" \
  1 "TOKEN_COVERAGE=FAIL" \
  "MISSING: --borderRadius-large consumed in"
assert_coverage "scoped-css-incomplete names the defining package path" \
  "$FIXTURES/scoped-css-incomplete/ds-pkg" \
  "$FIXTURES/scoped-css-incomplete/produced-skill" \
  1 "TOKEN_COVERAGE=FAIL" \
  "defined in @example/tokens/dist/css/functional/size/radius.css, NOT imported by any lifted CSS file"

# Test 24: tailwind-shaped — zero var(--X) consumption anywhere. The script
# must NOOP cleanly and exit 0; no MISSING rows must appear.
assert_coverage "tailwind-shaped exits 0 with NOOP tally" \
  "$FIXTURES/tailwind-shaped/ds-pkg" \
  "$FIXTURES/tailwind-shaped/produced-skill" \
  0 "TOKEN_COVERAGE=NOOP"

# Test 25: scoped-css-symlinked — ds-pkg passed as a SYMLINK (the shape
# pnpm uses: node_modules/@scope/pkg → ../.pnpm/<scope+pkg>@<ver>/...). The
# definer-file lookup must follow the symlink given as the directory
# argument. BSD `grep -r` does NOT follow such symlinks (returns zero
# matches → false "NOT DEFINED" rows); `grep -R` does. GNU grep treats both
# identically. This test is the regression guard for that one-character fix
# in check-token-coverage.sh; with the buggy `-r`, TOKEN_COVERAGE would
# report FAIL with "NOT DEFINED" instead of PASS.
assert_coverage "scoped-css-symlinked (pnpm-style) exits 0 with PASS tally" \
  "$FIXTURES/scoped-css-symlinked/ds-pkg-link" \
  "$FIXTURES/scoped-css-symlinked/produced-skill" \
  0 "TOKEN_COVERAGE=PASS"

# Test 30 (PASS counter): pass-token-coverage — scratch-mode fixture exercises
# check-token-coverage.sh end-to-end through the line-147 extract_imports call.
# Regression guard for the awk -v pat= escape bug where backslash-escaped parens
# in the heading pattern silently failed on macOS BWK awk (PRD-token-coverage-portability.md).
assert_coverage "pass-token-coverage exits 0 with PASS tally" \
  "$FIXTURES/pass-token-coverage/ds-pkg" \
  "$FIXTURES/pass-token-coverage/scratch" \
  0 "TOKEN_COVERAGE=PASS"

# Test 31 (PASS counter): fail-token-coverage — same scratch-mode shape with a
# non-covering @import. Guards against the pattern relaxation in Change A
# accidentally over-pass-matching.
assert_coverage "fail-token-coverage exits non-zero with FAIL tally" \
  "$FIXTURES/fail-token-coverage/ds-pkg" \
  "$FIXTURES/fail-token-coverage/scratch" \
  1 "TOKEN_COVERAGE=FAIL" \
  "MISSING: --surface-default"

# Test 26: live meta-skill self-check — every phase close in the real
# extract-ds-skill/SKILL.md emits a handoff doc, and discovery/validate/persist
# each carry the per-phase template. HANDOFF_EMISSION must report PASS.
# Asserts the check fires against the canonical target (regression guard for
# anyone editing the meta-skill files and forgetting the handoff prose).
assert "live extract-ds-skill HANDOFF_EMISSION PASSES" \
  "$META_SKILL_ROOT" \
  0 "HANDOFF_EMISSION=PASS"

# Test 27: fail-handoff-emission fixture — SKILL.md carries the three-phase
# structure (so the check fires) but lacks the resume-detect pre-checks and
# the per-phase handoff-write instructions. HANDOFF_EMISSION must report FAIL
# and the failure message must name SKILL.md and point at the state/handoff-skipped
# slug.
assert "fail-handoff-emission exits non-zero with FAIL tally" \
  "$FIXTURES/fail-handoff-emission/extract-ds-skill" \
  1 "HANDOFF_EMISSION=FAIL" \
  "state/handoff-skipped"

# Test 29: fail-inline-phase-transition fixture — SKILL.md carries the
# three-phase structure, the per-phase handoff-write prose (phase-N.md
# mentions), and the dryrun-label labeling section, so the
# state/handoff-skipped checks pass. What it lacks is the EXIT + validate:
# / persist: cutoff prose in Phase 1/2 close and the resume-parameter
# keywords globally. HANDOFF_EMISSION must report FAIL and the failure
# messages must cite state/inline-phase-transition.
assert "fail-inline-phase-transition exits non-zero with FAIL tally" \
  "$FIXTURES/fail-inline-phase-transition/extract-ds-skill" \
  1 "HANDOFF_EMISSION=FAIL" \
  "state/inline-phase-transition"

# Test 28: pass-fixture (pass-no-hardcoded-paths) without three-phase structure
# does NOT emit a HANDOFF_EMISSION tally — the SKILL.md portion is guarded on
# "## Phase 1: Discovery summary" so minimal meta-mode fixtures skip the check
# rather than fail. This is the "partial skeleton" posture documented inline
# in check-skill-docs.sh.
out_no_phase="$(bash "$CHECK" "$FIXTURES/pass-no-hardcoded-paths/extract-ds-skill" 2>&1)" || true
if grep -qE '^HANDOFF_EMISSION=FAIL' <<<"$out_no_phase"; then
  echo "FAIL  partial-skeleton fixture must NOT emit HANDOFF_EMISSION=FAIL"
  echo "  --- script output ---"
  echo "$out_no_phase" | sed 's/^/  /'
  echo "  ---"
  FAIL=$((FAIL + 1))
else
  echo "PASS  partial-skeleton fixture skips HANDOFF_EMISSION"
  PASS=$((PASS + 1))
fi

# Test 29: reexport-tier-present fixture — produced skill carrying the new
# `## Other re-exports` section in components.md must pass the post-emit shape
# check. Locks the Change-D-part-2 contract from PRD-extraction-completeness:
# a populated re-export tier is a valid shape, not a regression.
assert "reexport-tier-present fixture passes shape checks" \
  "$FIXTURES/reexport-tier-present/produced-skill" \
  0 "CHECK_RESULT=PASS"

# ---------- LEXICAL_DENY_LIST fixtures (meta-mode) ----------
#
# The meta-skill's own files must contain zero case-insensitive occurrences
# of the DS-distinctive deny-listed terms (one DS vendor, its host product,
# its icon set, and its distinctive component names). The check is part of
# the standard meta-mode audit, scans every file except scripts/tests/, and
# has NO illustrative-block carve-out. See check-skill-docs.sh section 14.

# Test: seeded violation — the fixture's SKILL.md mentions a deny-listed
# component name in prescription text. Tally must FAIL, exit non-zero, and
# the failure message must name the term and the file:line.
assert "fail-lexical-deny-list exits non-zero with FAIL tally" \
  "$FIXTURES/fail-lexical-deny-list/extract-ds-skill" \
  1 "LEXICAL_DENY_LIST=FAIL" \
  "deny-listed term 'blankslate'"
assert "fail-lexical-deny-list names the offending file and line" \
  "$FIXTURES/fail-lexical-deny-list/extract-ds-skill" \
  1 "LEXICAL_DENY_LIST=FAIL" \
  "fail-lexical-deny-list/extract-ds-skill/SKILL.md:10"

# Test: live meta-skill self-check — the real extractor tree is clean of
# deny-listed terms. Regression guard for anyone reintroducing DS-specific
# vocabulary into SKILL.md, references/, or scripts/.
assert "live extract-ds-skill LEXICAL_DENY_LIST PASSES" \
  "$META_SKILL_ROOT" \
  0 "LEXICAL_DENY_LIST=PASS"

# Test: produced-mode skips LEXICAL_DENY_LIST entirely — a produced DS skill
# legitimately names its own DS everywhere; the deny-list gates only the
# extractor's own files.
if grep -qE '^LEXICAL_DENY_LIST=' <<<"$out_produced"; then
  echo "FAIL  produced-mode must NOT emit LEXICAL_DENY_LIST tally"
  echo "  --- script output ---"
  echo "$out_produced" | sed 's/^/  /'
  echo "  ---"
  FAIL=$((FAIL + 1))
else
  echo "PASS  produced-mode skips LEXICAL_DENY_LIST"
  PASS=$((PASS + 1))
fi

# ---------- HANDOFF_COMPLETENESS fixtures (meta-mode) ----------
#
# The Phase 1 handoff must carry component shape (`## Components proposed`) and a
# non-hedged out-of-scope verdict (no `if confirmed`). The check scans the fenced
# template anchor in references/discovery.md AND any emitted handoff under
# .extract-ds-skill-scratch/handoffs/ (whole-file, skipped when absent). See
# PRD-phase-1-handoff-completeness.md and references/anti-patterns.md
# (state/handoff-missing-component-shape, state/handoff-out-of-scope-deferred).

# Test 32: pass — template carries `## Components proposed`.
assert "handoff-with-components exits 0 with PASS tally" \
  "$FIXTURES/handoff-with-components/extract-ds-skill" \
  0 "HANDOFF_COMPLETENESS=PASS"

# Test 33: pass — template carries the optional `## Known exclusions` section
# alongside `## Components proposed`. Locks the optional section as a valid shape.
assert "handoff-with-exclusions exits 0 with PASS tally" \
  "$FIXTURES/handoff-with-exclusions/extract-ds-skill" \
  0 "HANDOFF_COMPLETENESS=PASS"

# Test 34: pass — foundation sub-page tagged [out-of-scope: sibling-copy-skill]
# with no "if confirmed" hedge.
assert "foundation-out-of-scope exits 0 with PASS tally" \
  "$FIXTURES/foundation-out-of-scope/extract-ds-skill" \
  0 "HANDOFF_COMPLETENESS=PASS"

# Test 35: fail — `## Decisions` present but `## Components proposed` absent.
# Tally must FAIL, exit non-zero, message must name the slug.
assert "fail-handoff-missing-components exits non-zero with FAIL tally" \
  "$FIXTURES/fail-handoff-missing-components/extract-ds-skill" \
  1 "HANDOFF_COMPLETENESS=FAIL" \
  "state/handoff-missing-component-shape"

# Test 36: fail — template anchor contains the "if confirmed" hedge.
# Tally must FAIL, exit non-zero, message must name the slug.
assert "fail-handoff-if-confirmed exits non-zero with FAIL tally" \
  "$FIXTURES/fail-handoff-if-confirmed/extract-ds-skill" \
  1 "HANDOFF_COMPLETENESS=FAIL" \
  "state/handoff-out-of-scope-deferred"

# Test 37: live meta-skill self-check — the real references/discovery.md handoff
# template satisfies both completeness gates. Regression guard for anyone editing
# the handoff template and dropping component shape or reintroducing the hedge.
assert "live extract-ds-skill HANDOFF_COMPLETENESS PASSES" \
  "$META_SKILL_ROOT" \
  0 "HANDOFF_COMPLETENESS=PASS"

# ---------- HANDOFF_COMPLETENESS: emitted-handoff scan (cwd-relative) ----------
#
# The gate also scans actual emitted handoffs under
# .extract-ds-skill-scratch/handoffs/ (resolved relative to cwd). These tests
# point the check at the live meta-skill (clean template) but from a temp cwd
# holding a planted handoff, so the only FAIL source is the emitted document.
# Handoff bodies are placeholder-only — no design system is named.
EMIT_TMP="$(mktemp -d)"

# Test 38: emitted handoff has `## Decisions` but no `## Components proposed`.
mkdir -p "$EMIT_TMP/missing/.extract-ds-skill-scratch/handoffs"
cat >"$EMIT_TMP/missing/.extract-ds-skill-scratch/handoffs/phase-1.md" <<'EOF'
# Phase 1 handoff — <slug>

## Decisions (irrecoverable from codebase)

- **Slug**: `<slug>`
EOF
assert_cwd "emitted handoff missing components fails the gate" \
  "$EMIT_TMP/missing" "$META_SKILL_ROOT" \
  1 "HANDOFF_COMPLETENESS=FAIL" \
  "state/handoff-missing-component-shape"

# Test 39: emitted handoff carries the `if confirmed` hedge (with components).
mkdir -p "$EMIT_TMP/hedge/.extract-ds-skill-scratch/handoffs"
cat >"$EMIT_TMP/hedge/.extract-ds-skill-scratch/handoffs/phase-1.md" <<'EOF'
# Phase 1 handoff — <slug>

## Decisions (irrecoverable from codebase)

- **Slug**: `<slug>`
- **Foundation docs**: `<root-url>` — sub-pages: <slug> (route to a sibling skill in Phase 2 if confirmed)

## Components proposed

- **<Component1>** — <one-line description>
EOF
assert_cwd "emitted handoff with 'if confirmed' fails the gate" \
  "$EMIT_TMP/hedge" "$META_SKILL_ROOT" \
  1 "HANDOFF_COMPLETENESS=FAIL" \
  "state/handoff-out-of-scope-deferred"

# Test 40: well-formed emitted handoff — components present, no hedge → PASS.
# Proves the emitted-handoff scan does not false-positive on a valid document.
mkdir -p "$EMIT_TMP/ok/.extract-ds-skill-scratch/handoffs"
cat >"$EMIT_TMP/ok/.extract-ds-skill-scratch/handoffs/phase-1.md" <<'EOF'
# Phase 1 handoff — <slug>

## Decisions (irrecoverable from codebase)

- **Slug**: `<slug>`
- **Foundation docs**: `<root-url>` — sub-pages: <slug> [in-scope], <slug> [out-of-scope: sibling-<topic>-skill]

## Components proposed

- **<Component1>** — <one-line description>
EOF
assert_cwd "well-formed emitted handoff passes the gate" \
  "$EMIT_TMP/ok" "$META_SKILL_ROOT" \
  0 "HANDOFF_COMPLETENESS=PASS"

rm -rf "$EMIT_TMP"

# ---------- SHELL_INVARIANTS fixtures (produced-mode) ----------
#
# The SHELL_INVARIANTS produced-mode check promotes Phase 2's shell-invariant
# extraction floor to a post-emit gate. Setup is descriptive (read once at
# greenfield wiring time); `## Hard rules` is the contract checked at every
# emit. When Setup ships a wiring construct (provider mount, `### Companion CSS`
# subheading, or `### Foundation wiring` subheading), the produced SKILL.md
# must emit at least one Hard Rule whose body matches shell vocabulary
# (body|root|html|provider|wrap|theme|color-scheme|surface) AND references a
# token shape (`var(--...)` or the `<surface-*>` placeholder). Plus a cross-
# check: each cited `shell/<slug>` resolves to a row in produced anti-patterns.md.
# See PRD-shell-invariants.md and references/anti-patterns.md Layer C
# `shell/unpainted-body`, `shell/mode-attribute-no-theme-import`,
# `shell/provider-missing-content-wrap`.

# Test 41: pass — Setup ships root-entry-file + Companion CSS; Hard Rules has
# rules matching shell vocab + surface token; produced anti-patterns.md has
# Layer B rows for the cited shell/<slug>s. SHELL_INVARIANTS must PASS.
assert "pass-skill-with-shell-invariants exits 0 with PASS tally" \
  "$FIXTURES/pass-skill-with-shell-invariants/produced-skill" \
  0 "SHELL_INVARIANTS=PASS"

# Test 42: pass — Setup ships only a `### Foundation wiring` subheading (no
# reference-project code block, no Companion CSS). Shell-invariant Hard Rule
# is still promoted; cited shell/<slug> resolves in anti-patterns.md.
# SHELL_INVARIANTS must PASS — the foundation-wiring-only path produces the
# same invariant coverage as the reference-project path.
assert "pass-skill-with-foundation-only-wiring exits 0 with PASS tally" \
  "$FIXTURES/pass-skill-with-foundation-only-wiring/produced-skill" \
  0 "SHELL_INVARIANTS=PASS"

# Test 43: fail — Setup ships a complete root-entry-file + Companion CSS
# (trigger fires) but `## Hard rules` contains zero lines matching shell vocab
# + token shape. SHELL_INVARIANTS must FAIL and the count-assertion message
# must name the three pre-seeded shell/ slugs so the user knows which to
# promote.
assert "fail-skill-shell-invariants-absent exits non-zero with FAIL tally" \
  "$FIXTURES/fail-skill-shell-invariants-absent/produced-skill" \
  1 "SHELL_INVARIANTS=FAIL" \
  "shell/unpainted-body"

# Test 44: fail — Setup sets a `data-*-color-scheme` attribute on `<html>` in
# the root-entry-file code block; Hard Rules cites `shell/mode-attribute-no-
# theme-import` but no Layer B row appears in produced anti-patterns.md.
# Cross-check must FAIL and name the unresolved slug.
assert "fail-skill-mode-attribute-orphan exits non-zero with FAIL tally" \
  "$FIXTURES/fail-skill-mode-attribute-orphan/produced-skill" \
  1 "SHELL_INVARIANTS=FAIL" \
  "shell/mode-attribute-no-theme-import"

# ---------- SLATE_COVERAGE fixtures (produced-mode) ----------
#
# The full-coverage rule: every component on the confirmed slate gets its own
# contract section. The produced SKILL.md declares the slate under
# `## Component slate` (per references/skill-template.md); the produced-mode
# SLATE_COVERAGE check cross-checks each declared name against
# references/components/<kebab-name>.md (per-file mode) or a `## <Name>`
# heading in references/components.md (single-file mode). An absent section
# NOOPs (produced skills predating the contract); a declared-but-uncovered
# component FAILs. See references/component-extraction.md (Full-coverage rule)
# and references/anti-patterns.md component/slate-contract-missing.

# Test 49: pass — 3-component slate; Button resolves per-file, FormControl
# exercises kebab-casing (form-control.md), Stack resolves as a `## Stack`
# heading in components.md (single-file path). SLATE_COVERAGE must PASS and
# the script must exit 0.
assert "pass-slate-coverage exits 0 with PASS tally" \
  "$FIXTURES/pass-slate-coverage/produced-skill" \
  0 "SLATE_COVERAGE=PASS"

# Test 50: fail — the slate declares Tooltip but no contract section exists
# for it (no per-file, no single-file heading). SLATE_COVERAGE must FAIL,
# exit non-zero, and the message must name the uncovered component and the
# slug.
assert "fail-slate-coverage exits non-zero with FAIL tally" \
  "$FIXTURES/fail-slate-coverage/produced-skill" \
  1 "SLATE_COVERAGE=FAIL" \
  "slate component 'Tooltip' has no contract section"
assert "fail-slate-coverage names the slug" \
  "$FIXTURES/fail-slate-coverage/produced-skill" \
  1 "SLATE_COVERAGE=FAIL" \
  "component/slate-contract-missing"

# Test 51: produced-mode emits SLATE_COVERAGE even when SKILL.md carries no
# `## Component slate` section (re-use Test 4's on-the-fly produced fixture —
# the check NOOPs but the tally line MUST appear, mirroring TOKEN_COVERAGE).
if grep -qE '^SLATE_COVERAGE=' <<<"$out_produced"; then
  echo "PASS  produced-mode emits SLATE_COVERAGE tally"
  PASS=$((PASS + 1))
else
  echo "FAIL  produced-mode must emit SLATE_COVERAGE tally"
  echo "  --- script output ---"
  echo "$out_produced" | sed 's/^/  /'
  echo "  ---"
  FAIL=$((FAIL + 1))
fi

# ---------- DESIGN_CRAFT fixtures (produced-mode) ----------
#
# Every produced skill ships references/design-craft.md verbatim from the
# meta-skill's assets/design-craft.md (scaffold.sh cp; never regenerated) plus
# the fixed routing-table row. check-skill-docs.sh check DESIGN_CRAFT asserts
# routing row + byte-identity when the file is present and SKIPs when absent
# (the Phase 1 opt-out posture). Pass fixtures ship the file as a SYMLINK to
# the canonical asset so canonical edits never desync the fixtures. See
# references/persist.md (Design-craft materialization) and
# references/anti-patterns.md craft/regenerated-not-copied.

# Test 54: pass — craft file symlinked to the canonical asset (byte-identical
# by construction) + routing row present. DESIGN_CRAFT must PASS, exit 0.
assert "pass-design-craft-verbatim exits 0 with PASS tally" \
  "$FIXTURES/pass-design-craft-verbatim/produced-skill" \
  0 "DESIGN_CRAFT=PASS"

# Test 55: fail — craft file present and routed but paraphrased during persist
# (drifted from the canonical asset). The byte-diff must FAIL and the failure
# message must cite the craft/regenerated-not-copied slug.
assert "fail-design-craft-drift exits non-zero with FAIL tally" \
  "$FIXTURES/fail-design-craft-drift/produced-skill" \
  1 "DESIGN_CRAFT=FAIL" \
  "craft/regenerated-not-copied"

# Test 56: absent file SKIPs, never FAILs — re-use Test 4's on-the-fly produced
# fixture (which ships no craft file): the tally must be SKIP (opt-out posture),
# so a legitimate Phase 1 opt-out never blocks the closing message.
if grep -qE '^DESIGN_CRAFT=SKIP' <<<"$out_produced"; then
  echo "PASS  produced-mode reports DESIGN_CRAFT=SKIP when the file is absent"
  PASS=$((PASS + 1))
else
  echo "FAIL  produced-mode must report DESIGN_CRAFT=SKIP when the file is absent"
  echo "  --- script output ---"
  echo "$out_produced" | sed 's/^/  /'
  echo "  ---"
  FAIL=$((FAIL + 1))
fi

# Test 52: meta-mode skips SLATE_COVERAGE entirely — the slate declaration is
# a produced-skill contract; the meta-skill has no component slate.
if grep -qE '^SLATE_COVERAGE=' <<<"$out_meta_self"; then
  echo "FAIL  meta-mode must NOT emit SLATE_COVERAGE tally"
  echo "  --- script output ---"
  echo "$out_meta_self" | sed 's/^/  /'
  echo "  ---"
  FAIL=$((FAIL + 1))
else
  echo "PASS  meta-mode skips SLATE_COVERAGE"
  PASS=$((PASS + 1))
fi

# Test 57: meta-mode skips DESIGN_CRAFT entirely. The check is produced-mode
# only — the meta-skill ships the canonical asset, not a copy of it.
if grep -qE '^DESIGN_CRAFT=' <<<"$out_meta_self"; then
  echo "FAIL  meta-mode must NOT emit DESIGN_CRAFT tally"
  echo "  --- script output ---"
  echo "$out_meta_self" | sed 's/^/  /'
  echo "  ---"
  FAIL=$((FAIL + 1))
else
  echo "PASS  meta-mode skips DESIGN_CRAFT"
  PASS=$((PASS + 1))
fi

# Test 53: live meta-skill self-check — the full-coverage rule prose exists in
# references/component-extraction.md and the '- **Component slate**' bullet
# exists in references/skill-template.md. Regression guard for anyone editing
# either file and dropping the rule the SLATE_COVERAGE check keys off.
assert "live extract-ds-skill FULL_COVERAGE_RULE_PRESENT PASSES" \
  "$META_SKILL_ROOT" \
  0 "FULL_COVERAGE_RULE_PRESENT=PASS"

# ---------- validate.sh claims-file fixtures ----------
#
# The claims-file contract (references/validate.md, Claims file contract):
# positive prop claims become typed assignments in the generated probe,
# negative claims become @ts-expect-error lines, PATH claims run test -e.
# These tests build a self-contained fixture env on the fly: a fake DS
# package with a known prop-type surface, plus symlinks to the repo-root
# typescript install so `pnpm tsc` resolves from the fixture cwd. The env
# lives INSIDE the repo tree so react/@types/react resolve by walking up.
#
# Requires a repo-root `pnpm install`. When typescript/@types/react are
# absent the four tests are SKIPPED LOUDLY (counted in the summary) rather
# than silently passed — a silent no-op here is the green-but-broken trap.
VALIDATE="$SKILL_DIR/validate.sh"
REPO_ROOT="$(cd -- "$META_SKILL_ROOT/../../.." && pwd)"
SKIPPED=0

# Run validate.sh from the fixture cwd against a claims file and assert exit
# code, tally line, optional output substring. Package and apis file default to
# the fake-ds fixture; override via AV_PKG / AV_APIS globals. Usage:
#   assert_validate <name> <claims-file> <want-exit> <tally-grep> [out-substring]
assert_validate() {
  local name="$1" claims="$2" want_exit="$3" tally="$4" out_sub="${5:-}"
  local pkg="${AV_PKG:-fake-ds}" apis="${AV_APIS:-apis.txt}"
  local out got_exit=0
  out="$( (cd "$CLAIMS_TMP" && bash "$VALIDATE" "$pkg" "$apis" --claims "$claims") 2>&1)" || got_exit=$?
  local err=""
  if [[ "$got_exit" -ne "$want_exit" ]]; then
    err="  exit got=$got_exit want=$want_exit"
  fi
  if ! grep -qE "^${tally}$" <<<"$out"; then
    err+=$'\n  tally line not found: '"$tally"
  fi
  if [[ -n "$out_sub" ]] && ! grep -qF "$out_sub" <<<"$out"; then
    err+=$'\n  expected output substring not found: '"$out_sub"
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

if [[ -e "$REPO_ROOT/node_modules/.bin/tsc" && -d "$REPO_ROOT/node_modules/@types/react" ]]; then
  CLAIMS_TMP="$(mktemp -d "$SCRIPT_DIR/.claims-probe-tmp.XXXXXX")"
  mkdir -p "$CLAIMS_TMP/node_modules/fake-ds" "$CLAIMS_TMP/node_modules/.bin"
  printf '{ "name": "claims-probe-fixture", "private": true }\n' >"$CLAIMS_TMP/package.json"
  printf '{ "name": "fake-ds", "version": "1.0.0", "main": "index.js", "types": "index.d.ts" }\n' \
    >"$CLAIMS_TMP/node_modules/fake-ds/package.json"
  cat >"$CLAIMS_TMP/node_modules/fake-ds/index.d.ts" <<'EOF'
import * as React from 'react';
export declare const Button: React.FC<{ variant?: 'primary' | 'secondary'; disabled?: boolean }>;
export declare const Stack: React.FC<{ gap?: 'sm' | 'md' | 'lg' }>;
EOF
  : >"$CLAIMS_TMP/node_modules/fake-ds/index.js"
  # pnpm exec needs a manifest + a local .bin/tsc; link the repo install.
  ln -sfn "$(cd "$REPO_ROOT/node_modules/typescript" && pwd -P)" "$CLAIMS_TMP/node_modules/typescript"
  ln -sfn ../typescript/bin/tsc "$CLAIMS_TMP/node_modules/.bin/tsc"
  printf 'Button\nStack\n' >"$CLAIMS_TMP/apis.txt"

  # Test 45: well-formed claims file (positive + negative + path + url) —
  # the generated probe typechecks, test -e passes, url is counted but
  # skipped. VALIDATE_RESULT=PASS, exit 0, tally carries all four counts.
  printf 'Button.variant=primary\nNEGATIVE:Stack.gap=xs\nPATH:node_modules/fake-ds/index.d.ts\nURL:https://example.invalid/docs\n' \
    >"$CLAIMS_TMP/claims-pass.txt"
  assert_validate "claims fixture (pos+neg+path+url) passes" \
    claims-pass.txt 0 "VALIDATE_RESULT=PASS" \
    "CLAIMS_CHECKED=positive:1 negative:1 path:1 url-skipped:1"

  # Test 46: seeded FALSE POSITIVE claim — 'tertiary' is not in Button's
  # variant union. The typed assignment must break the typecheck.
  printf 'Button.variant=tertiary\n' >"$CLAIMS_TMP/claims-false-pos.txt"
  assert_validate "seeded false positive claim breaks the typecheck" \
    claims-false-pos.txt 1 "FAIL_REASON=typecheck" "error TS2322"

  # Test 47: seeded FALSE NEGATIVE claim — 'secondary' IS valid for
  # Button.variant, so the @ts-expect-error directive goes unused (TS2578)
  # and the probe fails. This is the upstream-type-widening guard.
  printf 'NEGATIVE:Button.variant=secondary\n' >"$CLAIMS_TMP/claims-false-neg.txt"
  assert_validate "seeded false negative claim fails via @ts-expect-error" \
    claims-false-neg.txt 1 "FAIL_REASON=typecheck" "TS2578"

  # Test 48: seeded missing node_modules/ path — test -e fails, the miss is
  # named, FAIL_REASON=path (typecheck and grep both clean).
  printf 'PATH:node_modules/fake-ds/missing.d.ts\n' >"$CLAIMS_TMP/claims-bad-path.txt"
  assert_validate "seeded missing node_modules path fails test -e" \
    claims-bad-path.txt 1 "FAIL_REASON=path" "PATH_MISS=node_modules/fake-ds/missing.d.ts"

  # Test 49: strict-exports package (issue #37) — its `exports` map omits the
  # ./package.json subpath, so require.resolve('<pkg>/package.json') throws
  # ERR_PACKAGE_PATH_NOT_EXPORTED. Phase B must fall back to resolving the main
  # entry and walking up to the package root; the nested dist/package.json
  # type-marker (name-less) must NOT be mistaken for that root. Pre-fix this
  # emitted GREP_MISS=__package_not_resolved__ → exit 1 FAIL_REASON=grep.
  mkdir -p "$CLAIMS_TMP/node_modules/fake-ds-strict/dist"
  cat >"$CLAIMS_TMP/node_modules/fake-ds-strict/package.json" <<'EOF'
{ "name": "fake-ds-strict", "version": "1.0.0",
  "exports": { ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" } } }
EOF
  printf '{ "type": "commonjs" }\n' >"$CLAIMS_TMP/node_modules/fake-ds-strict/dist/package.json"
  cat >"$CLAIMS_TMP/node_modules/fake-ds-strict/dist/index.d.ts" <<'EOF'
import * as React from 'react';
export declare const Button: React.FC<{ variant?: 'primary' | 'secondary' }>;
EOF
  : >"$CLAIMS_TMP/node_modules/fake-ds-strict/dist/index.js"
  printf 'Button\n' >"$CLAIMS_TMP/apis-strict.txt"
  printf 'Button.variant=primary\nPATH:node_modules/fake-ds-strict/dist/index.d.ts\n' \
    >"$CLAIMS_TMP/claims-strict.txt"
  AV_PKG="fake-ds-strict"; AV_APIS="apis-strict.txt"
  assert_validate "strict-exports package resolves via Phase B fallback" \
    claims-strict.txt 0 "VALIDATE_RESULT=PASS" "GREP_OK"

  # Test 50: a genuinely absent package must still emit the grep miss — the
  # fallback chain may not invent a package dir. (Typecheck fails first, so
  # FAIL_REASON=typecheck; the miss marker is asserted as an output substring.)
  printf '# no claims\n' >"$CLAIMS_TMP/claims-none.txt"
  AV_PKG="fake-ds-absent"; AV_APIS="apis-strict.txt"
  assert_validate "absent package still emits GREP_MISS=__package_not_resolved__" \
    claims-none.txt 1 "VALIDATE_RESULT=FAIL" "GREP_MISS=__package_not_resolved__ (fake-ds-absent)"
  AV_PKG=""; AV_APIS=""
else
  echo "SKIP  claims-probe tests (6) — typescript/@types/react not installed at $REPO_ROOT; run pnpm install first"
  SKIPPED=$((SKIPPED + 6))
fi

# ---------------------------------------------------------------------------
# probe-rendered.sh tests (issue #47). Deterministic — the suite never
# launches a real browser: skip paths are exercised directly and the
# browsers-unavailable path is forced via the PROBE_RENDERED_BROWSERS=absent
# test hook documented in the script header. Manifest validation runs BEFORE
# browser detection, so those assertions hold on hosts with browsers too.
# ---------------------------------------------------------------------------
PROBE="$SKILL_DIR/probe-rendered.sh"
PROBE_TMP="$(mktemp -d)"
printf -- '--color-accent | #0070f3 | node_modules/@acme/ui/dist/css/light.css:12 | html\n' \
  >"$PROBE_TMP/manifest.txt"

# assert_probe <name> <want-exit> <stdout-substring> <cmd...>
assert_probe() {
  local name="$1" want_exit="$2" want_sub="$3"
  shift 3
  local out got_exit=0
  out="$("$@" 2>&1)" || got_exit=$?
  local err=""
  if [[ "$got_exit" -ne "$want_exit" ]]; then
    err="  exit got=$got_exit want=$want_exit"
  fi
  if ! grep -qF "$want_sub" <<<"$out"; then
    err+=$'\n  expected substring not found: '"$want_sub"
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

# Test P1: no --url -> the documented no-docs-URL clean skip, exit 0.
assert_probe "probe: no docs URL skips cleanly" \
  0 "PROBE_SKIPPED=no-docs-url" \
  bash "$PROBE" --manifest "$PROBE_TMP/manifest.txt"

# Test P2: browsers forced absent -> graceful skip, exit 0, host-side
# install hint printed (the script must NEVER install browsers itself).
assert_probe "probe: browsers-unavailable skips gracefully" \
  0 "PROBE_SKIPPED=browsers-unavailable" \
  env PROBE_RENDERED_BROWSERS=absent \
  bash "$PROBE" --url "https://example.invalid/docs" --manifest "$PROBE_TMP/manifest.txt"

# Test P3: missing manifest file is a loud usage error (exit 2), even when
# browsers are absent — manifest validation precedes browser detection.
assert_probe "probe: missing manifest is a usage error" \
  2 "MANIFEST_ERROR=$PROBE_TMP/missing.txt: file not found" \
  env PROBE_RENDERED_BROWSERS=absent \
  bash "$PROBE" --url "https://example.invalid/docs" --manifest "$PROBE_TMP/missing.txt"

# Test P4: malformed manifest row (missing source-cite field) names the
# file and line, exit 2.
printf -- '--ok-token | #ffffff | a.css:1\n--bad-token | #ffffff\n' >"$PROBE_TMP/bad.txt"
assert_probe "probe: malformed manifest row names file:line" \
  2 "MANIFEST_ERROR=$PROBE_TMP/bad.txt:2" \
  env PROBE_RENDERED_BROWSERS=absent \
  bash "$PROBE" --url "https://example.invalid/docs" --manifest "$PROBE_TMP/bad.txt"

# Test P5: a manifest entry that is not a CSS custom property (no leading
# --) is rejected with the token named.
printf -- 'color-accent | #ffffff | a.css:1\n' >"$PROBE_TMP/notoken.txt"
assert_probe "probe: non-custom-property token rejected" \
  2 "token must be a CSS custom property" \
  env PROBE_RENDERED_BROWSERS=absent \
  bash "$PROBE" --url "https://example.invalid/docs" --manifest "$PROBE_TMP/notoken.txt"

# ---------------------------------------------------------------------------
# probe-rendered.sh --screenshot tests (issue #48). Same determinism rule:
# argument validation precedes browser detection, and the browsers-absent
# hook keeps the suite from ever launching a real browser.
# ---------------------------------------------------------------------------

# Test S1: screenshot mode with all required args but browsers absent ->
# graceful skip, exit 0 (args parse + validation passes first).
assert_probe "screenshot: browsers-unavailable skips gracefully" \
  0 "PROBE_SKIPPED=browsers-unavailable" \
  env PROBE_RENDERED_BROWSERS=absent \
  bash "$PROBE" --screenshot --component Button \
  --url "https://example.invalid/docs/button" \
  --produced-url "https://example.invalid/produced" \
  --out-dir "$PROBE_TMP/shots"

# Test S2: screenshot mode without --url -> the same documented no-docs-URL
# clean skip as diff mode, exit 0.
assert_probe "screenshot: no docs URL skips cleanly" \
  0 "PROBE_SKIPPED=no-docs-url" \
  env PROBE_RENDERED_BROWSERS=absent \
  bash "$PROBE" --screenshot --component Button \
  --produced-url "https://example.invalid/produced" \
  --out-dir "$PROBE_TMP/shots"

# Test S3: missing --component is a loud usage error (exit 2), even in a
# browserless sandbox.
assert_probe "screenshot: missing --component is a usage error" \
  2 "error: --component is required in screenshot mode" \
  env PROBE_RENDERED_BROWSERS=absent \
  bash "$PROBE" --screenshot \
  --url "https://example.invalid/docs/button" \
  --produced-url "https://example.invalid/produced" \
  --out-dir "$PROBE_TMP/shots"

# Test S4: missing --produced-url is a loud usage error (exit 2).
assert_probe "screenshot: missing --produced-url is a usage error" \
  2 "error: --produced-url is required in screenshot mode" \
  env PROBE_RENDERED_BROWSERS=absent \
  bash "$PROBE" --screenshot --component Button \
  --url "https://example.invalid/docs/button" \
  --out-dir "$PROBE_TMP/shots"

# Test S5: missing --out-dir is a loud usage error (exit 2) — screenshot
# mode never picks an implicit output path.
assert_probe "screenshot: missing --out-dir is a usage error" \
  2 "error: --out-dir is required in screenshot mode" \
  env PROBE_RENDERED_BROWSERS=absent \
  bash "$PROBE" --screenshot --component Button \
  --url "https://example.invalid/docs/button" \
  --produced-url "https://example.invalid/produced"

echo
if [[ "$SKIPPED" -gt 0 ]]; then
  echo "PASSED=$PASS FAILED=$FAIL SKIPPED=$SKIPPED"
else
  echo "PASSED=$PASS FAILED=$FAIL"
fi
[[ "$FAIL" -eq 0 ]]
