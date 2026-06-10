# audit-ds-fidelity — reference

## Rubric derivation — the fixed row catalog

The rubric is a function of the produced skill alone, and it is a **fixed catalog of grouped category rows** (~12), never per-component or per-bullet rows. The same skill must always yield the same rubric; the audit's job is to fold the skill's many rules into these buckets and score each bucket across every instance in the run.

| Row slug | What folds into it (from the produced skill) |
|---|---|
| `shell/painted-body` | base-styles/body background+color paint rules |
| `shell/mode-theme-pairing` | mode attributes ↔ theme CSS imports ↔ provider colorMode agreement |
| `shell/provider-wraps-content` | provider + base-styles wrap children as descendants |
| `token/no-raw-values` | all token rules and Bad/Good token rows |
| `component/legal-variants` | every variant/size/scheme union + "never invent" lists, all components |
| `component/required-props` | required aria-labels and other mandatory props, all call sites |
| `component/form-wiring` | control/label association rules (inputs inside form-control, ordering) |
| `component/icon-mechanics` | icon-as-component-not-JSX and similar prop-mechanics rules |
| `component/routing-preferences` | every "prefer X over Y" rule |
| `layout/system-idiom` | system layout/stack component over ad-hoc divs+margins |
| `audit/imports-resolve` | skill-independent (below) |
| `audit/typecheck-clean` | skill-independent (below) |

Scoring a category row: it passes only if **every** instance in the run passes; one violation anywhere sets the row's verdict (cite the worst offender). A category the skill never legislates, or with zero instances in the run, scores `–`/NA. If the skill states a rule no catalog row covers, fold it into the nearest row — mint a new row only if nothing fits, noting the minting in one line.

### Skill-independent rows (always present, always last)

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

| Rule | shell (layout+css) | components/* | Verdict | Evidence |
|---|:-:|:-:|:-:|---|
| shell/painted-body | ✅ | – | ✅ | |
| ... ~12 rows total ... | | | | |

RUBRIC_SOURCE=.claude/skills/primer-react
RULES=12 PASS=9 WARN=1 FAIL=2 NA=0
shell/painted-body=PASS
...
FIDELITY_RESULT=FAIL
```

≤3 file-group columns (e.g. `shell` = layout + global css; `components/*` = everything else). Evidence is one clause: worst-offender `file:line` plus a few words. No rubric-construction notes, no per-rule prose, summary ≤3 sentences.

## Worked example — two real runs, one skill

Both audited against the produced `primer-react` skill (13 components, 6 hard rules).

**Run A (unaided — generated without skill access):**

| Rule | shell | components/* | Verdict | Evidence |
|---|:-:|:-:|:-:|---|
| shell/painted-body | ⚠️ | – | ⚠️ | BaseStyles bare; body CSS carries the paint |
| shell/mode-theme-pairing | ✅ | – | ✅ | |
| shell/provider-wraps-content | ❌ | – | ❌ | layout.tsx:9 no `colorMode="auto"` vs `data-color-mode="auto"` |
| token/no-raw-values | ✅ | ✅ | ✅ | |
| component/legal-variants | – | ✅ | ✅ | |
| component/required-props | – | ✅ | ✅ | |
| component/form-wiring | – | ✅ | ✅ | |
| component/icon-mechanics | – | ✅ | ✅ | |
| component/routing-preferences | – | ❌ | ❌ | create-repo-card.tsx:50 `Banner` where skill routes to `Flash` |
| layout/system-idiom | – | ✅ | ✅ | |
| audit/imports-resolve | ✅ | ✅ | ✅ | verified on disk, not assumed |
| audit/typecheck-clean | ✅ | ✅ | ✅ | |

`RULES=12 PASS=8 WARN=1 FAIL=2 NA=0 · FIDELITY_RESULT=FAIL`

**Run B (skill-loaded):** same rubric, `RULES=12 PASS=11 WARN=1 FAIL=0 NA=0 · FIDELITY_RESULT=PASS` (the WARN: `minHeight` for `height`).

Comparison is a diff of the two footers — no comparative mode exists in the skill itself. Note what the differential shows: Run A got tokens-not-raw, legal variants, and import paths *right*; its failures concentrate in wiring and routing knowledge (which provider props pair with which attributes, which component the system prefers). That distribution is the finding, not just the totals.

Cautionary tale baked into this example: an early manual audit flagged Run A's `@import ".../primitives.css"` as a hallucinated path — by checking `node_modules` from inside a git worktree that borrows `node_modules` from the main checkout. The file exists. This is why `audit/imports-resolve` is script-checked against the resolved package root, never eyeballed, and why every ❌ needs evidence that would survive re-checking.

## Scoring judgment-tier rules

- **Provider wraps children**: read the actual JSX tree; "wraps" means children are descendants of BOTH provider and base-styles components.
- **Mode pairing**: every `data-*-theme` value on `<html>` must have a matching theme CSS `@import`; provider `colorMode` must agree with `data-color-mode`.
- **Painted shell**: pass if EITHER the base-styles component carries a token background style OR a body CSS rule paints background+color with tokens. Only one present → ⚠️ if the skill demands both, ✅ if the skill says AND/OR.
- **Routing preferences**: violation only when the dispreferred component is used for the use-case the skill names. A `Banner` in a context the skill never routes is `–`, not ❌.
- **Required props**: check every call site, not the first. One missing instance fails the row.
