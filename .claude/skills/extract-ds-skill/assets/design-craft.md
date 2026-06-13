# Design craft — composition defaults (DS-agnostic)

Shipped material. This file travels verbatim with every skill the
`extract-ds-skill` meta-skill produces. It is general design craft, not
derived from this design system — no `file:line` citations apply, and no
rule below names a real token, font, or component. Do not edit it in
place; it is replaced wholesale when the skill is re-extracted.

**Precedence (read first).** These are defaults for where the design
system is silent. The design system is canonical: wherever a DS token,
font, scale, component, or documented rule contradicts a line below,
follow the design system and drop the conflicting line without comment.

**Rule grammar.** `MUST` = hard requirement. `SHOULD` = strong default;
override only with a reason you could say out loud. `NEVER` = ban.
These rules fire at composition time (screens, pages, sections) — not on
token lookups or single-component API questions.

## Layout & structure

- NEVER: default to the hero → three-feature-cards → CTA → footer page shape. Pick a deliberate macrostructure for the content (stat-led, long-document, bento, split, workbench, editorial…) and commit to it.
- NEVER: nest cards inside cards, or build feature grids from identical icon-tile cards (rounded tile + icon + two-line blurb + "Learn more →").
- SHOULD: prefer 3–5 intentional items over 8 filler ones; grids interlock with no dead cells.
- SHOULD: break centered symmetry at least once per page, deliberately — centering every section is a template tell.
- SHOULD: use eyebrows, section numbering ("01/02"), and decorative dividers only when they encode real sequence or grouping; default off, max 1–2 per page.

## Hierarchy & density

- MUST: give every screen roughly three prominence levels (lead, support, detail); a reader should resolve what leads within two seconds.
- MUST: a lead figure is not a headline — pair any hero stat with a worded line that says what the number means.
- MUST: one primary action per screen — everything else renders as secondary or tertiary.
- MUST: design all four data states for every data-dependent view — loading, empty, error, populated. Empty states name one clear next action.
- SHOULD: match density to the job — spacious for marketing and landing surfaces, dense for dashboards and tables. One density everywhere is a default, not a decision.

## Typography

- MUST: take every type size from the DS type scale; no arbitrary pixel values.
- MUST: keep display headings to 2–3 lines maximum — widen the container or cut the copy rather than wrapping a headline down a narrow column.
- SHOULD: when the DS does not mandate fonts, pair a distinctive display face with a refined body face — one generic sans-serif doing both jobs is the most recognizable generated-UI tell.
- SHOULD: `text-wrap: balance` on headings, `text-wrap: pretty` on body, `tabular-nums` on numbers that change; leave letter-spacing alone unless the DS sets it.
- SHOULD: hold running prose to a comfortable measure (~45–75 characters per line) — constrain the text container, since shorter reads choppy and wider loses the eye on the return sweep.
- NEVER: italicize headings as a default emphasis device.

## Color

- MUST: take every color from a DS token; never improvise raw hex/rgb/oklch values mid-build.
- MUST: keep one accent hue per view, used sparingly — the accent lands on roughly the 5% of the surface that deserves the eye.
- SHOULD: prefer the DS's tinted neutrals over pure #000/#fff surfaces when both exist.
- NEVER: purple-to-cyan (or any multi-stop rainbow) gradient heroes on white — the canonical generated look.
- NEVER: gray text on colored backgrounds, or glow as a primary affordance.

## Spacing

- MUST: take every gap from the DS spacing scale; no arbitrary one-off values.
- SHOULD: give sections generous vertical rhythm — a section is a chapter, not a stacked box; cramped section padding reads as template output.
- SHOULD: center icons and glyphs optically, not just geometrically — trust the eye over the box model.

## Motion

- MUST: animate compositor properties only (`transform`, `opacity`).
- NEVER: `transition: all`, or animating layout properties (width/height/top/left/margin/padding).
- MUST: entrances ease-out, exits ease-in, user-initiated motion ≤300ms; reserve linear easing for progress indicators.
- NEVER: bounce or elastic easing on interface state changes.
- NEVER: animate high-frequency interactions (anything used dozens of times per session) or keyboard-initiated actions.
- MUST: honor `prefers-reduced-motion` for every non-essential animation.
- SHOULD: one orchestrated moment (a staggered page-load reveal, ~50ms per item) beats scattered micro-effects; cut any animation that carries no information.

## Interactive states & accessibility floor

- MUST: handle every state that applies to an interactive element — default, hover, focus-visible, active, disabled — plus loading, error, and success wherever the element can be in them.
- MUST: keep a visible focus ring (never removed, never animated), text contrast at 4.5:1 or better, and touch targets ≥44px that never overlap. When a surface flips lightness, recolor its text in the same change and confirm children inherit it; never let button text equal its fill.
- MUST: render errors adjacent to the field that caused them, not only in a distant summary.
- NEVER: signal state by color alone — pair every status hue (error/success/warning) with an icon, shape, or text label, so meaning survives color-blindness and grayscale.
- NEVER: put a menu, control, or information-bearing tooltip behind hover alone — anything that appears on hover must also open on keyboard focus and on a touch (coarse) pointer.
- NEVER: let a clickable label (button, nav link, CTA, breadcrumb) wrap to two lines — a two-line affordance reads as a styling error. Shorten the label first, else `white-space: nowrap` and let the layout reflow, else collapse the nav.
- NEVER: horizontal scroll on mobile viewports — verify narrow widths before calling a layout done.
- NEVER: emoji as icons or as bullet decoration.

## Honesty & restraint

- NEVER: fabricate metrics, testimonials, customer logos, star ratings, or user counts; placeholder names ("John Doe", "Acme"); or cliché AI-filler state copy ("Herding pixels…") — each reads as machine-generated. Use real data, a clearly labeled placeholder, or copy that says what the product is actually doing.
- NEVER: re-draw fake chrome — browser bars with traffic-light dots, phone frames, IDE windows. Use a real screenshot or drop the frame.
- SHOULD: reach for typography and plain CSS before decorative imagery or animation libraries; ornament added because a section "felt empty" is filler by definition.
- SHOULD: anchor the direction to one concrete reference before composing (a real product, brand, or genre — not adjectives like "modern" or "clean"); unanchored restraint defaults to bland. Then be able to answer "why this?" for every visible choice — if the honest answer is "it's common" or "it looks clean", that was a default, not a decision; choose again, deliberately.

## Before presenting: self-critique

- MUST: before presenting generated UI, score it 1–5 on three axes — **hierarchy** (does one thing clearly lead?), **restraint** (does every element earn its place?), **distinctiveness** (could this be mistaken for template output?) — and give any axis scoring below 3 one targeted revision pass before the user sees it. Keep the scores to yourself unless asked.
