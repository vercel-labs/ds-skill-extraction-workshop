# Dry-run rubric — `<YYYY-MM-DD>` · `<network-condition>`

> Copy this file to `dry-runs/<YYYY-MM-DD>-<network-condition>.md` before the
> run starts. Fill in fields as you go. One rubric per run. Source of truth
> for the Slice 13 patch-back loop: every FAIL or UX-confusion note here
> must translate into a patch to this starter's `README.md` and/or the
> companion Setup page within 24 hours.

## Run metadata

- **Date:** `<YYYY-MM-DD>`
- **Network condition:** `<a-good-wifi | b-mobile-hotspot | c-throttled-1mbps | d-airplane-mode>`
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
| Clone → Phase 1 gate (discovery summary visible) | T0 | | |
| Gate → extracted skill written to `.claude/skills/ds/` | | | |
| Extracted skill → generated `app/sign-in.tsx` | | | |
| Generated form → audit PASS/FAIL output complete | | | |

## Phase 1 — Discovery gate

- **Number of `[VERIFY]` markers surfaced:** `<n>`
- **Components named in the discovery summary:** `<list>` (target: ≥3 of `TextInput`, `Button`, `Checkbox`, `FormControl`)
- **Headline rule (`inactive` vs `disabled`) surfaced as `[VERIFY]`:** `<yes/no>`
- **Operator corrections at the gate:** `<freeform>`

## Phase 2 — Generation

- **Did `app/sign-in.tsx` get written:** `<yes/no>`
- **`pnpm tsc --noEmit` on `app/sign-in.tsx`:** `<pass/fail>` (paste error if fail)
- **Wrappers used:** `<list — target: at least TextInput + Button + FormControl>`
- **Prompt iterated?** `<no | yes — paste new body and reason>`

## Phase 3 — Audit

- **Audit produced PASS/FAIL per rule:** `<yes/no>`
- **`disabled` violation caught:** `<yes/no>`
- **Time-to-catch (prompt paste → surfaced FAIL):** `<mm:ss>` (target: ≤60s)
- **FAIL citation in `app/sign-in.tsx`:** `<file:line>`
- **FAIL citation in `.claude/skills/ds/` with rule slug:** `<slug @ file:line>`
- **Prompt iterated?** `<no | yes — paste new body and reason>`

## UX confusion observed

> Where did the attendee pause, re-read, or get stuck? Be concrete — time
> stamps, file paths, the exact wording that confused them. Every entry
> here is a candidate for a 24h patch-back to `README.md` or the
> companion Setup page.

- ...

## Errors

> Full error text + recovery path. Include Claude Code errors, Anthropic
> API errors, network errors, install errors.

- ...

## Failure-rate quote for Block 6

> One sentence quote-ready for the workshop's Block 6 stats slide. Form:
> "N of M runs caught the `disabled` violation in under 60 seconds."

- ...

## Patches landed within 24h

> Link the commits + PRs (in this starter and/or `ship-2026-companion-site`)
> that resolve the items above. If a patch is deferred, say why and put
> the follow-up on a tracked issue.

- ...
