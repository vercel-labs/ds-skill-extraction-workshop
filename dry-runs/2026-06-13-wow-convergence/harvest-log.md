# Harvest log — WS2 wow-convergence loop (#33)

Worktree: `.claude/worktrees/dryrun-18-wow-convergence-i1` (branch `dryrun/18-wow-convergence-i1`, from `main` 0c5d60a)
Skill under test: `.claude/skills/primer-react/` (regeneration run #5)
Prompts: `prompts/pr-merged-theater.md` (base), `prompts/pr-merged-theater-encore.md` (encore)

## Iteration 1 — generate

4 generations via primer-react subagents, fidelity-over-slate (reach for the real
@primer/react component when the 15-slate cannot express a beat the prompt calls for;
tag the import `// HARVEST:`). All four typecheck clean.

Files:
- `components/showcase/pr-merged-theater.base.gen1.tsx`
- `components/showcase/pr-merged-theater.base.gen2.tsx`
- `components/showcase/pr-merged-theater.encore.gen1.tsx`
- `components/showcase/pr-merged-theater.encore.gen2.tsx`

### Untaught @primer/react imports (excludes 15-slate + shell pair BaseStyles/ThemeProvider)

| Component   | base1 | base2 | encore1 | encore2 | Count | Signal     |
|-------------|:-----:|:-----:|:-------:|:-------:|:-----:|------------|
| ProgressBar |  yes  |  yes  |   yes   |   yes   |  4/4  | unanimous  |
| RelativeTime|  yes  |  yes  |   yes   |   yes   |  4/4  | unanimous  |
| Spinner     |  yes  |  yes  |   yes   |   yes   |  4/4  | unanimous  |
| Timeline    |   -   |  yes  |   yes   |   yes   |  3/4  | strong     |
| Avatar      |  yes  |  yes  |    -    |    -    |  2/4  | contested  |
| AvatarStack |   -   |  yes  |    -    |    -    |  1/4  | weak       |
| Tooltip     |   -   |  yes  |    -    |    -    |  1/4  | weak       |

Floor NOT met: every generation imported >=4 untaught components.

### Notes / tensions
- **Avatar / AvatarStack**: both encore agents deliberately avoided these, citing the
  prompts' "invented data, no external URLs" contract — Primer `Avatar` requires a real
  image `src`. Adding Avatar to the slate forces a stance on placeholder imagery vs the
  no-external-URL rule. Decision deferred to operator.
- **Tooltip**: only surfaced once (the merge-method info affordance). The skill already
  teaches IconButton's built-in tooltip; standalone Tooltip is a thinner need.
- Zero [VERIFY] markers across all four generations.

### Proposed slate additions (iteration 1)
- ADD (unanimous/strong): ProgressBar, RelativeTime, Spinner, Timeline
- HOLD (operator call): Avatar (+AvatarStack), Tooltip

### Next
On approval: add the chosen components to the extraction slate -> re-extract the skill
-> re-audit (run-tests.sh, check-skill-docs, verify-citations, token coverage)
-> regenerate -> re-harvest. Repeat until floor holds + Diego's wow.

## Iteration 1 — re-extract + audit (operator chose: add the 4 strong only)

Added to slate (15 -> 19): ProgressBar, Spinner, Timeline, RelativeTime. Held: Avatar/AvatarStack/Tooltip.

New reference files (each grounded in dist/**/*.d.ts, format-matched to the exemplar):
- references/components/progress-bar.md   (ProgressBar + ProgressBar.Item)
- references/components/spinner.md         (size, srText string|null, reduced-motion)
- references/components/timeline.md        (Item/Badge/Body/Break; 9-member Badge variant)
- references/components/relative-time.md   (date/tense/format/precision forwarded to <relative-time>)

SKILL.md wired: frontmatter description, "When to Load References" (+4 rows), "Component slate" (+4 bullets).

Audit (produced mode) against the 19-component skill:
- check-skill-docs.sh -> CHECK_RESULT=PASS (ROUTING_TABLE, COMPONENT_FILES, SLATE_COVERAGE,
  WIRING_NOT_SYNTHESIZED, SHELL_INVARIANTS, DESIGN_CRAFT all PASS); VERIFY_MARKERS=0
- verify-citations.sh -> resolution-only PASS (prose:286 resolved; no claims file)
- (one VERIFY in timeline.md reworded to grounded guidance -> now zero)

Status: floor not yet confirmed — needs a fresh generation round against the 19-component
skill to check whether generations now stay in-slate (the 4 additions are taught) or still
reach out (watch for Avatar, the held 2/4 item).

## Iteration 2 — regenerate against the 19-component skill (floor check)

4 fresh generations (base x2, encore x2) via primer-react subagents, same fidelity-over-slate
brief, slate list updated to 19.

Files:
- components/showcase/pr-merged-theater.base.i2gen1.tsx
- components/showcase/pr-merged-theater.base.i2gen2.tsx
- components/showcase/pr-merged-theater.encore.i2gen1.tsx
- components/showcase/pr-merged-theater.encore.i2gen2.tsx

### Untaught @primer/react imports (mechanically verified, not self-reported)

| Generation     | untaught imports | HARVEST tags |
|----------------|------------------|--------------|
| base.i2gen1    | none             | 0            |
| base.i2gen2    | none             | 0            |
| encore.i2gen1  | none             | 0            |
| encore.i2gen2  | none             | 0            |

- Avatar did NOT recur in any generation (the held 2/4 item from iteration 1). Two agents
  again rendered reviewers via Timeline + PersonIcon rather than reach for Avatar, citing
  the prompts' no-external-URL / invented-data rule. The 19-slate was reported sufficient
  by all four.
- `npx tsc --noEmit` over the whole worktree (all 8 generation files): EXIT=0, 0 errors.

### FLOOR: MET
- [x] A fresh generation per wow prompt imports only slate components (all 4 i2 gens).
- [x] Zero untaught imports / zero HARVEST escapes.
- [x] Skill audit green (check-skill-docs CHECK_RESULT=PASS, VERIFY_MARKERS=0; verify-citations resolution PASS).
- [x] Generations typecheck clean.

### CEILING: pending Diego's eye
encore.i2gen1 wired into app/page.tsx; proven Primer shell installed (layout.tsx + globals.css);
dev server running for the wow call. Sign-off to be recorded on #33 before the skill freezes.
