# Baseline dry-run — 2026-06-01

Frozen artifacts from the first end-to-end dry-run of the hands-on
segment, run inside a now-removed agent worktree
(`agent-aac384ab8d73a5d47`).

This directory is **instructor reference**, not an attendee starting
point. Attendees regenerate these artifacts live during the workshop;
this snapshot exists so future dry-runs have something to diff against.

## What's here

- `extracted-skill/` — the design-system skill the meta-skill
  produced from `ds/`. Mirrors what `.claude/skills/ds/` should
  contain after a successful Phase 1. Five files:
  `SKILL.md`, `AGENTS.md`, `references/components.md`,
  `references/anti-patterns.md`, `references/tokens.md`.
- `sign-in.tsx` — the form Phase 2 generated against the extracted
  skill. Mirrors what `app/sign-in.tsx` should contain after a
  successful Phase 2.

## Known limitation of this baseline

The Phase 3 audit on this run returned 5/5 PASS — no headline FAIL.
The meta-skill correctly resolved the `Button.tsx:11-13` vs
`DESIGN.md:12` contradiction at extraction time (`[VERIFY]` →
"DESIGN.md wins"), so Phase 2 generated `disabled={isLoading}` and the
audit had nothing to catch. The headline-trap design (A/B/C/D
options, see Obsidian vault) is unresolved as of this snapshot.

## How to diff a fresh run against this baseline

```bash
# After running the meta-skill on a clean checkout:
diff -r .claude/skills/ds/ dry-runs/2026-06-01-baseline/extracted-skill/
diff app/sign-in.tsx dry-runs/2026-06-01-baseline/sign-in.tsx
```

Drift on either side is interesting: it means either the meta-skill
output changed (revisit `references/`) or the generator's behaviour
on the same skill drifted (revisit prompt fixtures).
