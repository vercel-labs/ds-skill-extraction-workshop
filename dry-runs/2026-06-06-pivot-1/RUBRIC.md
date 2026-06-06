# Dry-run rubric — 2026-06-06 · pivot-1

> Filled-in fields below are what the meta-skill run produced. Blank fields
> belong to the operator's manual observation pass (timings, UX confusion,
> errors, Phase 4/5 outcomes).

## Run metadata

- **Date:** 2026-06-06
- **Label:** pivot-1 (first end-to-end run against the post-pivot product-surface component set)
- **Operator:** Diego de M.
- **Machine:** `<fill in: make/model, OS, RAM>`
- **Node version:** v22.19.0
- **pnpm version:** `<fill in: pnpm --version>`
- **Claude Code version:** `<fill in: claude --version>`
- **Fresh Claude install:** no (carried session)
- **Fresh git clone:** no (continuing branch `feature/extract-ds-skill`)
- **Fresh Anthropic API key:** no
- **Starter commit SHA:** `<fill in: git rev-parse HEAD>`

## Phase timings

| Phase | Start | End | Δ |
|---|---|---|---|
| Clone → `extract-ds-skill` Phase 1 gate (discovery summary visible) | T0 | | `<fill in>` |
| Phase 1 confirm → Phase 2 validation proof point visible | | | `<fill in>` |
| Phase 2 approve → extracted skill written to `.claude/skills/ds/` | | | `<fill in>` |
| Extracted skill → `prompts/issues.md` run → `app/page.tsx` generated | | | not run |
| Generated page → `prompts/audit.md` run → PASS/FAIL output complete | | | not run |

## Phase 1 — Discovery gate

- **Number of `[VERIFY]` markers surfaced in discovery summary:** 0
- **Components named in the discovery summary:** PageHeader, DataTable, SelectPanel, Banner, ActionMenu, ActionList (6/6)
- **Headline rule surfaced as a candidate (PageHeader slot composition):** yes — cited `ds/DESIGN.md:12` + `ds/components/PageHeader.docs.tsx:5`
- **Other rule candidates surfaced:** Banner variant semantics (`critical` blocking-only), DataTable rowHeader + pre-sort
- **Slug-collision warning fired (existing `.claude/skills/ds/`):** yes — surfaced as an open question in the discovery summary; operator confirmed overwrite default
- **Operator corrections at the gate:** "looks good, no notes"

## Phase 2 — Validation

- **Validation proof point visible (`N props verified, 0 hallucinations`):** yes
- **`tsc --noEmit` on scratch probe:** pass (exit 0 on `probe.tsx` + `ds-probe.tsx`)
- **Grep-resolves PASS count:** 39 / 39 (6 top-level components + 20 compound subcomponents + 13 props/variants/type aliases)
- **Hallucinations surfaced:** 0
- **Open `[VERIFY]` markers at gate:** 0
- **Operator iterated in scratch before approving:** no — approved on first proof point with "go"
- **Notes:** `.claude/skills/extract-ds-skill/scripts/validate.sh:21` aborted with `mapfile: command not found` (bash 3.2 on macOS). Equivalent typecheck + grep run manually to produce the proof point. Meta-skill script needs a portability fix.

## Phase 3 — Persist

- **Skill files written to `.claude/skills/ds/`:** yes — 10 files (SKILL.md, AGENTS.md, references/anti-patterns.md, references/tokens.md, references/components/{page-header,data-table,select-panel,banner,action-menu,action-list}.md)
- **`check-skill-docs.sh` exit code:** 0 (ROUTING_TABLE=PASS, COMPONENT_FILES=PASS, BEST_PRACTICES_COVERAGE=PASS, SLUG_RESOLUTION=PASS, SCOPE_GUARDRAIL=PASS, CHECK_RESULT=PASS)
- **`[VERIFY]` markers in persisted skill:** 7 total — 5 intentional tokens-deferral markers in `references/tokens.md` (lines 11, 15, 19, 23, 27), 2 false positives in `SKILL.md` (lines 65, 76) where the literal string `[VERIFY]` appears in prose describing the convention itself
- **Snapshot to `dry-runs/2026-06-06-pivot-1/` accepted:** yes — operator requested snapshot after closing message; meta-skill being updated to prompt for this in future runs

## Phase 4 — Generation (`prompts/issues.md`)

- **Did `app/page.tsx` get written:** not run
- **`pnpm tsc --noEmit` on `app/page.tsx`:** n/a
- **Wrappers used:** n/a
- **Mock data inline (no new deps):** n/a
- **Prompt iterated?** n/a

## Phase 5 — Audit (`prompts/audit.md`)

- **Audit produced PASS/FAIL per rule with line numbers:** not run
- **Headline FAIL caught (PageHeader slot composition violation):** n/a
- **Time-to-catch (audit prompt paste → surfaced FAIL):** n/a
- **FAIL citation in `app/page.tsx`:** n/a
- **FAIL citation in `.claude/skills/ds/` with rule slug:** n/a
- **Other traps surfaced:** n/a
- **Prompt iterated?** n/a

## UX confusion observed

- Operator (instructor) noticed the meta-skill did not produce a `dry-runs/<date>-<label>/` snapshot and had to ask why. Root cause: the meta-skill's persist target was hard-coded to `.claude/skills/<slug>/` only, with no awareness of the per-project `dry-runs/` convention. Patch in flight (Task #6 this run): add an optional snapshot prompt to the closing flow.
- Operator also observed `dry-runs/TEMPLATE.md` was stale (referenced pre-pivot form components and `app/sign-in.tsx`). Patch landed in this run: TEMPLATE.md + README.md + SUMMARY.md refactored for the product-surface set.

## Errors

- `scripts/validate.sh: line 21: mapfile: command not found` — macOS ships bash 3.2; the script needs bash 4+ for `mapfile`. Workaround: run typecheck + grep manually. Permanent fix: rewrite the array read as a `while IFS= read -r` loop, or shebang `/usr/bin/env -S bash` and require homebrew bash on PATH.

## Failure-rate quote for Block 6

- Cannot quote yet — Phase 5 audit not run for this dry-run. Re-run with the issues prompt + audit prompt to fill in.

## Patches landed within 24h

- `dry-runs/TEMPLATE.md` refactored from form-components to product-surface flow (this run).
- `dry-runs/README.md` updated to document the directory-snapshot convention (this run).
- `dry-runs/SUMMARY.md` updated for the post-pivot headline trap (this run).
- `extract-ds-skill` SKILL.md + `references/persist.md` patched to prompt for `dry-runs/<date>-<label>/` snapshot at the end of Phase 3 (this run, see Task #6).
- `scripts/validate.sh` bash-4 portability fix — DEFERRED. File issue.
