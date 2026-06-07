# PRD — Multi-example extraction for `extract-ds-skill`

Extend the `extract-ds-skill` meta-skill's reference-project step to lift
every composition exemplar in the `[example:project]` source as a
separate example file in the produced skill. Today the meta-skill walks
the reference project's root `app/layout.tsx` for wiring only; the
produced skill's `references/examples/` directory carries at most one
file, populated ad-hoc. The result is that downstream agents using the
produced skill have correct API references but few real compositions to
pattern-match against, and generated screens look like "Primer
components arranged" rather than "Primer compositions."

This PRD owns the **shared contract** between the meta-skill and the
reference project. The companion PRD at
`primer-nextjs-template/PRD-composition-exemplars.md` ships the
exemplar pages the contract scans and quotes the contract block
verbatim.

## Problem Statement

The dry-run of the produced `ds` skill against `prompts/issues.md` (in
this repo) renders a page that uses Primer components correctly —
`Button` variants are valid, `DataTable` columns resolve, `Stack` scale
words match — but does NOT look composed. Surface treatment is sparse,
sections do not sit on the right token-painted backgrounds, and the
page lacks the visual density a real Primer product page carries.

The contrast surfaced when reviewing v0's import-design-system scaffold
at `~/Downloads/import-design-system`. That scaffold ships four worked
showcase compositions at `components/showcase/{color-palette,type-scale,
component-showcase,create-repo-card}.tsx`. The agent that generated v0's
homepage had four real, multi-component Primer compositions to
pattern-match on when assembling the page. The agent generating ours
had one example file (`references/examples/create-repo-form.md`)
derived from the docs rather than from a real file the agent could
inspect.

The skill's API rules are sound. Both pipelines correctly extract
Button variants, Stack scale words, FormControl wiring. The difference
is exposure to composition during generation, and the lever for that
exposure is the reference project's filesystem.

The meta-skill currently treats the reference project as a wiring
source only. `references/reference-project.md` extracts the root
`app/layout.tsx` (provider mount, CSS imports, root `<html>`
attributes) and writes `.extract-ds-skill-scratch/wiring-extracted.md`.
It does not walk `app/page.tsx`, `app/<route>/page.tsx`, or
`components/showcase/*.tsx`. Even if the reference project ships richer
compositions tomorrow, the meta-skill ignores them.

The fix is mechanical: teach the meta-skill that the reference project
is also the source of composition exemplars, not just wiring, and
materialize each as a separate `references/examples/<name>.md` file in
the produced skill. The companion PRD ships the pages this contract
scans.

## Solution

Extend `references/reference-project.md`, the scaffolder, and the
post-emit check script to support multi-example extraction. The
extraction recipe is additive — when no exemplars exist in the
reference project, behavior is unchanged from today.

### Shared contract

The block below is the canonical definition. The companion PRD
(`primer-nextjs-template/PRD-composition-exemplars.md`) quotes this
block verbatim under its "Contract reference" section. Edits to either
copy must land in both PRDs in the same commit.

> **Composition exemplar extraction (Phase 2, additive to wiring lift).**
>
> When `[example:project]` is in scope, Phase 2 scans the reference
> project for composition exemplars in addition to lifting the root
> wiring. Two globs are walked top-to-bottom; both run, results
> concatenated:
>
> 1. `app/**/page.tsx` — Next.js App Router route pages (including the
>    root `app/page.tsx` when present).
> 2. `components/showcase/*.tsx` — non-routed showcase compositions.
>
> For each file matched, Phase 2 writes one file to
> `.extract-ds-skill-scratch/examples/<basename>.md`, where
> `<basename>` is the parent directory name for
> `app/<dir>/page.tsx` files (e.g. `app/issues/page.tsx` →
> `issues.md`), the literal `home` for the root `app/page.tsx`, or the
> file's basename without extension for `components/showcase/<name>.tsx`
> files (e.g. `create-repo-card.tsx` → `create-repo-card.md`).
>
> Each scratch example file follows the per-example template:
>
> ```markdown
> # Example: <title-cased-basename>
>
> Lifted from `<reference-project>/<relative-path>` (<framework>).
>
> ## Required imports
>
> - `@primer/react`: <comma-separated list of named imports>
> - `@primer/octicons-react`: <comma-separated list of named imports, or "(none)">
> - Other: <one line per non-Primer import, or "(none)">
>
> ## Composition (verbatim)
>
> ```tsx
> <verbatim copy of the file body from the first relevant import to
> the close of the default-exported component>
> ```
>
> ## What to copy
>
> - <one bullet per composition pattern the example demonstrates, sourced
>   from re-reading the lifted file>
> - <patterns, not data — e.g. "Action footer is a horizontal Stack with
>   `justify='end'`: invisible Cancel then primary submit", NOT "form has
>   a Cancel button">
> ```
>
> `app/layout.tsx` is **excluded** from the example scan — it remains
> the wiring source defined in the existing Reference-project
> extraction recipe. The recipe runs both extractions in parallel
> against the scratch workspace.
>
> Phase 3 materializes each scratch file to
> `.claude/skills/<slug>/references/examples/<basename>.md` verbatim,
> and writes a `.claude/skills/<slug>/references/examples/index.md`
> sub-index with one row per file: `- [<basename>](./<basename>.md) —
> <one-line summary lifted from the example file's first bullet>`.
>
> The produced `SKILL.md` routing table replaces the single
> `**Validated examples:** references/examples/` row with the
> `**Examples index:** references/examples/index.md` row plus one row
> per example file:
> `- **<basename>:** references/examples/<basename>.md — <one-line summary>`.
>
> **Fallback.** When neither glob matches (no `app/**/page.tsx` and no
> `components/showcase/*.tsx`), Phase 2 skips this step entirely. The
> produced skill's `references/examples/` directory is omitted, and the
> routing table omits both the examples-index row and the per-file
> rows. No `[VERIFY]` marker fires — an empty example set is a valid
> state for reference projects that ship wiring only.

### Affected meta-skill files

- `references/reference-project.md` — add a new "Composition exemplar
  extraction" section after the existing "Extraction recipe" section.
  Quote the shared contract block verbatim. Add a worked example using
  a public-DS-shaped target.
- `references/skill-template.md` — replace the single
  `**Validated examples:**` routing-table row with the
  `**Examples index:**` row plus the per-file row template. Update the
  produced-`SKILL.md` worked example to show 4-5 example rows.
- `references/persist.md` — extend the file-layout list to include
  `references/examples/<name>.md` (plural) and
  `references/examples/index.md`. Update the slug-collision check
  description to note that example file basenames are derived from the
  reference project's filesystem and may collide across runs (rare,
  but possible).
- `scripts/scaffold.sh` — accept a glob of scratch example files
  (`.extract-ds-skill-scratch/examples/*.md`) and copy each to
  `.claude/skills/<slug>/references/examples/<basename>.md`. Generate
  `references/examples/index.md` from the same set.
- `scripts/check-skill-docs.sh` — accept N rows of the
  `**<basename>:** references/examples/<basename>.md` shape in the
  routing table without flagging the existing "phantom row" failure.
  Add a new assertion: when `references/examples/*.md` exists,
  `references/examples/index.md` must also exist and reference each
  file by name.
- `scripts/tests/fixtures/` — add two fixtures: `pass-multi-example`
  (reference project ships 3 page files; produced skill writes 3
  example files plus index; routing table has 4 rows total) and
  `fail-missing-examples-index` (produced skill writes example files
  but no index; check script fails).

### Affected SKILL.md sections

- "When to Load References" routing table — the
  `references/reference-project.md` row's "Internal pass" column gains
  the composition exemplar extraction sub-step.
- "Six rule shapes" — unchanged. Composition exemplars are not rules,
  they are pattern-matchable examples.
- "Reflexive audit (the skill IS the rubric)" — tick (A) gains a new
  sub-bullet: "Every `references/examples/<name>.md` file lifts from a
  real file in the reference project, and the routing table contains
  one row per example file plus the index row."
- "Anti-fabrication rules" — add "Do not invent example files. If the
  reference project ships zero composition exemplars, the produced
  skill ships zero example files. Empty `references/examples/` is the
  correct empty state."

## User Stories

1. As the maintainer of `extract-ds-skill`, I want the meta-skill to
   lift every `app/**/page.tsx` from the reference project as a
   separate example file, so that the produced skill ships one
   composition exemplar per route the reference project demonstrates.
2. As the maintainer of `extract-ds-skill`, I want the meta-skill to
   also lift `components/showcase/*.tsx` files, so that reference
   projects styled after v0's import-design-system shape (non-routed
   showcases) work without renaming files.
3. As the maintainer of `extract-ds-skill`, I want
   `app/layout.tsx` excluded from the example scan, so that the wiring
   source does not double-emit as a composition example.
4. As a workshop attendee running Pass 2, I want the produced
   `ds` skill to ship 4-5 composition exemplars, so that the screens
   I prompt the agent to generate look like real Primer pages rather
   than "components arranged."
5. As a workshop attendee debugging Pass 1 vs Pass 2, I want each
   example file to include a "What to copy" bulleted list of
   composition patterns (not data), so that the agent generalizes the
   pattern instead of literally copying the example.
6. As a future agent re-running the meta-skill, I want the
   `references/examples/index.md` sub-index to list every example file
   with a one-line summary, so that the routing table stays compact
   and the agent can scan the index before opening individual files.
7. As a future agent re-running the meta-skill, I want the
   `scripts/check-skill-docs.sh` post-emit check to assert that the
   index file exists whenever examples exist, so that a partial scaffold
   surfaces immediately.
8. As a maintainer running fixture tests, I want a `pass-multi-example`
   fixture that exercises the 3-files-plus-index shape, so that
   regressions in the scaffolder are caught locally before they ship.
9. As a maintainer of a non-Next.js reference project (Vite, CRA), I
   want the meta-skill to gracefully skip the example scan when the
   reference project ships neither `app/**/page.tsx` nor
   `components/showcase/*.tsx`, so that the wiring-only path keeps
   working unchanged.
10. As the maintainer of `primer-nextjs-template`, I want the
    extraction contract documented in one place (this PRD), so that
    when I add the exemplar pages I am not guessing what filenames or
    paths the meta-skill expects.

## Implementation Decisions

The change is additive. Today's single-example path becomes a special
case of N=1 in the new contract. The discrete pieces:

- **Two globs, one pass.** `app/**/page.tsx` and
  `components/showcase/*.tsx` run in the same scan. Concatenate
  results, deduplicate by output basename (e.g. an `app/empty/page.tsx`
  and a `components/showcase/empty.tsx` would collide on `empty.md` —
  in that case, the `app/` glob wins and a `[VERIFY]` marker fires).
- **Basename derivation lives in the scaffolder, not in prose.** The
  rule `app/<dir>/page.tsx → <dir>.md`, `app/page.tsx → home.md`,
  `components/showcase/<name>.tsx → <name>.md` is implemented in
  `scripts/scaffold.sh` and re-asserted by `scripts/check-skill-docs.sh`.
  Prose in `references/reference-project.md` cites the rule; the
  script enforces it.
- **Verbatim copy, no paraphrase.** The "Composition (verbatim)"
  section is character-for-character. Phase 2's job is fidelity, not
  aesthetics. Indentation changes silently shift the contract surface.
- **"What to copy" is generated by re-reading the lifted file.** After
  the verbatim copy lands, the agent re-reads the scratch file and
  writes 3-6 bullets describing the composition patterns the example
  demonstrates. Bullets describe patterns (token-painted card surface,
  horizontal action footer with invisible-then-primary buttons), not
  data (a "Cancel" button, a 40px avatar). This separation is what
  lets downstream agents generalize.
- **Sub-index file is a flat list, not a routing table.** The
  `references/examples/index.md` is `- [<basename>](./<basename>.md) —
  <summary>` per line, no frontmatter, no headers beyond `# Examples`.
  It is meant to be scanned, not navigated through.
- **Anti-decisions.** The meta-skill does NOT (a) scan arbitrary
  globs the user passes — the two globs are hard-coded for v1, (b)
  attempt to infer composition rules from the example file (rule
  extraction stays in `references/component-extraction.md`'s six
  shapes), (c) cap the example count — if the reference project ships
  20 pages, the produced skill ships 20 example files, (d) cross-link
  example files to component files automatically (the agent can read
  both at generation time).

## Testing Decisions

Three layered checks define done:

1. **Unit-shaped fixture tests.** `scripts/tests/run-tests.sh` gains
   `pass-multi-example` (a fixture reference project with 3 pages +
   1 showcase file; assert the produced skill ships 4 example files
   plus index; assert routing table has 5 rows) and
   `fail-missing-examples-index` (produce 2 example files but
   suppress the index; assert `check-skill-docs.sh` exits non-zero
   with the "examples index missing" message). Both fixtures match
   the existing `pass-*` / `fail-*` directory shape under
   `scripts/tests/fixtures/`.
2. **Round-trip extraction.** After this PRD ships and the companion
   PRD's pages land in `primer-nextjs-template`, run
   `extract-ds-skill` against `primer-nextjs-template` end-to-end.
   Assert the produced `ds` skill carries one `references/examples/
   <basename>.md` file per page the template ships, plus the index.
   Assert the routing table in the produced `SKILL.md` lists each by
   path.
3. **Regeneration smoke test.** After the round-trip, re-run
   `prompts/issues.md` against the regenerated skill. Compare the
   produced page visually against the same prompt's output on
   `dryrun/02`. Assert the new output reads as composed (token-painted
   surfaces, sectioned layout, dense use of Primer primitives) and not
   as "components arranged." Documented as observational, not pass/fail
   — but a clear regression here invalidates the work.

No automated visual regression testing. The screenshots compared by
hand are the proof point; the workshop attendee sees the same
difference live.

## Out of Scope

- **Cross-skill composition.** The example files are pattern-matchable
  exemplars for the agent; they are not links between sibling skills.
  When a copy/voice sibling skill exists, the agent reads both at
  generation time; this PRD does not add cross-skill routing.
- **Example file rule extraction.** Rules continue to come from the
  six shapes in `references/component-extraction.md` (component-
  selection, prop-usage, naming-copy [route out], accessibility,
  default-state, cross-skill-back-reference). Example files are
  composition demonstrations, not rule sources.
- **Refresh verb.** When the reference project gains a new page, the
  produced skill gets that page on the next extraction run, not via a
  diff-driven refresh. A refresh verb (`refresh-ds-skill`) is deferred
  per the existing `references/coverage-gaps.md` entry.
- **Non-Next.js framework support.** The two globs (`app/**/page.tsx`,
  `components/showcase/*.tsx`) are Next.js App Router-shaped. Vite
  reference projects can ship `components/showcase/*.tsx` files (caught
  by the second glob), but Vite-routed pages (`src/routes/*.tsx`) are
  not scanned. Adding Vite / Next Pages Router globs is deferred until
  a reference project requires it.
- **Updating existing dry-runs.** The dry-run snapshots in
  `dry-runs/2026-06-0[1,6,7]-*` are frozen artifacts of prior extraction
  runs. They are not retroactively patched to include the new example
  shape; the next snapshot reflects the new contract.

## Further Notes

- **Why two globs and not one user-supplied glob.** A user-supplied
  glob would shift the contract from the meta-skill to the operator,
  which makes the workshop demo less reproducible. Two hard-coded
  globs cover the two layouts we have evidence for (Next App Router
  routes; non-routed showcases like v0's). When a third layout
  appears, add a third glob.
- **Why basename-from-directory for `app/<dir>/page.tsx`.** The
  alternative — basename-from-file — would produce 20 `page.md` files
  that all collide. The directory name carries the route, which is
  the natural identifier for the composition the page demonstrates.
- **Why ship the index file separately rather than embed it in
  `SKILL.md`.** `SKILL.md` is the orchestrator; bloating its routing
  table with N example rows per skill would degrade rule-following
  downstream. The index file lets `SKILL.md` carry one row pointing
  at the index plus per-file rows, while the index carries the full
  one-line summary per example. Progressive disclosure stays intact.
- **Why fixtures rather than mocking.** The existing fixture
  infrastructure already exercises the scaffolder against real
  filesystems (see `scripts/tests/fixtures/pass-no-hardcoded-paths/`
  etc.). Adding two more fixtures is cheaper than introducing a
  mocking layer; it also makes the regression visible in the fixture
  diff, not in test output.
- **Companion PRD.** The exemplar pages this contract scans are
  defined in `primer-nextjs-template/PRD-composition-exemplars.md`.
  That PRD quotes the shared contract block verbatim. Edits to the
  block in either PRD must land in both in the same commit; otherwise
  the meta-skill scans paths the template does not ship, or the
  template ships pages the meta-skill ignores.
- **Sequencing.** The template change is safe to land first; the
  meta-skill scans only `app/layout.tsx` until this PRD ships, so
  added pages sit unused. The meta-skill change requires the template
  change to be useful, but not to ship — the fallback (zero exemplars,
  empty `references/examples/`) keeps working when the template stays
  on the smoke-test page.
- **Why this is not "feature creep."** The meta-skill's mission
  sentence in `SKILL.md` is: "A design-system skill is an adapter that
  teaches an agent how to build high-fidelity UI with a specific
  design system." High-fidelity UI requires composition exposure, not
  just API surface. Adding example extraction reinforces the existing
  mission; it does not extend the scope (still tokens / assets /
  component descriptions / component APIs / now compositions, which
  are component APIs in use).
- **Follow-up work, NOT covered here.** (1) Implement the contract
  changes in the affected meta-skill files. (2) Add the two fixtures.
  (3) Run the round-trip extraction once the companion PRD's pages
  land. (4) Compare regeneration smoke-test output against
  `dryrun/02`. Each is a separate task; this PRD only defines the
  contract and its rollout shape.
