# Foundation: typography

## What this covers

- Primer's rem-based typography token system, semantic heading order rule, weight-via-token rule, alignment defaults, and line-length guidance.

Source URL fetched: https://primer.style/foundations/typography (the path `/product/getting-started/foundations/typography` from Phase 1 redirects here).

### token/rem-typography-baseline

Primer typography tokens (`--text-*-size`, `--text-*-lineHeight`, `--text-*-weight`) are built on `rem` so they honor the browser's default font-size preference. Line-height values are unitless and align to a 4px grid.

**When it bites:** Hardcoding `font-size: 14px` ignores the user's browser font-size preference; line-heights set in `px` drift off the 4px grid and produce inconsistent vertical rhythm.

| Bad | Good | Why |
|---|---|---|
| `font-size: 14px; line-height: 20px` | `font: var(--text-body-shorthand-small)` (or the per-axis size + lineHeight tokens) | The shorthand binds size + family + weight + lineHeight in one declaration, all rem-based. |

Source: https://primer.style/foundations/typography#overview

### token/weight-via-token

Bind `font-weight` to a typography weight token (`--text-*-weight`); never hardcode numeric weight values. The set of weights Primer ships is curated — arbitrary weights drift outside the available font cuts.

**When it bites:** `font-weight: 700` may render at the closest available cut (often 600 or 800) on systems where the 700 cut is not loaded, producing visible weight drift between platforms.

| Bad | Good | Why |
|---|---|---|
| `font-weight: 700` | `font-weight: var(--text-title-weight)` (or the matching semantic weight token) | Token-bound weights guarantee the cut Primer's font stack ships; raw numbers fall back unpredictably. |

Source: https://primer.style/foundations/typography#best-practices

### token/semantic-heading-order

Heading tag order is semantic and must follow document outline — `h1` before `h2` before `h3`. The visual size scale is set via the `variant` prop on `<Heading>` or via type tokens; never swap heading tags to achieve a visual size.

**When it bites:** Using `<h3>` for the page title because "h3 looks the right size" breaks the document outline and assistive-tech navigation; screen readers no longer announce the page title as the top heading.

| Bad | Good | Why |
|---|---|---|
| `<Heading as="h3" variant="large">Page title</Heading>` | `<Heading as="h1" variant="large">Page title</Heading>` | Visual scale is the `variant` prop; tag order is `as`, and `as` follows document outline regardless of size. |

Source: https://primer.style/foundations/typography#best-practices

### token/text-alignment-default

Default text alignment is left-aligned with ragged-right edges. Centered, justified, or right-aligned body text is atypical for Primer surfaces.

**When it bites:** Centering paragraph text reads as decorative and harms scannability; justified text introduces variable inter-word spacing that breaks the 80-character line-length target.

| Bad | Good | Why |
|---|---|---|
| `text-align: center` on a multi-line `<Text>` body | (default; omit) — left-aligned ragged right | Centering breaks scan rhythm; justifying introduces ill-spaced words. |

Source: https://primer.style/foundations/typography#readability

### token/line-length-target

Target ~80 characters per line of body text, per W3 page-structure guidance. Long line lengths reduce return-sweep accuracy.

**When it bites:** A `<Text>` block in a wide `<PageLayout containerWidth="large">` Content region reads at 120+ chars per line and degrades readability.

| Bad | Good | Why |
|---|---|---|
| `<Text>` body filling a 1200px container | `<Text style={{ maxWidth: "65ch" }}>` for body prose | The `ch` unit caps line length at ~65 characters regardless of container width, hitting the 80-char ceiling with a margin. |

Source: https://primer.style/foundations/typography#readability

[VERIFY: This foundation page documents typography principles but does NOT enumerate specific `--text-*-size` / `--text-*-lineHeight` token names or the Heading variant → scale mapping. Those tables live under `/product/primitives/typography/` and `/product/components/heading/` respectively; the produced skill should cross-link to them in `references/tokens.md` rather than duplicate them.]
