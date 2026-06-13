<!-- BEGIN:dry-run-worktree-rules -->
# Dry-runs use their own worktree

Before producing snapshot artefacts (`/extract-ds-skill`, a PRD build `/primer-react implement prompts/*.md`, `prompts/issues.md`, `prompts/audit.md`, anything frozen under `dry-runs/`): run `git worktree list`. Outputs go in the matching `.claude/worktrees/dryrun-NN-<label>-iN/` (branch `dryrun/NN-<label>-iN`) — never a durable branch.

Worktree needs root's config to run builds: `ln -sfn ../../../node_modules node_modules`. The `-fn` is load-bearing — plain `ln -s` follows the existing link and nests a stray `node_modules/node_modules` (pointing out of the repo) inside root's `node_modules`, which breaks Turbopack for *every* worktree (`Can't resolve 'scheduler'`).

## Where a change goes

- **Dry-run-specific → dryrun branch**: `dry-runs/<date>-<label>/` snapshots (app files + `harvest-log.md`), generated `app/` artefacts, a freshly-extracted `.claude/skills/<slug>/` not yet promoted.
- **Durable → feature branch → PR → `main`**: `.claude/skills/extract-ds-skill/`, the promoted reference skill `.claude/skills/primer-react/` (lives on main; repaired via PR; copied read-only into worktrees as skill-under-test), `dry-runs/TEMPLATE.md`/`README.md`/`SUMMARY.md`, this file.

A freshly-extracted skill is dry-run-specific until promoted to main; after that, durable.

Unsure? Ask before writing — re-splitting commits later is worse.
<!-- END:dry-run-worktree-rules -->
