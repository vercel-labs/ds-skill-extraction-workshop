# RATIONALE.md — `extract-ds-skill`

Workshop rationale. Not loaded by the agent at runtime. The human-readable record of WHY this skill is shaped the way it is.

## Workshop context

40-minute workshop "Transform your design system into agent skills" at the 2026 venue. Hands-on segment runs minutes 22-35 of 40. 18 days to venue as of 2026-05-31. The meta-skill at `.claude/skills/extract-ds-skill/` is the centerpiece — attendees clone the workshop starter DS, run this skill on it, and watch a real DS skill get extracted from real source on their laptop. The hands-on segment is the only part of the workshop that has to survive contact with an audience, so this file exists to keep the design defensible when something drifts.

## Scope lock (2026-05-31)

Anchored to a dated decision because scope creep is the #1 way this skill turns into a 1.2k-line monolith before the venue.

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. When you encounter a copy/naming/casing rule during extraction (e.g. "Title Case the label", "placeholder is action-oriented"), recognize it, route it - mention it in the discovery summary as a candidate for a sibling copy skill - but do NOT extract it into this DS skill.

## The 11 locked grill decisions

- **B1**: 4 components (TextInput, Button, Checkbox, FormControl) — enough to surface a headline rule without exploding scope.
- **α**: v0-shaped meta-skill (three-phase discover/validate/persist) — proven runtime flow from v0 PR #24474.
- **Claude Code locked Phase 1** — meta-skill ships as a Claude Code skill, not a different framework.
- **R3 hybrid cluster output** — SKILL.md + `references/{components/*.md, composition.md, design-principles.md, anti-patterns.md}` so the agent loads only what each phase needs.
- **S2 single human gate** at the Phase 2 → Phase 3 boundary — discovery, validation, and persistence each get one approval surface, not five.
- **No baseline** — no compare-to-naive-extraction control; the extraction's own verification IS the proof.
- **A2 reflexive audit** — the skill IS the rubric, no separate `audit/checklist.md`.
- **C2 two-file coda** — `SKILL.md` + `references/anti-patterns.md` as the minimum viable skill if everything else gets cut.
- **I3 joint read** — code AND docs, code wins on conflict.
- **D3 curated subset** + workshop-authored RATIONALE.md (this file) — the meta-skill ships a curated rationale, not a generated one.
- 11th decision logged in grill transcript, not load-bearing for build.

## The six v1-build decisions (ratified 2026-05-31)

| # | Question | Ratified | Why |
|---|----------|----------|-----|
| Q1 | Persist target | Per-project `.claude/skills/<slug>/` in attendee's repo | Attendees commit the skill with the starter — ownership lives in their repo, not their home dir. |
| Q2 | `validate.sh` default | Deterministic typecheck + grep-resolves, no visual probe | Catches what the model can't catch about its own output; produces "14 props verified, 0 hallucinations" before the persist gate. |
| Q3 | Hands-on deliverable | Skill files only | Starter repo (Task #9) is already a runnable Next app. Meta-skill produces SKILL files; the "see it work" moment is a second Claude Code session. |
| Q4 | Component scope | Auto-discover + prune | Typing 4 names off a slide is rehearsed theatre. Meta-skill scans exports, lists "Components found (38), proposing (4)", attendee prunes. |
| Q5 | Headline rule surfacing | Discover independently from source | Hard-coding `inactive` vs `disabled` is cheating; the audience can smell it. Mitigation: dry-runs until extraction lands the rule on its own. |
| Q6 | Hallmark stamp | Dropped from v1 | The v0 onboarding flow doesn't stamp, the product-copywriting skill doesn't stamp, git blame IS provenance. Deferred to `coverage-gaps.md` for when a re-extract verb needs source provenance. |

## Source pattern inheritance

**The v0 DS-onboarding flow (PR #24474)** gives the meta-skill its runtime spine — the three labeled phases, the single human gate at the Phase 2 → Phase 3 boundary, the scratch workspace, the anti-fabrication Do/Don't list with `[VERIFY]` markers, the slug-collision ASK rule, and the closing-message contract that asks for screen-level not component-level example prompts. Consciously dropped: the v0Config payload, the `ApplyV0SkillConfig` host primitive, the blob/S3 attachments, the dialog UI, the `v0_memories/<team>/skills/<slug>/` path (rewritten to `.claude/skills/<slug>/` for the per-project Q1 decision), and the `/CLEAN_CWD/` VM scratch (rewritten to local `.extract-ds-skill-scratch/`).

**vercel/front product-copywriting (post-PR #70332)** gives the skill its dispatch shape — YAML frontmatter as a trigger-rich contract, the `**STOP.** Reading SKILL.md alone is insufficient.` block verbatim, the "When to Load References" routing table, the `coverage-gaps.md` self-aware backlog with the ~150-200 instruction-budget caveat, AGENTS.md as a cross-agent stub. Consciously dropped: every voice/tone/banned-words rule, the Tier 3 conditional-allow words, the Period Rule, the two-metric eval split, the exemplars-as-PR-diffs lattice. Structural inspiration only — none of the copy content survives the scope guardrail.

**Geist `<BestPractices>` .mdx** gives the meta-skill its per-component file contract — flat list for simple components, `When to use / Behavior / Content / Accessibility` subsections for complex ones (vocabulary verbatim), the `Bad | Good | Why` columnar anti-pattern table, the two-marker convention (backticks for API tokens, `[Component](./components/name.md)` for peer edges), and the cross-component rule duplication discipline. Consciously dropped: the MDX JSX wrappers, the `peek` frontmatter, the `<Preview>` blocks, and the entire Shape 3 (naming/copy) rule body — Shape 3 is recognized during extraction for routing purposes only, never extracted.

**Hallmark (Together AI)** gives the skill its progressive-disclosure load map and its pre-emit self-check discipline (run a check BEFORE emitting output). Consciously dropped: all six pre-emit aesthetic axes (Philosophy/Hierarchy/Execution/Specificity/Restraint/Variety), the 22-named-theme catalog, the component cookbook archetype codes, the `study` and `redesign` verbs, and — per Q6 — the stamp-in-artifact pattern.

## Scope is in 8 places

The repetition is intentional. Single-point-of-truth scope is too brittle to load-bear across a 9-file skill.

1. `SKILL.md` scope section — verbatim quotable block.
2. `SKILL.md` Quick Triage step 1 — load-bearing gate.
3. `SKILL.md` Agent Stance bullet 3.
4. `SKILL.md` Anti-fabrication "Do not" list explicit entry.
5. `references/component-extraction.md` Shape 3 labelled `[OUT OF SCOPE - route to copy skill, do not extract]`.
6. `references/inheritance.md` product-copywriting row under `does_not_inherit`.
7. `references/inheritance.md` Hallmark row under `does_not_inherit`.
8. `RATIONALE.md` (this file) records the 2026-05-31 scope lock as a dated decision.

## Open dry-run risks

Before the workshop, the meta-skill needs at least 3 dry-runs against the workshop starter DS (cloned locally) to confirm:

- **Q5 risk** — the headline rule `inactive` vs `disabled` may not surface from extraction. Dry-run check: run the meta-skill cold on the workshop starter DS, confirm the rule appears in Phase 1 discovery without prompt-engineering it in. If it misses, tune extraction heuristics until it lands.
- **Q4 risk** — the auto-discover + prune flow may produce a noisy or wrong component count for the starter DS. Dry-run check: confirm `inspect.sh` surfaces a clean "Components found (N), proposing (M)" line where N matches package exports and M is a defensible workshop subset.
- **Q2 risk** — the typecheck + grep validation may produce a flat or unconvincing signal. Dry-run check: run `validate.sh` against the scratch extraction and confirm it emits something like "14 props verified against source, 0 hallucinations" — concrete enough to land as a proof point in the workshop.
- **Q1 risk** — the per-project persist target may feel arbitrary if attendees don't connect it to ownership. Dry-run check: after persistence, confirm `.claude/skills/<slug>/` shows up in `git status` and an attendee can `git add` it in one motion. The ownership story needs to be visible.

## Rendered-site probe (2026-06-12)

`scripts/probe-rendered.sh` adds an opt-in Phase 2 annotation layer: render the DS's public docs site headless (playwright + chromium) and diff the computed CSS custom-property values against the token values extracted from source. The single borrowed idea — rendered computed CSS is ground truth for token *values* — comes from observing CLI-first extractors that work URL-inward; we consciously did NOT adopt that architecture. No parallel artifact pipeline, no URL-first extraction: the probe folds into the existing source-first, citation-first flow as `[VERIFY]` annotations.

Why annotation and not extraction: a rendered page proves what a value *is* in one mode on one page, but carries no semantic name authority, no file:line cite, and no claim about the other modes. So the probe can corroborate or dispute a source-extracted value (theme override, build-time transform, stale declaration — each becomes a `[VERIFY: rendered-probe ...]` line for the human gate), but it can never replace the source cite. Source wins on conflict, always.

Operational posture: opt-in (docs URL accepted in Phase 1 + no opt-out), read-only against the docs site, heavy dependency gated (playwright is a consumer-project devDependency; browser binaries install on the host, never inside a sandbox — the script degrades to `PROBE_SKIPPED=browsers-unavailable` exit 0). The probe is the infrastructure-carrying slice for a family of rendered-site probes (audit screenshots, asset inventory, compiled-CSS fallback) that all reuse this one script rather than growing parallel pipelines.

The compiled-CSS recover fallback (`--recover`, 2026-06-12) is the ONE place the probe crosses from annotation into extraction, and it is deliberately fenced: it fires only when token-class source extraction returned `[private-blocker]` (a DS shipping only compiled CSS), with an accepted docs URL and no opt-out. Without it that DS dead-ends Phase 2; with it Phase 2 continues on clearly second-class material — every recovered row carries `[probe-derived]` in place of a `file:line` cite, semantic names are mostly lost (synthetic `--probe-*` rows), source wins every conflict (logged, never silenced), and the produced skill quarantines the rows under a dedicated tagged section the produced-mode audit (`PROBE_DERIVED_TOKENS=`) gates. The fallback is not a default and must not widen: for any DS with readable token source, the source-first contract stands untouched.

## What this skill consciously does NOT do

- Does not author a top-level DS-design document for the user's DS (D3 — the workshop maintainer authors that for the starter DS, separately).
- Does not run a separate audit/eval harness (A2 — the skill IS the rubric).
- Does not produce a runnable app (Q3 — skill files only, starter repo is separate).
- Does not stamp emitted files (Q6 — git tracks provenance).
- Does not extract copy / voice / marketing rules (scope guardrail).
