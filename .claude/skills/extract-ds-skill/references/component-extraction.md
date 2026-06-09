# Component extraction

How to turn a single component in the source design system into a per-component reference file under `references/components/<name>.md` in the extracted skill. Read this file once per Phase 2 extraction pass; re-read the Six rule shapes section whenever a rule resists classification.

Scope reminder before any extraction begins:

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. When you encounter a copy/naming/casing rule during extraction (e.g. "Title Case the label", "placeholder is action-oriented"), recognize it, route it - mention it in the discovery summary as a candidate for a sibling copy skill - but do NOT extract it into this DS skill.

---

## Seven rule shapes (Geist taxonomy + anti-substitution)

Every behavioral rule worth extracting maps to one of seven shapes. Classify the rule first, then extract using the per-shape recipe. If a rule does not fit any shape, it is probably not a rule — it is either prose framing or out-of-scope copy.

### Shape 1 — Component-selection

- **Looks like:** a peer-component table or paragraph that says "use X when Y, use Z when W". Cross-references at least one sibling component.
- **Find in:** component docs (`.mdx`, `README.md`), Storybook story descriptions, cross-linked "See also" sections.
- **Extract:** a paragraph under `### When to use` in the component's reference file. Wrap each sibling component name in a peer-component link: `[Combobox](./combobox.md)`. Keep the original threshold language verbatim ("under ~10 items", "past 3 options") — fuzzy thresholds are load-bearing.
- **Worked example (from Geist `select.mdx`):** "Pick `<Select>` for short, fixed lists (under ~10 items) where typing adds nothing; switch to [Combobox](./combobox.md) once filtering helps." The threshold (`~10`), the comparator component, and the trigger condition (`filtering helps`) all survive the extraction unchanged.

### Shape 7 — Anti-substitution

- **Looks like:** prose that names a peer component as the wrong choice for the current surface, often hedged with "experimental", "deprecated", "preview", "reserved for". Triggers: `"use X, not Y"`, `"do not reach for Y"`, `"do not substitute Y"`, `"Y is the wrong choice when..."`, `"Y is reserved for..."`, `"only reach for Y when..."`.
- **Find in:** component annotation files (`.docs.tsx`, `*.docs.mdx`, `<BestPractices>` blocks), README "When NOT to use" sections, ADRs that record a deliberate avoidance.
- **Extract:** bullet under `### Best Practices` (flat mode) or `### When to use` (subsectioned mode) in the IN-SCOPE component's reference file. The anti-substitution rule belongs to the in-scope component because that is where the trap fires — at consume-time the agent reaches for the wrong peer, not for the right one. Preserve the avoided peer's name in backticks even when the peer is outside the proposing set (no peer-component link — there is no peer reference file to link to). Preserve the DS-author's hedge ("experimental", "reserved for") verbatim.
- **Worked example (illustrative, DS-agnostic):** source annotation on `<Notice>` says "Use `Notice` for simple inline messages. Reach for experimental `Modal` only when you need title + dismiss actions — this card uses `Notice`, not `Modal`." Extracted into `notice.md` under `### Best Practices`: "Do not substitute the experimental `Modal` for inline messages — `Modal` is reserved for title + dismiss surfaces; `Notice` is the right choice here. (notice.docs.tsx:<line>)" The avoided peer (`Modal`) is in backticks, not a link. The hedge ("experimental", "reserved for") is preserved. The citation points at the annotation file the rule was lifted from.

The shape is distinct from Shape 1 (positive peer-graph routing) because the trigger and the extraction target differ: Shape 1 lands a peer-graph link to another in-scope component file; Shape 7 lands a plain-backtick warning naming an out-of-scope peer. Misclassifying Shape 7 as Shape 1 produces a broken link to a non-existent peer file; misclassifying Shape 7 as Shape 2 (prop-usage) loses the peer name entirely.

### Shape 2 — Prop-usage

- **Looks like:** a rule about how to use a specific prop, or which prop to prefer over another (`loading` over a manual spinner swap, `typeName='submit'` over `type='submit'`).
- **Find in:** TypeScript types (`*.d.ts`, prop interfaces), JSDoc on the prop, prop tables in docs, runtime warnings inside the implementation.
- **Extract:** bullet under `### Key props` or `### Behavior` in the component's reference file. Wrap every prop / value / literal API token in backticks: `disabled`, `primary`, `oclif/core`. Cite source as `file:line` inline.
- **Worked example (from Geist `button.mdx`):** "Pass `loading` instead of swapping in a spinner so the button stays focusable and announces the busy state to assistive tech. (button.tsx:88)" The prop is in backticks; the rationale (focus + ARIA) is preserved; the citation points at the implementation line that proves the behavior.

### Shape 3 — Naming / casing / copy

- **OUT OF SCOPE — route to copy skill, do not extract.**
- **Looks like:** "Title Case the label", "placeholder is action-oriented", "modal title is never a question", "button copy starts with a verb".
- **Find in:** copy guidelines, placeholder examples, component `<BestPractices>` blocks with naming rules embedded.
- **Extract:** do not. Recognize the shape, surface it in the Phase 1 discovery summary as "candidate for sibling copy skill — N rules of shape 3 detected, routed out", and move on. The DS skill must stay structural. A copy skill is a separate concern with a separate eval surface.

### Shape 4 — Accessibility

- **Looks like:** ARIA attribute requirements, keyboard interaction contracts, screen-reader announcement behavior, focus-management rules.
- **Find in:** `aria-*` attributes in the implementation, a11y test files (`*.a11y.test.tsx`, `*.axe.test.ts`), axe-cited rules in docs, focus traps in modal/dialog primitives.
- **Extract:** bullet under `### Accessibility` in the component's reference file. Cite the runtime behavior (focus trap, ARIA role) and the trap it prevents. Pair with a `[VERIFY]` marker if the rule was lifted from prose docs without a code-level reference.
- **Worked example:** "Do not pass `aria-label` to a Button that already renders visible text — duplicate announcement, screen readers read both the label and the text node. (button.tsx:204 prop comment)" The trap is named, the consequence is concrete, the citation is a prop comment in the implementation.

### Shape 5 — Default-state

- **Looks like:** the initial render state when no props are passed. Default focus target on a Modal. Default `Cancel` button position on a destructive dialog. Default `loading={false}` semantics.
- **Find in:** implementation defaults (`useState(initial)`, default-prop destructuring), Storybook default stories, prop-table default columns.
- **Extract:** bullet under `### Behavior` in the component's reference file. State the default and the consequence of overriding it incorrectly.
- **Worked example (from Geist `modal.mdx`):** "Default focus to `Cancel` on any destructive Modal. Enter must never trigger the destructive action without a typed confirmation. (modal.tsx:`initialFocusRef` default)" The default is concrete, the override risk is explicit, the citation points at the implementation primitive that enforces it.

### Shape 6 — Cross-skill back-reference

- **Looks like:** a rule that depends on a sibling skill — "use the icon skill's primitive, not raw SVG", "error toast copy lives in the copy skill, mirror it here".
- **Find in:** prose docs that cross-link other skills, bidirectional rule mirrors (Geist toast rules mirrored in product-copywriting).
- **Extract:** **DEFER for v1.** No sibling skills exist in the workshop scaffold yet. Mark the rule `[DEFER]` in the rule list during extraction so it is visible to the user but does not pollute the routing table. Pick up when the second skill in the cluster lands.

---

## Rules-only-in-prose detection (six heuristics)

Most behavioral rules do not live in types or test names. They live in prose — README paragraphs, `<BestPractices>` bullets, Storybook story descriptions. These heuristics surface them.

- **Negative imperatives** — sentences that start with "Don't wrap...", "Never pass...", "Avoid...", "Do not...". These are almost always Shape 2, 4, or 5.
- **Naming / casing prescriptions** — "Title Case", "lowercase", "action-oriented", "starts with a verb". Route out as Shape 3.
- **Fuzzy thresholds** — "under ~10 items", "for fewer than 5 options", "past 3 tabs". The threshold is the rule. Preserve verbatim, do not round.
- **Cross-component anti-patterns** — "X next to Y produces Z", "do not put X inside Y". These are Shape 1 expressed as a trap; extract into both X's and Y's reference files (see cross-component duplication below).
- **Runtime-validator complements** — a runtime warning or dev-mode assertion the type system cannot enforce. "Throws in dev if children include another `<Modal>`", "warns if `aria-label` is set on a Button that renders text". Shape 2 or Shape 4.
- **Anti-substitution prose** — sentences containing `"not <PeerComponent>"`, `"do not reach for <PeerComponent>"`, `"<PeerComponent> is reserved for..."`, `"only reach for <PeerComponent> when..."`. These are Shape 7. The avoided peer is almost always outside the proposing set (experimental, deprecated, upstream-only) — that is precisely why the DS author wrote the rule.

---

## Two-marker convention

Two markers, no others, used consistently across every component file.

- **Backticks** for prop / value / literal API tokens: `disabled`, `primary`, `oclif/core`, `typeName='submit'`. Use backticks for anything an agent would type into code.
- **Markdown links** for peer-component graph edges: `[FormControl](./form-control.md)`, `[Combobox](./combobox.md)`. The link target is the sibling component's reference file inside the extracted skill, not the source repo URL. This turns the references directory into a navigable graph the agent can follow with one tool call.

Do not mix these. A component name in a "use X instead of Y" rule is a link. A prop name is backticks. Source `file:line` citations are plain text after the rule.

---

## Subsection threshold

The component file uses either a flat list or a subsectioned list. Pick once per component based on rule count and axis count, do not switch mid-file.

- **Flat bulleted list under `## Best Practices`** when the component has `<10 rules` AND `<3 axes` (e.g. only prop-usage rules, no a11y or default-state). Simple components: Avatar, Badge, Switch.
- **Subsectioned** when the component has `≥10 rules` OR `≥3 axes`. Split into the following subsections, **vocabulary verbatim, order verbatim**:

  ```
  ### When to use
  ### Behavior
  ### Content
  ### Accessibility
  ```

  Drop a subsection only if it is genuinely empty. Do not rename, do not reorder. The vocabulary is load-bearing — agents key off these exact strings when navigating the file.

---

## Per-component file skeleton

Every per-component reference file emitted into `references/components/<name>.md` follows the same skeleton. The skeleton is the agent's load contract — sections are addressable by exact heading text.

```markdown
---
title: <ComponentName>
description: <one-line behavioural summary, not a marketing tagline>
---

## Public imports

`import { <ComponentName> } from '<package>'`

## When to use

<Shape 1 paragraph: peer-component selection with verbatim thresholds and
[Sibling](./sibling.md) graph links. Omit subsection only if the component
has no sibling in the in-scope set.>

## Key props

- `propA` — <one-line semantics, default value, citation>
- `propB` — <one-line semantics, default value, citation>

## Best Practices

<Flat list OR subsections per the threshold rule below. Always present.>

## Composition examples

```tsx
<ComponentName propA="value">
  <ChildComponent />
</ComponentName>
```

<One short, real, copy-pasteable example. Lifted from a real consumer file
or setup docs verbatim — do not reconstruct from memory.>

## Source references

- `<package-path>/<component>.tsx:<line>` — implementation
- `<package-path>/<component>.docs.tsx` — prop table source

## Common mistakes

- <Inline anti-pattern: one sentence, names the wrong path and the right path.>

## Things to never invent

- Props not listed under "Key props".
- Values not enumerated in the source type.
- Sibling components not present in the in-scope set.
```

The eight headings (`Public imports`, `When to use`, `Key props`, `Best Practices`, `Composition examples`, `Source references`, `Common mistakes`, `Things to never invent`) are the contract enforced by `check-skill-docs.sh`. A missing heading fails the post-emit check.

---

## Universal coverage rule

Every component file ships a `## Best Practices` section. No exceptions. If no rules surfaced during extraction for a given component, the section contains exactly one line:

```
No special rules — use the API as documented.
```

Skipping the section breaks the routing table. The meta-skill's `check-skill-docs.sh` greps for the heading in every component file; a missing heading fails the post-emit check. Universal coverage is the contract that lets the agent trust the routing table at runtime.

---

## Cross-component rule duplication

The same rule lives in EACH component file where the trap can fire. Do NOT normalize to a single file.

Concrete example from Geist: the rule "don't wrap a labelled Input or Select in a Tooltip — put the hint on a sibling icon button" lives in `input.mdx`, `select.mdx`, and `tooltip.mdx`. Three copies, same prose. This is intentional.

The reasoning: an agent loading only `references/components/button.md` to extract a Button must see the `button-loading-not-inactive` rule in that file, even though the inactive-vs-disabled distinction might also be relevant when reasoning about other interactive components. Normalizing the rule into a shared `interaction-states.md` saves bytes and breaks correctness — the agent reading Button alone would miss it. Duplication is correctness; normalization is brittle.

Operational consequence: when you find a rule during extraction, ask "which components is this trap reachable from?" and write the same rule (same prose, same citation) into every reachable component's file. Do not abbreviate, do not back-reference, do not extract into a shared module.

---

## `[VERIFY]` marker usage

Mark any rule inline with `[VERIFY]` when one of the following is true:

- The source is ambiguous (the rule appears in docs but no code-level reference grounds it).
- The rule was lifted from prose docs without a corresponding type, test, or runtime check.
- The extraction agent could not fully verify the prop name, prop value, or component name cited in the rule.
- A claim about default behavior was inferred from a Storybook story rather than read from the implementation.

The marker is literal. Place it at the end of the rule line, before any citation:

```
- Use `loading` instead of swapping in a spinner so the button stays focusable and announces the busy state to assistive tech. [VERIFY] (button.docs.tsx:142)
```

`[VERIFY]` markers accumulate during extraction. `scripts/check-skill-docs.sh` greps for them and surfaces the count in the persist closing message ("Persisted 4 components, 47 rules, 3 `[VERIFY]` markers — review before shipping"). The user decides whether to ground them, drop them, or ship as-is.

Do not use `[VERIFY]` as a way to ship guesses. If a rule cannot be grounded after a second look, drop it. The marker exists for genuinely ambiguous source, not for hedge.
