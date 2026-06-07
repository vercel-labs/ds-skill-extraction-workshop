---
name: do-work
description: "Execute a unit of work end-to-end: understand, implement, validate with typecheck and build, then commit. Use when the user wants to do work, build a feature, fix a bug, or implement an issue or phase from a plan. Do NOT use for design-system skill extraction — that flow has its own meta-skill (extract-ds-skill)."
---

# Do Work

Execute a complete unit of work: understand it, build it, validate it, commit it.

## Workflow

### 1. Understand the task

Read any referenced plan, PRD, or GitHub issue body in full. Explore the
codebase to understand the relevant files, patterns, and conventions.

If the task touches a design system surfaced under `.claude/skills/ds/`,
that skill's `SKILL.md` is the source of truth for component selection,
token usage, and wiring rules — read it before writing code.

If the task is ambiguous, ask the user to clarify scope before
proceeding. Do not guess at scope.

### 2. Plan the implementation (optional)

Skip when the task is already fully specified end-to-end (e.g., a
locked-down issue body). Plan when scope is open, when you have
multiple viable approaches, or when the task spans more than a couple
of files.

### 3. Implement

This is a frontend-only workshop — implement directly. No TDD
scaffolding.

Edit code directly. Do not delegate via subagents unless the task
genuinely splits into independent parallel pieces.

### 4. Validate

Run:

```
pnpm verify
```

This runs `pnpm typecheck && pnpm build`. Fix any failures and re-run
until both pass cleanly.

Husky's pre-commit hook also runs `pnpm typecheck` as a backstop — but
the build check lives here. Do not rely on the hook to catch build
failures, and do not commit without `pnpm verify` passing.

If a pre-existing failure outside the scope of this task blocks you,
make the minimal fix to unblock and call it out explicitly in the
commit message under a "Pre-existing fix" section. Never bypass the
hook with `--no-verify`.

### 5. Commit

Once `pnpm verify` passes, commit the work in ONE commit. Use the
project's commit message style — read `git log --oneline -n 10` if
unsure.

If the task originated from a GitHub issue, close the issue with a
one-line outcome:

```
gh issue close <N> --comment "<one-line outcome of what shipped>"
```

If the task only partially resolves the issue, comment on it instead
of closing:

```
gh issue comment <N> --body "<what was done, what remains>"
```
