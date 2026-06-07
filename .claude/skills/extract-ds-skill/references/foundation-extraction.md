# Foundation extraction

How to turn a single `[docs:foundation]` URL — a prose foundations page on a DS docs site (color usage, dark mode, theming, contrast, breakpoints, spacing scale) — into a set of `token/*` rules inside the extracted skill's `references/tokens.md`. Read this file once per Phase 2 extraction pass that includes a foundation URL. Re-read the Five foundation rule shapes section whenever a candidate rule resists classification.

Scope reminder before any extraction begins:

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. Foundation pages often interleave token guidance with brand-voice or product-tone guidance ("our blues feel calm"). Recognize voice/tone prose, route it OUT in the discovery summary as a candidate for a sibling copy skill, and extract only the structural rules (tokens, contrast, surfaces).

Wiring (HTML attributes, CSS imports, provider wrappers) is NOT extracted from foundation prose. It is lifted from a real consumer app — see `references/reference-project.md` (when present). Foundation extraction stays in the prose-rule lane.

---

## When to load this file

Phase 2 only. Triggered when the Phase 1 discovery summary contains a source line tagged `[docs:foundation]`. If no foundation URL is in scope, skip this file entirely — `references/component-extraction.md` covers everything you need.

WebFetch the URL once at the top of Phase 2, before instantiating any component probe. Cache the returned prose into a single string the extraction pass can re-read; do not re-fetch per rule.

---

## Five foundation rule shapes

Every rule worth extracting from a foundations page maps to one of five shapes. Classify first, then extract using the per-shape recipe. If a rule does not fit any shape, it is probably brand-voice prose, illustrative example, out-of-scope copy, or wiring (route wiring through `references/reference-project.md`, not through this file).

### Shape 1 — Token-pairing

- **Looks like:** a rule that says "use background X with foreground Y", "pair `<bg-token>` with `<on-bg-foreground-token>`", "any surface that uses an emphasis background must use the on-emphasis foreground for foreground content". The rule binds two named tokens that must travel together.
- **Find in:** color-usage sections, surface guidelines, "on-" prefix conventions in functional token names.
- **Extract:** one subsection in `references/tokens.md` under `### token/<surface>-<foreground>-pairing`. State the pair, the trap of mixing the wrong foreground onto the named surface (low contrast, fails axe), and a `Bad | Good | Why` row. Cite source as `<docs-url>#<section-anchor>`.

### Example output — extraction against a Mantine-shaped target (illustrative)

The block below uses a public Mantine color-usage page to ground the shape. The skill makes no assumption that the user's DS is Mantine; the same pattern applies to whichever DS the user passes (shadcn, Material, Geist, Chakra, Radix, an internal DS, etc.).

"Pair `--mantine-color-blue-filled` (filled-color surface) with `--mantine-color-white` (the on-filled foreground). Default `--mantine-color-text` against `--mantine-color-blue-filled` is the body-surface foreground, not the filled-surface foreground — pairing them fails 3:1 contrast in dark mode. (`https://mantine.dev/styles/colors/#colors-in-mantine`)" The pair, the trap, the contrast number, and the anchored citation all survive.

### Shape 2 — Mode-aware

- **Looks like:** a rule whose behavior flips between light and dark mode. "The neutral scale inverts in dark mode — step 1 becomes the darkest, step 10 becomes the lightest." "Borders in dark mode use step 7-8 minimum; step 5-6 used in light mode disappears against the muted background."
- **Find in:** dark-mode sections, theming pages, color-scale documentation that shows both modes side-by-side.
- **Extract:** subsection under `### token/<surface-or-scale>-<mode-behavior>`. State the behavior in light mode, the behavior in dark mode, and the rule that prevents the agent from hardcoding one. Mode pivots OFTEN co-occur with wiring (an HTML attribute or media query that selects the mode) — note the wiring requirement so a reader knows the rule is mode-coupled, but the wiring snippet itself is lifted via `references/reference-project.md`, not reconstructed here.

### Example output — extraction against a shadcn-shaped target (illustrative)

The block below uses a public shadcn theming page to ground the shape. The skill makes no assumption that the user's DS is shadcn; the same pattern applies to whichever DS the user passes.

"shadcn theming inverts CSS-variable values between light (`:root`) and dark (`.dark`) selectors — `--background` reads near-white in light, near-black in dark. Hardcoding a hex value for either mode breaks the other. Mode is selected by toggling the `.dark` class on `<html>` (wiring lifted from the reference project, not from this rule). (`https://ui.shadcn.com/docs/theming#token-convention`)" The light-vs-dark behavior, the inversion contract, and the anchored citation all survive.

### Shape 3 — Contrast-minimum

- **Looks like:** a numeric threshold rule about visual contrast. "Borders need step 7 or 8 against muted backgrounds." "Body text against the default background must use the default foreground or darker." "Disabled text uses the disabled foreground (4.5:1 minimum against the default background)."
- **Find in:** accessibility callouts on color-usage pages, contrast-ratio tables, WCAG citations alongside token names.
- **Extract:** subsection under `### token/<role>-contrast-minimum`. State the minimum (token step or contrast ratio), the surfaces it applies against, and the failure mode if violated (axe failure, reads as washed-out, breaks dark mode). Cite the docs section anchor. If the docs cite a WCAG level, preserve the citation verbatim.

### Example output — extraction against a Radix-shaped target (illustrative)

The block below uses a public Radix Colors palette-composition page to ground the shape. The skill makes no assumption that the user's DS is Radix.

"Borders use neutral step 7 against `--gray-2` (subtle component surfaces). Step 6 (used for separators on `--gray-1`, the app surface) disappears against subtle component surfaces. (`https://www.radix-ui.com/colors/docs/palette-composition/scales#understanding-the-scale`)" Threshold ("step 7"), the comparator ("subtle component surface"), and the failure mode ("disappears") all preserved.

### Shape 4 — Semantic-role

- **Looks like:** a rule about which semantic foreground variant goes with which surface emphasis. "Use the accent foreground only on the default or muted background; the accent foreground on an emphasis background fails contrast." "Status foregrounds (success, attention, severe, danger) require a muted or default surface; do not pair with emphasis surfaces."
- **Find in:** semantic-color sections, role-based foreground tables, "when to use accent / success / danger" callouts.
- **Extract:** subsection under `### token/<role>-foreground-surface`. List the valid surface(s), the invalid surface(s), and the on-emphasis fallback (e.g. "use the on-emphasis foreground instead").

### Example output — extraction against a shadcn-shaped target (illustrative)

The block below uses a public shadcn theming page to ground the shape. The skill makes no assumption that the user's DS is shadcn.

"Use `--destructive-foreground` only on `--destructive` (the emphasis-style danger background). On `--background` or `--muted`, use `--destructive` itself as the foreground — the destructive-foreground is tuned for the destructive surface, not for the default surface. (`https://ui.shadcn.com/docs/theming#theme-tokens`)" The valid surface, the invalid surface, the fallback, and the anchored citation all survive.

### Shape 5 — Fallback-element

- **Looks like:** a rule about how to style a native HTML element when no DS wrapper exists. "For `<a>` outside a Link component, set the link foreground and underline the text." "For native `<table>`, set the border color to the default border token and apply the muted background to alternating rows."
- **Find in:** "Native HTML" subsections, escape-hatch callouts, prose paragraphs that name a HTML tag in code-fence syntax.
- **Extract:** subsection under `### token/<element>-fallback`. State the element, the minimal CSS contract, the tokens to use, and the consequence of leaving the element unstyled (mismatches the DS, reads as a regression).

### Example output — extraction against a Material-UI-shaped target (illustrative)

The block below uses a public Material-UI dark-mode page to ground the shape. The skill makes no assumption that the user's DS is MUI; the same pattern applies to whichever DS the user passes.

"For one-off elements that opt out of MUI's `sx`-style theme integration, use `theme.applyStyles('dark', { backgroundColor: 'background.paper' })` to keep the element's surface aligned with the mode-aware palette. Without this, the element reads as unstyled HTML against the rest of the DS and the surface mismatches in dark mode. (`https://mui.com/material-ui/customization/dark-mode/#styling-in-dark-mode`)" The element, the mode-aware fix, and the consequence-if-omitted all preserved.

---

## Rules-only-in-prose detection (four heuristics)

Foundation rules rarely live in types — they live in prose paragraphs, contrast tables, and inline-coded snippets. These heuristics surface them.

- **Imperative pairing language** — "use X with Y", "pair X and Y", "X requires Y". Almost always Shape 1.
- **Mode pivots** — "in dark mode", "in light mode", "when the mode attribute is set". Almost always Shape 2.
- **Numeric contrast thresholds** — "step 7", "4.5:1", "WCAG AA". Almost always Shape 3.
- **"On-" prefix conventions** — `<role>-on<surface>` naming. Names a foreground variant tuned for a specific surface — the existence of the on-variant IS a Shape 1 pairing rule.

HTML-attribute / CSS-import / provider-prop snippets are wiring, not a prose rule shape. Route them through `references/reference-project.md` if a reference project is in scope; otherwise the produced `SKILL.md` Setup section falls back to a verbatim docs snippet (see `references/skill-template.md`).

---

## Marker conventions

Same two-marker rule as component extraction, with one addition specific to foundations.

- **Backticks** for token names, CSS variables, HTML attributes, prop names. Anything an agent would type into code.
- **Markdown links** for cross-references to sibling foundation pages or component pages: `[Dark mode](./tokens.md#dark-mode)`, `[Button](./components/button.md)`. Link target is inside the extracted skill, never the source docs URL.
- **Plain text** for the source citation. Foundation citations have the shape `(<docs-url>#<section-anchor>)` — the URL plus the docs page anchor. The anchor MUST resolve in the live page; see the [VERIFY] marker usage section below for the hard-gate when it does not.

---

## Per-rule subsection skeleton

Every foundation rule extracted into `references/tokens.md` follows the same skeleton.

```markdown
### token/<slug>

<One sentence stating the rule. State the trap, not just the recipe — "use X with Y" is recipe;
"use X with Y; pairing X with Z fails 3:1 contrast in dark mode" is rule.>

**When it bites:** <one sentence naming the concrete failure mode — "page renders dark text
on white surface", "border invisible against muted background", "axe fails on disabled state">

| Bad | Good | Why |
|---|---|---|
| `<bad-token-or-attr>` | `<good-token-or-attr>` | <one-line failure mode> |

Source: <docs-url>#<section-anchor>
```

The four elements (heading slug, single-sentence rule, `When it bites` line, `Bad | Good | Why` row, source citation) are the contract enforced by `scripts/check-skill-docs.sh`. A missing element fails the post-emit check for that slug.

---

## Universal coverage rule

Every `[docs:foundation]` URL extracted ships at least one rule per shape category present in the source page. If the source page covers four shapes (token-pairing, mode-aware, contrast-minimum, semantic-role), `references/tokens.md` ships at least four subsections — one per shape. Missing a shape that the source clearly covers reads as a gap; the explicit subsection reads as verified coverage.

If a page genuinely covers only one shape (e.g. a pure contrast-ratio reference), it is fine to ship a single subsection. Empty-output runs (no rules extracted) should NOT happen — if the URL is in scope, the extraction must produce at least one cited rule or the URL was the wrong source and discovery should have caught it.

---

## Cross-rule citation duplication

Unlike component extraction (where the same rule lives in every reachable component file), foundation rules live in exactly one place — the relevant subsection of `references/tokens.md`. Do NOT duplicate a foundation rule into a component file. If a component file needs to reference a foundation rule, link to it: `[Dark-mode wiring](../tokens.md#token-screen-surface-dark-theme)`.

The reason foundation rules do not duplicate: the trap they prevent is screen-wide or surface-wide, not component-scoped. A token-pairing rule applies anywhere those tokens appear; pinning the rule to Button or to Banner would suggest the rule is component-scoped when it is not.

---

## `[VERIFY]` marker usage

Mark any foundation rule inline with `[VERIFY]` when one of the following is true:

- The cited CSS variable does not grep-resolve in the installed token package (run `grep -r "<var-name>" node_modules/<ds-package>/dist/css/` or the equivalent path for the DS in scope; no hit = `[VERIFY]`).
- The cited URL anchor does not resolve in the live page (the prose section exists, but the anchor link 404s or jumps to the wrong heading). **Hard gate:** every unresolved anchor MUST carry the marker `[VERIFY: anchor did not resolve in fetched page]`. Soft notes ("not sure if this anchor exists", "appears to be...") are disallowed — either the anchor resolved against the WebFetch'd prose or the rule ships with the explicit marker.
- The rule was lifted from a docs page section the agent could not fully parse — e.g. an image-only contrast table the agent had to OCR or a chart with no alt text.

Place the marker at the end of the rule line, before the citation:

```
- Pair `--ds-bg-emphasis` with `--ds-fg-on-emphasis`. [VERIFY: --ds-fg-on-emphasis did not grep-resolve in `node_modules/<ds-package>/dist/css/functional/themes/light.css`] (`<docs-url>#emphasis-surfaces`)
```

`[VERIFY]` markers from foundation extraction count into the same tally as component extraction. The Phase 2 proof point reports both together: `F foundation-rules extracted (X cited, Y [VERIFY])` alongside the existing `N props verified`, `M tokens grep-resolved`, `K assets grep-resolved` lines.

Do NOT use `[VERIFY]` to ship guesses. If a foundation rule cannot be grounded after a second read of the source page, drop it. The marker exists for genuinely ambiguous source — a docs page that references a CSS variable the installed package has not exposed yet, or an anchor the live page no longer carries — not for "I think this is probably right."

---

## Out of scope (route OUT, do not extract)

The following frequently appear on foundation pages and frequently tempt the extraction agent. They go to the discovery summary as candidates for a sibling copy or brand skill, not into the DS skill:

- **Brand-voice prose** — "our greens feel reassuring", "the accent color carries energy". Tone, not contract.
- **Marketing-color guidance** — "use the marketing palette for landing pages, the product palette for the app". Belongs in a sibling brand skill.
- **Naming conventions for new tokens** — "name new tokens semantically, not by hex value". A meta-rule about extending the system, not a rule about using it.
- **History or rationale paragraphs** — "we moved from a 5-step to a 10-step scale in 2024". Context, not contract.
- **Wiring snippets** — `data-color-mode` attribute, `@import` of a CSS theme file, `<ThemeProvider>` wrapper, `:root { color-scheme: ... }`. Wiring is real and required, but it does not live in the prose-rule taxonomy — lift it verbatim from a reference project per `references/reference-project.md`, or fall back to the verbatim docs setup snippet per `references/skill-template.md`. Do NOT reconstruct wiring from foundation prose.

When you encounter one of these during extraction, surface it in the discovery summary on a single line: "Foundation page covers brand-voice prose — N rules of out-of-scope shape detected, routed out." Then continue extracting the in-scope shapes.
