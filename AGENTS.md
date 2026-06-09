<!-- BEGIN:dry-run-worktree-rules -->
# Dry-runs use their own worktree

Before running anything that produces snapshot artifacts — `/extract-ds-skill`, `prompts/issues.md`, `prompts/audit.md`, or anything else whose output gets frozen under `dry-runs/` — run `git worktree list`. If a `dryrun/NN` worktree exists at `.claude/worktrees/dryrun-NN/`, that branch is where dry-run outputs belong, not the main feature branch.

Split principle:

- **Dry-run-specific** (goes on `dryrun/NN`): `.claude/skills/<slug>/` produced by an extraction run, `dry-runs/<YYYY-MM-DD>-<label>/` snapshots, generated `app/page.tsx` artefacts from prompt runs.
- **Durable infrastructure** (stays on the main feature branch): edits to `.claude/skills/extract-ds-skill/`, the `dry-runs/TEMPLATE.md` / `README.md` / `SUMMARY.md` scaffolding, and any other change that lives across all future runs.

If unsure which side a change belongs on, ask before writing — splitting commits across branches after the fact is more work than asking upfront.
<!-- END:dry-run-worktree-rules -->
