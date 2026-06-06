# Dry-runs

Per-run snapshots and rubrics for the Slice 13 end-to-end dry-runs that
validate the workshop's Block 5 + Block 6 path before attendees touch
it.

## Files

- [`TEMPLATE.md`](./TEMPLATE.md) — copy the body into each run's `RUBRIC.md`.
- [`SUMMARY.md`](./SUMMARY.md) — aggregate stats across all runs.
- `<YYYY-MM-DD>-<label>/` — one directory per run.

Each run directory contains:

- `README.md` — context for the snapshot (what was generated, what was
  limited, how to diff against earlier runs).
- `RUBRIC.md` — the per-run rubric, derived from [`TEMPLATE.md`](./TEMPLATE.md).
- `extracted-skill/` — frozen copy of `.claude/skills/ds/` from the
  end of `extract-ds-skill` Phase 3.
- `page.tsx` (or earlier per-prompt artefact name) — frozen copy of
  `app/page.tsx` after the generation prompt runs. Optional — omit if
  the run stopped at Phase 3.

## Labels

Pick whichever fits the run. Examples:

- Network-condition runs: `a-good-wifi`, `b-mobile-hotspot`, `c-throttled-1mbps`, `d-airplane-mode` (stretch — validates Slice 14 USB-stick path).
- Pivot/scope runs: `pivot-1` (post-pivot product-surface set), `pivot-2`, `post-token-refactor`.
- Freeze runs: `freeze-day-rehearsal`, `final-freeze`.

Min target: 3 of the 4 network conditions before the freeze.

## Workflow

1. Create `dry-runs/<YYYY-MM-DD>-<label>/` and copy the body of
   [`TEMPLATE.md`](./TEMPLATE.md) into `RUBRIC.md` inside it.
2. Run the workshop end-to-end under attendee-grade conditions (fresh
   Claude install, fresh clone, no debugging shortcuts).
3. Fill in the rubric as you go. At the end of `extract-ds-skill`'s
   Phase 3, accept the snapshot prompt — the meta-skill will copy
   `.claude/skills/ds/` into `extracted-skill/` for you.
4. After the issues-page prompt + audit prompt land, copy
   `app/page.tsx` to the run directory.
5. Within 24 hours, patch every surfaced failure mode into this
   starter's `README.md` and/or the companion Setup page.
6. Re-run on the patched artefacts.
7. Update [`SUMMARY.md`](./SUMMARY.md) after every run.

## Source

Slice 13 acceptance criteria: see issue #7.
Component pivot (2026-06-06): see `ds/PIVOT.md`.
