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
    ├── foundations/<page>.md      (one per accepted+crawled foundation URL;
    │   OR (omitted)                omitted entirely when no foundation URL
    │                               passed — see split rules)
    ├── foundations/index.md       (sub-index of every foundations/<page>.md;
    │   OR (omitted)                co-required with foundations/<page>.md)
    ├── examples/<name>.md         (one per composition exemplar lifted from
    │   OR (omitted)                the reference project; omitted entirely
    │                               when no exemplars exist — see split rules)
    ├── examples/index.md          (sub-index of every examples/<name>.md;
    │   OR (omitted)                co-required with examples/<name>.md)
    └── anti-patterns.md
```

Apply the universal-coverage rule: every component file ships a Best Practices section even if the only bullet is "No special rules — use the API as documented." Omitting the section reads as a gap; the explicit no-op bullet reads as a verified absence.

Split rules:

- Components: ≥10 components → one file per component under `references/components/`. <10 components → single `references/components.md` with one `## <ComponentName>` section per component.
- Tokens: one family (e.g. color only) → single `references/tokens.md`. Multiple families → `references/tokens/<family>.md` per family (color, space, type, motion). `references/tokens.md` holds per-token entries (name + value + family + use-when prose); prose-rule subsections from foundation pages move to `references/foundations/<page>.md` per the Foundations split rule below.
- Foundations: one file per accepted+crawled foundation URL surfaced by the discovery crawl (see `references/foundation-extraction.md`, Per-URL iteration contract), plus an `index.md` sub-index. Basename derivation: apply the **slug map below** to the URL's last path segment; unmapped slugs fall through to the raw last segment. Basenames are derived from the URLs the user passed and CAN collide across runs against different DSes (rare; the scaffolder surfaces the colliding name in its output). When no foundation URL was passed, omit `references/foundations/` entirely — empty `references/foundations/index.md` is a worse failure mode than an absent directory. The slug map ships as part of the meta-skill at `scripts/scaffold.sh` (encoded as a bash case statement) and is documented as prose below so the agent can predict the destination filename before scaffolder time.

  | URL last segment | Canonical filename |
  |---|---|
  | `color`, `color-usage`, `colors` | `colors.md` |
  | `typography`, `type` | `typography.md` |
  | `spacing`, `layout`, `space` | `spacing-layout.md` |
  | `icons`, `iconography` | `icons.md` |
  | `responsive`, `breakpoints` | `responsive.md` |
  | `dark-mode`, `theming`, `theme`, `color-modes` | `theming.md` |
  | `content`, `voice`, `tone` | (route OUT — copy skill; do not create the file) |
  | (anything else) | raw last segment as `<segment>.md` |

  The `content` / `voice` / `tone` row is a route-out, not a write — the scope guardrail still applies even when a foundations URL surfaces a copy/voice page. Surface the routed URL in the discovery summary as a sibling-copy-skill candidate and skip writing the foundation file.

- Examples: one file per composition exemplar surfaced by the reference-project extraction (see `references/reference-project.md`, Composition exemplar extraction section), plus an `index.md` sub-index. Basename derivation lives in `scripts/scaffold.sh` (`app/<dir>/page.tsx → <dir>.md`, `app/page.tsx → home.md`, `components/showcase/<name>.tsx → <name>.md`). Basenames are derived from the reference project's filesystem and CAN collide across runs against different reference projects (rare, but possible — the scaffolder surfaces the colliding name in its output). When the reference project ships zero exemplars (or no reference project was passed), omit `references/examples/` entirely — empty `references/examples/index.md` is a worse failure mode than an absent directory.

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

## Optional: dry-run snapshot

Fires AFTER the closing message and `[VERIFY]` tally land, only when `dry-runs/` exists at the project root. The snapshot freezes a copy of the persisted skill so future runs have something to diff against; it is project-specific convention (workshop authoring repos, evals-as-fixtures repos) and skipped silently otherwise.

### When to fire

- `dry-runs/` directory exists at the project root. Probe with `test -d dry-runs` from the working directory (NOT `find`, NOT a deep scan — the convention is always project-root, never nested).
- The Phase 3 write completed successfully (`check-skill-docs.sh` exited 0). Do NOT offer the snapshot if persist failed; the partial skill is not snapshot-worthy.

### The prompt

One question. Single-question gate. The user can accept a default label, type a custom label, or decline. Do NOT escalate into a multi-question wizard; if the user is unsure the manual `cp -R` is one command away.

```
A `dry-runs/` directory exists in this project. Snapshot this run to
`dry-runs/<YYYY-MM-DD>-<label>/`?

Default label: `<slug>-<short-tag>` — pick from:
  - `<slug>-baseline`     (first run for this DS)
  - `<slug>-pivot-<n>`    (post-component-set or post-scope change)
  - `<slug>-refresh-<n>`  (re-extracted after a DS version bump)
  - or type your own label.

Reply with a label, "yes" to accept the default, or "no" to skip.
```

Pick the default tag from the run's posture: if no prior `dry-runs/<date>-<slug>-*` exists, default to `<slug>-baseline`. If priors exist and the component set changed, default to `<slug>-pivot-<n+1>`. If priors exist and only the DS version moved, default to `<slug>-refresh-<n+1>`. The user can always override.

### What the snapshot writes

On accept, the agent writes three things to `dry-runs/<YYYY-MM-DD>-<label>/`:

1. **`extracted-skill/`** — a full `cp -R` of `.claude/skills/<slug>/`. NOT a symlink (snapshots are frozen; symlinks would drift the moment the live skill changes).

2. **`README.md`** — context for the snapshot. Mirror the shape of `dry-runs/2026-06-01-baseline/README.md` when present:
   - One-paragraph header naming the run (`<label> dry-run — <YYYY-MM-DD>`), the scope (which components, which DS version), and the "instructor reference / not attendee starting point" disclaimer.
   - `## What's here` — bullet list of every file copied, with a one-liner explaining what each mirrors.
   - `## Diff against earlier runs` — a fenced bash block with `diff -r` commands pointing at the previous snapshot(s) under `dry-runs/`. Include this even when there is only one prior snapshot; readers expect it.
   - `## Known limitations of this snapshot` — list everything the snapshot does NOT cover (Phase 4/5 not yet run, scripts that aborted, deferred tokens, etc.). Honest scope is more useful than implied completeness.

3. **`RUBRIC.md`** — derived from `dry-runs/TEMPLATE.md`. Pre-fill the fields the agent run produced directly (components named in discovery, validation proof point, `check-skill-docs.sh` exit code, `[VERIFY]` tally, slug-collision outcome, any script aborts the agent worked around). Leave operator-observable fields (timings, machine details, UX confusion, Phase 4/5 outcomes) blank with `<fill in>` markers. Do NOT fabricate timings or operator notes — those are the operator's manual pass.

### What the snapshot does NOT write

- Generated app artefacts (`app/page.tsx` etc.). Those land in `dry-runs/<date>-<label>/` only after the generation prompt runs, which is a separate invocation. The snapshot README's "Known limitations" must call out that those artefacts are missing if the run stopped at Phase 3.
- `SUMMARY.md` updates. The aggregate table at `dry-runs/SUMMARY.md` is operator-edited; the meta-skill does not append rows automatically (the operator decides which runs are SUMMARY-worthy).
- Any modification to existing `dry-runs/<other-date>-<other-label>/` directories. Snapshots are write-once-per-directory.

### Collision handling

If `dry-runs/<YYYY-MM-DD>-<label>/` already exists, ASK before overwriting. Mirror the Phase 3 slug-collision posture: never silently suffix `-2`, never auto-rename. The user picks: overwrite, pick a different label, or abort the snapshot (the skill at `.claude/skills/<slug>/` is unaffected either way).

### After the snapshot

Print one confirmation line:

```
Snapshot written to `dry-runs/<YYYY-MM-DD>-<label>/`. RUBRIC.md fields filled
where the agent could; operator-observable fields (timings, Phase 4/5) left
blank.
```

Then the conversation is done. Do NOT offer further actions; the user owns the next move (run the generation prompt, fill the rubric, update `SUMMARY.md`).
