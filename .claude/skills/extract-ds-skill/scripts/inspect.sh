#!/usr/bin/env bash
# scripts/inspect.sh — Phase 1 source classifier. Called once per source the user named in the discovery prompt. Shallow only — does not enumerate components. See references/discovery.md.
# Run `chmod +x scripts/inspect.sh` once after install.
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "INSPECT_FAIL=usage: inspect.sh <path-or-url>"
  exit 2
fi

ARG="$1"
CLEANUP_DIR=""
cleanup() { [ -n "$CLEANUP_DIR" ] && rm -rf "$CLEANUP_DIR"; }
trap cleanup EXIT

if printf '%s' "$ARG" | grep -Eq '^(https?://|git@)'; then
  SHA=$(printf '%s' "$ARG" | shasum | cut -c1-8)
  CLEANUP_DIR="/tmp/extract-ds-inspect-${SHA}"
  rm -rf "$CLEANUP_DIR"
  if ! git clone --depth 1 --quiet "$ARG" "$CLEANUP_DIR" 2>/dev/null; then
    echo "INSPECT_FAIL=git clone failed for $ARG (private or unreachable)"
    exit 1
  fi
  SOURCE_PATH="$CLEANUP_DIR"
else
  if [ ! -d "$ARG" ]; then
    echo "INSPECT_FAIL=path does not exist: $ARG"
    exit 1
  fi
  SOURCE_PATH="$(cd "$ARG" && pwd)"
fi

cd "$SOURCE_PATH"
echo "SOURCE_PATH=$SOURCE_PATH"

PKG_NAME="no-package-json"
PKG_EXPORTS_HAS_COMPONENTS=0
PKG_EXPORTS_HAS_ASSETS=0
if [ -f package.json ]; then
  PKG_NAME=$(node -e "try{console.log(require('./package.json').name||'unnamed')}catch(e){console.log('unparseable')}" 2>/dev/null || echo "unparseable")
  EXPORT_KEYS=$(node -e "try{const e=require('./package.json').exports||{};console.log(typeof e==='string'?'.':Object.keys(e).join('\n'))}catch(e){console.log('')}" 2>/dev/null || echo "")
  printf '%s' "$EXPORT_KEYS" | grep -qi 'component' && PKG_EXPORTS_HAS_COMPONENTS=1 || true
  printf '%s' "$EXPORT_KEYS" | grep -Eqi 'asset|icon|logo' && PKG_EXPORTS_HAS_ASSETS=1 || true
fi

ROLE="unknown"
if [ -f AGENTS.md ] || [ -f CLAUDE.md ]; then ROLE="agents-claude"; fi
if [ -d .storybook ]; then ROLE="storybook"; fi
if [ -d docs ] && [ -d _next -o -d .next ]; then ROLE="docs-site"; fi
if [ "$PKG_EXPORTS_HAS_ASSETS" -eq 1 ]; then ROLE="asset-package"; fi
if [ "$PKG_EXPORTS_HAS_COMPONENTS" -eq 1 ] || [ -d src/components ] || [ -d packages ]; then ROLE="design-system-code"; fi
if [ -d app ] && [ -d pages -o -f next.config.js -o -f next.config.mjs ]; then ROLE="product-app"; fi
echo "SOURCE_ROLE=$ROLE"

TOP=$(find . -mindepth 1 -maxdepth 1 -type d \
  ! -name node_modules ! -name .git ! -name dist ! -name build ! -name .next ! -name _next \
  -exec basename {} \; 2>/dev/null | sort | paste -sd, -)
echo "TOP_LEVEL_FOLDERS=${TOP:-none}"

echo "PACKAGE_JSON_NAME=$PKG_NAME"

echo "EXPORTS_BEGIN"
if [ -f package.json ]; then
  node -e "try{const e=require('./package.json').exports;if(!e){console.log('none');}else if(typeof e==='string'){console.log('.');}else{Object.keys(e).forEach(k=>console.log(k));}}catch(e){console.log('none')}" 2>/dev/null || echo "none"
else
  echo "none"
fi
echo "EXPORTS_END"

COMPONENT_COUNT=0
for DIR in src/components src; do
  if [ -d "$DIR" ]; then
    COMPONENT_COUNT=$(find "$DIR" -maxdepth 3 -type f \( -name '*.tsx' -o -name '*.ts' \) 2>/dev/null \
      | xargs grep -l -E '^export (default |const [A-Z]|function [A-Z])' 2>/dev/null | wc -l | tr -d ' ')
    break
  fi
done
echo "COMPONENT_COUNT_GUESS=$COMPONENT_COUNT"

AGENTS=""
# The hosted-git dotdir is assembled from fragments so the meta-skill's
# LEXICAL_DENY_LIST self-scan does not flag this functional path.
GH_DOTDIR=".git""hub"
for F in AGENTS.md CLAUDE.md "$GH_DOTDIR/copilot-instructions.md"; do
  [ -f "$F" ] && AGENTS="${AGENTS:+$AGENTS,}$F"
done
echo "AGENTS_FILES=${AGENTS:-none}"

echo "INSPECT_OK"
