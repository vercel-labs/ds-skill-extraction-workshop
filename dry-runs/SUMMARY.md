# Dry-run summary

> Aggregate stats across all dry-runs. Update after every run. The final
> entry under "Block 6 quote" is the failure-rate sentence used on the
> workshop's stats slide.

## Runs

| Date | Label | Rubric | Headline trap caught? | Time-to-catch | `[VERIFY]` count |
|---|---|---|---|---|---|
| `2026-06-01` | `baseline` | [link](./2026-06-01-baseline/README.md) | n/a — pre-pivot, no headline trap | n/a | n/a |
| `YYYY-MM-DD` | `<label>` | [link](./YYYY-MM-DD-<label>/RUBRIC.md) | | | |

## Aggregate stats

> "Headline trap" = the PageHeader slot-composition violation (post-pivot).
> Pre-pivot baseline used the `inactive` vs `disabled` trap — not comparable.

- **Runs completed (post-pivot):** `<n / target>`
- **Headline trap caught in ≤60s:** `<n / n>`
- **Average time-to-catch:** `<mm:ss>`
- **Average `[VERIFY]` markers at discovery gate:** `<n>`
- **Phase 1 (clone → discovery gate) median:** `<mm:ss>`
- **Phase 2 (discovery → validation proof) median:** `<mm:ss>`
- **Phase 3 (validation → persisted skill) median:** `<mm:ss>`
- **Phase 4 (persisted → generated `app/page.tsx`) median:** `<mm:ss>`
- **Phase 5 (generated → audit complete) median:** `<mm:ss>`

## Recurring failure modes

> Anything that surfaced in ≥2 runs. Each entry links to the patches
> that addressed it.

- ...

## Prompt iterations

> If `prompts/issues.md` or `prompts/audit.md` were edited during dry-runs,
> document the diff and the reason here. Spec lock: prompts are NOT
> paraphrased live on stage; any change is committed first and the dry-run
> rerun on the new body.

- ...

## Block 6 quote

> Final quote-ready sentence for the workshop's stats slide. Replace the
> placeholder once the last in-window dry-run completes.

- `<N of M dry-runs caught the PageHeader slot-composition violation in under 60 seconds.>`

## Final freeze-day run

- **Date:** `<YYYY-MM-DD>` (target: ≥2 days before workshop freeze)
- **Machine:** attendee-grade laptop
- **Rubric:** [link](./<YYYY-MM-DD>-freeze-day/RUBRIC.md)
- **All acceptance criteria green?** `<yes/no>`
