# Issue #{{NUMBER}}: {{TITLE}}

{{BODY}}

---

## How to work this issue

Use the `do-work` skill (`.claude/skills/do-work/SKILL.md`) for the
end-to-end workflow: understand → implement → validate → commit.

Validation gate: `pnpm verify` (typecheck + build) must pass before
commit. Husky's pre-commit hook runs typecheck again as a backstop —
do not bypass it with `--no-verify`.

**Do NOT close or comment on this issue.** It is a shared workshop
spec — many attendees will work it independently against their own
snapshots. Stop after the commit. The issue stays open as the
canonical spec; your work lives in your commit, not in issue noise.
This overrides the `do-work` skill's default close-on-completion
behaviour.
