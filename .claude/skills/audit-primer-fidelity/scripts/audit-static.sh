#!/usr/bin/env bash
# audit-static.sh <run-dir> [<run-dir> ...]
# Deterministic tier of audit-primer-fidelity. Emits greppable KEY=... lines.
# Checks: raw color/px values, unresolved CSS @imports and JS package imports,
# leftover [VERIFY] markers. Exit 0 always (findings are data, not errors).
set -u

if [ $# -lt 1 ]; then
  echo "usage: audit-static.sh <run-dir> [<run-dir> ...]" >&2
  exit 2
fi

# PKG_ROOT = nearest ancestor of the first run-dir containing node_modules
# APP_ROOT = nearest ancestor containing tsconfig.json/package.json ("@/" alias base)
# These differ in git worktrees that borrow node_modules from the main checkout.
PKG_ROOT="$(cd "$1" && pwd)"
while [ "$PKG_ROOT" != "/" ] && [ ! -d "$PKG_ROOT/node_modules" ]; do
  PKG_ROOT="$(dirname "$PKG_ROOT")"
done
APP_ROOT="$(cd "$1" && pwd)"
while [ "$APP_ROOT" != "/" ] && [ ! -f "$APP_ROOT/tsconfig.json" ] && [ ! -f "$APP_ROOT/package.json" ]; do
  APP_ROOT="$(dirname "$APP_ROOT")"
done
[ "$APP_ROOT" = "/" ] && APP_ROOT="$PKG_ROOT"

files() {
  find "$@" -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.css' \) \
    -not -path '*/node_modules/*' 2>/dev/null
}

RAW_HITS=0
echo "## raw values (hex colors, px literals, rgb()) — token rule candidates"
while IFS= read -r f; do
  # hex colors; px outside var() fallbacks; rgb()/rgba(). Excludes comments crudely.
  hits=$(grep -nE '#[0-9a-fA-F]{3,8}\b|[^-a-zA-Z(][0-9]+px|rgba?\(' "$f" | grep -v 'var(--' || true)
  if [ -n "$hits" ]; then
    while IFS= read -r line; do
      echo "RAW_VALUE=$f:${line%%:*}"
      RAW_HITS=$((RAW_HITS + 1))
    done <<<"$hits"
  fi
done < <(files "$@")
echo "RAW_VALUE_COUNT=$RAW_HITS"

echo "## import resolution"
UNRESOLVED=0
resolve_pkg_path() { # $1 = specifier like @scope/pkg/dist/x.css
  [ -e "$PKG_ROOT/node_modules/$1" ]
}
while IFS= read -r f; do
  dir="$(dirname "$f")"
  # CSS @import "..."  and JS: import ... from "..." / import "..."
  specs=$(grep -ohE '@import +"[^"]+"|from +"[^"]+"|^import +"[^"]+"' "$f" \
    | grep -oE '"[^"]+"' | tr -d '"' || true)
  for s in $specs; do
    case "$s" in
      .*)  # relative — resolve against the file, allow extensionless TS/TSX
        if [ -e "$dir/$s" ] || [ -e "$dir/$s.ts" ] || [ -e "$dir/$s.tsx" ] \
           || [ -e "$dir/$s/index.ts" ] || [ -e "$dir/$s/index.tsx" ]; then :; else
          echo "UNRESOLVED_IMPORT=$f -> $s"; UNRESOLVED=$((UNRESOLVED + 1))
        fi ;;
      @/*) # tsconfig alias — check from APP_ROOT with same extension fallbacks
        p="$APP_ROOT/${s#@/}"
        if [ -e "$p" ] || [ -e "$p.ts" ] || [ -e "$p.tsx" ]; then :; else
          echo "UNRESOLVED_IMPORT=$f -> $s"; UNRESOLVED=$((UNRESOLVED + 1))
        fi ;;
      *)
        # bare package specifier: subpaths must exist on disk; bare roots are
        # left to typecheck (exports-field resolution is out of scope here)
        if echo "$s" | grep -qE '^(@[^/]+/[^/]+|[^@][^/]*)/.+'; then
          resolve_pkg_path "$s" || {
            echo "UNRESOLVED_IMPORT=$f -> $s"; UNRESOLVED=$((UNRESOLVED + 1)); }
        fi ;;
    esac
  done
done < <(files "$@")
echo "UNRESOLVED_IMPORT_COUNT=$UNRESOLVED"

echo "## leftover [VERIFY] markers"
VERIFY=$(files "$@" | xargs grep -n '\[VERIFY\]' 2>/dev/null || true)
if [ -n "$VERIFY" ]; then
  while IFS= read -r line; do echo "VERIFY_MARKER=${line%%	*}"; done <<<"$VERIFY"
fi
echo "VERIFY_COUNT=$(printf '%s' "$VERIFY" | grep -c . || true)"

[ "$RAW_HITS" -eq 0 ] && echo "RAW_VALUES=PASS" || echo "RAW_VALUES=REVIEW"
[ "$UNRESOLVED" -eq 0 ] && echo "IMPORTS_RESOLVE=PASS" || echo "IMPORTS_RESOLVE=FAIL"
exit 0
