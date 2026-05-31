# DESIGN.md — `extract-ds-skill`

Diego-authored rationale. Not loaded by the agent at runtime. The human-readable record of WHY this skill is shaped the way it is.

## Workshop context

40-minute workshop "Transform your design system into agent skills" at the 2026 venue. Hands-on segment runs minutes 22-35 of 40. 18 days to venue as of 2026-05-31. The meta-skill at `.claude/skills/extract-ds-skill/` is the centerpiece — attendees clone the Primer starter, run this skill on it, and watch a real DS skill get extracted from real source on their laptop. The hands-on segment is the only part of the workshop that has to survive contact with an audience, so this file exists to keep the design defensible when something drifts.

## Scope lock (2026-05-31)

Anchored to a dated decision because scope creep is the #1 way this skill turns into a 1.2k-line monolith before the venue.

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. When you encounter a copy/naming/casing rule during extraction (e.g. "Title Case the label", "placeholder is action-oriented"), recognize it, route it - mention it in the discovery summary as a candidate for a sibling copy skill - but do NOT extract it into this DS skill.

## The 11 locked grill decisions

- **B1**: 4 components (TextInput, Button, Checkbox, FormControl) — enough to surface a headline rule without exploding scope.
- **α**: Sahaj-shaped meta-skill (three-phase discover/validate/persist) — proven runtime flow from v0 PR #24474.
- **Claude Code locked Phase 1** — meta-skill ships as a Claude Code skill, not a different framework.
- **R3 hybrid cluster output** — SKILL.md + `references/{components/*.md, composition.md, design-principles.md, anti-patterns.md}` so the agent loads only what each phase needs.
- **S2 single human gate** at the Phase 2 → Phase 3 boundary — discovery, validation, and persistence each get one approval surface, not five.
- **No baseline** — no compare-to-naive-extraction control; the extraction's own verification IS the proof.
- **A2 reflexive audit** — the skill IS the rubric, no separate `audit/checklist.md`.
- **C2 two-file coda** — `SKILL.md` + `references/anti-patterns.md` as the minimum viable skill if everything else gets cut.
- **I3 joint read** — code AND docs, code wins on conflict.
- **D3 curated subset** + Diego-authored DESIGN.md (this file) — the meta-skill ships a Diego-curated rationale, not a generated one.
- 11th decision logged in grill transcript, not load-bearing for build.

## The six v1-build decisions (ratified 2026-05-31)

| # | Question | Ratified | Why |
|---|----------|----------|-----|
| Q1 | Persist target | Per-project `.claude/skills/<slug>/` in attendee's repo | Attendees commit the skill with the starter — ownership lives in their repo, not their home dir. |
| Q2 | `validate.sh` default | Deterministic typecheck + grep-resolves, no visual probe | Catches what the model can't catch about its own output; produces "14 props verified, 0 hallucinations" before the persist gate. |
| Q3 | Hands-on deliverable | Skill files only | Starter repo (Task #9) is already a runnable Next app. Meta-skill produces SKILL files; the "see it work" moment is a second Claude Code session. |
| Q4 | Component scope | Auto-discover + prune | Typing 4 names off a slide is rehearsed theatre. Meta-skill scans exports, lists "Components found (38), proposing (4)", attendee prunes. |
| Q5 | Headline rule surfacing | Discover independently from source | Hard-coding `inactive` vs `disabled` is cheating; the audience can smell it. Mitigation: dry-runs until extraction lands the rule on its own. |
| Q6 | Hallmark stamp | Dropped from v1 | Sahaj doesn't stamp, John doesn't stamp, git blame IS provenance. Deferred to `coverage-gaps.md` for when a re-extract verb needs source provenance. |

## Source pattern inheritance

**Sahaj v0 (PR #24474)** gives the meta-skill its runtime spine — the three labeled phases, the single human gate at the Phase 2 → Phase 3 boundary, the scratch workspace, the anti-fabrication Do/Don't list with `[VERIFY]` markers, the slug-collision ASK rule, and the closing-message contract that asks for screen-level not component-level example prompts. Consciously dropped: the v0Config payload, the `ApplyV0SkillConfig` host primitive, the blob/S3 attachments, the dialog UI, the `v0_memories/<team>/skills/<slug>/` path (rewritten to `.claude/skills/<slug>/` for the per-project Q1 decision), and the `/CLEAN_CWD/` VM scratch (rewritten to local `.extract-ds-skill-scratch/`).

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
8. `DESIGN.md` (this file) records Diego's 2026-05-31 scope lock as a dated decision.

## Open dry-run risks

Before the workshop, the meta-skill needs at least 3 dry-runs against Primer (cloned locally) to confirm:

- **Q5 risk** — the headline rule `inactive` vs `disabled` may not surface from extraction. Dry-run check: run the meta-skill cold on `primer/react@v37.x`, confirm the rule appears in Phase 1 discovery without prompt-engineering it in. If it misses, tune extraction heuristics until it lands.
- **Q4 risk** — the auto-discover + prune flow may produce a noisy or wrong component count for Primer. Dry-run check: confirm `inspect.sh` surfaces a clean "Components found (N), proposing (M)" line where N matches package exports and M is a defensible workshop subset.
- **Q2 risk** — the typecheck + grep validation may produce a flat or unconvincing signal. Dry-run check: run `validate.sh` against the scratch extraction and confirm it emits something like "14 props verified against source, 0 hallucinations" — concrete enough to land as a proof point in the workshop.
- **Q1 risk** — the per-project persist target may feel arbitrary if attendees don't connect it to ownership. Dry-run check: after persistence, confirm `.claude/skills/<slug>/` shows up in `git status` and an attendee can `git add` it in one motion. The ownership story needs to be visible.

## What this skill consciously does NOT do

- Does not author `DESIGN.md` for the user's DS (D3 — Diego authors that for the workshop's Primer starter).
- Does not run a separate audit/eval harness (A2 — the skill IS the rubric).
- Does not produce a runnable app (Q3 — skill files only, starter repo is separate).
- Does not stamp emitted files (Q6 — git tracks provenance).
- Does not extract copy / voice / marketing rules (scope guardrail).
