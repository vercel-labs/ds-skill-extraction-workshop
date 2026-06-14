#!/usr/bin/env bash
# Run one model x effort dry-run end-to-end:
#   worktree -> install -> headless claude build (cost captured) -> typecheck -> dev server -> screenshots
# Usage: run-variant.sh <opus|sonnet> <low|medium|high|xhigh|max> <port>
# Env:   SHOTS_ONLY=1  -> skip worktree/install/build/typecheck, just (clean) dev server + screenshots
set -uo pipefail

MODEL_ALIAS="$1"; EFFORT="$2"; PORT="$3"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

case "$MODEL_ALIAS" in
  opus)   MODEL_ID="claude-opus-4-8" ;;
  sonnet) MODEL_ID="claude-sonnet-4-6" ;;
  *) echo "unknown model $MODEL_ALIAS"; exit 2 ;;
esac

LABEL="${MODEL_ALIAS}-effort-${EFFORT}"
WT=".claude/worktrees/dryrun-24-${LABEL}-i1"
AWT="$ROOT/$WT"
BR="dryrun/24-${LABEL}-i1"
OUT="$ROOT/dryrun-harness/out/${LABEL}"
mkdir -p "$OUT"
PRD="prompts/pr-merged-switch-dark-mode.md"
SHOTS_ONLY="${SHOTS_ONLY:-0}"

log(){ echo "[$(date +%H:%M:%S)] [$LABEL] $*" | tee -a "$OUT/run.log"; }

APPEND="You are running headless inside a pre-created git worktree at ${WT} on branch ${BR}, which IS the designated dry-run worktree for this task. node_modules is already installed here. Do NOT create another git worktree. Do NOT run pnpm install at the repo root. Do NOT symlink node_modules. Do NOT commit, stage, or push anything. You may run typecheck or a build to verify, but do NOT leave a dev server or any other background process running when you finish — kill anything you start. Implement the PRD in this worktree, then stop."

log "=== START model=$MODEL_ID effort=$EFFORT port=$PORT shots_only=$SHOTS_ONLY ==="

if [ "$SHOTS_ONLY" != "1" ]; then
  # 1. worktree (idempotent: skip if exists)
  if [ -d "$WT" ]; then
    log "worktree exists, reusing"
  else
    git worktree add -b "$BR" "$WT" HEAD >>"$OUT/setup.log" 2>&1 || { log "WORKTREE_FAIL"; exit 1; }
    log "worktree created"
  fi

  # 2. install (per AGENTS.md: each worktree gets its own node_modules)
  log "pnpm install --frozen-lockfile ..."
  ( cd "$WT" && pnpm install --frozen-lockfile ) >"$OUT/install.log" 2>&1 && log "install ok" || log "INSTALL_WARN (see install.log)"

  # 3. headless build with effort control + cost capture
  log "building with claude -p (this is the long step) ..."
  BUILD_START=$(date +%s)
  ( cd "$WT" && claude -p \
      --model "$MODEL_ID" \
      --effort "$EFFORT" \
      --output-format json \
      --permission-mode bypassPermissions \
      --append-system-prompt "$APPEND" \
      "/primer-react implement $PRD" ) >"$OUT/cost.json" 2>"$OUT/build.err"
  BUILD_RC=$?
  BUILD_END=$(date +%s)
  log "build exit=$BUILD_RC wall=$((BUILD_END-BUILD_START))s"

  # 4. cost report from the JSON envelope
  node -e '
    const fs=require("fs");
    let j={}; try{ j=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); }catch(e){ console.log("cost.json parse failed:",e.message); process.exit(0); }
    const u=j.usage||{};
    const rep={
      label: process.argv[2],
      model: process.argv[3], effort: process.argv[4],
      total_cost_usd: j.total_cost_usd ?? null,
      duration_ms: j.duration_ms ?? null,
      duration_api_ms: j.duration_api_ms ?? null,
      num_turns: j.num_turns ?? null,
      is_error: j.is_error ?? null,
      input_tokens: u.input_tokens ?? null,
      output_tokens: u.output_tokens ?? null,
      cache_creation_input_tokens: u.cache_creation_input_tokens ?? null,
      cache_read_input_tokens: u.cache_read_input_tokens ?? null,
    };
    fs.writeFileSync(process.argv[5], JSON.stringify(rep,null,2));
    console.log("COST", JSON.stringify(rep));
  ' "$OUT/cost.json" "$LABEL" "$MODEL_ID" "$EFFORT" "$OUT/cost-report.json" | tee -a "$OUT/run.log"

  # 5. typecheck signal (non-fatal)
  ( cd "$WT" && pnpm typecheck ) >"$OUT/typecheck.log" 2>&1 && log "typecheck PASS" || log "typecheck FAIL (see typecheck.log)"
else
  log "SHOTS_ONLY: skipping worktree/install/build/typecheck"
fi

# 6. dev server + screenshots
# First, kill any dev server the build agent left running for THIS worktree and clear the Next dev lock,
# otherwise Next's per-project lock makes our screenshot server abort.
log "cleaning up any leftover dev server / port holder ..."
lsof -ti tcp:"$PORT" 2>/dev/null | xargs kill -9 2>/dev/null
pkill -f "$AWT" 2>/dev/null
rm -rf "$WT/.next/dev" 2>/dev/null
sleep 1

log "starting dev server on :$PORT ..."
( cd "$WT" && pnpm exec next dev -p "$PORT" ) >"$OUT/dev.log" 2>&1 &
DEVPID=$!

UP=""
for i in $(seq 1 90); do
  if curl -sf "http://localhost:$PORT/" >/dev/null 2>&1; then UP=1; break; fi
  # bail early if the dev server died
  if ! kill -0 "$DEVPID" 2>/dev/null; then log "DEV_PROCESS_EXITED early (see dev.log)"; break; fi
  sleep 1
done

if [ -n "$UP" ]; then
  log "dev up, capturing screenshots ..."
  node "$ROOT/dryrun-harness/screenshot.mjs" --url "http://localhost:$PORT/" --outdir "$OUT/shots" --label "$LABEL" >"$OUT/shots.log" 2>&1 && log "screenshots ok" || log "SCREENSHOT_WARN (see shots.log)"
else
  log "DEV_NEVER_READY (see dev.log)"
fi

kill "$DEVPID" 2>/dev/null
pkill -P "$DEVPID" 2>/dev/null
pkill -f "$AWT" 2>/dev/null
lsof -ti tcp:"$PORT" 2>/dev/null | xargs kill -9 2>/dev/null
sleep 1
log "=== DONE ==="
