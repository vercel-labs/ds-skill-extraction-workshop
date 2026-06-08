# AGENTS — primer-react

Any agent touching this skill reads `SKILL.md` first, then the per-domain files named in its routing table. SKILL.md is the orchestrator; the references carry the manual.

## What this skill is

An adapter for building high-fidelity GitHub-style UI with Primer React (`@primer/react@38.26.0`, `@primer/primitives@11.9.0`, `@primer/octicons-react@19.28.1`). It teaches what to read, what is public API, what is authoritative, and how to verify generated UI uses Primer correctly. It is not a copy of the Primer docs.

## Scope

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. The `content` foundation page from the Primer docs was routed OUT to a sibling copy skill, not extracted here.

## Load order

1. `SKILL.md` — Setup wiring, import rules, source-of-truth, routing table, hard rules.
2. `references/components.md` — the 6 proposing components (Button, FormControl, TextInput, Select, PageLayout, Stack), 8 sections each.
3. `references/tokens.md` — color / size / type token values.
4. `references/foundations/index.md` → individual foundation pages — prose token rules.
5. `references/examples/index.md` → composition exemplars lifted from the reference project.
6. `references/anti-patterns.md` — cross-cutting Bad | Good | Why traps.

## Common agent failure modes

- Inlining raw hex/px instead of `var(--token)`. Color, space, radius, shadow, and type all have tokens.
- Rendering inputs without a wrapping `FormControl` + `FormControl.Label` — the headline a11y rule.
- Deep-importing internal paths instead of the `@primer/react` barrel (or `/experimental` for experimental components).
- Inventing props/variants. If `generated/components.json` does not export it, it does not exist; mark unverifiable claims `[VERIFY]`.
- Hand-rolling SVG icons instead of using `@primer/octicons-react`.

## Coverage gaps

The proposing set is 6 of ~78 Primer components. Overlays/dialogs, data-display, navigation, and inputs beyond the core set are not covered. If a prompt needs them, run a second extraction with an expanded slate.
