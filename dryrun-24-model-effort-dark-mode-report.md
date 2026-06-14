# Model × Effort Audit — `pr-merged-switch-dark-mode` (dryrun-24)

**Date:** 2026-06-14
**PRD:** `prompts/pr-merged-switch-dark-mode.md` (commit `f3fc82b`) — the merged-PR "theater" encore, **plus a user-facing light/dark toggle the skill does not document** (so the toggle also tests each model's ability to *infer or research* how to drive Primer's color mode).
**Skill under test:** `.claude/skills/primer-react/` (Primer React `@primer/react` 38.26.0).
**Matrix:** `{opus = claude-opus-4-8, sonnet = claude-sonnet-4-6} × {low, medium, high, xhigh, max}` = **10 builds.**
**How built:** each variant = one headless `claude -p --model … --effort … --permission-mode bypassPermissions --output-format json "/primer-react implement prompts/pr-merged-switch-dark-mode.md"`, in its own git worktree (`dryrun/24-<model>-effort-<lvl>-i1`) with its own `node_modules`. Cost is the build's real `total_cost_usd`.
**How measured:** per variant — 3 stages (initial / checks-green / post-merge) × light+dark system contexts + a deterministic toggle test, captured with Playwright (`dryrun-harness/screenshot.mjs`). Toggle and merge-gating findings are read from the **DOM**, not inferred from pixels.

---

## TL;DR — the sweet spot

- **The model is the dominant cost lever, by ~3–7×. Effort is a rounding error on sonnet and a 2.6× multiplier on opus.**
- **Both models nailed the undocumented dark-mode toggle.** 10/10 shipped a real, labelled color-mode control; 9/10 also made the resolved mode observable on the document root (the one miss recolors correctly but only inside the React subtree).
- **opus renders visibly richer, more GitHub-faithful UIs — even at `low` effort.** opus is the only model that reaches for `Timeline`; the climb from opus-low → opus-max buys *refinement*, not a new tier.
- **Recommended picks:**
  - **Best value overall → `sonnet · medium` (~$2.17):** clean, correct, accessible, dark-mode-capable. ~⅓ the cost of the cheapest opus.
  - **Best value when GitHub-fidelity / "wow" matters → `opus · low` (~$5.38):** near-top richness at the bottom of the opus price ladder.
  - **Diminishing returns → `opus · xhigh/max` and `sonnet · >medium`:** pay 2.4–2.6× (opus) for marginal polish, or more effort on sonnet for ~no change.

---

## 1. Cost (verified `total_cost_usd` per build)

| effort | sonnet | opus | opus ÷ sonnet |
|---|---:|---:|---:|
| low | **$1.23** | **$5.38** | 4.4× |
| medium | **$2.17** | **$6.34** | 2.9× |
| high | **$2.32** | **$8.97** | 3.9× |
| xhigh | **$1.89** | **$12.67** | 6.7× |
| max | **$2.02** | **$14.24** | 7.0× |
| **range** | **$1.2–2.3** | **$5.4–14.2** | — |

**Total batch spend: $57.23** (sonnet 5 builds ≈ $9.6; opus 5 builds ≈ $47.6).

- **Sonnet effort → cost is flat and non-monotonic** ($1.23 / 2.17 / 2.32 / 1.89 / 2.02). Effort barely moves sonnet's bill; xhigh was actually *cheaper* than medium.
- **Opus effort → cost scales hard and monotonically** ($5.38 → $14.24, **2.6×** low→max). xhigh and max are where opus gets expensive (77k / 109k output tokens, 80 / 90 turns).
- A single **opus-max build ($14.24) ≈ the entire sonnet column ($9.6 for all five efforts), with change to spare.**

*Caveat:* `total_cost_usd` is the build's own token usage. Orchestration and the (API-free) Playwright/screenshot steps are excluded, so per-variant numbers are apples-to-apples build cost.

---

## 2. Build integrity (uniform — everyone passed)

| signal | result |
|---|---|
| `tsc --noEmit` typecheck | **10 / 10 PASS** |
| Runtime console errors (light + dark) | **0 across all 10** |
| Renders both light & dark | **10 / 10** |
| Produced editable merge form | **10 / 10** |

No variant shipped a broken build. This is a floor, not a differentiator.

---

## 3. Dark-mode toggle — the headline capability test

The skill doesn't document color-mode switching, so this measures inference/research ability. Read from the DOM (toggle located by `data-testid`, then by accessible name; flip asserted on `<html>` + body background).

| variant | toggle found | accessible name | recolors page | resolved mode on document root |
|---|:---:|---|:---:|:---:|
| sonnet · low | ✅ | "Switch to dark mode" | ✅ | ✅ |
| sonnet · medium | ✅ | ✅ | ✅ | ✅ |
| sonnet · high | ✅ | ✅ | ✅ | ✅ |
| sonnet · xhigh | ✅ | ✅ | ✅ | ✅ |
| **sonnet · max** | ✅ | ✅ | ✅ (full page) | **❌ (root not updated)** |
| opus · low | ✅ | ✅ | ✅ | ✅ |
| opus · medium | ✅ | ✅ | ✅ | ✅ |
| opus · high | ✅ | ✅ | ✅ | ✅ |
| opus · xhigh | ✅ | ✅ | ✅ | ✅ |
| opus · max | ✅ | ✅ | ✅ | ✅ |

**Findings (DOM-verified):**
- **10/10 inferred the feature** — every variant shipped a discoverable, properly-labelled ("Switch to dark/light mode") color-mode control. Neither model needed the skill to spell it out.
- **The PRD created a real fork.** It asked for *both* "drive the design system's own mechanism" *and* "resolved mode observable on the document root."
  - 9/10 satisfied both — most synced `<html data-color-mode>` themselves (e.g., `opus · low` does this **without** `useTheme`, via a manual document-root sync).
  - **`sonnet · max` used the purest DS path** (`useTheme().setColorMode("night")`) — the page recolors fully (background included) — **but the resolved mode never reaches the document root** (`data-color-mode` stays `auto`, body bg unchanged in the DOM). It's the exact failure the PRD warned about for machine-checkability: visually correct, not headless-assertable. *Ironically the most "by-the-book" Primer usage is the one that misses the observability clause.*

---

## 4. Accessibility — "merge genuinely unavailable while checks run"

The PRD: *"a keyboard user cannot trigger it, and a screen reader does not announce it as actionable."* Read from the merge button's DOM attributes during the checking phase.

| variant | gating approach (during checks) | keyboard/SR-blocked? |
|---|---|:---:|
| **sonnet · low** | Primer `inactive` → `data-inactive`, **no `aria-disabled`, focusable** | **❌ announced as actionable** |
| sonnet · medium | merge control **not rendered** until ready | ✅ (by omission) |
| sonnet · high | merge control **not rendered** until ready | ✅ (by omission) |
| sonnet · xhigh | native `disabled` | ✅ |
| sonnet · max | native `disabled` | ✅ |
| **opus · low** | **`aria-disabled="true"`** (most semantically correct) | ✅ |
| opus · medium | native `disabled` | ✅ |
| opus · high | native `disabled` | ✅ |
| opus · xhigh | native `disabled` | ✅ |
| opus · max | native `disabled` | ✅ |

**Findings:**
- **9/10 correctly make merge unavailable** while checks run — via native `disabled`, `aria-disabled`, or by not rendering the control at all.
- **`sonnet · low` is the single genuine a11y gap:** it uses Primer's `inactive` prop, which (in 38.26.0) emits only `data-inactive`, leaves the button focusable, and sets **no** `aria-disabled` — so a screen reader still announces an actionable "Merge pull request" button while checks are running. *This is a DOM fact; the lived screen-reader experience should still be confirmed by a human.*
- **`opus · low` shows the best instinct here** (`aria-disabled="true"`), edging out the native-`disabled` majority on semantics.

---

## 5. Design-system reach (objective proxy for richness / "attachment")

Distinct Primer components used per variant (grep of the component source):

| variant | # Primer components | uses `Timeline`? | notable |
|---|:---:|:---:|---|
| sonnet · low | 18 | ❌ | — |
| sonnet · medium | 17 | ❌ | — |
| sonnet · high | 18 | ❌ | — |
| sonnet · xhigh | 18 | ❌ | — |
| sonnet · max | 18 | ❌ | — |
| opus · low | 17 | ❌ | manual root color-mode sync |
| opus · medium | 19 | ✅ | — |
| opus · high | 19 | ✅ | — |
| opus · xhigh | 19 | ✅ | — |
| opus · max | **20** | ✅ | adds `RelativeTime` |

- **All 10** used the full editable-form kit (`FormControl`, `TextInput`, `Textarea`, `Checkbox`, `Select`) with real labels, plus `StateLabel` for Open/Merged, `Flash` for the ready cue, `Label`/`CounterLabel` for metadata. Both models "got" the assignment.
- **`Timeline` is the divider:** 4/5 opus builds render the CI checks as a connected Primer `Timeline` (the authentic GitHub look); **zero sonnet builds do** — sonnet renders a flat checks list. This is the structural root of opus's denser, more GitHub-faithful feel.

---

## 6. Visual craft & fidelity  ⚠️ *visual impressions — need human confirmation*

> Per project guidance, the items below are taste/fidelity impressions from screenshots, not assertable facts. Screenshots live under `dryrun-harness/out/<variant>/shots/`.

- **opus, even at `low`, is the strongest tier:** repo/author header ("@user wants to merge N commits into …"), labels, per-check CI provider names, approving-reviews summary, ready banner, fully-populated commit headline + description. Reads like a real PR page.
- **opus-high / xhigh / max** add the `Timeline` checks with sub-descriptions (e.g., "typecheck · tsc --noEmit") and a bordered review card. **opus-xhigh and opus-max are the most GitHub-faithful** (reviews with avatars/usernames, "no conflicts with trunk"). The jump from opus-low → opus-max is **refinement, not a new tier**.
- **sonnet builds are clean, correct, and well-composed but flatter** — simpler checks list, less of the surrounding PR chrome, fewer authentic GitHub touches. Perfectly presentable; less "wow."
- Dark mode rendered correctly and legibly across the board (spot-checked sonnet-max, opus-xhigh, sonnet-low) — backgrounds, capsules, labels, and the checks wall all recolor through tokens.

---

## 7. Cost-vs-quality synthesis & recommendation

| If your priority is… | Pick | Build cost | Why |
|---|---|---:|---|
| **Lowest cost that's still correct + accessible + dark-mode-capable** | **sonnet · medium** | ~$2.17 | Clean, complete, labelled, working observable toggle, proper merge gating. ~⅓ of cheapest opus. |
| **GitHub-fidelity / "wow" at best value** | **opus · low** | ~$5.38 | Near-top richness (reviews, PR chrome, full form) + the best a11y gating (`aria-disabled`) — at the *bottom* of the opus ladder. |
| **Maximum polish, cost no object** | opus · high → xhigh | ~$8.97–12.67 | `Timeline` checks + review card. xhigh/max add marginal gloss for 2.4–2.6× opus-low. |
| **Avoid** | opus · max; sonnet · >medium | $14.24 / — | opus-max = most expensive for marginal gain over xhigh; sonnet effort above medium buys nothing (flat quality *and* flat cost). |

**The two levers, restated:**
1. **Model = the real dial.** It sets both cost (3–7×) *and* the quality ceiling (opus reaches for `Timeline` and full PR chrome; sonnet stays flatter). Choose the model for the outcome you need.
2. **Effort = secondary.** On sonnet it's nearly free and nearly inert — `medium` is plenty; more is wasted. On opus it's a genuine 2.6× cost climb for diminishing visual returns — `low`/`high` capture most of the value.

**How low can you go?** For *this* task: **`sonnet · medium`** is the floor that still ships a correct, accessible, dark-mode-capable PR panel. Step up to **`opus · low`** only when GitHub-grade density/fidelity is the point — and stop there unless you specifically need the extra polish of `high`.

---

## 8. Caveats & integrity notes

- **n = 1 per cell.** One generation per (model, effort); no within-cell variance measured. Treat rankings as directional.
- **Merge-*completion* auto-verified for 7/10.** `sonnet · medium`, `sonnet · high`, and `opus · xhigh` label their primary button "Create a merge commit" and/or only reveal it post-checks; the Playwright auto-click didn't trigger their final transition. Their ready-to-merge forms render correctly and the merged-state UI is implemented in source — **low risk, but the final Open→Merged click for these three is not machine-confirmed.**
- **Visual/taste claims (Section 6) need human review** and are labelled as such; DOM-derived claims (Sections 1–5) are verified.
- **`sonnet · low` a11y gap** and the **`sonnet · max` root-observability miss** are DOM facts; the *lived* AT experience should be confirmed by a human.
- **Cost excludes orchestration + screenshots** (build-only `total_cost_usd`).
- **Harness evolved during the run** (merge-locator broadened to cover "Create a merge commit"; all 10 re-screenshotted with the final locator for consistency).
- **Nothing committed.** Builds sit dirty in their `dryrun/24-*` worktrees (as the PRD requires); this report + `dryrun-harness/` are untracked on branch `dryrun/24-model-effort-dark-mode` (to be rebased onto current `main`, then committed).

---

## Appendix — full per-variant data

| variant | cost | turns | out-tok | LOC | CSS | #DS | Timeline | toggle root-obs | merge gated | typecheck |
|---|---:|---:|---:|---:|---:|---:|:---:|:---:|:---:|:---:|
| sonnet · low | $1.23 | 35 | 14k | 429 | 0 | 18 | ❌ | ✅ | ❌ | PASS |
| sonnet · medium | $2.17 | 60 | 34k | 556 | 0 | 17 | ❌ | ✅ | ✅* | PASS |
| sonnet · high | $2.32 | 59 | 34k | 573 | 0 | 18 | ❌ | ✅ | ✅* | PASS |
| sonnet · xhigh | $1.89 | 58 | 34k | 419 | 0 | 18 | ❌ | ✅ | ✅ | PASS |
| sonnet · max | $2.02 | 54 | 43k | 466 | 0 | 18 | ❌ | ❌ | ✅ | PASS |
| opus · low | $5.38 | 37 | 24k | 674 | 0 | 17 | ❌ | ✅ | ✅ (aria) | PASS |
| opus · medium | $6.34 | 61 | 36k | 506 | 0 | 19 | ✅ | ✅ | ✅ | PASS |
| opus · high | $8.97 | 68 | 57k | 575 | 0 | 19 | ✅ | ✅ | ✅ | PASS |
| opus · xhigh | $12.67 | 80 | 77k | 687 | 58 | 19 | ✅ | ✅ | ✅ | PASS |
| opus · max | $14.24 | 90 | 109k | 588 | 91 | 20 | ✅ | ✅ | ✅ | PASS |

`*` gated by not rendering the merge control until checks pass. `(aria)` = `aria-disabled` (most correct).

**Artifacts:** `dryrun-harness/out/<variant>/` — `cost-report.json`, `shots/report.json`, 8 screenshots each (`{light,dark}-{1-initial,2-checks-green,3-merged}.png`, `toggle-{before,after}.png`). Generated components: `.claude/worktrees/dryrun-24-<variant>-i1/components/showcase/pr-merged-theater.tsx`.
