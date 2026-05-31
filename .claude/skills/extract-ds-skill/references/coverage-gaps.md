# Coverage gaps

Self-aware backlog. The meta-skill at v1 knows what it does not yet handle. Each gap is logged with impact and rough line-cost to close. Closing them is post-workshop work — the 2026 venue cut ships with these gaps known and documented.

## Three-column impact rubric

| Gap | Impact | Est. line cost |
|---|---|---|
| Motion tokens (rarely first-class in mid-size DSs) | LOW | ~30 |
| Multi-package monorepos with sub-DSs (Primer has `@primer/react` + `@primer/primitives`) | MEDIUM | ~80 |
| Figma-as-source-of-truth (no joint-read path yet, code is canonical) | HIGH | ~200 |
| Per-component `.stories.tsx` parsing (currently lifts only from docs + types) | MEDIUM | ~60 |
| Cross-skill back-reference seeding when sibling skill does not exist (deferred to second cultivation pass) | LOW | ~40 |
| Stamp-in-artifact provenance (Hallmark pattern, deferred per locked Q6 — adds when a re-extract verb needs source provenance) | LOW | ~30 |
| Slim-index pattern for large DSs (>20 components) — meta-skill emits per-component file with no index layer; currently OK at workshop scope | MEDIUM at >20 components, LOW at workshop scope | ~50 |

## Instruction-budget caveat

The hard ceiling on what a single SKILL.md can reliably enforce:

> "the per-skill instruction-count budget is finite, and frontier LLM rule-following degrades as instruction count rises beyond ~150-200."

If the meta-skill produces a DS skill whose `SKILL.md` exceeds ~150 instructions, warn the user and point at this caveat. Mitigations, in order of preference:

- Move detail into `references/` files (already the layout pattern — keep `SKILL.md` an orchestrator)
- Drop motion tokens if the DS does not ship them first-class
- Drop deprecated components from the discovery list before Phase 2
- Split a large component into a sibling skill if its rule surface alone approaches the budget

Count instructions before persist. `scripts/check-skill-docs.sh` surfaces the count in the closing message so the user can see it crossing the threshold.

## Workshop-defer note

Any gap tagged `defer-to-post-workshop` is explicitly out of scope for the 2026 venue cut. The meta-skill at v1 ships with the gaps above known and documented; closing them is post-workshop work.

Two gaps in the rubric carry this tag implicitly:

- **Figma-as-source-of-truth (HIGH)** — the joint-read path treats code as canonical. A real Figma integration needs a separate inspection verb and a conflict-resolution rule that goes beyond "code wins on conflict." Defer.
- **Hallmark-style stamp provenance (LOW)** — per locked Q6, stamps were dropped from v1 because Sahaj does not stamp, John does not stamp, and `check-skill-docs.sh` does not use stamps as a falsifiability check. Adding it because Hallmark does would be cargo-cult. Revisit when a re-extract verb lands and source provenance becomes load-bearing.

The remaining MEDIUM and LOW rows are safe at workshop scope (4 components, single-package DS, no motion tokens). They become real when a user points the meta-skill at a larger or more fragmented DS — at which point this file is the entry point for the next pass.
