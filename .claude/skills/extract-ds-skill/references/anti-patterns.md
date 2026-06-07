# Anti-patterns — two layers, one slug registry

Anti-patterns live in two places because two different traps fire in two different scopes. A component-local trap belongs next to that component's API contract. A cross-cutting token-discipline trap belongs in one columnar table that every component file links back to. Duplication across layers is correctness, not noise — see `component-extraction.md` cross-component-rule-duplication.

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

## Rule slug namespaces

Every anti-pattern — Layer A or Layer B — registers a slug. Slugs are greppable identifiers cited in findings: when a rule fires during extraction or during a `check-skill-docs.sh` run, the slug links the violation back to the rule.

- `token/...` for token violations — examples: `token/hex-literal`, `token/ad-hoc-spacing`, `token/ad-hoc-font-size`, `token/ad-hoc-duration`, `token/ad-hoc-shadow`.
- `component/...` for component-level rules — examples: `component/button-inactive-vs-disabled`, `component/textinput-requires-formcontrol`, `component/button-no-aria-label-with-text`.
- `asset/...` for asset violations — examples: `asset/raw-svg-instead-of-icon`, `asset/inlined-logo-instead-of-package-import`.

Slug grammar:

- Lowercase, hyphen-separated.
- Namespace prefix (`token/`, `component/`, `asset/`) is mandatory. Unprefixed slugs are rejected by `check-skill-docs.sh`.
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
