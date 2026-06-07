# Foundation extraction

How to turn a single `[docs:foundation]` URL — a prose foundations page on a DS docs site (color usage, dark mode, theming, contrast, breakpoints, spacing scale) — into a set of `token/*` rules inside the extracted skill's `references/tokens.md` and, if the docs prescribe wiring, into the produced `SKILL.md` Setup section. Read this file once per Phase 2 extraction pass that includes a foundation URL. Re-read the Six foundation rule shapes section whenever a candidate rule resists classification.

Scope reminder before any extraction begins:

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. Foundation pages often interleave token guidance with brand-voice or product-tone guidance ("our blues feel calm"). Recognize voice/tone prose, route it OUT in the discovery summary as a candidate for a sibling copy skill, and extract only the structural rules (tokens, contrast, surfaces, wiring).

---

## When to load this file

Phase 2 only. Triggered when the Phase 1 discovery summary contains a source line tagged `[docs:foundation]`. If no foundation URL is in scope, skip this file entirely — `references/component-extraction.md` covers everything you need.

WebFetch the URL once at the top of Phase 2, before instantiating any component probe. Cache the returned prose into a single string the extraction pass can re-read; do not re-fetch per rule.

---

## Six foundation rule shapes

Every rule worth extracting from a foundations page maps to one of six shapes. Classify first, then extract using the per-shape recipe. If a rule does not fit any shape, it is probably brand-voice prose, illustrative example, or an out-of-scope copy rule — route it out, do not extract.

### Shape 1 — Token-pairing

- **Looks like:** a rule that says "use background X with foreground Y", "pair `bgColor-accent-emphasis` with `fgColor-onEmphasis`", "any surface that uses `bgColor-emphasis` must use `fgColor-onEmphasis` for foreground content". The rule binds two named tokens that must travel together.
- **Find in:** color-usage sections, surface guidelines, "on-" prefix conventions in functional token names.
- **Extract:** one subsection in `references/tokens.md` under `### token/<surface>-<foreground>-pairing`. State the pair, the trap of mixing the wrong foreground onto the named surface (low contrast, fails axe), and a `Bad | Good | Why` row. Cite source as `<url>#<section-anchor>`.
- **Worked example:** "Pair `--bgColor-emphasis` with `--fgColor-onEmphasis`. Default `--fgColor-default` against `--bgColor-emphasis` fails 3:1 contrast in dark mode. (https://primer.style/product/getting-started/foundations/color-usage/#emphasis-surfaces)" The pair, the trap, the contrast number, and the anchored citation all survive.

### Shape 2 — Mode-aware

- **Looks like:** a rule whose behavior flips between light and dark mode. "The neutral scale inverts in dark mode — `gray-1` becomes the darkest, `gray-10` becomes the lightest." "Borders in dark mode use step 7-8 minimum; step 5-6 used in light mode disappears against `bgColor-muted`."
- **Find in:** dark-mode sections, theming pages, color-scale documentation that shows both modes side-by-side.
- **Extract:** subsection under `### token/<surface-or-scale>-<mode-behavior>`. State the behavior in light mode, the behavior in dark mode, and the rule that prevents the agent from hardcoding one. Include the wiring requirement (e.g. `data-color-mode="dark"` attribute or `prefers-color-scheme` media query) — wiring is half the rule.
- **Worked example:** "Set `data-color-mode="dark"` on `<html>` for dark theme. Without it, semantic CSS vars resolve to their light defaults regardless of the imported stylesheet. Pair with importing `@primer/primitives/dist/css/functional/themes/dark.css`. (https://primer.style/product/getting-started/foundations/color-usage/#dark-mode)" Both the attribute and the import are part of the same rule; do not split them across two rules.

### Shape 3 — Contrast-minimum

- **Looks like:** a numeric threshold rule about visual contrast. "Borders need step 7 or 8 against muted backgrounds." "Body text against `bgColor-default` must use `fgColor-default` or darker." "Disabled text uses `fgColor-disabled` (4.5:1 minimum against `bgColor-default`)."
- **Find in:** accessibility callouts on color-usage pages, contrast-ratio tables, WCAG citations alongside token names.
- **Extract:** subsection under `### token/<role>-contrast-minimum`. State the minimum (token step or contrast ratio), the surfaces it applies against, and the failure mode if violated (axe failure, reads as washed-out, breaks dark mode). Cite the docs section anchor. If the docs cite a WCAG level, preserve the citation verbatim.
- **Worked example:** "Borders use neutral step 7 or 8 against `bgColor-muted`. Step 5-6 (used for separators on `bgColor-default`) disappears against muted surfaces. (https://primer.style/product/getting-started/foundations/color-usage/#borders)" Threshold ("step 7 or 8"), the comparator ("muted"), and the failure mode ("disappears") all preserved.

### Shape 4 — Semantic-role

- **Looks like:** a rule about which semantic foreground variant goes with which surface emphasis. "Use `fgColor-accent` only on `bgColor-default` or `bgColor-muted`; `fgColor-accent` on `bgColor-emphasis` fails contrast." "`fgColor-{role}` (success, attention, severe, danger) requires a muted or default surface; do not pair with emphasis surfaces."
- **Find in:** semantic-color sections, role-based foreground tables, "when to use accent / success / danger" callouts.
- **Extract:** subsection under `### token/<role>-foreground-surface`. List the valid surface(s), the invalid surface(s), and the on-emphasis fallback (e.g. "use `fgColor-onEmphasis` instead").
- **Worked example:** "Use `--fgColor-accent` on `--bgColor-default` or `--bgColor-muted`. On `--bgColor-accent-emphasis` use `--fgColor-onEmphasis` — the accent foreground does not have enough contrast against its own emphasis surface. (https://primer.style/product/getting-started/foundations/color-usage/#functional-colors)"

### Shape 5 — Wiring-contract

- **Looks like:** an HTML attribute, CSS import, or provider prop the docs say is required for the foundation to work at all. "Set `data-color-mode` on `<html>`." "Import `@primer/primitives/dist/css/functional/themes/light.css` at the entry point." "Wrap the app in `<ThemeProvider colorMode="auto">`."
- **Find in:** "Getting started" snippets, "Setup" subsections of foundation pages, theming integration docs.
- **Extract:** Two writes. First, a subsection in `references/tokens.md` under `### token/<foundation>-wiring` documenting the requirement. Second, inject the wiring step into the produced `SKILL.md` Setup section (see `references/skill-template.md` for the Setup injection slot). The Setup injection is what makes the wiring discoverable at agent-load time; the tokens.md entry is what surfaces it during reflexive audit.
- **Worked example:** "Set `color-scheme: dark` on `:root` and `background-color: var(--bgColor-default); color: var(--fgColor-default)` on `html, body`. Without these, the browser default surface (white) sits underneath the dark-theme tokens and the page renders dark text on a white page. (https://primer.style/product/getting-started/foundations/color-usage/#setup)" This is exactly the rule the screen-surface bug needed; extracting it into the wiring-contract shape prevents the same bug on the next regenerate.

### Shape 6 — Fallback-element

- **Looks like:** a rule about how to style a native HTML element when no DS wrapper exists. "For `<a>` outside a Link component, set `color: var(--fgColor-link)` and `text-decoration: underline`." "For native `<table>`, set `border-color: var(--borderColor-default)` and apply `--bgColor-muted` to alternating rows."
- **Find in:** "Native HTML" subsections, escape-hatch callouts, prose paragraphs that name a HTML tag in code-fence syntax.
- **Extract:** subsection under `### token/<element>-fallback`. State the element, the minimal CSS contract, the tokens to use, and the consequence of leaving the element unstyled (mismatches the DS, reads as a regression).
- **Worked example:** "Native `<table>` without a DataTable wrapper: set `border-collapse: collapse`, apply `border: 1px solid var(--borderColor-default)` on cells, and `background-color: var(--bgColor-muted)` on `<th>`. Without this the table reads as unstyled HTML against the rest of the DS. (https://primer.style/product/getting-started/foundations/color-usage/#native-elements)"

---

## Rules-only-in-prose detection (five heuristics)

Foundation rules rarely live in types — they live in prose paragraphs, contrast tables, and inline-coded snippets. These heuristics surface them.

- **Imperative pairing language** — "use X with Y", "pair X and Y", "X requires Y". Almost always Shape 1.
- **Mode pivots** — "in dark mode", "in light mode", "when `data-color-mode` is set". Almost always Shape 2.
- **Numeric contrast thresholds** — "step 7", "4.5:1", "WCAG AA". Almost always Shape 3.
- **"On-" prefix conventions** — `fgColor-onEmphasis`, `fgColor-onAccent`. Names a foreground variant tuned for a specific surface — the existence of the on-variant IS a Shape 1 pairing rule.
- **HTML attributes or CSS imports in code-fence** — `data-color-mode`, `prefers-color-scheme`, `@import "@primer/primitives/..."`. Almost always Shape 5.

---

## Marker conventions

Same two-marker rule as component extraction, with one addition specific to foundations.

- **Backticks** for token names, CSS variables, HTML attributes, prop names: `--bgColor-default`, `data-color-mode`, `colorMode="auto"`. Anything an agent would type into code.
- **Markdown links** for cross-references to sibling foundation pages or component pages: `[Dark mode](./tokens.md#dark-mode)`, `[Button](./components/button.md)`. Link target is inside the extracted skill, never the source docs URL.
- **Plain text** for the source citation. Foundation citations have the shape `(<url>#<section-anchor>)` — the URL plus the docs page anchor. Anchor must resolve in the live page; if it does not, omit the anchor and cite the bare URL with a `[VERIFY]` marker.

---

## Per-rule subsection skeleton

Every foundation rule extracted into `references/tokens.md` follows the same skeleton. Mirror the shape of the existing `token/screen-surface-dark-theme` rule the user hand-wrote on 2026-06-06; that is the template.

```markdown
### token/<slug>

<One sentence stating the rule. State the trap, not just the recipe — "use X with Y" is recipe;
"use X with Y; pairing X with Z fails 3:1 contrast in dark mode" is rule.>

**When it bites:** <one sentence naming the concrete failure mode — "page renders dark text
on white surface", "border invisible against muted background", "axe fails on disabled state">

**Wiring (if Shape 5):**
```css
/* minimal verbatim snippet, lifted from docs, not reconstructed */
```

| Bad | Good | Why |
|---|---|---|
| `<bad-token-or-attr>` | `<good-token-or-attr>` | <one-line failure mode> |

Source: <url>#<section-anchor>
```

The five elements (heading slug, single-sentence rule, `When it bites` line, optional wiring fence for Shape 5, `Bad | Good | Why` row, source citation) are the contract enforced by `scripts/check-skill-docs.sh`. A missing element fails the post-emit check for that slug.

---

## Universal coverage rule

Every `[docs:foundation]` URL extracted ships at least one rule per shape category present in the source page. If the source page covers four shapes (token-pairing, mode-aware, contrast-minimum, semantic-role), `references/tokens.md` ships at least four subsections — one per shape. Missing a shape that the source clearly covers reads as a gap; the explicit subsection reads as verified coverage.

If a page genuinely covers only one shape (e.g. a pure contrast-ratio reference), it is fine to ship a single subsection. Empty-output runs (no rules extracted) should NOT happen — if the URL is in scope, the extraction must produce at least one cited rule or the URL was the wrong source and discovery should have caught it.

---

## Cross-rule citation duplication

Unlike component extraction (where the same rule lives in every reachable component file), foundation rules live in exactly one place — the relevant subsection of `references/tokens.md`. Do NOT duplicate a foundation rule into a component file. If a component file needs to reference a foundation rule, link to it: `[Dark-mode wiring](../tokens.md#token-screen-surface-dark-theme)`.

The reason foundation rules do not duplicate: the trap they prevent is screen-wide or surface-wide, not component-scoped. A `bgColor-emphasis` / `fgColor-onEmphasis` pairing rule applies anywhere those tokens appear; pinning the rule to Button or to Banner would suggest the rule is component-scoped when it is not.

The one exception: the Shape 5 wiring-contract subsection ALSO injects into the produced `SKILL.md` Setup section. This is not duplication — the Setup section is the agent's load-time contract, the tokens.md subsection is the reflexive-audit citation. Both are required.

---

## `[VERIFY]` marker usage

Mark any foundation rule inline with `[VERIFY]` when one of the following is true:

- The cited CSS variable does not grep-resolve in the installed token package (run `grep -r "<var-name>" node_modules/@<ds-package>/primitives/dist/css/` or the equivalent path for the DS in scope; no hit = `[VERIFY]`).
- The cited URL anchor does not resolve in the live page (the prose section exists, but the anchor link 404s or jumps to the wrong heading).
- The rule was lifted from a docs page section the agent could not fully parse — e.g. an image-only contrast table the agent had to OCR or a chart with no alt text.
- The wiring contract (Shape 5) names an HTML attribute, CSS import, or provider prop the agent could not confirm by reading the installed package's source.

Place the marker at the end of the rule line, before the citation:

```
- Pair `--bgColor-emphasis` with `--fgColor-onEmphasis`. [VERIFY: --fgColor-onEmphasis did not grep-resolve in node_modules/@primer/primitives/dist/css/functional/themes/light.css] (https://primer.style/product/getting-started/foundations/color-usage/#emphasis-surfaces)
```

`[VERIFY]` markers from foundation extraction count into the same tally as component extraction. The Phase 2 proof point reports both together: `F foundation-rules extracted (X cited, Y [VERIFY])` alongside the existing `N props verified`, `M tokens grep-resolved`, `K assets grep-resolved` lines.

Do NOT use `[VERIFY]` to ship guesses. If a foundation rule cannot be grounded after a second read of the source page, drop it. The marker exists for genuinely ambiguous source — a docs page that references a CSS variable the installed package has not exposed yet — not for "I think this is probably right."

---

## Out of scope (route OUT, do not extract)

The following frequently appear on foundation pages and frequently tempt the extraction agent. They go to the discovery summary as candidates for a sibling copy or brand skill, not into the DS skill:

- **Brand-voice prose** — "our greens feel reassuring", "the accent color carries energy". Tone, not contract.
- **Marketing-color guidance** — "use the marketing palette for landing pages, the product palette for the app". Belongs in a sibling brand skill.
- **Naming conventions for new tokens** — "name new tokens semantically, not by hex value". A meta-rule about extending the system, not a rule about using it.
- **History or rationale paragraphs** — "we moved from a 5-step to a 10-step scale in 2024". Context, not contract.

When you encounter one of these during extraction, surface it in the discovery summary on a single line: "Foundation page covers brand-voice prose — N rules of out-of-scope shape detected, routed out." Then continue extracting the in-scope shapes.
