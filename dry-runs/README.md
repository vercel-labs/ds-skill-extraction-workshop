# Dry-runs

Per-run rubrics for the Slice 13 end-to-end dry-runs that validate the
workshop's Block 5 + Block 6 path before attendees touch it.

## Files

- [`TEMPLATE.md`](./TEMPLATE.md) — copy this to start a new run.
- [`SUMMARY.md`](./SUMMARY.md) — aggregate stats across all runs.
- `<YYYY-MM-DD>-<network-condition>.md` — one per run.

## Conditions (min 3 of 4)

- `a-good-wifi`
- `b-mobile-hotspot`
- `c-throttled-1mbps`
- `d-airplane-mode` (stretch — validates the Slice 14 USB-stick path)

## Workflow

1. Copy `TEMPLATE.md` to `<YYYY-MM-DD>-<network-condition>.md`.
2. Run the workshop end-to-end under attendee-grade conditions (fresh
   Claude install, fresh clone, no debugging shortcuts).
3. Fill in the rubric as you go.
4. Within 24 hours, patch every surfaced failure mode into this
   starter's `README.md` and/or the companion Setup page.
5. Re-run on the patched artefacts.
6. Update `SUMMARY.md` after every run.

## Source

Slice 13 acceptance criteria: see issue #7.
