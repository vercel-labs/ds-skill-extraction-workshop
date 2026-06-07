# Issue #{{NUMBER}}: {{TITLE}}

{{BODY}}

---

## How to work this issue

Use the `do-work` skill (`.claude/skills/do-work/SKILL.md`) for the
end-to-end workflow: understand → implement → validate → commit.

Validation gate: `pnpm verify` (typecheck + build) must pass before
commit. Husky's pre-commit hook runs typecheck again as a backstop —
do not bypass it with `--no-verify`.

On completion, close this issue with a one-line outcome:

```
gh issue close {{NUMBER}} --comment "<what shipped>"
```
