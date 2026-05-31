# Dry-run summary

> Aggregate stats across all dry-runs. Update after every run. The final
> entry under "Block 6 quote" is the failure-rate sentence used on the
> workshop's stats slide.

## Runs

| Date | Condition | Rubric | `disabled` caught? | Time-to-catch | `[VERIFY]` count |
|---|---|---|---|---|---|
| `YYYY-MM-DD` | `a-good-wifi` | [link](./YYYY-MM-DD-a-good-wifi.md) | | | |
| `YYYY-MM-DD` | `b-mobile-hotspot` | [link](./YYYY-MM-DD-b-mobile-hotspot.md) | | | |
| `YYYY-MM-DD` | `c-throttled-1mbps` | [link](./YYYY-MM-DD-c-throttled-1mbps.md) | | | |
| `YYYY-MM-DD` | `d-airplane-mode` | [link](./YYYY-MM-DD-d-airplane-mode.md) | | | |

## Aggregate stats

- **Runs completed:** `<n / 4>` (min target: 3)
- **`disabled` violation caught in ≤60s:** `<n / n>`
- **Average time-to-catch:** `<mm:ss>`
- **Average `[VERIFY]` markers at discovery gate:** `<n>`
- **Phase 1 (clone → gate) median:** `<mm:ss>`
- **Phase 2 (gate → extracted) median:** `<mm:ss>`
- **Phase 3 (extracted → generated form) median:** `<mm:ss>`
- **Phase 4 (generated → audit complete) median:** `<mm:ss>`

## Recurring failure modes

> Anything that surfaced in ≥2 runs. Each entry links to the patches
> that addressed it.

- ...

## Prompt iterations

> If `prompts/sign-in.md` or `prompts/audit.md` were edited during dry-runs,
> document the diff and the reason here. Spec lock: prompts are NOT
> paraphrased live on stage; any change is committed first and the dry-run
> rerun on the new body.

- ...

## Block 6 quote

> Final quote-ready sentence for the workshop's stats slide. Replace the
> placeholder once the last in-window dry-run completes.

- `<N of M dry-runs caught the disabled violation in under 60 seconds.>`

## Final freeze-day run

- **Date:** `<YYYY-MM-DD>` (target: ≥2 days before workshop freeze)
- **Machine:** attendee-grade laptop
- **Rubric:** [link](./<YYYY-MM-DD>-freeze-day.md)
- **All acceptance criteria green?** `<yes/no>`
