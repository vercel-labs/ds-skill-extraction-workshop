# AGENTS — primer-react

Any agent building UI with this skill reads `SKILL.md` first (it is an orchestrator), then loads the `references/` files named in its routing table. SKILL.md alone is insufficient.

## What this skill covers

- Components: `Button`, `TextInput`, `FormControl`, `PageHeader` (`@primer/react@38.26.0`). Props are grounded in the package types under `node_modules/@primer/react/dist/<Component>/`.
- Tokens: `@primer/primitives@11.9.0` functional + theme CSS custom properties (`references/tokens.md` + `references/foundations/`).
- Assets: Octicons (`@primer/octicons-react`) — see `references/foundations/icons.md`.
- Composition exemplars lifted verbatim from a real consumer app (`vercel-labs/primer-nextjs-template`) in `references/examples/`.

## Common failure modes

- **Unpainted shell.** Editing an "already wired" `layout.tsx` / `globals.css` without re-confirming the body paints with `var(--bgColor-default)`. The shell invariants in `SKILL.md` `## Hard rules` must be re-checked on every shell-touching edit, not just at greenfield.
- **Inventing Button variants.** The `VariantType` union is exactly five values; `secondary` / `xs` do not exist.
- **Bare inputs.** A `TextInput` outside a `FormControl` loses label association and fails axe.
- **Inline SVG.** Use Octicon components, not hand-inlined `<svg>` — they carry the size enum and inherit `currentColor`.
- **Raw hex/px.** Use functional tokens; the neutral scale inverts between modes, so a hardcoded light-mode hex renders dark-on-dark in dark mode.

## Scope

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice and marketing copy — route copy rules to a sibling copy skill.
