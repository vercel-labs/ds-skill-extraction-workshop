---
name: extract-ds-skill
description: Test fixture — meta-skill self-mode with the three-phase shape, the phase-N.md handoff-write prose, and the dryrun-label labeling section all present, but missing the cutoff prose at Phase 1 close and Phase 2 close. HANDOFF_EMISSION must report FAIL and the failure messages must cite state/inline-phase-transition (the handoff write IS referenced and the dryrun-label prose IS present, but the post-write inline transition is the failure mode).
---

## Handoff filename labeling

Handoff filenames are prefixed with the dryrun version of the worktree they were written from. Under a `.claude/worktrees/dryrun-01/` cwd, write `.extract-ds-skill-scratch/handoffs/dryrun-01-phase-N.md`.

## Phase 1: Discovery summary

Inspect, classify, render a discovery summary, wait for "go".

### Phase 1 close (handoff emission, mandatory)

After the user confirms, write `phase-1.md` to scratch. Then proceed to the next phase in this same session.

## Phase 2: Validate the extraction in a scratch workspace

Run validation in scratch, emit proof-point, iterate on `[VERIFY]` markers, wait for approval. Write `phase-2.md` to scratch before the gate.

### Phase 2 close (handoff emission, mandatory)

After approval, proceed to the next phase in this same session.

## Phase 3: Persist the skill

Write to `.claude/skills/<slug>/`. Run `check-skill-docs.sh`. Close.

## Phase 3 close (handoff emission, mandatory)

Write `phase-3.md` to scratch as a brief for sibling agents.
