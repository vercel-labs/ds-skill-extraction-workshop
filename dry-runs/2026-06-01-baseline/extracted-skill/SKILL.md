---
name: ds
description: Build accessible UI with the in-repo `ds` design system — a thin Primer wrapper (Button, TextInput, Checkbox, FormControl) with a tighter a11y floor than Primer's defaults. Use when the user asks for a sign-in form, a settings page, a labelled form, or any screen styled with `ds`. Triggers: 'ds', 'design system', 'primer', 'sign-in form', 'form with FormControl'. Scope: components, tokens, assets. Out of scope: tone of voice, marketing copy, product copywriting — route copy rules to a sibling skill, do not extract them here. IMPORTANT: this file is an orchestrator. Load the references/ files named in the routing table; SKILL.md alone is insufficient.
---

## Mission

A `ds` skill is an adapter that teaches an agent how to build high-fidelity apps with `ds`. It is not a copy of the documentation. It tells the agent what to read, what APIs are public, what sources are authoritative, and how to verify that generated UI uses the system correctly.

## Scope

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. When you encounter a copy/naming/casing rule during extraction (e.g. "Title Case the label", "placeholder is action-oriented"), recognize it, route it — mention it as a candidate for a sibling copy skill — but do NOT extract it into this DS skill.

## Setup

`ds` lives in-repo at `ds/` (it is not a published npm package). It re-exports four components from `@primer/react` 38.x. No provider mount is required by `ds` itself; `@primer/react` provides a `ThemeProvider` that consumers wrap their tree in for full styling — out of scope for this workshop's sign-in fixture.

Install (already done in the workshop starter): `pnpm install` resolves `@primer/react@38.26.0` and `@primer/primitives@11.9.0` per `package.json:14-16`.

## Import rules

- Import each component from its own file: `import { Button } from '@/ds/components/Button'`.
- Do NOT deep-import from `@primer/react` (e.g. `@primer/react/lib-esm/Button`). The wrapper exists to give the consumer a single named export per component; bypassing it defeats the wrapper.
- The `FormControl` re-export preserves Primer's compound subcomponents: `FormControl.Label`, `FormControl.Caption`, `FormControl.Validation`. Use them via dot-access, not separate imports.

## Source-of-truth rules

- `ds/DESIGN.md` — the headline a11y rules ("the floor"). When DESIGN.md and a JSDoc comment in `ds/components/*.tsx` disagree, DESIGN.md wins (e.g. the `disabled` vs `inactive` rule at `ds/DESIGN.md:12`). The contradicting JSDoc at `ds/components/Button.tsx:12-13` is a DS-team-side documentation bug — flagged `[VERIFY]`.
- `ds/components/*.tsx` — wrapper source. Cite for type signatures (props pass-through via `ComponentProps<typeof Primer*>`).
- `ds/components/*.docs.tsx` — per-component documentary examples and inline a11y rules (e.g. `Button.docs.tsx:2-7`, `FormControl.docs.tsx:4-5`).
- `@primer/react` types — the actual prop surface for every component (since `ds` types are `ComponentProps<typeof PrimerX>`).

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| User asks for a button or any clickable submit element | references/components.md | Headline rule lives in the `## Button` section: `component/button-disabled-not-inactive`. |
| User wires a text input or checkbox | references/components.md | Always wrap in `FormControl` — `component/formcontrol-wrap-inputs`. |
| User asks for a form with labels, captions, or validation | references/components.md | Compound `FormControl.Label` / `.Caption` / `.Validation` pattern lives there. |
| User asks about tokens, spacing, color | references/tokens.md | `ds/tokens.json` is a stub; runtime tokens come from `@primer/primitives` — `[VERIFY]` which subset is in scope. |
| User asks for a Bad / Good / Why on a specific trap | references/anti-patterns.md | One row per known trap. The `disabled` vs `inactive` trap is the headline. |

## Hard rules

- The `ds/DESIGN.md:12` headline rule is non-negotiable: on a submit button that is in-flight, use `disabled={isLoading}`, NOT `inactive={isLoading}`. `inactive` is a non-interactive *visual* state — screen readers still announce it as actionable, and keyboard users can still hit Enter and double-submit the form. Rule slug: `component/button-disabled-not-inactive`.
- Wrap every `TextInput` and `Checkbox` in `<FormControl>`. Bare inputs lose the label association and fail axe (ds/components/FormControl.docs.tsx:4-5). Rule slug: `component/formcontrol-wrap-inputs`.
- Do NOT pass `aria-label` to a `Button` that already renders visible text (ds/components/Button.docs.tsx:2-7). The accessible name silently drifts from the visual label. Rule slug: `component/button-no-redundant-aria-label`.
- Any prop, variant, token, or asset the agent cannot ground in `ds/components/*.tsx` or the resolved `@primer/react` types gets a literal `[VERIFY]` marker inline. Mark unverifiable facts `[VERIFY]`. Report blockers instead of guessing.

## Final checks

After generating UI styled with `ds`, the closing summary must:

- Cite each component used to its source file in `ds/components/`.
- List any `[VERIFY]` markers left in the generated code.
- Name the screen-level prompt that produced the UI.
- Confirm the submit button (if any) uses `disabled`, not `inactive`, per the headline rule.
