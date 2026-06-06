<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:dry-run-worktree-rules -->
# Dry-runs use their own worktree

Before running anything that produces snapshot artifacts — `/extract-ds-skill`, `prompts/audit.md`, or anything else whose output explicitly gets frozen under `dry-runs/` — run `git worktree list`. If a `dryrun/NN` worktree exists at `.claude/worktrees/dryrun-NN/`, that branch is where dry-run outputs belong, not the main feature branch.

Do **not** auto-switch worktrees for a normal `/ds` generation request. If the user asks to build from `prompts/issues.md` or edit `app/page.tsx`, stay in the current worktree unless they explicitly say this is a dry-run replay. The live generation source map is:

- `prompts/issues.md` — the Phase 2 generation prompt.
- `.claude/skills/ds/` — the skill loaded by `/ds`.
- `ds/components/` — the live wrapper source for `PageHeader`, `DataTable`, `SelectPanel`, `Banner`, `ActionMenu`, `ActionList`.
- `app/page.tsx` — the generated page target.
- `dry-runs/` and `.claude/worktrees/dryrun-NN/` — historical/frozen run artifacts, not the default target for `/ds`.

Split principle:

- **Dry-run-specific** (goes on `dryrun/NN`): `.claude/skills/<slug>/` produced by an extraction run, `dry-runs/<YYYY-MM-DD>-<label>/` snapshots, generated `app/page.tsx` artifacts from an explicitly requested dry-run replay.
- **Durable infrastructure** (stays on the main feature branch): edits to `.claude/skills/extract-ds-skill/`, the `dry-runs/TEMPLATE.md` / `README.md` / `SUMMARY.md` scaffolding, and any other change that lives across all future runs.

If unsure which side a change belongs on, ask before writing — splitting commits across branches after the fact is more work than asking upfront.
<!-- END:dry-run-worktree-rules -->
