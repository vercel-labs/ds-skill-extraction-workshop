# Pivot-1 dry-run — 2026-06-06

Frozen artifacts from the first end-to-end dry-run of the hands-on
segment **against the post-pivot product-surface component set**
(see `ds/PIVOT.md`, dated 2026-06-06). This directory is **instructor
reference**, not an attendee starting point. Attendees regenerate
these artifacts live during the workshop; this snapshot exists so
future dry-runs have something to diff against.

## What's here

- `extracted-skill/` — the design-system skill `extract-ds-skill`
  produced from `ds/`. Mirrors what `.claude/skills/ds/` should
  contain after a successful Phase 3. Ten files:
  `SKILL.md`, `AGENTS.md`, `references/anti-patterns.md`,
  `references/tokens.md`, and `references/components/{page-header,
  data-table,select-panel,banner,action-menu,action-list}.md`.
- `RUBRIC.md` — per-run rubric derived from `dry-runs/TEMPLATE.md`.
  Partially filled by the agent run; remaining fields (Phase 4 / 5,
  timings, errors, UX confusion) belong to the operator's manual
  observation pass.
- `page.tsx` — **not present yet.** This snapshot stopped at the end
  of Phase 3 (skill persisted, audit script PASS). The
  `prompts/issues.md` + `prompts/audit.md` passes have not been run
  for this dry-run. Copy `app/page.tsx` into this directory after
  those land.

## Diff against earlier runs

```bash
# Diff the extracted skill against the pre-pivot baseline:
diff -r dry-runs/2026-06-01-baseline/extracted-skill/ \
        dry-runs/2026-06-06-pivot-1/extracted-skill/
```

The baseline used the old form components (`TextInput`, `Button`,
`Checkbox`, `FormControl`) and the `inactive` vs `disabled` headline
trap. This run uses the product-surface set (`PageHeader`, `DataTable`,
`SelectPanel`, `Banner`, `ActionMenu`, `ActionList`) and the
`PageHeader` slot-composition rule as the headline trap. The diff is
expected to be large and structural, not regression-flavoured.

## Known limitations of this snapshot

- **Phase 4 / 5 not run.** No `app/page.tsx` artefact. The audit prompt
  hasn't been exercised against this skill yet. The "headline trap
  caught?" cell in `SUMMARY.md` is therefore blank until that pass.
- **`validate.sh` aborted on macOS bash 3.2.** The meta-skill's
  `scripts/validate.sh` uses `mapfile` (bash 4+). The agent ran the
  equivalent typecheck + grep manually to produce the proof point. The
  meta-skill script needs a portability fix before the next attendee
  run on a default-shell macOS machine.
- **Token rules deferred.** `references/tokens.md` is a stub with 5
  `[VERIFY]` markers — intentional v1 deferral until a token trap
  surfaces in generated UI.
