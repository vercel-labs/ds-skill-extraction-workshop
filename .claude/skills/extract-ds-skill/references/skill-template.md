# skill-template.md

Contract for the `SKILL.md` (and surrounding reference files) that `extract-ds-skill` WRITES into the user's repo at `.claude/skills/<slug>/`. The meta-skill itself is the producer; this file is the spec for the produced artifact.

Scope reminder — applies to everything below: In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. When you encounter a copy/naming/casing rule during extraction (e.g. "Title Case the label", "placeholder is action-oriented"), recognize it, route it - mention it in the discovery summary as a candidate for a sibling copy skill - but do NOT extract it into this DS skill.

## YAML frontmatter shape

Two required fields: `name` and `description`. No `peek`, no `tags`, no `version` — keep the frontmatter minimal so the dispatcher can parse it without YAML edge cases.

- `name` — trigger-rich, kebab-case slug. Matches the directory name. Example: `mantine`, `geist`, `acme-ui`. No spaces, no scope prefix, no version suffix.
- `description` — one sentence that contains, in order: (1) the DS name, (2) the component types the skill covers, (3) trigger keywords a user would actually type, (4) a scope guardrail, (5) the verbatim closing line `IMPORTANT: this file is an orchestrator. Load the references/ files named in the routing table; SKILL.md alone is insufficient.`

Worked example — frontmatter for a Mantine-shaped extraction (illustrative; substitute the DS in scope):

```yaml
---
name: mantine
description: Build accessible UI with the Mantine React design system (TextInput, Button, Checkbox, InputWrapper). Use when the user asks for a Mantine-styled page, a Mantine form, or wraps inputs in InputWrapper. Triggers: 'mantine', 'mantine ui', 'mantine form'. Scope: components, tokens, assets. Out of scope: tone of voice and marketing copy — route copy rules to a sibling skill. IMPORTANT: this file is an orchestrator. Load the references/ files named in the routing table; SKILL.md alone is insufficient.
---
```

The `description` is the dispatch contract. If a trigger keyword the user actually types is missing, the skill will not load. Lift trigger keywords from the DS's own naming (package name, docs site URL slug, common shorthand) — do not invent.

## SKILL.md required sections (for the user's DS skill)

Emit these sections in this order. Detail goes into `references/`, not into SKILL.md. SKILL.md is the router.

- **Mission** — one paragraph, adapter-not-docs framing adapted to the DS by name. Template: "A `<ds-name>` skill is an adapter that teaches an agent how to build high-fidelity apps with `<ds-name>`. It is not a copy of the documentation. It tells the agent what to read, what APIs are public, what sources are authoritative, and how to verify that generated UI uses the system correctly."
- **Setup** — install command + provider wiring. Copy wiring verbatim from a real consumer app; if none exists, lift from setup docs. Do not reconstruct from memory. Include the `import` line for the provider/theme component and the JSX wrap-the-tree example. Cite source as `repo-relative-path:line`.

  **Companion CSS subheadings.** For every CSS file the reference-project extraction surfaced under `## Companion CSS file (verbatim) — <path>` in `.extract-ds-skill-scratch/wiring-extracted.md` (see `references/reference-project.md`, Extraction recipe step 5), emit a `### Companion CSS — <relative-path-from-consumer-app-root>` subheading immediately after the root-entry-file code block, in the same order they appear in scratch. Each subheading carries a verbatim fenced CSS block — full file contents, no truncation, no paraphrase. The agent that uses this skill must be able to copy-paste the block into the corresponding file in their own consumer app and have the wiring work.

  **Prose-summary fallback is banned.** Do NOT write "imports the full token surface", "includes the size + typography + motion stack", or any other paraphrase in place of the actual `@import` lines. Do NOT cross-ref to `references/foundations/<page>.md` for "the verbatim CSS" — foundation files document rules, not wiring; the verbatim CSS belongs in this Setup section. The rule is registered as `wiring/css-prose-summary` in `references/anti-patterns.md` Layer C and enforced by `scripts/check-token-coverage.sh` (Phase 2 hard gate) plus `scripts/check-skill-docs.sh` check #11 `TOKEN_COVERAGE` (Phase 3 post-emit).

  **Foundation-docs wiring fallback.** When the run includes a `[docs:foundation]` source but no `[example:project]` reference project, the foundation page's own setup snippet is the wiring source — lift it verbatim (HTML attribute on `<html>`, CSS `@import`, a global CSS rule on `:root` / `html, body`, a `ThemeProvider` prop the docs declare required) and append it to the Setup section under a `### Foundation wiring` subheading. Each step gets a verbatim code fence and the citation `(<docs-url>#<section-anchor>)`. If the foundation page carries no setup snippet, omit the subheading entirely — do not write an empty `### Foundation wiring` block. When BOTH a reference project AND a foundation URL are in scope, the order in the Setup section is: install command → root-entry-file code block → `### Companion CSS — <path>` subheadings (one per lifted file, in scratch order) → `### Foundation wiring` subheading. Companion CSS always precedes Foundation wiring; the reference project is the higher-fidelity source. Note: Foundation wiring is fallback wiring; wiring is NOT a prose rule shape and is not extracted via `references/foundation-extraction.md`.

  Worked example of the injected subsection (illustrative — substitute the DS-specific mode attribute and token names from the user's DS):

  ```markdown
  ### Foundation wiring

  Dark-theme surface contract — required when the DS's color-scheme attribute is set on `<html>` (e.g. `data-mantine-color-scheme="dark"` for Mantine, `data-theme="dark"` for shadcn, `class="dark"` for MUI mode-boot):

  ```css
  :root { color-scheme: dark; }
  html, body {
    background-color: var(--ds-surface-default);
    color: var(--ds-text-default);
  }
  ```

  Without these, the browser default surface (white) renders underneath the dark-theme tokens. Source: `<docs-url>#dark-mode`
  ```
- **Import rules** — barrel vs deep, public vs internal. State the canonical import path (`<ds-package>`, not `<ds-package>/lib-esm/Button` or any other internal subpath). List any deep imports that ARE public (rare). Mark every other deep path as forbidden.
- **Source-of-truth rules** — which docs/repo paths are canonical. Code wins on conflict with docs. List the repo path (e.g. `packages/react/src/`), the docs URL, the Storybook URL if public. Mark private/inaccessible sources explicitly.
- **Routing table** — 3-column dispatch: `Trigger | Files to load | Notes`. Every row resolves to a real file under `references/`. Triggers are user-intent phrases ("user asks for a button", "user wires a form"), not file names.

  **Design-craft row (fixed).** Every produced skill carries one verbatim row pointing at the shipped design-craft reference:

  - `| user composes a screen, page, or section layout | references/design-craft.md | DS-agnostic design-craft defaults, shipped verbatim by the meta-skill — the DS wins on conflict |`

  Omit the row only when the user opted out of the craft file in Phase 1 (see `references/persist.md`, Design-craft materialization). Enforced post-emit by `scripts/check-skill-docs.sh` check `DESIGN_CRAFT`.

  **Composition exemplar rows.** When the reference-project extraction surfaced composition exemplars (see `references/reference-project.md`, Composition exemplar extraction section), the routing table carries one row per exemplar file plus an index row. Replace any single `**Validated examples:** references/examples/` row with:

  - `| user reviews available composition exemplars | references/examples/index.md | one entry per composition exemplar lifted from the reference project |`
  - One row per exemplar, of the shape: `| <basename>: <one-line summary> | references/examples/<basename>.md | composition exemplar lifted from <reference-project>/<relative-path> |`

  The per-exemplar summary is the same one-line phrase the scaffolder writes into `references/examples/index.md`, derived from the first bullet of the exemplar's "What to copy" section. When the reference project ships zero exemplars (or no reference project was passed), omit BOTH the index row and the per-exemplar rows — empty `references/examples/` is the correct empty state, not a row pointing at an empty directory.

  Worked example — routing table fragment for a produced skill whose reference project shipped 4 exemplars (illustrative; substitute the user's `<reference-project>` and the basenames the scaffolder actually produced):

  ```markdown
  ## When to Load References

  | Trigger | Files to load | Notes |
  |---|---|---|
  | user asks for a button | references/components/button.md | per-component file |
  | user wires a form | references/components/form-control.md | a11y composition rules |
  | user composes a screen, page, or section layout | references/design-craft.md | DS-agnostic design-craft defaults, shipped verbatim by the meta-skill — the DS wins on conflict |
  | user reviews available composition exemplars | references/examples/index.md | one entry per composition exemplar lifted from the reference project |
  | home: <one-line summary> | references/examples/home.md | composition exemplar lifted from <reference-project>/app/page.tsx |
  | <route-a>: <one-line summary> | references/examples/<route-a>.md | composition exemplar lifted from <reference-project>/app/<route-a>/page.tsx |
  | <route-b>: <one-line summary> | references/examples/<route-b>.md | composition exemplar lifted from <reference-project>/app/<route-b>/page.tsx |
  | <showcase-name>: <one-line summary> | references/examples/<showcase-name>.md | composition exemplar lifted from <reference-project>/components/showcase/<showcase-name>.tsx |
  | user asks for a component not in the routing table above | references/components.md `## Other re-exports` (single-file) OR references/components/_other-reexports.md (per-file) | thin wrappers — props live in the upstream types file named under each entry |
  ```

  A reference project that ships zero exemplars omits all five exemplar rows; the routing table carries only the per-component rows.
- **Component slate** — the machine-readable declaration of the confirmed extraction slate: one bullet per component the user approved at the Phase 1 gate, names copied verbatim from the phase-1 handoff's `## Components proposed` section. Shape:

  ```markdown
  ## Component slate

  - `<ComponentName>` — <one-line description from the discovery summary>
  ```

  Every name listed here must resolve to its own contract section — `references/components/<kebab-name>.md` in per-file mode, or a `## <ComponentName>` section in `references/components.md` in single-file mode — per the full-coverage rule in `references/component-extraction.md`. The `## Other re-exports` tier never satisfies the rule; that tier is reserved for wrappers OUTSIDE the slate. `scripts/check-skill-docs.sh` (produced mode, `SLATE_COVERAGE`) cross-checks the declaration against the emitted contract sections. Do not omit this section: without the declaration, the post-emit check cannot tell a pruned slate from a dropped contract.
- **Other re-exports** — when the source DS wraps and re-exports more components than the proposing set, list the unannotated wrappers under this section in `references/components.md` (single-file mode) or in `references/components/_other-reexports.md` (per-file mode, ≥10 proposing components). One line per re-export:
  - `<ComponentName>` — `import { <ComponentName> } from '<barrel-path>'`. Props: see `<upstream-types-path>/<ComponentName>.d.ts`.

  This section tells the agent that the wrapper exists in the consumer surface and points at the upstream types as the prop source-of-truth. Do NOT extract per-prop entries — these components carry no DS-author-elevated rules; the upstream types are sufficient. Do NOT extract `### Best Practices`, `### Composition examples`, or any other per-component subsection — the absence of a `.docs.tsx`-style annotation IS the signal that no DS-elevated rules exist.

  If the source DS has zero re-exports outside the proposing set, omit the section entirely. Do NOT write an empty `## Other re-exports` heading — empty sections are a worse failure mode than absence (they imply enumeration was attempted and produced nothing, which is not true).
- **Hard rules** — do-not-invent list + `[VERIFY]` convention + **shell invariants promoted from Phase 2 shell-invariant extraction** (per `references/validate.md` Shell-invariant extraction step). At minimum, when the DS surfaces a body-paint contract: an explicit rule paraphrasing "The body/root MUST paint with the DS's surface token. A token-painted component on an unpainted shell is the canonical mode-mismatch bug." When the DS surfaces a mode attribute on `<html>`: an explicit rule pairing the attribute with the required theme imports. When the DS surfaces a provider: an explicit rule that the provider wraps children, not renders as a sibling. When the lifted wiring sets a fixed viewport height on the shell wrapper: an explicit rule that consumer apps use `minHeight`, not fixed `height`, for viewport-fill — see `shell/fixed-viewport-height`. State plainly: any prop, variant, token, or asset the agent cannot ground in source gets a literal `[VERIFY]` marker inline. Mark unverifiable facts `[VERIFY]`. Report blockers instead of guessing.

  Worked example of the produced `## Hard rules` section (illustrative — substitute the DS-specific surface token name, mode attribute name, and provider name from Phase 1 discovery; omit any rule whose underlying construct is not surfaced by the DS per the omission rule in `references/anti-patterns.md`):

  ```markdown
  ## Hard rules

  - The body/root MUST paint with `var(--<surface-default>)` via either the `<BaseSurface style={{ backgroundColor: "var(--<surface-default>)" }}>` style prop OR `body { background-color: var(--<surface-default>); color: var(--<text-default>); }` in `globals.css`. A token-painted component on an unpainted shell is the canonical mode-mismatch bug — see `references/anti-patterns.md` `shell/unpainted-body`.
  - `<html data-*-color-scheme="<mode>">` MUST be paired with the matching theme CSS import (`@import "<ds-themes>/<mode>.css";`). The attribute sets the resolution context; the import provides the values — see `shell/mode-attribute-no-theme-import`.
  - `<Provider>` MUST wrap children, not render as a sibling: `<Provider><BaseSurface>{children}</BaseSurface></Provider>`. Provider context only reaches descendants — see `shell/provider-missing-content-wrap`.
  - The shell wrapper in Setup uses `height: "100vh"` verbatim from the reference project; in YOUR app use `minHeight` — fixed height clips content taller than the viewport. See `shell/fixed-viewport-height`.
  - Any prop, variant, token, or asset the agent cannot ground in source gets a literal `[VERIFY]` marker inline.
  - Report blockers instead of guessing.
  ```

  Shell-invariant rules promoted here mirror the constructs lifted into Setup, not constructs the meta-skill imagines the DS might have. A DS that ships only CSS imports (no provider) drops the provider rule; a DS that auto-detects OS color preferences (no mode attribute) drops the mode-attribute rule; a DS that ships its own root surface component (no body-paint contract for the consumer to wire) drops the body-paint rule. Inventing a rule to fill a slot is a fabrication; omit the rule when the construct is absent.
- **Final checks** — closing summary the agent emits after generating UI: cite each component used to its source file, list any `[VERIFY]` markers it had to leave, name the screen-level prompt it just built, AND confirm shell parity: the page/root surface paints with a surface token; the mode attribute (when present) matches the imported theme CSS files; the provider (when present) wraps children, not siblings. Shell parity is checked after ANY edit to the consumer app's root layout / providers / globals.css, not only on greenfield app creation — an agent editing an existing layout that already looks "wired" must re-confirm the shell invariants from the produced skill's `## Hard rules`, not from its memory of how the file looked before the edit.

## Per-component reference file contract

Verbatim from v0's onboarding-instructions.ts L111-113:

"Each file: public imports, when to use, key props and variants, accessibility, composition examples, source references, common mistakes, things to never invent."

The 8-section checklist — the agent ticks each one during the reflexive-audit pre-emit re-read:

1. **Public imports** — the `import` line(s) the consumer writes. Barrel form preferred.
2. **When to use** — one or two sentences. Includes the negative case ("not for X — use `<other>`").
3. **Key props and variants** — the props the agent will actually reach for. Cite each to source `file:line`. Skip exhaustive prop dumps; the type definitions are the exhaustive list. Cite format: the first mention in a file uses the full `node_modules/<pkg>/...:line` form; later cites in the same file may drop to the short `dist/...:line` form. Upstream-repo cites use the `<owner>/<repo>@<ref>:<path>` form — never a bare `packages/...` or `src/...` path, which `scripts/verify-citations.sh` cannot resolve and must skip (the skipped class must not grow).
4. **Accessibility** — required ARIA, label associations, keyboard behavior. Cite to source or to the docs a11y section.
5. **Composition examples** — code blocks that compile. Imports included. Each example doubles as a pattern (see collapse rule below).
6. **Source references** — repo-relative paths to the component implementation, its tests, its docs.
7. **Common mistakes** — `Bad | Good | Why` rows. Lift from real Storybook anti-patterns or test fixtures when possible.
8. **Things to never invent** — props, variants, slots, or asset names the agent might hallucinate. Negative imperatives.

Every component file ships all 8 sections. If a section is genuinely empty (e.g. a primitive with no a11y obligations), write "No special rules — use the API as documented." Do not omit the heading.

## Per-token reference file contract

Token name + value + family (color / space / type / motion) + use-when prose + a `Bad | Good | Why` row.

- Group tokens by family when more than one family is present: `references/tokens/colors.md`, `references/tokens/space.md`, etc.
- Single file `references/tokens.md` if only one family is present in the DS.
- Token value is the resolved primitive value at the documented breakpoint (e.g. `#0969da`, `8px`, `400 14px/20px`). Cite to the token source file.
- `use-when` is one sentence: "for primary interactive surfaces", "for stacking same-direction siblings". Not a paraphrase of the token name.
- The `Bad | Good | Why` row is mandatory when the token has a near-neighbor it gets confused with (e.g. `accent.fg` vs `accent.emphasis`). Skip only when no near-neighbor exists.

### Foundation-derived rule subsections in `references/tokens.md`

Rules extracted from a `[docs:foundation]` URL land as `### token/<slug>` subsections inside the family file they belong to (`tokens.md` for single-family DSes; `tokens/colors.md` for multi-family DSes with a color-usage foundation). They live alongside the per-token entries above, not in a separate file. The slug pattern is `token/<noun>-<rule>` — e.g. `token/screen-surface-dark-theme`, `token/emphasis-foreground-pairing`, `token/border-contrast-minimum`.

Each subsection follows the per-rule skeleton documented in `references/foundation-extraction.md` (heading + one-sentence rule + `When it bites:` line + `Bad | Good | Why` row + source citation). The skeleton is the contract enforced by `scripts/check-skill-docs.sh` SLUG_RESOLUTION check — every `token/*` slug grepped from the SKILL.md routing table or any reference file must have a matching `### token/<slug>` heading somewhere in the tokens family.

#### Worked example — single foundation-rule subsection against a public-DS-shaped target (illustrative)

The block below uses a public-DS-shaped target to ground the skeleton. The skill makes no assumption that the user's DS is the one in the example; the same subsection contract applies to whichever DS the user passes.

```markdown
### token/screen-surface-dark-theme

When the app sets `data-mantine-color-scheme="dark"` on `<html>`, the root surface and default text colors must be wired through the DS's semantic tokens — otherwise the browser default white surface sits underneath the dark theme and the page renders dark text on a white page.

**When it bites:** any page that imports `@mantine/core/styles.css` and sets the dark scheme without also setting `color-scheme` and the body surface — the page renders dark text on white because of exactly this gap.

**Wiring:**
```css
:root { color-scheme: dark; }
html, body {
  background-color: var(--mantine-color-body);
  color: var(--mantine-color-text);
}
```

| Bad | Good | Why |
|---|---|---|
| `@import "tailwindcss";` alone in `globals.css` | `@import "tailwindcss";` + the wiring block above | Tailwind reset paints the browser default surface white; semantic DS tokens never reach the root |

Source: https://mantine.dev/styles/colors/#dark-mode
```

## Pattern-example collapse rule

Verbatim from v0's onboarding-instructions.ts L116:

"Treat pattern guidance and example code as one thing: the annotated example IS the pattern."

Implication: do not write a prose paragraph that describes a pattern, then a separate code block that demonstrates it. Write the code block, annotate it inline with comments, and let that be the entire pattern entry. If the prose adds nothing the annotated code does not already say, delete the prose.

## patterns.md escape hatch

Single file `references/patterns.md`, only created if the DS has cross-cutting screen-level guidance — e.g. "settings page composition", "form submission flow", "empty-state recipe". Never used for single-component rules.

If you reach for `patterns.md` to capture a per-component rule, you are misusing it — put the rule in the component file. The test: if removing one named component from the rule would leave the rule incoherent, it is a component rule, not a pattern.

## Best Practices section shape

Plain Markdown, NOT Geist's JSX `<BestPractices>` wrapper. Heading: `## Best Practices`. Goes into the per-component file, after the composition examples and before the common-mistakes table.

Two shapes — pick by counting rules and axes:

- **Flat bulleted list** — when the component has fewer than 10 rules AND fewer than 3 distinct axes of concern. One bullet per rule. Each rule is a single imperative sentence. Cite source `file:line` at the end of the bullet (cite format per the Key-props bullet above: full `node_modules/...` form on first mention, `owner/repo@ref:path` for upstream cites).
- **Subsectioned** — when the component has 10 or more rules OR 3 or more axes. Use the Geist vocabulary verbatim, in this order:

  ```markdown
  ## Best Practices

  ### When to use
  - rule
  - rule

  ### Behavior
  - rule
  - rule

  ### Content
  - rule (likely [OUT OF SCOPE - route to copy skill])
  - rule

  ### Accessibility
  - rule
  - rule
  ```

Headings are verbatim: `When to use` / `Behavior` / `Content` / `Accessibility`. Order is verbatim. If a section is empty, omit it — do not write `### Behavior\n\n- none`.

The `### Content` subsection is the most common site for out-of-scope rules. When extracting, surface `Content` rules in the discovery summary as candidates for a sibling copy skill; do not extract them into the DS skill.
