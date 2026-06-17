# Inheritance ledger

Why each pattern in `extract-ds-skill` is here, and what was consciously dropped. Future maintainers reading this file should be able to trace any decision back to its source, and see the fences that hold the scope.

## v0 design-system skill onboarding (vercel/v0 PR #24474)

### Inherits

- Three labeled phases verbatim: `## Phase 1: Discovery summary`, `## Phase 2: Validate the extraction in a scratch workspace`, `## Phase 3: Persist the skill`
- Single human gate at the Phase 2 to Phase 3 boundary ("Wait for explicit user approval before Phase 3.")
- Pre-persistence validation gate — scratch workspace, nothing in durable storage until the user confirms
- Adapter-not-docs mission sentence (lightly adapted from `onboarding-instructions.ts:17`)
- Discovery summary budget rules verbatim — "One line per source is the budget. No tables, no per-source field breakdowns."
- "If the user just says 'go' without answering anything, pick defensible defaults and proceed." verbatim
- Shallow-inspect rule for Phase 1 — package exports, top-level folders, docs index; do not enumerate every component, token, or icon yet
- Source-role taxonomy: design-system code / asset package / product or example app / internal AGENTS or CLAUDE files / docs site / Storybook / Figma / private-or-inaccessible
- Slug-collision ASK rule — "ASK the user whether to overwrite or pick a different slug - do not silently suffix."
- Skill directory layout — `SKILL.md` + `references/components/*.md` + `references/tokens.md` + `references/assets.md` (omit any folder that would be empty)
- Per-component reference file contract verbatim — public imports, when to use, key props and variants, accessibility, composition examples, source references, common mistakes, things to never invent
- Pattern-example collapse — "Treat pattern guidance and example code as one thing: the annotated example IS the pattern."
- Anti-fabrication Do/Don't list + `[VERIFY]` marker convention — "Mark unverifiable facts `[VERIFY]`. Report blockers instead of guessing."
- Closing message contract — "show 2-3 example prompts to try. Make them screen- or product-level ('a settings page', 'a pricing section'), not component shopping lists."
- Smoke-test artifact distinct from shipped artifact (the showcase index page exists to prove rendering, must not ship with the starter)

### Does not inherit

- `v0Config` / `v0.json` canonical payload (host-side config, not portable to Claude Code)
- `ApplyV0SkillConfig` host-side tool
- Reference workspace mounting at chat init
- Blob / S3 attachments
- `hidden-context` message-part type
- Dialog UI (`skill-onboarding.tsx`)
- `v0_memories/<team>/skills/<slug>/` path — we use `.claude/skills/<slug>/` in the attendee's repo (per-project, not per-team)
- `/CLEAN_CWD/` VM scratch — we use local `.extract-ds-skill-scratch/`
- Feature flag `designSystemSkillConfigEnabled`
- Showcase index page rendered in v0 preview iframe — we use deterministic typecheck + grep-resolves as the default `validate.sh` mode, with optional probe-page escalation

## vercel/front product-copywriting skill (STRUCTURAL only)

### Inherits

- YAML frontmatter `description` as dispatch contract — trigger-rich + an `IMPORTANT:` clause directing the agent to load the named references
- "When to Load References" routing table — 3-column: trigger | files to load | internal cross-skill pass
- Three-tier file layout — `SKILL.md` + `AGENTS.md` + `references/*.md`
- `**STOP.** Reading SKILL.md alone is insufficient.` block verbatim, with bold preserved
- Per-domain file granularity — the split-or-fail empirical lesson (a 1.2k-line monolith was unreliable)
- Rule slug registry — namespace prefix (`component/...`, `token/...`), hyphenated, one slug per concept
- `coverage-gaps.md` as a self-aware backlog + the ~150-200 instruction-budget caveat
- Cross-skill composition via the third column of the routing table
- Quick Triage executive summary — priority-ordered, mechanical-last
- Agent Stance slot — 5-bullet meta-rule block
- `AGENTS.md` as a cross-agent stub + "Common Agent Failure Modes" letter to future agents
- Per-skill internal-consistency check script (analog of `check-skill-docs`)

### Does not inherit (ALL voice/tone content is out of scope)

- All voice / tone / banned-words content (Tier 1 hype, AI-slop tells)
- Voice tone-flex table
- Tier 3 conditional-allow word table
- Period Rule, curly quotes, Mechanics typographic register
- Exemplars-as-PR-diffs convention
- Two-metric eval split (`rule_correctness` vs `fidelity`) — eval harness is out of scope for v1
- Sentence-style vs Title-Case button rules
- Single-Skill Interface Workflow table — no sibling skills in v1

## Geist `<BestPractices>` .mdx pattern

### Inherits

- Per-component file with frontmatter `title` + `description` (drop `peek` — docs-rendering-specific)
- `## Best Practices` heading + bulleted list, plain Markdown — NOT the JSX `<BestPractices>` wrapper
- Flat-list shape for simple components (fewer than 10 rules)
- Subsectioned shape for complex components — `When to use / Behavior / Content / Accessibility` (vocabulary verbatim, order verbatim)
- Six rule shapes recognized during extraction — component-selection, prop-usage, naming-copy [route out], accessibility, default-state, cross-skill-back-reference [defer]
- Two-marker convention — backticks for prop, value, and literal API tokens; `[Component](./components/name.md)` for peer-component graph edges
- Rules-only-in-prose detection heuristics — negative imperatives, naming prescriptions, fuzzy thresholds, cross-component traps, runtime-validator complements
- `Bad | Good | Why` columnar anti-pattern table — code-fence in the left two columns, prose in the right
- Cross-component rule duplication — the same rule lives in EACH component file where the trap can fire; do not normalize
- Universal coverage rule — every component file ships a Best Practices section, even if only "No special rules — use the API as documented."
- Shape 3 (naming/copy) recognition for ROUTING purposes only — the meta-skill identifies these to route them out, NOT to extract

### Does not inherit

- MDX JSX wrappers — `<BestPractices>`, `<Component>`, `<Preview>`
- `peek` frontmatter field
- Live-rendered docs surface
- Naming / copy / casing rule CONTENT — recognize and route out; do not extract

## Hallmark (Together AI)

### Inherits

- Progressive-disclosure load map — every reference file is named in `SKILL.md` with an explicit load-when condition
- Pre-emit self-check discipline — run a check BEFORE emitting output; adapted as the reflexive audit in `SKILL.md`
- Verb-table dispatch slot — v1 has only the `extract` verb; the slot is reserved for a future `audit` or `refresh` verb

### Does not inherit

- Stamp-in-artifact pattern — DROPPED from v1 per locked decision Q6. Git tracks provenance; `check-skill-docs.sh` does not use stamps as a falsifiability check; the v0 onboarding flow does not stamp; the product-copywriting skill does not stamp. Adding it because Hallmark does is cargo-cult. Deferred to `coverage-gaps.md` for when a re-extract verb needs source provenance.
- All taste / aesthetic gate content
- Six pre-emit axes (Philosophy / Hierarchy / Execution / Specificity / Restraint / Variety)
- Macrostructure, theme, and genre dispatching
- 22-named-theme catalog
- Component cookbook archetype codes
- `study` verb (DNA extraction)
- `redesign` verb (page-redesign flow)
- Separate long gates file — we collapse audit into the `SKILL.md` reflexive-audit section per A2 + C2

## Scope guardrail (anchors all four sources)

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. When you encounter a copy/naming/casing rule during extraction (e.g. "Title Case the label", "placeholder is action-oriented"), recognize it, route it - mention it in the discovery summary as a candidate for a sibling copy skill - but do NOT extract it into this DS skill.
