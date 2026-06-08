# Anti-patterns — three layers, one slug registry

Anti-patterns live in three places because three different trap classes fire in three different scopes. A component-local trap belongs next to that component's API contract. A cross-cutting token-discipline trap belongs in one columnar table that every component file links back to. A meta-skill extraction-discipline trap belongs in this file too — those rules govern how the meta-skill produces the skill, not how the produced skill is used. Duplication across layers is correctness, not noise — see `component-extraction.md` cross-component-rule-duplication.

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. When you encounter a copy/naming/casing rule during extraction (e.g. "Title Case the label", "placeholder is action-oriented"), recognize it, route it - mention it in the discovery summary as a candidate for a sibling copy skill - but do NOT extract it into this DS skill.

## Layer A — Component-local inline anti-patterns

The SHAPE lives here. Real instances live inside each component file at `references/components/<name>.md`, inside the file's `## Best Practices` section. This file documents the contract every component-local trap obeys; it does not store the traps themselves.

Format: a `- Never X, Y, or Z.` bullet, one trap per line, present-tense imperative, ends in a one-clause WHY. Cite the source `file:line` as a parenthetical or as a `[VERIFY]` marker when the cite cannot be resolved.

Example shape (illustrative — actual rules come from extraction):

```markdown
## Best Practices

- Never pass `aria-label` to a Button that already renders visible text — duplicate announcement.
- Never render a TextInput outside an InputWrapper — label association breaks, axe fails.
- Never use a non-interactive visual prop to communicate a loading state — non-interactive variants still announce as actionable to screen readers. Use `disabled={isLoading}` instead.
```

Rules of the shape:

- One trap per bullet. Compound traps split into separate bullets.
- Lead with `Never` (or `Do not`). Negative imperative is the contract; positive guidance lives elsewhere in the file.
- The clause after the em-dash is the WHY in plain language — one clause max, no full paragraphs.
- Inline code-fence the literal prop, value, or API token (v0 convention).
- Cite the source. If extraction cannot resolve a `file:line`, append ` [VERIFY]` instead of guessing.
- A component file with no traps still ships a `## Best Practices` section containing `No special rules — use the API as documented.` (Geist universal-coverage rule).

Length budget: a component file should not exceed roughly a dozen bullets in `## Best Practices`. Past that, the trap is probably either (a) a token-discipline rule that belongs in Layer B, or (b) two traps fused into one bullet that need to split.

Edge case — the inverted-positive trap: extraction sometimes surfaces a rule phrased as a positive recommendation ("Always wrap inputs in FormControl"). Rewrite it as a negative imperative before writing it ("Never render a TextInput outside a FormControl — label association breaks, axe fails."). The negative form is the contract because it names the failure mode; the positive form lets the agent rationalize a partial compliance.

Edge case — the threshold rule: a rule like "Buttons taller than 48px lose icon alignment" is a fuzzy threshold (Geist rule shape 5). Write it as `- Never set Button height above 48px — icon slot mis-aligns past the type-scale anchor.` and cite the exact source line for the 48px figure. If the threshold is not in source, mark the bullet `[VERIFY]` rather than invent it.

## Layer B — Cross-cutting Bad/Good/Why columnar table

Token-discipline violations that span components — hex literals vs token names, arbitrary spacing vs grid, ad-hoc font sizes vs scale, ad-hoc durations vs motion tokens, ad-hoc shadows vs elevation tokens — collapse into one table at the top of this file once the meta-skill is extracting against a real DS.

Column headers verbatim: `Bad | Good | Why`. Code-fence the Bad and Good cells (inline backticks). Prose Why is one clause, no more.

```markdown
| Bad | Good | Why |
|---|---|---|
| `color: #5C5CFF` | `color: var(--ds-color-accent)` | Hex literal bypasses theming; switches break in dark mode. |
| `padding: 13px` | `padding: var(--space-3)` | Off-grid spacing breaks vertical rhythm. |
| `font-size: 15px` | `font-size: var(--text-body-md)` | Ad-hoc size escapes the type scale. |
```

Table discipline:

- Bad cell shows the literal a generator would emit if the rule were not enforced.
- Good cell shows the named token the DS actually exposes. If the DS does not expose a named token for the axis, the row does not belong in the table — drop it rather than invent a token name.
- Why cell is one clause and names the failure mode (theming break, rhythm break, scale escape, motion mismatch, elevation mismatch).
- Rows are sorted by axis: color first, space second, type third, motion fourth, elevation/shadow last. Consistent order makes the table scannable across DS skills.
- No "examples" column, no "severity" column, no "owner" column. Three columns, end of contract. Width inflation is the table's first failure mode.

A populated table for an illustrative extraction (substitute the user's DS token names) would look like:

```markdown
| Bad | Good | Why |
|---|---|---|
| `color: #1F2328` | `color: var(--mantine-color-text)` | Hex literal bypasses theming; switches break in dark mode. |
| `background: #FFFFFF` | `background: var(--mantine-color-body)` | Hex literal bypasses theming; switches break in dark mode. |
| `padding: 13px` | `padding: var(--mantine-spacing-md)` | Off-grid spacing breaks vertical rhythm. |
| `margin: 7px` | `margin: var(--mantine-spacing-xs)` | Off-grid spacing breaks vertical rhythm. |
| `font-size: 15px` | `font-size: var(--mantine-font-size-md)` | Ad-hoc size escapes the type scale. |
```

Repeating the same WHY clause across rows in the same axis is correct — the failure mode is genuinely the same. Do not paraphrase for variety.

## Layer C — Meta-skill extraction discipline

Layer A and Layer B describe rules the *produced* skill ships — guidance for the agent that USES the skill. Layer C describes rules the *meta-skill itself* obeys while producing a skill. They live in this file because the audit surface is the same (slug registry, `check-skill-docs.sh` enforcement), but the failure mode is upstream: a Layer C violation is the meta-skill shipping a broken produced skill, not the produced skill mis-guiding the agent.

Format: a short prose rule with a slug header, a `Why:` line naming the failure mode, and a `How to enforce:` line naming the script and the gate. Slugs use the `wiring/` and `state/` namespaces (the only Layer C namespaces today; more will be added when more meta-skill rules surface).

### wiring/css-prose-summary

Companion CSS files lifted from the reference project must ship verbatim in `SKILL.md` Setup under a `### Companion CSS — <relative-path>` subheading per lifted file. Never summarize as prose (e.g. "imports the full token surface", "includes the size + typography + motion stack"). Never cross-ref to `references/foundations/<page>.md` for the "verbatim CSS" — foundation files document rules, not wiring.

**Why:** A downstream agent reading prose like "imports the full token surface" cannot reconstruct a 15-line `@import` block. The agent plausibly writes 6 lines; the missing 9 mean `var(--X)` tokens consumed by produced exemplars never resolve, and pages paint via the `var(--X, 12px)` literal fallbacks — visually plausible, factually drifting off the DS.

**How to enforce:** Two gates. Phase 2 hard gate — `scripts/check-token-coverage.sh <ds-pkg-root> .extract-ds-skill-scratch/` runs at the end of the Reference-project extraction step in `references/validate.md`; failure blocks the wait-for-approval gate. Phase 3 post-emit — `scripts/check-skill-docs.sh` check #11 `TOKEN_COVERAGE` re-runs the same logic against the persisted skill when invoked with `--ds-package-root <path>`; without the flag, the check NOOPs and passes (the gate is opt-in for produced-mode because the DS package root is not derivable from the produced skill alone).

### state/handoff-skipped

Each phase close MUST write `.extract-ds-skill-scratch/handoffs/phase-N.md` before its wait-gate (or before the closing message in Phase 3). The handoff doc captures ONLY irrecoverable state — user decisions surfaced in the discovery summary (Phase 1), proof-point + `[VERIFY]` tally + scratch artefact pointers (Phase 2), produced-skill path + audit tally + follow-up suggestions (Phase 3). Never duplicate content already in the meta-skill files (`SKILL.md`, `references/*.md`), in `AGENTS.md`, or in scratch artefacts on disk. The template for each phase's handoff lives in the per-phase reference doc (`references/discovery.md` for phase-1, `references/validate.md` for phase-2, `references/persist.md` for phase-3).

**Why:** Mid-extraction sessions are long. Phase 1 explores many sources; Phase 2 lifts CSS, mines tokens, fetches foundation docs, extracts component composition. By the Phase 2/3 gate, context-window blow-outs and accidental `/exit` are common. Without a handoff doc, the user's accepted decisions (slug, proposing set, `[VERIFY]` acceptances, headline rules) live ONLY in chat history — a fresh session re-enters Phase 1 from zero, wasting the explore-cost AND re-asking the user for confirmations they already gave. With the handoff, a new session reads the doc and resumes at the next phase boundary, skipping the recompute.

**How to enforce:** `scripts/check-skill-docs.sh` meta-mode runs a `HANDOFF_EMISSION` regex check that asserts SKILL.md contains a handoff-write reference for each phase (`phase-1.md`, `phase-2.md`, `phase-3.md`), and that `references/discovery.md`, `references/validate.md`, and `references/persist.md` each contain a `## Handoff document — phase-N.md template` section header. `scripts/tests/run-tests.sh` exercises the same check against fixtures (Tests 26-29). Skipping the handoff write in any phase trips the per-phase substring assertion and the closing message points back at this rule.

### state/inline-phase-transition

After writing `.extract-ds-skill-scratch/handoffs/phase-1.md` (resp. `phase-2.md`), the meta-skill MUST print the cutoff message and EXIT the session. Do NOT enter the next phase inline in the same session. The only allowed inline transition is the user's explicit "continue inline" override at the cutoff gate. Phase 3 is exempt (it is terminal — there is no next phase to transition into).

**Why:** The handoff doc exists to clear the context window between phases. A session that writes the handoff and then keeps running has spent disk bytes for zero context benefit: the chat is not dead, the user's decisions are still in scrollback, and Phase 2's heavier work (CSS lifting, WebFetch over foundation URLs, token grep-resolves) eats into context that should have been freed. The handoff helps only by accident — when the session does crash — and the named risk (context-window blow-out wasting Phase 1's explore-cost) is left unprotected during the most expensive phase. Skipping the handoff and writing-then-ignoring the handoff are siblings: both defeat the cutoff invariant.

**How to enforce:** Same `HANDOFF_EMISSION` check as `state/handoff-skipped`. Phase 1 and Phase 2 close sections in SKILL.md must contain the literal `EXIT` token AND the next-phase resume keyword (`validate:` for Phase 1 close, `persist:` for Phase 2 close). The cutoff-message substring assertions guard against a future edit silently restoring inline transition.

### state/handoff-missing-component-shape

The Phase 1 handoff MUST carry a `## Components proposed` section listing each component in the proposing set with the one-line description shown to the user in the discovery summary. The section is required whenever the proposing set is non-empty (the `## Decisions` block names the set; `## Components proposed` records its shape).

**Why:** The discovery summary shows the user a one-liner per proposed component, but a handoff that records component *names* only forces Phase 2 — running in a fresh session — to re-read each component from `node_modules/<package>` to recover shape. That duplicates Phase 1's inspection work and risks a divergent interpretation of the same component. Persisting the one-liners carries shape across the session boundary for free (the text already exists; it is re-emitted, not regenerated).

**How to enforce:** `scripts/check-skill-docs.sh` meta-mode runs a `HANDOFF_COMPLETENESS` check against two targets: the fenced template anchor in `references/discovery.md`, and any emitted handoff under `.extract-ds-skill-scratch/handoffs/` (scanned whole-file, skipped when absent). It hard-fails when a `## Decisions` heading is present but `## Components proposed` is absent. `scripts/tests/run-tests.sh` exercises the pass and fail branches against fixtures (`handoff-with-components`, `fail-handoff-missing-components`) plus a live-meta assert. The `## Known exclusions` companion section (emitted only when the proposing set is a strict subset, N − M > 0) is template discipline documented here, not a separate hard grep — its absence when N = M is correct, so it carries no gate.

### state/handoff-out-of-scope-deferred

When foundation docs are crawled in Phase 1, each sub-page that may fall outside the meta-skill's charter (tokens / assets / component descriptions / component APIs) MUST be fetched and classified `[in-scope]` or `[out-of-scope: sibling-<topic>-skill]` BEFORE the handoff is written. The handoff carries the verdict per sub-page. Hedged "route to a sibling skill in Phase 2 if confirmed" language is forbidden.

**Why:** Verification belongs in Phase 1, when the foundation docs are first crawled and the page is already fetched. Deferring the decision to Phase 2 with an "if confirmed" hedge means the resuming session inherits an open question instead of a decision — it must re-fetch the page to classify it, or worse, extract out-of-scope prose (tone, copy, localization) into the DS skill. A Phase-1 verdict makes the boundary auditable and keeps Phase 2 free of re-discovery.

**How to enforce:** Same `HANDOFF_COMPLETENESS` check. It hard-fails when the substring `if confirmed` appears in the fenced template anchor of `references/discovery.md` or in any emitted handoff under `.extract-ds-skill-scratch/handoffs/`. Prose outside the template fence may discuss the banned hedge (the rule must name what it forbids); only fenced template content is scanned in `discovery.md`. `scripts/tests/run-tests.sh` exercises the fail branch via the `fail-handoff-if-confirmed` fixture and the pass branch via `foundation-out-of-scope` (tagged sub-pages, no hedge) plus the live-meta assert.

### component/anti-substitution-dropped

Anti-substitution prose ("use X, not Y", "experimental Y reserved for...", "prefer X over Y") in source documentation must land in the produced skill as a Shape 7 warning under the IN-SCOPE component's reference file. The warning lands on the trap target (the in-scope component), not on the out-of-set peer the source names — readers reach for the trap target, so that is where the guardrail must fire.

**Why:** Anti-substitution sentences silently fall through Shapes 1-6 (none of the existing six rule shapes matches "use X, not Y" prose). The rule reads as a non-rule and is dropped during Phase 2 rule extraction, surfacing in the produced skill as a missing guardrail. Downstream agents then route to the out-of-set peer because nothing told them not to — the exact failure mode the source author tried to prevent.

**How to apply:** Phase 2 self-audit during component extraction. When source carries Shape 7 trigger vocabulary (the "Anti-substitution prose" heuristic in `references/component-extraction.md`) but no Shape 7 warning landed in the produced reference file, re-classify the prose per Shape 7 and append the warning before persist. No deterministic script gate — Layer C, warn-only.

### component/reexport-tier-invisible

Re-exports outside the proposing set (`ds/components/*.tsx` minus the user-confirmed proposing set) must materialize in the produced skill as a `## Other re-exports` section per `references/skill-template.md` + `references/persist.md`. The section ships even when it contains one entry — its absence reads as "every wrapper is in the proposing set," which is a different claim than "the wrappers exist but live under their upstream types."

**Why:** Phase 1's discovery handoff enumerates re-exports outside the proposing set under `## Re-exports outside proposing set` (per `references/discovery.md`), but no Phase 2 → Phase 3 step materializes the unannotated tier. Without the `## Other re-exports` section in the produced `components.md` (or `_other-reexports.md` in per-file mode), downstream agents asking for a wrapper not in the routing table find nothing — the wrapper is invisible to the skill even though it exists in the DS.

**How to apply:** Phase 3 self-audit during persist. When the Phase 1 handoff carries an `## Re-exports outside proposing set` section with one or more entries but the produced `components.md` (or `_other-reexports.md`) has no `## Other re-exports` section, materialize the section per `references/persist.md` Persist-map "Other re-exports" bullet before closing. No deterministic script gate — Layer C, warn-only. The closing-message tally surfaces the count (`M re-exports under Other re-exports`) so a zero-where-handoff-was-nonzero reads as a missed materialization.

## Rule slug namespaces

Every anti-pattern — Layer A, Layer B, or Layer C — registers a slug. Slugs are greppable identifiers cited in findings: when a rule fires during extraction or during a `check-skill-docs.sh` run, the slug links the violation back to the rule.

- `token/...` for token violations (Layer B) — examples: `token/hex-literal`, `token/ad-hoc-spacing`, `token/ad-hoc-font-size`, `token/ad-hoc-duration`, `token/ad-hoc-shadow`.
- `component/...` for component-level rules (mostly Layer A) — examples: `component/button-inactive-vs-disabled`, `component/textinput-requires-formcontrol`, `component/button-no-aria-label-with-text`. Layer C `component/...` slugs also exist for meta-skill extraction-completeness discipline that fires per-component (e.g. `component/anti-substitution-dropped`, `component/reexport-tier-invisible`) — the Layer is named in each slug's subsection body, not in the namespace.
- `asset/...` for asset violations (Layer A or Layer B depending on cite) — examples: `asset/raw-svg-instead-of-icon`, `asset/inlined-logo-instead-of-package-import`.
- `wiring/...` for meta-skill wiring-discipline rules (Layer C) — examples: `wiring/css-prose-summary`. Fire against the meta-skill's own output during extraction, not against produced-skill usage.
- `state/...` for meta-skill session-state-discipline rules (Layer C) — examples: `state/handoff-skipped`, `state/inline-phase-transition`, `state/handoff-missing-component-shape`, `state/handoff-out-of-scope-deferred`. Fire against the meta-skill's own session management (handoff emission, phase cutoffs, resume parameters, handoff-template completeness), not against produced-skill content. Distinct from `wiring/` because the failure mode is upstream of any produced artefact — a `state/` violation means the meta-skill loses session continuity, not that it ships bad content.

Slug grammar:

- Lowercase, hyphen-separated.
- Namespace prefix (`token/`, `component/`, `asset/`, `wiring/`, `state/`) is mandatory. Unprefixed slugs are rejected by `check-skill-docs.sh`.
- One slug per concept. If the same trap fires in two component files, the slug is identical in both — the slug names the rule, not its location.
- Slugs are stable. Renaming a slug breaks every finding that cites it, so renames go through `coverage-gaps.md` first.
- Slugs are unique across the skill. Slug collisions are surfaced by `check-skill-docs.sh` and ASK the user to rename one (same convention as the persist-time slug-collision rule).

Citing slugs: a finding writes `component/button-inactive-vs-disabled fired at button.tsx:142` — the slug resolves to its definition, the location resolves to the source, the audit trail is one grep away.

## Builder rule (how the meta-skill BUILDS this file)

The meta-skill routes extracted rules into Layer A or Layer B (or both) using these rules:

- Any extracted rule referencing a literal value vs a named token → Layer B row. Example: a `Bad: color: #fff` / `Good: color: var(--surface)` rule belongs in the table, not inside a component file.
- Any component-local "never X" → Layer A inline inside the component file. Example: `Never pass aria-label to a Button that already renders visible text` belongs in `references/components/button.md`, not in the table.
- Rules can appear in BOTH places when the trap fires at the component level AND as a token-discipline issue. Example: a rule saying `Never set Button's background to a hex literal — use --ds-color-button-bg` is a `component/button-no-hex-bg` Layer A bullet inside `button.md` AND a `token/hex-literal` Layer B row in this file. Duplication is correctness — see `component-extraction.md` cross-component-rule-duplication.
- Naming/copy/casing rules (Geist Shape 3) are recognized for routing and surfaced in the discovery summary as candidates for a sibling copy skill. They are NOT written into Layer A or Layer B. The discovery summary line reads `Copy/naming rules detected (N) — routed to candidate sibling copy skill, not extracted here.`
- Rules with no source citation are written with a `[VERIFY]` marker rather than dropped. `check-skill-docs.sh` counts the markers and surfaces the count in the closing message; the user decides whether to verify or strip.

## Pre-seeded Layer B template rows

The meta-skill scaffolds these three default rows for ANY DS during Phase 3, then fills in the DS-specific token names discovered during Phase 1:

- `token/hex-literal` (color) — Bad: `color: #<hex>`, Good: `color: var(--<color-token>)`, Why: hex literal bypasses theming; switches break in dark mode.
- `token/ad-hoc-spacing` (space) — Bad: `padding: <px>`, Good: `padding: var(--<space-token>)`, Why: off-grid spacing breaks vertical rhythm.
- `token/ad-hoc-font-size` (type) — Bad: `font-size: <px>`, Good: `font-size: var(--<type-token>)`, Why: ad-hoc size escapes the type scale.

If the user's DS exposes motion tokens (detected during Phase 1 token scan), the meta-skill adds:

- `token/ad-hoc-duration` (motion) — Bad: `transition: <ms>`, Good: `transition: var(--<duration-token>)`, Why: ad-hoc duration breaks motion coherence.

If a token axis is absent from the DS (e.g. no motion tokens, no elevation tokens), the corresponding row is omitted — the rule does not belong in the table if the Good cell cannot resolve to a real token. Inventing a token name to fill a row is a fabrication; drop the row instead.

## Audit hooks

The two layers and the slug registry exist to be checked, not just read. `scripts/check-skill-docs.sh` runs three passes against this file and its citations:

- Every Layer B row's Good cell parses as `var(--<name>)` and the `<name>` resolves against `references/tokens.md`. Unresolved token names fail the check.
- Every slug cited in a component file's `## Best Practices` section resolves either to a Layer B row (when prefixed `token/`) or to a documented slug in this file's namespace list. Unresolved slugs fail the check.
- Every `[VERIFY]` marker in the file is counted and surfaced in the post-emit closing message, so the user sees the verification debt before persisting.

The audit does not pass judgment on whether a rule is correct — it only verifies that the rule's plumbing (slug, citation, token resolution) holds together. Correctness is the user's call at the Phase 2 → Phase 3 gate.
