---
name: extract-ds-skill
description: Test fixture — meta-skill self-mode, full three-phase shape but missing the per-phase handoff-emission prose. HANDOFF_EMISSION must report FAIL.
---

## Phase 1: Discovery summary

Inspect the sources the user pointed at, classify each by role, render a discovery summary. No "Resume check first" pre-check here — that absence is what this fixture exercises.

## Phase 2: Validate the extraction in a scratch workspace

Run the validation in scratch. No resume-detect pre-check and no per-phase handoff-write instruction in this fixture.

## Phase 3: Persist the skill

Write the produced skill to `.claude/skills/<slug>/`. No "Phase 1 close" or "Phase 3 close" handoff-emission subsections anywhere in this file.
