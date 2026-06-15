#!/usr/bin/env bash
# assemble-arm.sh <24|25>  -> prints a JSON array of per-variant rows.
# arm 24 = with-skill (components on dryrun/24-*-i1 branches, artifacts in out/)
# arm 25 = no-skill   (components in dryrun-25-*-i1 worktrees, artifacts in out-25/)
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
ARM="$1"
LABELS=(opus-effort-low opus-effort-medium opus-effort-high opus-effort-xhigh opus-effort-max sonnet-effort-low sonnet-effort-medium sonnet-effort-high sonnet-effort-xhigh sonnet-effort-max)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
COMPONENT_REL="components/showcase/pr-merged-theater.tsx"

{
for lbl in "${LABELS[@]}"; do
  if [ "$ARM" = "24" ]; then
    OUTD="dryrun-harness/out/$lbl"; armname="skill"; BR="dryrun/24-$lbl-i1"
    comp="$TMP/$lbl.comp.tsx"; git show "$BR:$COMPONENT_REL" >"$comp" 2>/dev/null || comp="-"
    [ -s "$comp" ] || comp="-"
    # color-mode wiring can live in layout.tsx OR a providers.tsx the agent invented
    lay="$TMP/$lbl.lay.tsx"; : > "$lay"
    git show "$BR:app/layout.tsx" >>"$lay" 2>/dev/null
    git show "$BR:app/providers.tsx" >>"$lay" 2>/dev/null
    [ -s "$lay" ] || lay="-"
  else
    OUTD="dryrun-harness/out-25/$lbl"; armname="no-skill"; WT=".claude/worktrees/dryrun-25-$lbl-i1"
    comp="$WT/$COMPONENT_REL"; [ -f "$comp" ] || comp="-"
    lay="$TMP/$lbl.lay.tsx"; : > "$lay"
    [ -f "$WT/app/layout.tsx" ] && cat "$WT/app/layout.tsx" >>"$lay"
    [ -f "$WT/app/providers.tsx" ] && cat "$WT/app/providers.tsx" >>"$lay"
    [ -s "$lay" ] || lay="-"
  fi
  tc=NA
  if grep -q "typecheck PASS" "$OUTD/run.log" 2>/dev/null; then tc=PASS
  elif grep -q "typecheck FAIL" "$OUTD/run.log" 2>/dev/null; then tc=FAIL; fi
  node dryrun-harness/aggregate-variant.mjs --label "$lbl" --arm "$armname" \
    --cost "$OUTD/cost-report.json" --shots "$OUTD/shots/report.json" \
    --component "$comp" --layout "$lay" --typecheck "$tc"
done
} | node -e 'const fs=require("fs");const rows=fs.readFileSync(0,"utf8").trim().split("\n").filter(Boolean).map(JSON.parse);process.stdout.write(JSON.stringify(rows,null,2))'
