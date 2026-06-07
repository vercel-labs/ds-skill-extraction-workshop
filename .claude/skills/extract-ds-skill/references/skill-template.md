# skill-template.md

Contract for the `SKILL.md` (and surrounding reference files) that `extract-ds-skill` WRITES into the user's repo at `.claude/skills/<slug>/`. The meta-skill itself is the producer; this file is the spec for the produced artifact.

Scope reminder — applies to everything below: In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. When you encounter a copy/naming/casing rule during extraction (e.g. "Title Case the label", "placeholder is action-oriented"), recognize it, route it - mention it in the discovery summary as a candidate for a sibling copy skill - but do NOT extract it into this DS skill.

## YAML frontmatter shape

Two required fields: `name` and `description`. No `peek`, no `tags`, no `version` — keep the frontmatter minimal so the dispatcher can parse it without YAML edge cases.

- `name` — trigger-rich, kebab-case slug. Matches the directory name. Example: `primer-react`, `geist`, `acme-ui`. No spaces, no scope prefix, no version suffix.
- `description` — one sentence that contains, in order: (1) the DS name, (2) the component types the skill covers, (3) trigger keywords a user would actually type, (4) a scope guardrail, (5) the verbatim closing line `IMPORTANT: this file is an orchestrator. Load the references/ files named in the routing table; SKILL.md alone is insufficient.`

Worked example — Primer React extraction:

```yaml
---
name: primer-react
description: Build accessible UI with GitHub's Primer React design system (TextInput, Button, Checkbox, FormControl). Use when the user asks for a Primer-styled page, a GitHub-styled form, or wraps inputs in FormControl. Triggers: 'primer', 'primer-react', 'github ui', 'octicons form'. Scope: components, tokens, assets. Out of scope: tone of voice and marketing copy — route copy rules to a sibling skill. IMPORTANT: this file is an orchestrator. Load the references/ files named in the routing table; SKILL.md alone is insufficient.
---
```

The `description` is the dispatch contract. If a trigger keyword the user actually types is missing, the skill will not load. Lift trigger keywords from the DS's own naming (package name, docs site URL slug, common shorthand) — do not invent.

## SKILL.md required sections (for the user's DS skill)

Emit these sections in this order. Detail goes into `references/`, not into SKILL.md. SKILL.md is the router.

- **Mission** — one paragraph, adapter-not-docs framing adapted to the DS by name. Template: "A `<ds-name>` skill is an adapter that teaches an agent how to build high-fidelity apps with `<ds-name>`. It is not a copy of the documentation. It tells the agent what to read, what APIs are public, what sources are authoritative, and how to verify that generated UI uses the system correctly."
- **Setup** — install command + provider wiring. Copy wiring verbatim from a real consumer app; if none exists, lift from setup docs. Do not reconstruct from memory. Include the `import` line for the provider/theme component and the JSX wrap-the-tree example. Cite source as `repo-relative-path:line`.

  **Foundation-docs wiring injection.** When the run includes a `[docs:foundation]` source and the foundation extraction surfaced any Shape 5 (wiring-contract) rules — e.g. an HTML attribute on `<html>`, a CSS `@import`, a global CSS rule on `:root` / `html, body`, a `ThemeProvider` prop the docs declare required — append those wiring steps to the Setup section immediately after the consumer-app wiring, under a `### Foundation wiring` subheading. Each step gets a verbatim code fence lifted from the foundation page, plus the citation `(<url>#<section-anchor>)`. If no Shape 5 rules were extracted, omit the subheading entirely — do not write an empty `### Foundation wiring` block.

  Worked example of the injected subsection (the screen-surface dark-mode wiring the post-mortem hand-fixed):

  ```markdown
  ### Foundation wiring

  Dark-theme surface contract — required when `data-color-mode="dark"` is set on `<html>`:

  ```css
  :root { color-scheme: dark; }
  html, body {
    background-color: var(--bgColor-default);
    color: var(--fgColor-default);
  }
  ```

  Without these, the browser default surface (white) renders underneath the dark-theme tokens. Source: `<docs-url>#dark-mode`
  ```
- **Import rules** — barrel vs deep, public vs internal. State the canonical import path (`<ds-package>`, not `<ds-package>/lib-esm/Button` or any other internal subpath). List any deep imports that ARE public (rare). Mark every other deep path as forbidden.
- **Source-of-truth rules** — which docs/repo paths are canonical. Code wins on conflict with docs. List the repo path (e.g. `packages/react/src/`), the docs URL, the Storybook URL if public. Mark private/inaccessible sources explicitly.
- **Routing table** — 3-column dispatch: `Trigger | Files to load | Notes`. Every row resolves to a real file under `references/`. Triggers are user-intent phrases ("user asks for a button", "user wires a form"), not file names.
- **Hard rules** — do-not-invent list + `[VERIFY]` convention. State plainly: any prop, variant, token, or asset the agent cannot ground in source gets a literal `[VERIFY]` marker inline. Mark unverifiable facts `[VERIFY]`. Report blockers instead of guessing.
- **Final checks** — closing summary the agent emits after generating UI: cite each component used to its source file, list any `[VERIFY]` markers it had to leave, name the screen-level prompt it just built.

## Per-component reference file contract

Verbatim from v0's onboarding-instructions.ts L111-113:

"Each file: public imports, when to use, key props and variants, accessibility, composition examples, source references, common mistakes, things to never invent."

The 8-section checklist — the agent ticks each one during the reflexive-audit pre-emit re-read:

1. **Public imports** — the `import` line(s) the consumer writes. Barrel form preferred.
2. **When to use** — one or two sentences. Includes the negative case ("not for X — use `<other>`").
3. **Key props and variants** — the props the agent will actually reach for. Cite each to source `file:line`. Skip exhaustive prop dumps; the type definitions are the exhaustive list.
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

Each subsection follows the per-rule skeleton documented in `references/foundation-extraction.md` (heading + one-sentence rule + `When it bites:` line + optional wiring fence for Shape 5 + `Bad | Good | Why` row + source citation). The skeleton is the contract enforced by `scripts/check-skill-docs.sh` SLUG_RESOLUTION check — every `token/*` slug grepped from the SKILL.md routing table or any reference file must have a matching `### token/<slug>` heading somewhere in the tokens family.

#### Worked example — single foundation-rule subsection against a public-DS-shaped target (illustrative)

The block below uses a public-DS-shaped target to ground the skeleton. The skill makes no assumption that the user's DS is the one in the example; the same subsection contract applies to whichever DS the user passes.

```markdown
### token/screen-surface-dark-theme

When the app sets `data-color-mode="dark"` on `<html>`, the root surface and default text colors must be wired through Primer's semantic tokens — otherwise the browser default white surface sits underneath the dark theme and the page renders dark text on a white page.

**When it bites:** any page that imports `@primer/primitives/dist/css/functional/themes/dark.css` without also setting `color-scheme` and the body surface — the issues page in the post-mortem rendered dark text on white because of exactly this gap.

**Wiring:**
```css
:root { color-scheme: dark; }
html, body {
  background-color: var(--bgColor-default);
  color: var(--fgColor-default);
}
```

| Bad | Good | Why |
|---|---|---|
| `@import "tailwindcss";` alone in `globals.css` | `@import "tailwindcss";` + the wiring block above | Tailwind reset paints the browser default surface white; semantic Primer tokens never reach the root |

Source: https://primer.style/product/getting-started/foundations/color-usage/#dark-mode
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

- **Flat bulleted list** — when the component has fewer than 10 rules AND fewer than 3 distinct axes of concern. One bullet per rule. Each rule is a single imperative sentence. Cite source `file:line` at the end of the bullet.
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
