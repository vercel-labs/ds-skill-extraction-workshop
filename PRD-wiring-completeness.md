# PRD — Wiring completeness for `extract-ds-skill`

Extend the `extract-ds-skill` meta-skill's reference-project step so the
produced skill ships a paste-ready, completely-imported wiring section —
not a prose summary that downstream agents cannot reconstruct from.
Today the meta-skill lifts `app/layout.tsx` verbatim but only describes
the companion `app/globals.css` in prose, and only checks that the
upstream CSS file's `@import` lines are path-valid — not that they
cover every `var(--X)` the produced exemplars consume. The result is
that a downstream agent following the produced skill writes an
under-imported `globals.css`, several Primer tokens silently fall back
to the `, 12px` literals in `var(--X, 12px)` declarations, and the
generated app paints "close enough" while drifting off the DS.

This PRD owns the **verbatim-wiring contract** and the
**token-coverage check** between the meta-skill and any reference
project it consumes. It composes with
`PRD-multi-example-extraction.md` (which owns multi-example lifts);
both PRDs share the underlying `[example:project]` source classifier
defined in `references/discovery.md`.

## Problem Statement

The Phase 2 output of `/extract-ds-skill` against
`vercel-labs/primer-nextjs-template` in `dryrun-04` produced a skill
whose `SKILL.md` Setup section describes `app/globals.css` like this:

> Companion `app/globals.css` imports the full `@primer/primitives`
> token surface (size + typography + motion + spacing + light + dark
> themes) — see the verbatim CSS in `./references/foundations/colors.md`
> under the dark-mode rule.

Two problems:

1. **The cross-reference is broken.** `references/foundations/colors.md`
   in the produced skill contains zero `@import` lines. The verbatim
   CSS lives nowhere in the produced skill — only on the upstream
   GitHub URL the meta-skill fetched and discarded after a path-validity
   check.
2. **The prose is too coarse for an agent to reconstruct from.** A
   downstream agent reading "size + typography + motion + spacing +
   light + dark themes" would plausibly write a 6-line `@import` block.
   The upstream `globals.css` has **15** `@import` lines. The missing
   nine include `functional/size/radius.css`,
   `functional/spacing/space.css`, `functional/motion/motion.css`, and
   the three `base/*` files. Without those, `--borderRadius-large`,
   `--stack-padding-normal`, `--base-size-24`, and several other tokens
   consumed by the produced `examples/new.md` and other exemplars never
   resolve. The recipes use `var(--X, fallback-px)` declarations, so
   the page paints with the literal fallbacks rather than the token
   values — visually plausible, factually drifting.

This is the same gap `OBSERVATIONS.md` #8 observed in v0's
`import-design-system` starter. The meta-skill is positioned to close
it but currently does not.

The bug splits into two distinct fixes:

- **(A) Verbatim shipping gap.** Phase 2 lifts `layout.tsx` verbatim
  but does NOT recursively lift the CSS files `layout.tsx` imports.
  The produced `SKILL.md` has no way to ship paste-ready wiring.
- **(B) Coverage-check gap.** Phase 2 grep-resolves each `@import`
  line in the upstream `globals.css` for *path-validity* (each line
  refers to a real file) but never checks *coverage* (every
  `var(--X)` consumed by produced exemplars is brought into scope by
  one of those `@import`s). The current check would pass an incomplete
  wiring as long as every `@import` line resolved — exactly v0's
  failure mode.

Fix (A) makes the produced skill correct under the happy path. Fix
(B) makes the meta-skill detect the failure case so it cannot ship a
broken skill silently.

## Approach

### Change A — Lift companion CSS files verbatim

Extend the reference-project extraction recipe to recursively follow
`import './X.css'` lines from the root entry file and lift each
resolved CSS file verbatim into the scratch workspace. Recursion is
bounded to depth 3 and stays inside the consumer-app source tree
(`app/`, `src/`) — `@import "@pkg/..."` lines inside CSS files stay
as paths (they are still grep-validated for path-validity but their
content is not lifted from `node_modules/`).

The produced `SKILL.md` Setup section then carries one verbatim code
block per lifted CSS file, under a `### Companion CSS — <path>`
subheading per file, alongside the existing `layout.tsx` code block.
The prose-summary fallback ("imports the full token surface") is
removed; cross-refs to "verbatim CSS in
`references/foundations/<page>.md`" are forbidden.

### Change B — Token coverage assertion

New script `scripts/check-token-coverage.sh <ds-package-root>
<wiring-scratch-or-skill-dir>`. Logic:

1. Collect every `var(--X)` from the **code-block surfaces only** of
   the produced skill: `SKILL.md` Setup section fenced blocks,
   `references/examples/*.md` `## Composition (verbatim)` blocks,
   `references/components/*.md` `## Composition examples` blocks.
   **Skip** `references/tokens.md`, `references/foundations/*.md`, and
   `references/anti-patterns.md` — those carry Bad-column `var()`
   literals that are illustrative-of-rules, not code-to-ship.
2. For each `X`, locate the file in `<ds-package-root>/dist/css/` (or
   equivalent path the DS uses) that defines `--X` via
   `grep -rl "^[[:space:]]*--X:"`.
3. Assert that file appears as an `@import` line in one of the lifted
   CSS files. If not, emit a per-var failure row:
   `MISSING: --X consumed in <file>:<line>, defined in <ds-root>/<path>.css, NOT imported by any lifted CSS file`.
4. NO-OP cleanly when zero `var(--X)` are consumed (Tailwind-style
   apps); emit `TOKEN_COVERAGE=NOOP`.

The script is wired in two places:

- **Phase 2 hard gate** at the end of `validate.md`
  Reference-project extraction step (step 5). Failure blocks the
  wait-for-approval gate; the user sees the coverage report and
  either accepts `[VERIFY]` markers or loops back to discovery.
- **Phase 3 post-emit check** as new assertion `TOKEN_COVERAGE`
  (check #11) in `scripts/check-skill-docs.sh` produced-mode, so
  re-extracted or hand-edited skills get the same protection.

DS-agnostic: `<ds-package-root>` is passed explicitly by the caller
(taken from Phase 1 discovery), never parsed from `@import` lines.

## Files to modify

| Path | Change |
|---|---|
| `.claude/skills/extract-ds-skill/references/reference-project.md` | Extend § "Extraction recipe" recursion: follow `import './X.css'` lines depth-3 within consumer-app tree, lift each CSS file verbatim. Update § "Output contract" (lines ~196-226) to specify a *repeating* `### Companion CSS — <path>` block per lifted file. |
| `.claude/skills/extract-ds-skill/references/skill-template.md` | Update SKILL.md Setup template (lines ~25-51) to require a `### Companion CSS — <path>` code block per lifted CSS file. Delete prose-summary fallback. Forbid cross-refs to "verbatim CSS in foundations/*.md". |
| `.claude/skills/extract-ds-skill/references/validate.md` | (a) Step 5 in Reference-project extraction step calls `bash scripts/check-token-coverage.sh <ds-pkg-root> .extract-ds-skill-scratch/`; failure blocks approval. (b) Proof-point line format (lines 67-71) changes: `Wiring extracted from <ref>@<entry> (<framework>, N lines, K CSS files lifted, M tokens consumed, M covered)`. (c) Worked example block (lines 73-91) updated to show the new line + a `TOKEN_COVERAGE=PASS` line. |
| `.claude/skills/extract-ds-skill/references/persist.md` | Update Phase 3 materialization shape: per-file `### Companion CSS — <path>` blocks lift verbatim from scratch into produced SKILL.md Setup. |
| `.claude/skills/extract-ds-skill/references/anti-patterns.md` | New row, slug `wiring/css-prose-summary`: *"Companion CSS files lifted from the reference project must ship verbatim in SKILL.md Setup. Never summarize as prose (e.g. 'imports the full token surface'); never cross-ref to foundation files for verbatim wiring. The agent that uses this skill cannot reconstruct a token import list from prose."* |
| `.claude/skills/extract-ds-skill/SKILL.md` | Update Phase 2 flow text to mention the recursive CSS lift + token-coverage hard gate. Update the in-orchestrator worked-example block to mirror the validate.md proof-point format change. |
| `.claude/skills/extract-ds-skill/scripts/check-token-coverage.sh` (NEW) | The script described above. Mirror the arg shape of `scripts/validate.sh` (DS package as positional). Exit codes: 0 = PASS, 0 = NOOP (with `TOKEN_COVERAGE=NOOP` on stdout), 1 = FAIL with per-var report. |
| `.claude/skills/extract-ds-skill/scripts/check-skill-docs.sh` | Add check #11 `TOKEN_COVERAGE` in produced-mode that calls `check-token-coverage.sh` against a persisted skill. |
| `.claude/skills/extract-ds-skill/scripts/tests/` | Three fixtures: (1) `primer-shaped-complete` — exemplar consumes `--borderRadius-large`, wiring imports `functional/size/radius.css` → PASS; (2) `primer-shaped-incomplete` — exemplar consumes `--borderRadius-large`, wiring omits `functional/size/radius.css` → FAIL with the expected MISSING row; (3) `tailwind-shaped` — no `var(--X)` in any code block → NOOP. Add cases to `run-tests.sh`. |

## Notes / risks

- **Recursion depth.** Depth 3 is a safety bound, not a discovery
  limit. The vast majority of real apps have depth 1 (`layout.tsx` →
  `globals.css`). Two-hop chains (`globals.css` → `tokens.css` →
  `themes.css`) are rare but plausible. If recursion hits depth 3 with
  more files unresolved, the agent emits
  `[VERIFY: CSS import depth exceeded — manually review additional files at <paths>]`
  and continues.
- **The `dryrun-04` produced skill stays untouched.** Per user
  direction. This change prevents the bug for future runs only.
- **Backward compatibility.** Existing produced skills (none in
  production yet) that lack the new `### Companion CSS` blocks will
  fail the new `check-skill-docs.sh` check #11 in produced-mode.
  Acceptable; they were broken anyway.
- **Multi-package wiring.** If `globals.css` imports from two DS
  packages (e.g. `@primer/primitives` + a sibling utility package),
  the coverage script needs to be re-invoked once per package-root,
  OR take a list of package-roots. v1: single package-root, log a
  warning when other `@pkg/*` `@import`s appear in the lifted CSS.
  Address multi-package in a follow-on if a real DS surfaces the case.
- **Composes with `PRD-multi-example-extraction.md`.** That PRD adds
  more example files to the produced skill; each new example adds more
  `var(--X)` consumption surface that this PRD's coverage check
  protects. Order of landing does not matter; the two PRDs are
  independent at the file level (different sections of the same
  meta-skill files, no overlapping edits).

## Verification

End-to-end checks, in order:

1. **Re-run `/extract-ds-skill` against `primer-nextjs-template`**
   (the same input `dryrun-04` used). Expected output: the new
   produced `SKILL.md` Setup section contains BOTH the verbatim
   `layout.tsx` code block AND a verbatim
   `### Companion CSS — app/globals.css` block listing all 15
   `@import` lines. The prose summary "imports the full
   `@primer/primitives` token surface" is gone. No cross-ref to
   `colors.md` for verbatim CSS.
2. **Phase 2 proof-point line shows the new format.** Expected:
   `Wiring extracted from github.com/vercel-labs/primer-nextjs-template@app/layout.tsx (next-app, 30 lines, 1 CSS file lifted, 28 tokens consumed, 28 covered)`
   (counts approximate). Plus a `TOKEN_COVERAGE=PASS` line.
3. **Negative test via fixture `primer-shaped-incomplete`.** Run
   `bash scripts/tests/run-tests.sh`. Expected:
   `check-token-coverage.sh` exits 1 with output naming the missing
   `@import` line
   (`MISSING: --borderRadius-large consumed in examples/new.md:38, defined in @primer/primitives/dist/css/functional/size/radius.css, NOT imported by any lifted CSS file`).
4. **NO-OP test via fixture `tailwind-shaped`.** Same harness,
   expected exit 0 with `TOKEN_COVERAGE=NOOP`.
5. **Post-hoc check on `dryrun-04`** (read-only verification): run
   `bash scripts/check-skill-docs.sh --produced --skill .claude/worktrees/dryrun-04/.claude/skills/primer/`.
   Expected: check #11 `TOKEN_COVERAGE` reports FAIL because the
   produced skill lacks the verbatim `globals.css` block — the script
   has nothing to coverage-check against, so it fails closed. (This
   confirms the post-hoc check would have caught the bug on the
   already-produced artifact.)
