# Dry-run rubric — `<YYYY-MM-DD>` · `<label>`

> Copy this file to `dry-runs/<YYYY-MM-DD>-<label>/RUBRIC.md` before the
> run starts. Fill in fields as you go. One rubric per run. Source of truth
> for the Slice 13 patch-back loop: every FAIL or UX-confusion note here
> must translate into a patch to this starter's `README.md` and/or the
> companion Setup page within 24 hours.

## Run metadata

- **Date:** `<YYYY-MM-DD>`
- **Label:** `<network-condition or short tag — e.g. a-good-wifi, pivot-1, post-token-refactor>`
- **Operator:** `<name>`
- **Machine:** `<make/model, OS, RAM>`
- **Node version:** `<output of node --version>`
- **pnpm version:** `<output of pnpm --version>`
- **Claude Code version:** `<output of claude --version>`
- **Fresh Claude install:** `<yes/no>`
- **Fresh git clone:** `<yes/no>`
- **Fresh Anthropic API key:** `<yes/no>`
- **Starter commit SHA:** `<git rev-parse HEAD>`

## Phase timings

Record wall-clock time per phase. Use `T0` = moment the attendee starts
the clone command. All deltas in `mm:ss`.

| Phase | Start | End | Δ |
|---|---|---|---|
| Clone → `extract-ds-skill` Phase 1 gate (discovery summary visible) | T0 | | |
| Phase 1 confirm → Phase 2 validation proof point visible | | | |
| Phase 2 approve → extracted skill written to `.claude/skills/ds/` | | | |
| Extracted skill → `prompts/issues.md` run → `app/page.tsx` generated | | | |
| Generated page → `prompts/audit.md` run → PASS/FAIL output complete | | | |

## Phase 1 — Discovery gate

- **Number of `[VERIFY]` markers surfaced in discovery summary:** `<n>`
- **Components named in the discovery summary:** `<list>` (target: all 6 of `PageHeader`, `DataTable`, `SelectPanel`, `Banner`, `ActionMenu`, `ActionList`)
- **Headline rule surfaced as a candidate (PageHeader slot composition — `LeadingVisual`/`TrailingVisual` INSIDE `TitleArea`; chrome OUTSIDE):** `<yes/no>`
- **Other rule candidates surfaced:** `<list — e.g. Banner variant semantics, DataTable rowHeader, SelectPanel cancel snapshot>`
- **Slug-collision warning fired (existing `.claude/skills/ds/`):** `<yes/no>`
- **Operator corrections at the gate:** `<freeform>`

## Phase 2 — Validation

- **Validation proof point visible (`N props verified, 0 hallucinations`):** `<yes/no>`
- **`tsc --noEmit` on scratch probe:** `<pass/fail>`
- **Grep-resolves PASS count:** `<n / total>`
- **Hallucinations surfaced:** `<n>`
- **Open `[VERIFY]` markers at gate:** `<n>`
- **Operator iterated in scratch before approving:** `<no | yes — describe>`

## Phase 3 — Persist

- **Skill files written to `.claude/skills/ds/`:** `<yes/no>`
- **`check-skill-docs.sh` exit code:** `<0 | non-zero — paste failures>`
- **`[VERIFY]` markers in persisted skill:** `<n>` (target: ≤5 for tokens-deferral, ≤2 false-positive self-references in SKILL.md)
- **Snapshot to `dry-runs/<date>-<label>/` accepted:** `<yes/no>`

## Phase 4 — Generation (`prompts/issues.md`)

- **Did `app/page.tsx` get written:** `<yes/no>`
- **`pnpm tsc --noEmit` on `app/page.tsx`:** `<pass/fail>` (paste error if fail)
- **Wrappers used:** `<list — target: at least PageHeader + DataTable + SelectPanel + Banner + ActionMenu + ActionList>`
- **Mock data inline (no new deps):** `<yes/no>`
- **Prompt iterated?** `<no | yes — paste new body and reason>`

## Phase 5 — Audit (`prompts/audit.md`)

- **Audit produced PASS/FAIL per rule with line numbers:** `<yes/no>`
- **Headline FAIL caught (PageHeader slot composition violation):** `<yes/no>`
- **Time-to-catch (audit prompt paste → surfaced FAIL):** `<mm:ss>` (target: ≤60s)
- **FAIL citation in `app/page.tsx`:** `<file:line>`
- **FAIL citation in `.claude/skills/ds/` with rule slug:** `<slug @ file:line>` (e.g. `component/page-header-slot-composition @ references/components/page-header.md:NN`)
- **Other traps surfaced (Banner variant semantics, DataTable rowHeader, DataTable pre-sort, SelectPanel cancel snapshot, ActionMenu controlled pairing, ActionList danger variant):** `<list>`
- **Prompt iterated?** `<no | yes — paste new body and reason>`

## UX confusion observed

> Where did the attendee pause, re-read, or get stuck? Be concrete — time
> stamps, file paths, the exact wording that confused them. Every entry
> here is a candidate for a 24h patch-back to `README.md` or the
> companion Setup page.

- ...

## Errors

> Full error text + recovery path. Include Claude Code errors, Anthropic
> API errors, network errors, install errors, and meta-skill script
> failures (`validate.sh`, `scaffold.sh`, `check-skill-docs.sh`).

- ...

## Failure-rate quote for Block 6

> One sentence quote-ready for the workshop's Block 6 stats slide. Form:
> "N of M runs caught the PageHeader slot-composition violation in under
> 60 seconds." Swap in whichever headline trap the run made canonical.

- ...

## Patches landed within 24h

> Link the commits + PRs (in this starter and/or `ship-2026-companion-site`)
> that resolve the items above. If a patch is deferred, say why and put
> the follow-up on a tracked issue.

- ...
