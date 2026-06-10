# audit-primer-fidelity — reference

## The baked-in rubric — 12 fixed rows

This is the rubric. It encodes the Primer React contract for this repository (the 13 `ds/components/` wrappers: Button, IconButton, Checkbox, CounterLabel, Flash, FormControl, Heading, Label, Select, Stack, Text, Textarea, TextInput — plus the app shell). Every run is scored against exactly these rows, in this order.

### Shell rows

**`shell/painted-body`** — the body/root surface paints with tokens.
- Pass if EITHER `<BaseStyles style={{ backgroundColor: "var(--bgColor-default)" }}>` OR `body { background-color: var(--bgColor-default); color: var(--fgColor-default); }` in the global CSS. Only one of the two present → ✅ (AND/OR contract); neither → ❌.
- Bad: theme CSS imported but no body paint — token-painted cards float on the browser-default surface (the canonical "card painted, body unpainted" bug).

**`shell/mode-theme-pairing`** — dark mode actually wired.
- `<html data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">` attributes must be paired with BOTH `@import "@primer/primitives/dist/css/functional/themes/light.css"` AND `.../themes/dark.css` in the global CSS. Attributes without the imports leave `var(--bgColor-default)` at fallback — dark mode silently broken.
- Provider `colorMode` must agree with `data-color-mode` (e.g. both `auto`).
- `<ThemeProvider>` with **no `colorMode` prop** while `<html data-color-mode="auto">` is set → ❌. The CSS-variable layer follows the OS preference but Primer's React layer defaults to light: the page background goes dark while every component surface stays light — a white card floating on a black page. The omission is silent and typechecks clean; this is the canonical unaided failure.

**`shell/provider-wraps-content`** — context reaches the components.
- `<ThemeProvider><BaseStyles>{children}</BaseStyles></ThemeProvider>` — children must be descendants of BOTH. A provider rendered as a sibling of `{children}` gives every component the default theme: ❌.

### Token row

**`token/no-raw-values`** — always tokens, never raw values. Functional tokens, never base scale.

| Bad | Good |
|---|---|
| `color: #1f2328` | `color: var(--fgColor-default)` |
| `var(--color-scale-gray-1)` | `var(--bgColor-default)` (base scale ignores color mode) |
| `padding: 16px` | `padding: var(--base-size-16)` |
| `font-weight: 700` | `font-weight: var(--text-title-weight)` |
| `border-radius: 6px` | `border-radius: var(--borderRadius-medium)` |
| `box-shadow: 0 1px 2px #0001` | `box-shadow: var(--shadow-resting-small)` |

### Component category rows

Each row aggregates every instance across the run; one violation fails the row.

**`component/legal-variants`** — variants/sizes restricted to documented sets, never invented: Button & IconButton `default|primary|danger|invisible`; Flash `default|success|warning|danger`; Label variants per Primer docs.

**`component/required-props`** —
- IconButton REQUIRES `aria-label` (no visible text).
- Button with visible text must NOT get `aria-label` (it overrides the accessible name).
- Loading state = `disabled={isSubmitting}`, never `inactive` (inactive is visual-only; screen readers still announce actionable).

**`component/form-wiring`** —
- Every TextInput/Textarea/Select/Checkbox lives inside `FormControl` with `FormControl.Label`; bare inputs lose label association.
- Checkbox comes BEFORE `FormControl.Label` inside the control.
- `required` goes on FormControl, not the inner input (the label gets the affordance).
- Select builds options with `Select.Option`, not bare `<option>`.

**`component/icon-mechanics`** — icons from `@primer/octicons-react`; pass the icon **component reference** to `icon` / `leadingVisual` / `trailingVisual`, never JSX (`leadingVisual={RepoIcon}`, not `leadingVisual={<RepoIcon />}`).

**`component/routing-preferences`** —
- Flash for simple inline notes inside a form/card; experimental Banner only when title + description + dismiss actions are needed.
- Imports come from `@/ds/components/*` wrappers or the `@primer/react` barrel (`/experimental` for DataTable/Table/Blankslate); never deep `lib-esm` paths.

**`layout/system-idiom`** — Stack with named gaps (`none|condensed|normal|spacious`) instead of pixel margins on children; system layout components over ad-hoc divs+margins.

### Mechanical rows (always last)

- **`audit/imports-resolve`** — every JS `import` specifier and CSS `@import` path resolves to a real file in `node_modules` (or the repo). Catches hallucinated paths (e.g. a `primitives.css` aggregate that doesn't exist in the installed version) — bundlers and browsers silently skip missing CSS imports, so tokens degrade with no error anywhere. Script-checked, never eyeballed.
- **`audit/typecheck-clean`** — the project's `tsc --noEmit` exits 0 for the audited files.

## Cell semantics

| Value | Meaning | Footer | Examples |
|---|---|---|---|
| ✅ | Rule satisfied | PASS | |
| ⚠️ | Deviates in the safe direction | WARN | `minHeight: 100vh` where the contract says `height: 100vh`; requiring `aria-label` where `aria-labelledby` would also satisfy the package |
| ❌ | Rule violated | FAIL | unresolved `@import`; provider rendered as sibling; raw `#hex` |
| – | Not applicable (component absent / file class absent) | NA | IconButton rules in a run with no IconButton |

Verdict column = worst cell in the row (❌ > ⚠️ > ✅; all `–` → NA).

## Report template

```markdown
# Primer fidelity audit — <run label>

Rubric is this skill's baked-in Primer contract; the audited run may not
have had access to any DS skill. Audited files: <list>. Typecheck:
<command + exit code>.

| Rule | shell (layout+css) | components/* | Verdict | Evidence |
|---|:-:|:-:|:-:|---|
| shell/painted-body | ✅ | – | ✅ | |
| ... 12 rows total ... | | | | |

RUBRIC=audit-primer-fidelity (baked-in)
RULES=12 PASS=9 WARN=1 FAIL=2 NA=0
shell/painted-body=PASS
...
FIDELITY_RESULT=FAIL
```

≤3 file-group columns (e.g. `shell` = layout + global css; `components/*` = everything else). Evidence is one clause: worst-offender `file:line` plus a few words. No rubric-construction notes, no per-rule prose, summary ≤3 sentences.

## Worked example — two real runs

**Run A (unaided — generated without skill access):**

| Rule | shell | components/* | Verdict | Evidence |
|---|:-:|:-:|:-:|---|
| shell/painted-body | ⚠️ | – | ⚠️ | BaseStyles bare; body CSS carries the paint |
| shell/mode-theme-pairing | ❌ | – | ❌ | layout.tsx:9 ThemeProvider has no `colorMode` while html sets `data-color-mode="auto"` — white card on dark page |
| shell/provider-wraps-content | ✅ | – | ✅ | |
| token/no-raw-values | ✅ | ✅ | ✅ | |
| component/legal-variants | – | ✅ | ✅ | |
| component/required-props | – | ✅ | ✅ | |
| component/form-wiring | – | ✅ | ✅ | |
| component/icon-mechanics | – | ✅ | ✅ | |
| component/routing-preferences | – | ❌ | ❌ | create-repo-card.tsx:50 `Banner` where the contract routes to `Flash` |
| layout/system-idiom | – | ✅ | ✅ | |
| audit/imports-resolve | ✅ | ✅ | ✅ | verified on disk, not assumed |
| audit/typecheck-clean | ✅ | ✅ | ✅ | |

`RULES=12 PASS=8 WARN=1 FAIL=2 NA=0 · FIDELITY_RESULT=FAIL`

**Run B (skill-loaded):** same rubric, `RULES=12 PASS=11 WARN=1 FAIL=0 NA=0 · FIDELITY_RESULT=PASS` (the WARN: `minHeight` for `height`).

Comparison is a diff of the two footers — no comparative mode exists in the skill itself. Note what the differential shows: Run A got tokens-not-raw, legal variants, and import paths *right*; its failures concentrate in wiring and routing knowledge (which provider props pair with which attributes, which component the system prefers). That distribution is the finding, not just the totals.

Cautionary tale baked into this example: an early manual audit flagged Run A's `@import ".../primitives.css"` as a hallucinated path — by checking `node_modules` from inside a git worktree that borrows `node_modules` from the main checkout. The file exists. This is why `audit/imports-resolve` is script-checked against the resolved package root, never eyeballed, and why every ❌ needs evidence that would survive re-checking.

## Scoring judgment-tier rules

- **Provider wraps children**: read the actual JSX tree; "wraps" means children are descendants of BOTH ThemeProvider and BaseStyles.
- **Mode pairing**: every `data-*-theme` value on `<html>` must have a matching theme CSS `@import`; provider `colorMode` must agree with `data-color-mode`.
- **Painted shell**: pass if EITHER BaseStyles carries a token background style OR a body CSS rule paints background+color with tokens (AND/OR contract — one is enough).
- **Routing preferences**: violation only when the dispreferred component is used for the use-case the contract names. A `Banner` in a context the contract never routes is `–`, not ❌.
- **Required props**: check every call site, not the first. One missing instance fails the row.
