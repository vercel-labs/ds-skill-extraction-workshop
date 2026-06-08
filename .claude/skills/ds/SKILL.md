---
name: ds
description: Build accessible UI with the project's `ds` design system — a thin Primer React wrapper exposing Button, IconButton, FormControl, Flash. Use when the user asks for a GitHub-style page, a form with validation, a flash banner, or icon actions. Triggers: 'ds', 'primer', 'button', 'form control', 'flash', 'icon button', 'github-style'. Scope: components, tokens, assets. Out of scope: tone of voice and marketing copy — route copy rules to a sibling skill. IMPORTANT: this file is an orchestrator. Load the references/ files named in the routing table; SKILL.md alone is insufficient.
---

## Scope

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting — route copy rules to a sibling skill.

## Mission

A `ds` skill is an adapter that teaches an agent how to build high-fidelity apps with the Primer React design system (`@primer/react`). It is not a copy of the documentation. It tells the agent what to read, what APIs are public, what sources are authoritative, and how to verify that generated UI uses the system correctly.

## Setup

```bash
npm install @primer/react @primer/primitives @primer/octicons-react
```

Provider wiring — wrap the app root in `ThemeProvider`:

```tsx
import { ThemeProvider, BaseStyles } from '@primer/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <BaseStyles>
        {children}
      </BaseStyles>
    </ThemeProvider>
  );
}
```

Source: https://primer.style/guides/react#getting-started

## Import rules

Canonical import path: `@primer/react`. All public components are barrel-exported.

```tsx
import { Button, IconButton, FormControl, Flash } from '@primer/react';
```

Icons import from `@primer/octicons-react`:

```tsx
import { AlertIcon, TrashIcon, SearchIcon } from '@primer/octicons-react';
```

Deep imports (e.g. `@primer/react/lib-esm/Button`) are forbidden — internal paths are not part of the public API.

## Source-of-truth rules

- Code wins on conflict with docs.
- Types: `node_modules/@primer/react/dist/` — the published `.d.ts` files are the canonical prop surface.
- Tokens: `node_modules/@primer/primitives/dist/css/` — CSS custom properties are the canonical token names.
- Icons: `node_modules/@primer/octicons-react/dist/` — exported icon components are the canonical asset inventory.

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| user asks for a button or action trigger | references/components.md `## Button` | variant, size, loading, leadingVisual |
| user asks for an icon-only button | references/components.md `## IconButton` | requires `aria-label`, tooltip built-in |
| user wires a form or needs label association | references/components.md `## FormControl` | sub-components: Label, Caption, Validation, LeadingVisual |
| user asks for a flash banner or status message | references/components.md `## Flash` | variant: default, warning, success, danger |
| user needs token names for color, spacing, or type | references/tokens.md | semantic token names from @primer/primitives |
| user needs to avoid raw CSS values | references/anti-patterns.md | Bad/Good/Why table for token discipline |

## Hard rules

- Do not invent props, variants, icons, assets, tokens, or setup steps. If the types file does not export it, it does not exist.
- Mark unverifiable facts `[VERIFY]`. Report blockers instead of guessing.
- Copy wiring verbatim from setup docs. Do not reconstruct from memory.
- Every icon referenced must exist in `@primer/octicons-react` exports. Do not invent icon names.

## Final checks

After generating UI with this skill, the agent must:

1. Cite each component used to its source (`@primer/react` barrel export).
2. List any `[VERIFY]` markers left in the generated output.
3. Name the screen-level prompt just built ("a settings page", "a form with validation").
