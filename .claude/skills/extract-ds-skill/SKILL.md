---
name: extract-ds-skill
description: Extract a Claude Code design-system skill from a real DS source. Use when the user wants to turn a design system (component library, token set, asset package) into an installable skill at .claude/skills/<slug>/ in their project. Triggers: 'make a skill from <DS>', 'extract a DS skill', 'turn primer/geist/material/<DS> into a skill'. Scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting - route copy rules to a separate copy skill, do not extract them here. IMPORTANT: this file is an orchestrator. Load the references/ files named in the routing table; SKILL.md alone is insufficient for any phase past initial discovery framing.
---

## Mission (what a DS skill IS)

A design-system skill is an adapter that teaches an agent how to build high-fidelity UI with a specific design system. It is not a copy of the design-system documentation. It tells the agent what to read, what APIs are public, what sources are authoritative, and how to verify that generated UI uses the system correctly.

This skill BUILDS such a skill from a real DS source. The output is the skill; this file is the recipe.

## Scope (locked)

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. When you encounter a copy/naming/casing rule during extraction (e.g. "Title Case the label", "placeholder is action-oriented"), recognize it, route it - mention it in the discovery summary as a candidate for a sibling copy skill - but do NOT extract it into this DS skill.

This scope block is quoted by downstream rules (Quick Triage step 1, Agent Stance bullet 3, Anti-fabrication "Do not" list, `references/component-extraction.md` Shape 3). Do not paraphrase or trim it when re-citing.

The skill runs in three labeled phases. The single human gate sits at the boundary between Phase 2 and Phase 3. Phase 1 closes with a confirmation prompt; Phase 2 closes with an approval prompt; Phase 3 writes to disk.

## Phase 1: Discovery summary

Inspect the sources the user pointed at, classify each by role (design-system code, asset package, product/example app, internal AGENTS/CLAUDE files, docs site, docs:foundation, Storybook, Figma), auto-discover component exports, and render a compact discovery summary inline (not a file). Hard ceiling 30 lines, target 20-28. Load `references/discovery.md` for the budget rules, the source-role taxonomy, the auto-discover-and-prune flow, and the worked example.

The discovery summary covers: proposed skill name and target path, DS one-liner, components in scope (one line each, of the form "Components found (N), proposing (M)"), tokens detected (one summary line), assets detected (one summary line), foundation docs URL if any (one line, tagged `[docs:foundation]`, single URL, omitted entirely if the user did not provide one), 1-3 headline rule candidates with `file:line` cites, sources used (one line each, tagged `[code]` / `[docs]` / `[docs:foundation]` / `[storybook]` / `[private-blocker]`), and any open questions that would actually stop Phase 2. End with a single short sentence asking the user to confirm or adjust. Then stop and wait. If the user just says "go" without answering anything, pick defensible defaults and proceed.

Inspect-but-do-not-enumerate is the rule. Read enough to know what each source contains (package exports, top-level folders, docs index, example apps); do not list every component, token, or icon yet. The full enumeration happens in Phase 2, against the pruned set the user confirms.

### Worked example — Phase 1 summary against a public-DS-shaped target (illustrative)

The block below uses a public-DS-shaped target to ground the shape. The skill makes no assumption that the user's DS is the one in the example; the same summary contract applies to whichever DS the user passes. Substitute real cites for the DS you are extracting.

```
Proposed skill: `primer-react` -> .claude/skills/primer-react/
DS: Primer React - GitHub's component library for building consistent, accessible UI.

Components found (38), proposing (4):
- TextInput - single-line text entry with built-in validation slots
- Button - primary/invisible/danger action trigger with icon + loading states
- Checkbox - controlled boolean input, pairs with FormControl for label/caption
- FormControl - wraps an input + label + caption + validation; required-for-a11y composition

Tokens detected: ~180 across color (primer/primitives), space (4px grid), type (functional scale).
Assets detected: 0 icons in this package (octicons ship separately, out of scope for v1).

Foundation docs: https://primer.style/product/getting-started/foundations/color-usage/ [docs:foundation] (color usage + dark-mode wiring + semantic-foreground roles)

Headline rule candidates:
- "Use `disabled={isLoading}` on submit buttons, not `inactive` - `inactive` is a non-interactive visual state, screen readers still announce it as actionable" (Button.docs.tsx:142)
- "Wrap every TextInput / Checkbox in `<FormControl>`; bare inputs lose label association and fail axe" (FormControl.docs.tsx:31)
- "Do not pass `aria-label` to a Button that already renders visible text" (Button.tsx:204)

Sources used:
- github.com/primer/react @ v37.x [code, joint-read]
- primer.style/react [docs]
- primer.style/product/getting-started/foundations/color-usage/ [docs:foundation]

Out-of-scope rules surfaced (route to sibling copy skill): "button labels are Title Case", "placeholder text is action-oriented".

No blockers. Confirm or adjust? (Reply "go" to accept defaults and begin extraction.)
```

## Phase 2: Validate the extraction in a scratch workspace

Triggered only after explicit user confirmation from Phase 1. Goal: prove the extraction grounds in real source before any file is written to `.claude/skills/<slug>/`. Everything in this phase lives in `.extract-ds-skill-scratch/` (local, gitignored). Nothing is written to `.claude/skills/<slug>/` yet - iteration is cheap and partial state never lands in the user's project.

Load `references/validate.md` for the deterministic typecheck + grep-resolves protocol. The validation runs `scripts/validate.sh` against the scratch workspace. It typechecks the extracted component contracts against the DS package's published types, greps every cited token name against the source token file, greps every cited icon/asset name against the asset package, and counts `[VERIFY]` markers.

If a `[docs:foundation]` URL is in scope from Phase 1, run the foundation-docs extraction step in addition. WebFetch the URL once, load `references/foundation-extraction.md`, classify candidate rules into the five shapes (token-pairing, mode-aware, contrast-minimum, semantic-role, fallback-element), grep-resolve every cited CSS variable against the installed token package (`node_modules/<ds-package>/dist/css/`), and mark unresolved cites `[VERIFY]`. Stash extracted rules in `.extract-ds-skill-scratch/tokens-extracted.md` — no foundation rule lands in `.claude/skills/<slug>/` until Phase 3. Skip this paragraph entirely when no foundation URL is in scope; the baseline typecheck + grep-resolves contract is the full Phase 2. Wiring (HTML attributes, CSS imports, provider wrappers) is NOT extracted from foundation prose — it is lifted from a real consumer app via `references/reference-project.md` when one is in scope, or from the verbatim docs setup snippet otherwise.

The proof point surfaced before the gate is a single line of the form: "N props verified against source, M tokens grep-resolved, K assets grep-resolved, F foundation-rules extracted (X cited, Y `[VERIFY]`), 0 hallucinations" alongside any open `[VERIFY]` markers as a numbered tally. Omit the `F foundation-rules` segment when no `[docs:foundation]` URL was in scope. If the tally is non-zero, the agent describes each unresolved marker and asks whether to drop the rule, escalate to a second-pass source read, or accept it as a known limitation.

Iterate in `.extract-ds-skill-scratch/` until the user is satisfied. Re-run `scripts/validate.sh` after each iteration. Do not touch `.claude/skills/<slug>/` during iteration. Wait for explicit user approval before Phase 3.

### Worked example — Phase 2 proof-point line (illustrative)

The block below uses a public-DS-shaped target to ground the shape. The skill makes no assumption that the user's DS is the one in the example; the same proof-point contract applies to whichever DS the user passes.

```
Validation complete.
- 14 props verified against source (Button: 6, TextInput: 4, Checkbox: 2, FormControl: 2)
- 47 tokens grep-resolved (color: 28, space: 12, type: 7)
- 0 assets in scope this run
- 6 foundation-rules extracted (5 cited, 1 [VERIFY])
- 0 hallucinations
- 3 open [VERIFY] markers:
  1. Button.md:42 - loading-state prop name not confirmed in types file
  2. FormControl.md:18 - validation slot signature absent from public types; inferred from docs
  3. tokens.md:74 - `--fgColor-onMuted` cited by foundation URL but no grep-resolve in @primer/primitives@11.9.0

Approve to persist? (Reply "go" to write to .claude/skills/primer-react/.)
```

## Phase 3: Persist the skill

Triggered only after the user confirms the validation looks good. This is the first write to `.claude/skills/<slug>/` in this conversation. Once you start writing here, files go live immediately. No staging, no draft frontmatter, no commit step. Partial state during a crash is acceptable.

Load `references/persist.md` for the slug-collision check (must run FIRST, before any write), the file layout, the per-component-file contract, and the closing message. The scaffolder writes `SKILL.md`, `AGENTS.md`, `references/components/*.md`, `references/tokens.md`, `references/assets.md`, and optionally `references/patterns.md` - omit any folder that would be empty.

If the user later asks for changes, edit the files in-place (they are already live under `.claude/skills/<slug>/`). Re-run `scripts/check-skill-docs.sh` after any edit that touches the routing table, the rule-slug registry, or the file layout.

The persist target is `.claude/skills/<slug>/` in the attendee's project (per-project, not per-user). Attendees commit the skill alongside the starter; the skill ships with the repo, not the dotfiles. This makes the skill portable across machines, reviewable in PRs, and rollback-able with `git`.

## Source-role taxonomy

Every source the user points at falls into one of ten roles. The taxonomy lives in `references/discovery.md`; this is the SKILL.md summary for fast classification during Phase 1.

- **Design-system code** (`[code]`) - the package source, types file, and component implementations. Highest authority. Joint-read with docs; wins on conflict.
- **Asset package** (`[code]`) - icons, logos, illustrations shipped as a separate package (e.g. octicons, geist-icons). Treat exports as the inventory; do not invent names.
- **Product/example app** (`[code]`) - a real consumer of the DS. The single best source for wiring (provider mount, font setup, globals CSS, install scripts). Copy wiring verbatim from here when available.
- **Reference project** (`[example:project]`) - a real consumer app the user supplies as a URL or local path at Phase 1 input time, explicitly tagged for **wiring extraction**. Phase 2 auto-detects the framework (Vite / Next.js App / Next.js Pages / CRA), reads the root entry file, and lifts the provider mount + CSS imports + root-element attributes verbatim per `references/reference-project.md`. Opt-in. When omitted and a `[docs:foundation]` URL is in scope, the Setup section falls back to the verbatim docs setup snippet.
- **Internal AGENTS/CLAUDE files** (`[code]`) - guidance the DS team has already written for agents. Inherit liberally; cite by `file:line`.
- **Docs site** (`[docs]`) - prose-and-example documentation. Useful for the "when to use" and "common mistakes" sections; lower authority than types on prop signatures. Cited, not extracted.
- **Docs:foundation** (`[docs:foundation]`) - a single prose foundations page on the DS docs site that is EXTRACTED into `token/*` rules, not just cited. One URL per call, opt-in. Phase 2 fetches it via WebFetch, extracts five prose rule shapes per `references/foundation-extraction.md` (token-pairing, mode-aware, contrast-minimum, semantic-role, fallback-element), and materializes them as subsections inside `references/tokens.md`. Wiring (HTML attributes, CSS imports, provider wrappers) is NOT extracted from foundation prose — it is lifted from a real consumer app via `references/reference-project.md`, or from the verbatim docs setup snippet as a fallback.
- **Storybook** (`[storybook]`) - canonical variant examples. Useful for composition examples; not always authoritative on prop names if the stories lag the package.
- **Figma** (`[figma]`) - design-time source. Use for tokens and visual rules; never for prop names or API contracts.
- **Private/inaccessible** (`[private-blocker]`) - soft blocker. Log, proceed, may become available later.

## Six rule shapes (extraction recognition)

During extraction, every rule the agent surfaces falls into one of six shapes. The full taxonomy with examples lives in `references/component-extraction.md`; this is the SKILL.md summary so the agent can route quickly.

1. **Component-selection** - "use X for Y; do not use X for Z". Extract.
2. **Prop-usage** - "set `disabled` not `inactive` on loading buttons". Extract.
3. **Naming-copy** - "button labels are Title Case", "placeholder is action-oriented". **ROUTE OUT.** Mention in discovery summary as a candidate for a sibling copy skill; do not extract here.
4. **Accessibility** - "wrap inputs in FormControl for label association". Extract.
5. **Default-state** - "buttons render `medium` size unless explicitly sized". Extract.
6. **Cross-skill-back-reference** - "for icon usage, see icons skill". Defer until a sibling skill exists; mark `[VERIFY]` and proceed.

## Quick Triage

Five-step priority scan. Run in order. Stop at the first step that fires a hard rule.

1. **Is the request in scope (tokens/assets/components/APIs) or copy?** If copy (tone, voice, marketing language, casing rules, placeholder phrasing, error-message wording, microcopy style) → say so and stop. Suggest a sibling copy skill (`extract-copy-skill` or equivalent); do not extract copy here. The full scope guardrail is quoted in the Scope section above - apply it verbatim.
2. **Is the DS source accessible?** If the user pointed at a private repo, paywalled package, or unreachable docs site, treat it as a soft blocker - record it in the discovery summary tagged `[private-blocker]`, do not pretend you read it. Inputs that may become available later are not hard blockers; inputs you fabricated from memory are.
3. **Does a skill with this slug already exist at `.claude/skills/<slug>/`?** If yes, ASK before overwriting. Never silently suffix `-2`, `-new`, or a date. The user picks: overwrite, choose a different slug, or abort.
4. **Is the auto-discovered component set the right scope?** Print "Components found (N), proposing (M)" in Phase 1 and let the user prune. Default is "all exported public components"; the user trims. Never type a hand-picked component list off a slide - the discovery scan is the source of truth, the prune is the human edit.
5. **Are sources joint-readable (code + docs)?** If both are present, joint-read them and resolve conflicts in favor of code. If only docs are present, mark every extracted prop with `[VERIFY]` until a consumer app or types file lands. If only code is present, extract from the types and the source; docs-derived rules are deferred.

## Agent Stance

- The DS source is the canonical truth. Generated rules cite source by `file:line`; uncited rules get `[VERIFY]` or get dropped. A rule with no source citation is a hallucination waiting to surface in someone else's PR.
- Joint-read code and docs - code wins on conflict. A docs page that claims a prop the types file does not export is a docs bug, not a feature. Log the divergence in the discovery summary so the DS team can fix it.
- Scope discipline is load-bearing. If a rule is about copy, voice, or marketing tone, route it out (mention in the discovery summary as a candidate for a sibling copy skill) - do not extract it. The scope guardrail block is quoted verbatim by Quick Triage step 1 and by `references/component-extraction.md` Shape 3.
- Auto-discover then prune. Scan the package's public exports, list everything in Phase 1, let the user trim. Workshop credibility depends on this: rehearsed theatre is detectable; an auto-discovered list pruned live is not.
- Copy wiring verbatim from a real consumer app; if none exists, lift from setup docs. Do not reconstruct from memory.

## When to Load References

Progressive disclosure is the contract. Load each reference file only at the gate it serves.

| When you are... | Load references | Internal pass |
|---|---|---|
| Framing Phase 1, classifying sources, rendering the discovery summary | `references/discovery.md` | Source-role taxonomy, auto-discover-and-prune, budget rules |
| Running Phase 2 validation in `.extract-ds-skill-scratch/` | `references/validate.md` | Typecheck + grep-resolves protocol, `[VERIFY]` tally, wait-gate |
| About to write the first file under `.claude/skills/<slug>/` in Phase 3 | `references/persist.md` + `references/skill-template.md` | Slug-collision check, file layout, SKILL.md contract |
| After closing message, considering the optional `dry-runs/` snapshot prompt | `references/persist.md` (`## Optional: dry-run snapshot`) | Conditional on `dry-runs/` existing at project root; prompt shape, copy + RUBRIC stub |
| Extracting a single component into `references/components/<name>.md` | `references/component-extraction.md` | 8-section component-file checklist, six rule shapes, Shape 3 routing |
| Extracting rules from a `[docs:foundation]` URL into `references/tokens.md` and the produced SKILL.md Setup section | `references/foundation-extraction.md` | Six foundation rule shapes, per-rule subsection skeleton, CSS-variable grep-resolve, Setup-injection contract |
| Lifting wiring from an `[example:project]` reference project into `.extract-ds-skill-scratch/wiring-extracted.md`, AND lifting composition exemplars from the same reference project into `.extract-ds-skill-scratch/examples/<basename>.md` | `references/reference-project.md` | Framework auto-detection (Vite / Next.js App / Next.js Pages / CRA), provider + CSS imports + root-attrs lift recipe, framework-adaptation note, fallback-to-docs path, AND composition exemplar extraction (two globs — `app/**/page.tsx` and `components/showcase/*.tsx` — one scratch file per match, per-file "What to copy" pattern bullets) |
| Writing a `Bad \| Good \| Why` block, or any cross-cutting anti-pattern | `references/anti-patterns.md` | Column grammar, code-fence rule, cross-component duplication |
| Asked "why did you inherit X from Y?" by a maintainer | `references/inheritance.md` | Source-by-source inherit / do-not-inherit ledger |
| Hitting a known gap (Hallmark progressive-disclosure tiers, stamp pattern, refresh verb) | `references/coverage-gaps.md` | ~150-200 instruction-budget caveat, deferred work |
| Performing a reflexive audit during or after extraction | none - the rules below ARE the rubric. No separate `audit/` verb in v1; reflexive audit only |

Do NOT pre-load reference files before their gate triggers - progressive disclosure is the contract.

## Workflow Gates

**STOP.** Reading SKILL.md alone is insufficient. The reference files are not optional appendices; they are the operating contract. SKILL.md frames the phases and the rules; the references carry the operational detail. Skipping a required load means the agent fabricates the contract instead of following it.

Required loads (non-negotiable):

- Before writing `SKILL.md` for the new skill, load `references/skill-template.md`. SKILL.md is the load-bearing file of the skill the agent is producing; the contract for what goes in it (frontmatter shape, mission sentence, routing table layout, hard rules, final checks) is too long to fit here.
- Before writing each `references/components/<name>.md`, load `references/component-extraction.md`. The 8-section checklist (public imports / when to use / key props / accessibility / composition examples / source references / common mistakes / things to never invent), the six rule shapes, and the Shape 3 routing rule live there. Load once per component; the file is short on purpose.
- Before any write to `.claude/skills/<slug>/`, load `references/persist.md`. The slug-collision check (run FIRST, before any write), the file layout, and the closing-message contract live there.
- After scaffold completes, run `scripts/check-skill-docs.sh`. This is the post-emit consistency check; its output IS the audit result. Do not declare the skill saved before this script exits 0.

## Anti-fabrication rules

**Do:**

- Verify component props, token names, icon names, and asset names from source. The source is the types file, the published component, the token export, or the asset manifest - not the docs site alone.
- Mark unverifiable facts [VERIFY]. Report blockers instead of guessing. A `[VERIFY]` marker is cheap; a fabricated rule that lands in a starter is expensive.
- Copy wiring verbatim from a real consumer app; if none exists, lift from setup docs. Do not reconstruct from memory.
- Treat private/inaccessible sources as inputs that may become available later, not hard blockers. Tag them `[private-blocker]` in the discovery summary and proceed with what is accessible.
- Joint-read code and docs; resolve conflicts in favor of code. Log the divergence so the DS team sees it.
- Prefer public package APIs and exports over internal source paths. The skill teaches consumers; consumers cannot import from internal paths.

**Do not:**

- Invent props, variants, icons, assets, tokens, or setup steps. If the types file does not export it, it does not exist.
- Silently overwrite an existing slug. Before writing anything, check whether a skill with that slug already exists. If it does, ASK the user whether to overwrite or pick a different slug - do not silently suffix.
- Pre-load reference files before their gate triggers. Progressive disclosure is load-bearing; eager loading inflates context and degrades rule-following.
- Extract copy, voice, naming, or casing rules into this DS skill. Recognize them during extraction (Shape 3) and route them to a sibling copy skill via the discovery summary.
- Leave empty placeholders or guidance that encourages guessing. Empty placeholders read as "fill this in later" and never get filled.
- Encourage raw CSS values when tokens exist. A skill that opens the door to raw hex codes loses the design-system contract on the first prompt.
- Include examples that do not compile against public APIs. Every example file in `references/components/*.md` must be runnable against the published package.
- Put the full design system manual in SKILL.md. SKILL.md routes; references carry the manual.
- Invent example files. If the reference project ships zero composition exemplars (no `app/**/page.tsx`, no `components/showcase/*.tsx`), the produced skill ships zero example files. Empty `references/examples/` is the correct empty state — never fabricate a composition exemplar to fill the directory.

## Reflexive audit (the skill IS the rubric)

Three layered mechanisms operate during and after extraction. There is no separate `audit/` verb in v1. The rules listed in this file and the reference files ARE the rubric. The agent audits itself by re-reading the rules at gate boundaries and by running a deterministic script after persist.

**(A) PRE-EMIT structural re-read.** Just before invoking `scripts/scaffold.sh`, re-read this "Reflexive audit" section and `references/component-extraction.md`, then paste a tick-list back into the message as visible chain-of-thought:

1. Every component file has all 8 required sections (public imports / when to use / key props / accessibility / composition examples / source references / common mistakes / things to never invent). Missing sections are not allowed; "no special rules" is the explicit empty-state for components that genuinely have nothing extra to say.
2. Every extracted rule is cited to a source `file:line`. Uncited rules carry `[VERIFY]` or are dropped. Citations point at the canonical source - prefer the types file or the component source over a docs page.
3. Every rule is in scope (tokens/assets/components/APIs). Any copy/voice/casing rule surfaced during extraction is recorded in the discovery summary as a candidate for a sibling copy skill, not extracted here. The scope guardrail block is quoted by this rule.
4. Every routing-table row in the new SKILL.md resolves to a file the scaffolder is about to write. Phantom rows (rows pointing at files the scaffolder will not produce) are the most common consistency bug; the pre-emit tick is the cheapest place to catch them.
5. Every rule slug in the new SKILL.md follows the registry pattern (`component/<name>-<rule>`, `token/<name>-<rule>`, `asset/<name>-<rule>`). Hyphenated, namespaced, one slug per concept.
6. Every `references/examples/<name>.md` file lifts from a real file in the reference project (an `app/**/page.tsx` or a `components/showcase/*.tsx`), and the routing table contains one row per example file plus the index row. If the reference project ships zero exemplars, `references/examples/` is omitted and the routing table carries no example rows — the empty state is a real state, not an omission to backfill.

If any tick fails, fix in `.extract-ds-skill-scratch/` and re-run the tick-list before calling `scripts/scaffold.sh`. This is a visible chain-of-thought step, not a hidden one. The agent pastes the tick-list back into the message so a human reviewing the transcript can verify the audit ran.

**(B) IN-FLIGHT `[VERIFY]` markers.** Any rule the agent cannot fully ground in source gets a literal `[VERIFY]` marker inline at the point of extraction. Keep a running tally. The tally surfaces in the Phase 2 proof-point line ("N props verified, K open [VERIFY] markers") and again in the closing message after Phase 3. A `[VERIFY]` marker is not a defect; an undecided `[VERIFY]` at the end of Phase 3 is. Resolve each one by reading more source, downgrading the rule, or dropping it.

**(C) POST-EMIT `scripts/check-skill-docs.sh`.** Runs against the written skill after Phase 3 writes complete. The script asserts: every routing-table row in the new SKILL.md resolves to a real file under `.claude/skills/<slug>/`; every rule slug in the registry resolves to a citation in a reference file; every `[VERIFY]` marker is grep-counted and surfaced; every component file ships all 8 required sections. The script's stdout IS the audit result. Exit code 0 means consistency passed; non-zero means at least one assertion failed and the closing message must list the failures.

No separate `audit/checklist.md`, no `rubric.md`. The rules ARE the rubric. A future audit verb is deferred (see `references/coverage-gaps.md`); v1 ships the reflexive loop only.

## Final checks

After `scripts/check-skill-docs.sh` exits 0, print the closing message. The closing message has three parts: a one-line confirmation, 2-3 example prompts, and the `[VERIFY]` tally.

First line: ``Skill saved at `.claude/skills/<slug>/`.``

Then the closing-message rule applies verbatim: "Tell the user the skill is saved, then show 2-3 example prompts to try. Make them screen- or product-level ('a settings page', 'a pricing section'), not component shopping lists." The prompts are how the user proves the skill works end-to-end without further coaching. Pick prompts that exercise multiple components and at least one composition pattern.

Example shape (substitute the real DS name, the real slug, and realistic product-level prompts for the DS in scope):

> **Skill saved as `<slug>`.**
>
> Try it:
> - "Build a login page styled with <name>"
> - "Create a billing settings screen with a plan picker and invoice history"
> - "Draft a pricing section using <name> components"

Then list every `[VERIFY]` marker as a numbered list with the file path and a one-line summary of what could not be grounded. The tally is non-optional even when the count is zero - "0 open [VERIFY] markers" is the success state worth surfacing:

```
[VERIFY] markers (N):
1. references/components/button.md:42 — loading-state prop name not confirmed in types file
2. references/tokens.md:18 — motion scale absent from package; inferred from docs site only
```

If any `check-skill-docs.sh` assertion failed, list the failures verbatim from the script's stdout and stop. Do not declare success. Do not print the example prompts. The skill on disk is partial; the user decides whether to fix in place (files are already live under `.claude/skills/<slug>/`) or roll back manually with `git`. The agent does not auto-rollback; the per-project persist target makes rollback the user's call, not the skill's.

After the closing message lands, run the **optional snapshot step** (next section). After that step resolves (yes or no), the conversation is done. Further user requests for changes are handled by editing the live files in place and re-running `scripts/check-skill-docs.sh` after each edit that touches the routing table, the rule-slug registry, or the file layout.

## Optional: snapshot to `dry-runs/`

If a `dry-runs/` directory exists at the project root, after the closing message ask the user whether to snapshot this run into `dry-runs/<YYYY-MM-DD>-<label>/`. If `dry-runs/` does not exist, skip this step silently — the convention is project-specific and absent in most consumer repos.

The prompt has exactly one question and offers a default label. Worked example:

> A `dry-runs/` directory exists in this project. Snapshot this run to `dry-runs/<YYYY-MM-DD>-<label>/`?
> Default label: `<slug>-<short-tag>` (e.g. `ds-pivot-1`, `primer-react-baseline`).
> Reply with a label, "yes" to accept the default, or "no" to skip.

If the user accepts, copy `.claude/skills/<slug>/` to `dry-runs/<date>-<label>/extracted-skill/`, write a `README.md` mirroring the existing baseline shape (one paragraph of context, "What's here" list, "Diff against earlier runs" snippet, "Known limitations" list), and write a stub `RUBRIC.md` by copying the body of `dry-runs/TEMPLATE.md` and pre-filling the fields the agent run itself produced (components, validation proof point, `check-skill-docs.sh` exit code, `[VERIFY]` tally). Leave the operator-observable fields (timings, UX confusion, Phase 4/5) blank.

Detail and mechanics in `references/persist.md` (`## Optional: dry-run snapshot`). Do NOT pre-load that section — load it on this step's gate only.

If the user replies "no" (or anything other than a label/yes), skip silently. This is a single-question gate, not a multi-step interaction; if the user is unsure, the snapshot can be created manually after the fact with `cp -R .claude/skills/<slug>/ dry-runs/<date>-<label>/extracted-skill/`.

## Slug-naming heuristics

The slug is the directory name under `.claude/skills/`. It is also the trigger word the user types when invoking the skill. Pick it carefully.

- Kebab-case, short. `primer-react`, `geist`, `acme-ui`. Not `PrimerReact`, not `primer_react`, not `our-internal-design-system-v2-final`.
- Match the package name when possible. If the DS publishes as `<scope>/<pkg>` (e.g. `<scope>/react`), the slug is `<scope>-react`; if it publishes as a bare name (e.g. `geist`), the slug matches the bare name.
- If the package name collides with a generic word (`ui`, `components`, `design`), prefix with the org or product (`acme-ui`, `vercel-design`).
- If the user has multiple sibling skills (DS + copy + a11y), the slug should disambiguate: `primer-react` for the DS skill, `primer-copy` for the sibling.
- Slug collisions are a hard ASK. Never silently suffix `-2`, `-new`, `-v2`, or a date.

## The single human gate (clarification)

The skill has exactly one human gate. It sits between Phase 2 and Phase 3. Phase 1 closes with a confirmation prompt, but that prompt is cheap - the worst case is the user types "go" and the agent regenerates the discovery summary. The Phase 2 / Phase 3 boundary is different: once Phase 3 begins, files land in `.claude/skills/<slug>/` and the act is durable.

The reason the gate is here and not elsewhere:

- Phase 1 has nothing to gate. Discovery is read-only inspection.
- Phase 2 produces a deterministic proof point ("N props verified, 0 hallucinations"). The user reviews this proof point against their own knowledge of the DS, then approves or sends the agent back to iterate.
- Phase 3 writes to disk. Once it starts, there is no rollback inside the skill - the user rolls back with `git` if needed.

Single gate is a v0-inherited contract. It keeps the human in the loop where the cost of being wrong is high, and out of the loop where the cost of being wrong is cheap. Do not add a second gate "for safety"; redundant gates train the user to rubber-stamp them.

## Common agent failure modes

Notes for the next agent that runs this skill. Failure modes observed during dry-runs and design review:

- **Pre-loading references.** The agent reads `references/persist.md` during Phase 1 "to be safe". This inflates context, degrades rule-following downstream, and signals confusion about progressive disclosure. Load on gate, never before.
- **Extracting copy rules.** A button-label casing rule shows up in the source; the agent extracts it into `references/components/button.md` because the source says it. Wrong. Route it out via the discovery summary. The scope guardrail is load-bearing.
- **Skipping the slug-collision check.** The agent assumes the slug is fresh and writes. If a skill at that slug already exists, the user loses their previous work. The collision check is the FIRST step of Phase 3, not an afterthought.
- **Hand-picking components instead of auto-discovering.** The agent reads the docs nav, types 6 component names, and proceeds. Wrong. Scan exports, propose all, let the user prune. The "N found, M proposing" line is the contract; the audience will notice if it is missing.
- **Declaring success before `check-skill-docs.sh` exits 0.** The agent finishes scaffolding, prints the closing message, and the user discovers later that a routing-table row points at a missing file. Run the check first; only then close.
- **Silent `[VERIFY]` markers.** The agent leaves `[VERIFY]` markers in the files but does not surface them in the closing message. The markers exist to be resolved; surface every one, by file and line.
- **Treating docs as authoritative over types.** The agent reads the docs site, sees a prop called `loading`, extracts a rule. The types file does not export `loading`; the prop is `isLoading`. Joint-read, prefer code on conflict.
- **Inventing a prop because "every button has one".** The DS does not ship a `size="xs"` variant; the agent extracts a rule about it because most DSs do. If the types file does not export it, it does not exist.
- **Re-loading SKILL.md mid-extraction.** SKILL.md is the orchestrator; it does not change between phases. Re-loading it wastes context. Load references on gate; trust the SKILL.md you already have.
- **Skipping the pre-emit tick-list.** The agent generates the component files and goes straight to `scripts/scaffold.sh`. The pre-emit re-read is the cheapest place to catch phantom routing-table rows, missing sections, and uncited rules. Skip it and the post-emit script catches more failures, but later and louder.

## Inheritance summary (where the rules come from)

This skill inherits from four sources. The full ledger lives in `references/inheritance.md`; this is the SKILL.md summary for orientation.

- **v0 DS-onboarding flow** (`onboarding-instructions.ts`) - the three-phase contract, the single human gate, the discovery-summary budget rules, the adapter-not-docs mission sentence, the slug-collision ASK rule, the anti-fabrication Do/Don't list, the closing-message contract. Phrasings marked verbatim above are character-for-character from this source.
- **vercel/front product-copywriting skill** - the structural shape only: YAML frontmatter as dispatch contract, the "When to Load References" routing-table layout, the `**STOP.**` block grammar, per-domain reference-file granularity, Quick Triage layout, Agent Stance layout. None of the copywriting content is inherited; the scope guardrail explicitly routes copy out.
- **Geist `<BestPractices>` .mdx pattern** - per-component file with frontmatter, `When to use / Behavior / Content / Accessibility` subsection vocabulary, six rule shapes, `Bad | Good | Why` columnar anti-pattern grammar, cross-component rule duplication, universal-coverage rule.
- **Hallmark (Together AI)** - progressive-disclosure load map, pre-emit self-check discipline as reflexive audit. Stamp pattern dropped from v1 (logged in `references/coverage-gaps.md` as deferred).

## Out of scope for v1

To prevent feature creep mid-extraction, the following are explicitly out of scope. They live in `references/coverage-gaps.md` as deferred work.

- Audit verb (`audit-ds-skill` or similar). The reflexive audit IS the rubric in v1; a standalone audit verb is deferred until a re-extract verb needs it.
- Refresh verb (`refresh-ds-skill`). When the DS upgrades, re-run the extract verb against the new version. A purpose-built refresh that diffs old vs new is deferred.
- Stamp pattern (Hallmark-style machine-readable per-file claims). Git blame is provenance; `check-skill-docs.sh` does not need stamps as a falsifiability check.
- Visual probe in `validate.sh`. v1 ships deterministic typecheck + grep-resolves only. A visual probe (boot a preview, screenshot, diff) is deferred.
- Cross-skill composition beyond the routing-table third column. v1 ships single-skill workflows; sibling-skill orchestration is deferred.
- Tier-stratified progressive disclosure (Hallmark's 7-tier load map). v1 ships 1-tier (load-on-gate). Noted as MEDIUM-at-scale, LOW at workshop scope.

## Why this design (notes for future maintainers)

Six architectural choices were locked on 2026-05-31. Recording them here so the next maintainer does not relitigate them by accident.

- **Per-project persist target.** The skill writes to `.claude/skills/<slug>/` in the attendee's repo, not `~/.claude/skills/<slug>/` in their user directory. Per-project makes the skill committable, reviewable in PRs, and portable across machines. Per-user would have made the workshop demo non-reproducible across attendee laptops.
- **Deterministic validation (typecheck + grep-resolves), no visual probe.** Catches what the model cannot catch about its own output. The proof point is "N props verified, 0 hallucinations" - a number the user can audit at a glance. A visual probe would catch render bugs the typecheck misses, but at the cost of time, flakiness, and a runtime dependency. Deferred to coverage-gaps.md.
- **Skill files only (no runnable starter).** The hands-on deliverable is the skill files. A separate starter repo (built in Task #9) provides the runnable Next app the freshly extracted skill is exercised against. Splitting deliverables keeps the meta-skill's surface small and the demo's surface bounded.
- **Auto-discover + prune component scope.** The meta-skill scans the package's public exports and proposes the full set; the user prunes. Hand-picking would have been faster on stage but would have read as rehearsed theatre. The "Components found (38), proposing (4)" line is the workshop-credibility primitive.
- **Headline rules discovered independently.** The meta-skill does not hard-code "use `disabled` not `inactive`" for Primer. If dry-runs show the extraction misses the rule, the prompts in this file are tuned until it lands. Hard-coding is detectable; the audience can smell it.
- **No Hallmark stamp pattern.** The v0 onboarding flow does not stamp. The product-copywriting skill does not stamp (git blame is provenance). `check-skill-docs.sh` does not need stamps as a falsifiability check. Adding a stamp because Hallmark does would be cargo-cult. Deferred to `references/coverage-gaps.md` for a future re-extract verb that genuinely needs source provenance.

## Operating envelope (what good output looks like)

A successful run produces:

- A single skill directory at `.claude/skills/<slug>/` containing `SKILL.md`, `AGENTS.md`, `references/components/*.md`, `references/tokens.md`, `references/assets.md`, and optionally `references/patterns.md`.
- A SKILL.md for the produced skill (not this file) that frames the DS as canonical, names setup and import rules, lists routing rules pointing at `references/`, and ends with hard rules and final checks. Short, operational, authoritative.
- Every component file with all 8 sections (public imports / when to use / key props / accessibility / composition examples / source references / common mistakes / things to never invent), every rule cited to `file:line` or marked `[VERIFY]`.
- A `check-skill-docs.sh` exit code 0.
- A closing message that confirms the save path, offers 2-3 product-level example prompts, and lists every open `[VERIFY]` marker.

A failed run produces: a `check-skill-docs.sh` exit code non-zero, a list of failures verbatim from the script, and no example prompts. The skill on disk is partial; the user decides whether to fix in place or `git reset`. The agent does not auto-rollback.

The agent's job is to land in the successful-run state. The reflexive audit, the validation gate, the slug-collision ASK, and the post-emit consistency check are the four mechanisms that get it there. Trust the contract. Do not improvise around it.

