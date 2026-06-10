# audit-ds-fidelity — reference

## Rubric derivation

The rubric is a function of the produced skill alone. Extract rows in this order; the same skill must always yield the same rubric.

### 1. Hard rules (`SKILL.md ## Hard rules`)

One row per bullet. Key each row by the anti-pattern slug the rule cites (e.g. `shell/unpainted-body`, `shell/mode-attribute-no-theme-import`, `shell/provider-missing-content-wrap`, `token/no-raw-values`). If a hard rule cites no slug, mint one as `hard/<kebab-summary>` and note the minting in the report preamble.

### 2. Anti-pattern rows (`references/anti-patterns.md`)

One row per Bad/Good table row, keyed by its slug. Skip any slug already captured from Hard rules.

### 3. Per-component conditional rows

From each `references/components/<name>.md` (or the single `references/components.md`), extract:

- **Legal-values rows** — variant/size unions under "Key props" and "Things to never invent" → `component/<name>-legal-variants`.
- **Required-prop rows** — e.g. `component/iconbutton-requires-aria-label`.
- **Mechanics rows** — e.g. `component/icon-prop-not-jsx`.
- **Routing rows** — "prefer X over Y" guidance → `component/<x>-over-<y>`.

Conditional rows apply only when the component appears in the audited run. Detect appearance by import (wrapper or barrel) or JSX usage. Absent → every cell `–`, footer value `NA`.

### 4. Skill-independent rows (always present, always last)

- `audit/imports-resolve` — every JS `import` specifier and CSS `@import` path must resolve to a real file in `node_modules` (or the repo). This catches hallucinated paths (e.g. a `primitives.css` aggregate that does not exist in the installed version) that neither tsc nor a visual check reveals — bundlers and browsers silently skip missing CSS imports, so tokens degrade with no error anywhere.
- `audit/typecheck-clean` — the project's `tsc --noEmit` exits 0 for the audited files.

## Cell semantics

| Value | Meaning | Footer | Examples |
|---|---|---|---|
| ✅ | Rule satisfied | PASS | |
| ⚠️ | Deviates in the safe direction | WARN | `minHeight: 100vh` where skill says `height: 100vh`; requiring `aria-label` where `aria-labelledby` would also satisfy the package |
| ❌ | Rule violated | FAIL | unresolved `@import`; provider rendered as sibling; raw `#hex` |
| – | Not applicable (component absent / file class absent) | NA | IconButton rules in a run with no IconButton |

Verdict column = worst cell in the row (❌ > ⚠️ > ✅; all `–` → NA).

## Report template

```markdown
# DS fidelity audit — <run label>

Rubric derived from `<skill path>` only; the audited run may not have had
access to it. Audited files: <list>. Typecheck: <command + exit code>.

| Rule | app/layout.tsx | app/globals.css | components/* | Verdict | Evidence |
|---|:-:|:-:|:-:|:-:|---|
| shell/unpainted-body | ✅ | ✅ | – | ✅ | |
| ... | | | | | |

RUBRIC_SOURCE=.claude/skills/primer-react
RULES=14 PASS=10 WARN=1 FAIL=3 NA=0
shell/unpainted-body=PASS
...
FIDELITY_RESULT=FAIL
```

Column set = the audited files grouped however keeps the table ≤ ~6 columns
(group `components/*` when many). Rows and footer lines are NEVER grouped.

## Worked example — two real runs, one skill

Both audited against the produced `primer-react` skill (13 components, 6 hard rules).

**Run A (unaided — generated without skill access):**

| Rule | layout.tsx | globals.css | components/* | Verdict | Evidence |
|---|:-:|:-:|:-:|:-:|---|
| audit/imports-resolve | ✅ | ✅ | ✅ | ✅ | all `@import`/alias paths exist (verified on disk, not assumed) |
| shell/mode-attribute-no-theme-import | ✅ | ✅ | – | ✅ | theme css imported |
| shell/provider-missing-content-wrap | ❌ | – | – | ❌ | layout.tsx:9 `ThemeProvider` without `colorMode="auto"` while `<html data-color-mode="auto">`; no `suppressHydrationWarning` |
| shell/unpainted-body | ⚠️ | ✅ | – | ⚠️ | BaseStyles bare; body CSS rule carries the paint |
| component/flash-over-experimental-banner | – | – | ❌ | ❌ | create-repo-card.tsx:50 `Banner` where skill routes to `Flash` |
| token/no-raw-values | ✅ | ✅ | ✅ | ✅ | all `var(--…)` |

`RULES=14 PASS=10 WARN=1 FAIL=2 NA=1 · FIDELITY_RESULT=FAIL`

**Run B (skill-loaded):** same rubric, `RULES=14 PASS=13 WARN=1 FAIL=0 NA=0 · FIDELITY_RESULT=PASS` (the WARN: `minHeight` for `height`).

Comparison is a diff of the two footers — no comparative mode exists in the skill itself. Note what the differential shows: Run A got tokens-not-raw, legal variants, and import paths *right*; its failures concentrate in wiring and routing knowledge (which provider props pair with which attributes, which component the system prefers). That distribution is the finding, not just the totals.

Cautionary tale baked into this example: an early manual audit flagged Run A's `@import ".../primitives.css"` as a hallucinated path — by checking `node_modules` from inside a git worktree that borrows `node_modules` from the main checkout. The file exists. This is why `audit/imports-resolve` is script-checked against the resolved package root, never eyeballed, and why every ❌ needs evidence that would survive re-checking.

## Scoring judgment-tier rules

- **Provider wraps children**: read the actual JSX tree; "wraps" means children are descendants of BOTH provider and base-styles components.
- **Mode pairing**: every `data-*-theme` value on `<html>` must have a matching theme CSS `@import`; provider `colorMode` must agree with `data-color-mode`.
- **Painted shell**: pass if EITHER the base-styles component carries a token background style OR a body CSS rule paints background+color with tokens. Only one present → ⚠️ if the skill demands both, ✅ if the skill says AND/OR.
- **Routing preferences**: violation only when the dispreferred component is used for the use-case the skill names. A `Banner` in a context the skill never routes is `–`, not ❌.
- **Required props**: check every call site, not the first. One missing instance fails the row.
