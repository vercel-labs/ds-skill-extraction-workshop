# Phase 3 — Persist the skill

Triggered only after the user confirms the validation report from Phase 2. This is the first write outside the scratch workspace. Read this file end-to-end before invoking `scripts/scaffold.sh`.

## Persist target

Default target is `.claude/skills/<slug>/` in the current project (per-project, per the 2026-05-31 locked decision). The skill lives inside the user's repo and gets committed alongside their code, so the design system and the skill that extracts it travel together through code review.

If the user explicitly requests user-scope (`~/.claude/skills/<slug>/`), honor it and log the choice in the closing message so the next agent in the chat knows the skill is not project-local.

Do not write to both. Pick one target, state it, write there.

## Slug-collision check

Before writing anything, check whether a skill with that slug already exists at the persist target. If it does, ASK the user whether to overwrite or pick a different slug — do not silently suffix.

Mechanism:

- `scripts/scaffold.sh` checks for an existing `<persist-target>/<slug>/` directory before any write.
- If the directory exists, `scaffold.sh` exits with code `75` and writes the conflicting path to stderr.
- The agent reads the exit code, surfaces the collision to the user, and waits for either an overwrite confirmation or a new slug. No silent suffix, no auto-rename.

## No staging / no draft / no commit step

Once you start writing here, files go live immediately. No staging, no draft frontmatter, no commit step. Partial state during a crash is acceptable.

The validation gate at the end of Phase 2 is the only checkpoint. Past that gate, every `scaffold.sh` write lands directly in the persist target. The user owns committing those files via their normal git workflow.

## Directory tree to write

```
.claude/skills/<slug>/
├── SKILL.md
├── AGENTS.md
└── references/
    ├── components/<name>.md      (per-component, if ≥10 components)
    │   OR components.md           (single file, if <10 components)
    ├── tokens.md                  (or per-family if >1 family)
    └── anti-patterns.md
```

Apply the universal-coverage rule: every component file ships a Best Practices section even if the only bullet is "No special rules — use the API as documented." Omitting the section reads as a gap; the explicit no-op bullet reads as a verified absence.

Split rules:

- Components: ≥10 components → one file per component under `references/components/`. <10 components → single `references/components.md` with one `## <ComponentName>` section per component.
- Tokens: one family (e.g. color only) → single `references/tokens.md`. Multiple families → `references/tokens/<family>.md` per family (color, space, type, motion).

## Closing message contract

Tell the user the skill is saved, then show 2-3 example prompts to try. Make them screen- or product-level ("a settings page", "a pricing section"), not component shopping lists.

Template:

```
Skill saved as `<slug>` at `<persist-target>/<slug>/`.

Try it:
- "Build a <screen-level prompt 1>"
- "Create a <screen-level prompt 2>"
- "Design a <screen-level prompt 3>"
```

Screen-level prompts force the agent to compose multiple components against real layout constraints. Component shopping lists ("show me a Button") prove nothing the validation gate did not already prove.

## [VERIFY] surfacing rule

List every `[VERIFY]` marker in the closing message as a numbered list with file paths. The user needs to know what still needs human eyes before relying on the skill.

Mechanism:

- `scripts/check-skill-docs.sh` greps the persisted skill for `[VERIFY]` markers and emits one line per hit: `<file>:<line>  <surrounding-rule-text>`.
- The agent appends that output to the closing message under a `## Unverified facts (N)` heading. If N is 0, state "No unverified facts." explicitly — silence reads as an oversight.

## NO stamp in v1

The Hallmark stamp-in-artifact pattern was considered and dropped from v1. Git tracks file provenance; `scaffold.sh` writes plain Markdown without per-file machine-readable claims. The decision is logged in `references/coverage-gaps.md` as a deferred feature — add stamps when a future `refresh` or `re-extract` verb needs source provenance to detect drift.
