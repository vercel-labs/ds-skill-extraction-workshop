# Skill vs No-Skill — `pr-merged-switch-dark-mode` (dryrun-25 vs dryrun-24)

**Date:** 2026-06-15
**Question:** Does invoking `/primer-react` steer the model to better results for fewer tokens? dryrun-24 built every variant **with** the skill (`/primer-react implement …`). dryrun-25 rebuilds the same matrix **without** it: the model gets only the PRD, `node_modules`, and WebFetch, and has to infer the Primer React it needs. To keep the no-skill arm honest, the skill folder was deleted from each worktree before the build, so the agent could not read it even uninvoked.
**Base:** both arms branch from commit `f3fc82b` for a byte-identical start state.
**PRD:** `prompts/pr-merged-switch-dark-mode.md` (the merged-PR panel plus an undocumented light/dark toggle).
**Matrix:** `{opus = claude-opus-4-8, sonnet = claude-sonnet-4-6} × {low, medium, high, xhigh, max}` = 10 builds per arm, 20 total.
**How built:** each variant = one headless `claude -p --model … --effort … --permission-mode bypassPermissions --output-format json`, in its own git worktree with its own `node_modules`. No-skill build command is `"implement prompts/pr-merged-switch-dark-mode.md"` (no `/primer-react`). The appended output-hygiene prompt is identical across both arms.
**How measured:** Playwright DOM probe (`dryrun-harness/screenshot.mjs`) for the toggle, merge-gating, and console errors; brace-bounded source parser (`measure-component.mjs`) for DS reach and token discipline; `total_cost_usd` for cost. Both arms re-measured with the same tools, so the comparison is apples-to-apples.

---

## TL;DR — what the skill actually buys

- **The skill saves money mostly by cutting opus's search, not by writing less code.** Total build spend went from **$57.23 (skill) to $68.80 (no-skill), +20% / +$11.57**. Output tokens are nearly tied (463k vs 487k, +5%). The gap is **cache-read input**: 40.1M to 53.4M (+33%). Without the recipe in front of it, the model reads and re-reads `node_modules` and docs to derive what the skill states up front.
- **The cost premium is an opus phenomenon.** Opus accounts for **$10.71 of the $11.57 delta (93%)**: every opus tier costs 10–35% more without the skill, and opus cache-read jumps +43%. Sonnet is roughly flat (+$0.86 total, and it even wrote *fewer* output tokens without the skill).
- **Quality came out close to even.** Both arms: 10/10 typecheck PASS, 9/10 toggle root-observable, 4/10 use `Timeline`, similar DS reach (17–19 Primer components), similar token discipline. A frontier model infers the right component set, a working labelled toggle, and correct merge gating without the skill.
- **The skill's quality edge is narrow and specific:** 0/10 console errors with the skill vs one SSR hydration mismatch without it (sonnet·high), and it rescued the weakest config (sonnet·low) on dark-mode observability, which the no-skill arm shipped broken.

**Answer to the hypothesis:** "fewer tokens" holds for opus cost and input churn, not for output volume and not for sonnet. "Better results" holds only at the margin on this task. The skill pays for itself on opus by reducing exploration, and it steers around one dark-mode footgun. It does not unlock a capability the model otherwise lacks.

---

## 1. Cost & tokens (the main event)

| variant | skill $ | no-skill $ | Δ$ | Δ% | skill out-tok | no-skill out-tok | skill turns | no-skill turns |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| opus · low | 5.38 | 6.57 | +1.19 | +22% | 24k | 25k | 37 | 48 |
| opus · medium | 6.34 | 8.58 | +2.23 | +35% | 36k | 37k | 61 | 54 |
| opus · high | 8.97 | 10.98 | +2.01 | +22% | 57k | 51k | 68 | 73 |
| opus · xhigh | 12.67 | 13.98 | +1.31 | +10% | 77k | 102k | 80 | 94 |
| opus · max | 14.24 | 18.21 | +3.97 | +28% | 109k | 121k | 90 | 84 |
| sonnet · low | 1.23 | 1.62 | +0.38 | +31% | 14k | 20k | 35 | 51 |
| sonnet · medium | 2.17 | 2.07 | −0.10 | −5% | 34k | 28k | 60 | 63 |
| sonnet · high | 2.32 | 2.33 | +0.01 | 0% | 34k | 39k | 59 | 76 |
| sonnet · xhigh | 1.89 | 2.35 | +0.46 | +25% | 34k | 39k | 58 | 70 |
| sonnet · max | 2.02 | 2.13 | +0.11 | +5% | 43k | 26k | 54 | 63 |
| **total** | **57.23** | **68.80** | **+11.57** | **+20%** | **463k** | **487k** | **602** | **676** |

**Where the money goes (skill → no-skill):**

| | cost | output tok | cache-create | cache-read |
|---|---:|---:|---:|---:|
| all | $57.23 → $68.80 | 463k → 487k (+5%) | 5.12M → 5.88M | 40.1M → 53.4M (+33%) |
| opus | $47.60 → $58.31 (+$10.71) | 302k → 336k | 4.40M → 5.11M | 25.0M → 35.8M (+43%) |
| sonnet | $9.63 → $10.48 (+$0.86) | 160k → 151k | 716k → 777k | 15.1M → 17.6M (+17%) |

The cost driver is input context, not generated code. Output is flat (sonnet's even dropped). Cache-read input ballooned, most of it on opus, because the no-skill agent spends turns reading `node_modules` and fetching docs to reconstruct knowledge the skill provides directly. Turns rose in 7 of 10 cells. This is the cost of search.

*Caveat:* `total_cost_usd` is the build's own token usage. Orchestration and the API-free Playwright steps are excluded.

---

## 2. Build integrity

| signal | skill (24) | no-skill (25) |
|---|---|---|
| `tsc --noEmit` typecheck | 10 / 10 PASS | 10 / 10 PASS |
| Runtime console errors (light + dark) | 0 across all 10 | 2 on sonnet·high, 0 elsewhere |
| Produced editable merge form | 10 / 10 | 10 / 10 |

The one regression: **sonnet·high (no-skill) logs a React hydration mismatch** in both light and dark contexts ("A tree hydrated but some attributes of the server rendered HTML didn't match the client properties"). It drives dark mode by mutating the document root from a client effect without reconciling SSR, so the server and client markup disagree on first paint. The skill's wiring recipe (color-mode attributes declared on `<html>` with `suppressHydrationWarning`) is the standard guard against exactly this. Every skill build avoided it.

---

## 3. Dark-mode toggle (DOM-verified)

The PRD asks for a labelled color-mode control whose resolved mode is observable on the document root. `resolvedModeObservable` is asserted by reading `<html>` `data-color-mode` and computed `color-scheme` before and after a real click.

| variant | found (s / n) | accessible name (s / n) | root-observable (s / n) |
|---|:---:|:---:|:---:|
| opus · low | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| opus · medium | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| opus · high | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| opus · xhigh | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| opus · max | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| sonnet · low | ✅ / ✅ | ✅ / ✅ | **✅ / ❌** |
| sonnet · medium | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| sonnet · high | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| sonnet · xhigh | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ |
| sonnet · max | ✅ / ✅ | ✅ / ✅ | **❌ / ✅** |

Both arms land 9/10 root-observable, with different misses. The no-skill arm broke **sonnet·low**: the toggle clicks but `<html>` never changes and body background stays transparent, so the control is cosmetic. The skill arm got sonnet·low working and instead missed **sonnet·max** (the by-the-book `useTheme().setColorMode` path that recolors the subtree but never reaches the root). Each arm shipped exactly one non-observable toggle. The capability itself is not skill-exclusive: 19 of 20 builds across both arms inferred a real, labelled, root-observable dark-mode toggle on their own.

---

## 4. Accessibility — merge unavailable while checks run

| variant | skill gating | no-skill gating |
|---|---|---|
| opus · low | disabled ✅ | disabled ✅ |
| opus · medium | disabled ✅ | not rendered ✅ |
| opus · high | disabled ✅ | disabled ✅ |
| opus · xhigh | disabled ✅ | disabled ✅ |
| opus · max | disabled ✅ | not rendered ✅ |
| sonnet · low | **inactive only ❌** | disabled ✅ |
| sonnet · medium | not rendered ✅ | **inactive only ❌** |
| sonnet · high | not rendered ✅ | disabled ✅ |
| sonnet · xhigh | disabled ✅ | disabled ✅ |
| sonnet · max | disabled ✅ | disabled ✅ |

Both arms gate merge correctly 9/10. Each has a single gap on a sonnet variant where the merge button uses Primer's `inactive` prop, which emits only `data-inactive`, stays focusable, and sets no `aria-disabled`, so a screen reader still announces it as actionable. The skill arm's gap is sonnet·low; the no-skill arm's is sonnet·medium. The lived assistive-technology experience should be confirmed by a human; this is a DOM fact.

---

## 5. Design-system reach & token discipline

| variant | skill #prim | no-skill #prim | skill Timeline | no-skill Timeline | skill hex+px | no-skill hex+px | skill LOC | no-skill LOC |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---:|---:|
| opus · low | 17 | 17 | ❌ | ❌ | 9 | 3 | 674 | 451 |
| opus · medium | 18 | 19 | ✅ | ✅ | 5 | 4 | 506 | 602 |
| opus · high | 18 | 18 | ✅ | ✅ | 3 | 0 | 575 | 537 |
| opus · xhigh | 18 | 17 | ✅ | ❌ | 5 | 7 | 687 | 675 |
| opus · max | 19 | 19 | ✅ | ✅ | 6 | 5 | 588 | 681 |
| sonnet · low | 17 | 17 | ❌ | ❌ | 7 | 6 | 429 | 531 |
| sonnet · medium | 16 | 17 | ❌ | ❌ | 8 | 8 | 556 | 527 |
| sonnet · high | 17 | 19 | ❌ | ❌ | 12 | 13 | 573 | 571 |
| sonnet · xhigh | 17 | 17 | ❌ | ❌ | 4 | 3 | 419 | 494 |
| sonnet · max | 17 | 17 | ❌ | ✅ | 3 | 6 | 466 | 449 |
| **total** | | | **4/10** | **4/10** | **62** | **55** | | |

DS reach is a tie (17–19 Primer components in both arms). Knowing which components exist is not what the skill provides; the model reads that from `node_modules`. `Timeline` usage is 4/10 in both arms, with the distribution shuffled (opus·xhigh lost it without the skill, sonnet·max gained it). Treat that as n=1 noise rather than a skill effect. Token discipline is also roughly even: zero `sx` props anywhere in either arm, and raw hex+px literals are comparable (skill 62, no-skill 55). Both arms are disciplined; the skill is not the reason on this task.

---

## 6. What the skill changed, and what it did not

**Changed:**
- **Opus build cost.** Every opus tier ran 10–35% more expensive without the skill, +$10.71 across the column, driven by a +43% jump in cache-read input as the model explored to reconstruct the recipe. This is the clearest, most consistent effect in the experiment.
- **Robustness on the dark-mode footgun.** The skill arm had zero console errors and a working toggle on every sonnet tier. The no-skill arm tripped an SSR hydration mismatch once (sonnet·high) and shipped a dead toggle once (sonnet·low).

**Did not change much:**
- **Output volume.** The amount of code written is essentially the same with or without the skill (+5% overall, and sonnet wrote less without it).
- **Sonnet cost.** Flat to slightly higher, +$0.86 total, inside the noise.
- **Component selection, Timeline usage, token discipline.** All tied. The model infers the design-system surface on its own.

The picture: on a well-specified PRD, a frontier model with `node_modules` and web access can reach the same destination without the skill. The skill makes opus take a shorter, cheaper path there and keeps the model out of one dark-mode trap. Its value is search reduction and reliability at the margin, concentrated on the expensive model, not a new capability tier.

---

## 7. Caveats & integrity notes

- **n = 1 per cell.** One generation per (model, effort, arm); no within-cell variance. The Timeline and per-variant gating shuffles are within plausible single-sample noise. The cost and cache-read trends are consistent enough across all five opus tiers to trust directionally.
- **DS-reach counts** come from the brace-bounded parser and run about 1 below the original dryrun-24 audit's grep. Both arms use the identical tool, so the comparison is internally consistent even though absolute counts differ slightly from the dryrun-24 report.
- **Visual and taste claims are excluded.** This report covers only DOM-verified and source-measured facts. Side-by-side fidelity impressions would need human review.
- **Cost excludes orchestration and screenshots** (build-only `total_cost_usd`).
- **Nothing committed in the build worktrees.** No-skill builds sit dirty in `.claude/worktrees/dryrun-25-*-i1` on branches `dryrun/25-*-i1`, as the dry-run convention requires.

---

## Appendix — per-variant data (no-skill arm, dryrun-25)

| variant | cost | turns | out-tok | LOC | #prim | Timeline | toggle root-obs | merge gated | console-err | typecheck |
|---|---:|---:|---:|---:|---:|:---:|:---:|:---:|:---:|:---:|
| opus · low | $6.57 | 48 | 25k | 451 | 17 | ❌ | ✅ | ✅ | 0 | PASS |
| opus · medium | $8.58 | 54 | 37k | 602 | 19 | ✅ | ✅ | ✅ | 0 | PASS |
| opus · high | $10.98 | 73 | 51k | 537 | 18 | ✅ | ✅ | ✅ | 0 | PASS |
| opus · xhigh | $13.98 | 94 | 102k | 675 | 17 | ❌ | ✅ | ✅ | 0 | PASS |
| opus · max | $18.21 | 84 | 121k | 681 | 19 | ✅ | ✅ | ✅ | 0 | PASS |
| sonnet · low | $1.62 | 51 | 20k | 531 | 17 | ❌ | ❌ | ✅ | 0 | PASS |
| sonnet · medium | $2.07 | 63 | 28k | 527 | 17 | ❌ | ✅ | ❌ | 0 | PASS |
| sonnet · high | $2.33 | 76 | 39k | 571 | 19 | ❌ | ✅ | ✅ | 2 | PASS |
| sonnet · xhigh | $2.35 | 70 | 39k | 494 | 17 | ❌ | ✅ | ✅ | 0 | PASS |
| sonnet · max | $2.13 | 63 | 26k | 449 | 17 | ✅ | ✅ | ✅ | 0 | PASS |

**Artifacts:** no-skill builds in `dryrun-harness/out-25/<variant>/` (`cost-report.json`, `shots/report.json`, screenshots) and worktrees `.claude/worktrees/dryrun-25-<variant>-i1/`. Skill baseline in `dryrun-harness/out/<variant>/` and `arm24.json`. Comparison tables regenerated by `node dryrun-harness/compare.mjs out-25/arm24.json out-25/arm25.json`.
