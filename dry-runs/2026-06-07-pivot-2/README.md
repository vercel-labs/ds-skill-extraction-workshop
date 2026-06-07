# Pivot-2 dry-run — 2026-06-07

Frozen snapshot of the **second** post-pivot extraction, run on branch
`dryrun/02` and persisted via the meta-skill's Phase 3. Captures the
state immediately after the slug-collision overwrite so future
iterations on the same worktree can diff against it.

## What's here

- `extracted-skill/` — the design-system skill produced from `ds/` by
  `extract-ds-skill`. Four files:
  - `SKILL.md` (7.3k)
  - `AGENTS.md` (6.0k)
  - `references/components.md` (22k, single-file layout — 6 components < 10-component split threshold)
  - `references/tokens.md` (8.5k, 6 foundation rules from `primer.style/product/getting-started/foundations/color-usage/`)
- `page.tsx` — **not present yet.** This snapshot stopped at the end of
  Phase 3. The `prompts/issues.md` pass that generates the GitHub-style
  issues page has not been run for this dry-run. Copy `app/page.tsx`
  into this directory after that pass lands.

## Diff against earlier runs

```bash
# Diff this snapshot against pivot-1:
diff -r dry-runs/2026-06-06-pivot-1/extracted-skill/ \
        dry-runs/2026-06-07-pivot-2/extracted-skill/

# Diff against the pre-pivot baseline:
diff -r dry-runs/2026-06-01-baseline/extracted-skill/ \
        dry-runs/2026-06-07-pivot-2/extracted-skill/
```

The structural change pivot-1 → pivot-2 is the addition of a
foundation-docs source role and a reference-project source role to the
meta-skill (see PRs around 2026-06-07). Expect changes in
`references/tokens.md` (rules now cite the foundation page directly)
and in the wiring section of `SKILL.md` (lifted verbatim from
`primer/react-template` instead of synthesised from prose).

## How to drive the next pass

The `prompts/issues.md` fixture generates `app/page.tsx`. Tracked by
GitHub issue — invoke via:

```bash
./ralph/run-claude-from-issue.sh <issue-number>
```

The script `cd`s into this worktree, fetches the issue body, and
launches a fresh Claude Code session seeded with it. The session sees
`.claude/skills/ds/` (this snapshot's source) via the auto-loaded
skills index.

## Known limitations of this snapshot

- **Generation pass not run.** No `app/page.tsx` artefact. The
  `prompts/issues.md` + `prompts/audit.md` passes are the next dry-run
  steps; their outputs land in this directory once produced.
- **Token rules: 6 cited, 0 `[VERIFY]`.** Foundation extraction
  converged cleanly this run — no deferred markers, unlike pivot-1's
  5 stubs.
- **`RUBRIC.md` not populated.** Copy from `dry-runs/TEMPLATE.md` and
  fill as the generation + audit passes complete.
