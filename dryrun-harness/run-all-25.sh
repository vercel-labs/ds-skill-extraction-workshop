#!/usr/bin/env bash
# dryrun-25 (NO-SKILL): run the remaining 9 variants in waves of 3.
# sonnet-low is the pilot, run separately first. Ports 3202-3210.
# Mirrors dryrun-24's run-all.sh ordering (priciest opus builds in different waves).
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"

JOBS=(
  "opus max 3206"
  "opus low 3202"
  "sonnet medium 3207"
  "opus xhigh 3205"
  "opus medium 3203"
  "sonnet high 3208"
  "opus high 3204"
  "sonnet xhigh 3209"
  "sonnet max 3210"
)

i=0
for spec in "${JOBS[@]}"; do
  # shellcheck disable=SC2086
  set -- $spec
  echo "[$(date +%H:%M:%S)] launching $1 $2 on :$3"
  bash dryrun-harness/run-variant-25.sh "$1" "$2" "$3" >"dryrun-harness/out-25/$1-effort-$2.batch.log" 2>&1 &
  i=$((i+1))
  if [ $((i % 3)) -eq 0 ]; then
    echo "[$(date +%H:%M:%S)] wave full ($i launched), waiting for this wave to finish..."
    wait
    echo "[$(date +%H:%M:%S)] wave done"
  fi
done
wait
echo "ALL_VARIANTS_DONE_25"
