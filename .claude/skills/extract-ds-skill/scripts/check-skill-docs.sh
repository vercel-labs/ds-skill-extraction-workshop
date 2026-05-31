#!/usr/bin/env bash
# scripts/check-skill-docs.sh — Phase 3 post-emit consistency check. Runs after
# scaffold.sh + content fill. Assertions: routing resolves, components covered,
# slugs resolve, scope guardrail present. [VERIFY] markers reported
# informationally. See SKILL.md reflexive audit section.

set -euo pipefail

[[ $# -ge 1 ]] || { echo "usage: check-skill-docs.sh <skill-path>" >&2; exit 2; }
SKILL_PATH="${1%/}"
SKILL_MD="$SKILL_PATH/SKILL.md"
[[ -d "$SKILL_PATH" ]] || { echo "error: skill path missing: $SKILL_PATH" >&2; exit 2; }
[[ -f "$SKILL_MD" ]]   || { echo "error: SKILL.md missing: $SKILL_MD"   >&2; exit 2; }

COMPONENT_DIR="$SKILL_PATH/references/components"
COMPONENTS_MD="$SKILL_PATH/references/components.md"
ANTI="$SKILL_PATH/references/anti-patterns.md"
FAILED=0

# 1. Routing table resolves — every file path in the second column exists.
ROUTING_MISSING=()
in=0
while IFS= read -r line; do
  [[ "$line" =~ ^##[[:space:]]+When[[:space:]]+to[[:space:]]+Load[[:space:]]+References ]] && { in=1; continue; }
  [[ $in -eq 1 && "$line" =~ ^##[[:space:]] ]] && in=0
  [[ $in -eq 1 && "$line" =~ ^\| ]] || continue
  col2="$(awk -F'|' '{print $3}' <<<"$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  [[ -z "$col2" || "$col2" =~ ^-+$ || "$col2" =~ [Ff]iles?[[:space:]]+to[[:space:]]+load ]] && continue
  while IFS= read -r p; do
    [[ -n "$p" && ! -e "$SKILL_PATH/$p" ]] && ROUTING_MISSING+=("$p")
  done < <(grep -oE '[A-Za-z0-9_./-]+\.(md|sh)' <<<"$col2" || true)
done < "$SKILL_MD"
if [[ ${#ROUTING_MISSING[@]} -eq 0 ]]; then echo "ROUTING_TABLE=PASS"
else echo "ROUTING_TABLE=FAIL missing=${ROUTING_MISSING[*]}"; FAILED=1; fi

# 2. Every cited component has a per-component file OR a section in components.md.
CITED=()
while IFS= read -r n; do CITED+=("$n"); done < <(
  grep -rhoE '\(\.?/?components/[A-Za-z0-9_-]+\.md\)' "$SKILL_PATH" 2>/dev/null \
    | sed 's#.*/##;s#\.md)##' | sort -u)
COMPONENT_MISSING=()
for n in "${CITED[@]+"${CITED[@]}"}"; do
  [[ -z "$n" ]] && continue
  [[ -f "$COMPONENT_DIR/$n.md" ]] && continue
  [[ -f "$COMPONENTS_MD" ]] && grep -qiE "^##[[:space:]]+$n([[:space:]]|$)" "$COMPONENTS_MD" && continue
  COMPONENT_MISSING+=("$n")
done
if [[ ${#COMPONENT_MISSING[@]} -eq 0 ]]; then echo "COMPONENT_FILES=PASS"
else echo "COMPONENT_FILES=FAIL missing=${COMPONENT_MISSING[*]}"; FAILED=1; fi

# 3. Universal coverage — every component file has "## Best Practices".
BP_MISSING=()
if [[ -d "$COMPONENT_DIR" ]]; then
  while IFS= read -r f; do
    grep -qE '^##[[:space:]]+Best[[:space:]]+Practices[[:space:]]*$' "$f" || BP_MISSING+=("$f")
  done < <(find "$COMPONENT_DIR" -type f -name '*.md')
fi
if [[ ${#BP_MISSING[@]} -eq 0 ]]; then echo "BEST_PRACTICES_COVERAGE=PASS"
else echo "BEST_PRACTICES_COVERAGE=FAIL missing=${BP_MISSING[*]}"; FAILED=1; fi

# 4. Every component/token/asset slug resolves in anti-patterns.md OR inline.
UNRESOLVED=()
while IFS= read -r slug; do
  [[ -z "$slug" ]] && continue
  [[ -f "$ANTI" ]] && grep -qF "$slug" "$ANTI" && continue
  [[ "${slug%%/*}" == "component" ]] && grep -rqF "$slug" "$COMPONENT_DIR" 2>/dev/null && continue
  UNRESOLVED+=("$slug")
done < <(grep -rhoE '\b(component|token|asset)/[a-z0-9][a-z0-9-]*' "$SKILL_PATH" 2>/dev/null | sort -u)
if [[ ${#UNRESOLVED[@]} -eq 0 ]]; then echo "SLUG_RESOLUTION=PASS"
else echo "SLUG_RESOLUTION=FAIL unresolved=${UNRESOLVED[*]}"; FAILED=1; fi

# 5. [VERIFY] markers — informational only; never fails the check.
VERIFY_COUNT=$(grep -rcE '\[VERIFY\]' "$SKILL_PATH" 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')
echo "VERIFY_MARKERS=$VERIFY_COUNT"
echo "VERIFY_LOCATIONS="
grep -rnE '\[VERIFY\]' "$SKILL_PATH" 2>/dev/null \
  | awk -F: '{print "- " $1 ":" $2}' || true

# 6. Scope guardrail present in SKILL.md (verbatim substring).
if grep -qF "In scope: tokens, assets, component descriptions, component APIs." "$SKILL_MD"; then
  echo "SCOPE_GUARDRAIL=PASS"
else
  echo "SCOPE_GUARDRAIL=FAIL"; FAILED=1
fi

if [[ $FAILED -eq 0 ]]; then echo "CHECK_RESULT=PASS"; exit 0
else echo "CHECK_RESULT=FAIL"; exit 1; fi
