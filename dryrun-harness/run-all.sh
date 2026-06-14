#!/usr/bin/env bash
# Run the remaining 9 variants in waves of 3 (bash 3.2 compatible: no `wait -n`).
# sonnet-low is the pilot, run separately. Ports 3102-3110.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"

# Reordered so the two priciest builds (opus xhigh, opus max) land in different waves.
# Ports are fixed per variant regardless of order. sonnet-low is the pilot (already done).
JOBS=(
  "opus max 3106"
  "opus low 3102"
  "sonnet medium 3107"
  "opus xhigh 3105"
  "opus medium 3103"
  "sonnet high 3108"
  "opus high 3104"
  "sonnet xhigh 3109"
  "sonnet max 3110"
)

i=0
for spec in "${JOBS[@]}"; do
  # shellcheck disable=SC2086
  set -- $spec
  echo "[$(date +%H:%M:%S)] launching $1 $2 on :$3"
  bash dryrun-harness/run-variant.sh "$1" "$2" "$3" >"dryrun-harness/out/$1-effort-$2.batch.log" 2>&1 &
  i=$((i+1))
  if [ $((i % 3)) -eq 0 ]; then
    echo "[$(date +%H:%M:%S)] wave full ($i launched), waiting for this wave to finish..."
    wait
    echo "[$(date +%H:%M:%S)] wave done"
  fi
done
wait
echo "ALL_VARIANTS_DONE"
