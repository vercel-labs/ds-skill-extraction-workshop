---
name: ds
description: Build accessible UI with the local `ds/` design system — a thin per-project wrapper around `@primer/react` 38.26.0 covering Banner, ActionMenu, ActionList, DataTable, PageHeader, and SelectPanel. Use when the user asks for a Primer-styled page, a GitHub-style action menu, a sortable issue table, a filterable label picker, or a repo-style page header. Triggers — 'ds', 'primer', 'primer-react', 'github ui', 'action menu', 'select panel', 'page header', 'data table', 'banner'. Out of scope — tone of voice and marketing copy; route copy rules to a sibling skill. IMPORTANT: this file is an orchestrator. Load the references/ files named in the routing table; SKILL.md alone is insufficient.
---

# ds

## Mission

A `ds` skill is an adapter that teaches an agent how to build high-fidelity UI with this project's local `ds/` design system — a thin wrapper around `@primer/react` 38.26.0 and `@primer/primitives` 11.9.0. It is not a copy of the Primer documentation. It tells the agent what to read, what APIs are public, what sources are authoritative, and how to verify that generated UI uses the system correctly.

## Setup

`@primer/react` and `@primer/primitives` are already in `package.json` dependencies (`@primer/react@38.26.0`, `@primer/primitives@11.9.0`). The local wrapper at `ds/components/<Name>.tsx` re-exports each component; consumers import from `@/ds/components/<Name>` (path alias `@/* → ./*` configured in `tsconfig.json`).

Provider wiring — lifted verbatim from a real Primer-React consumer (the official Vite template). The host framework in this project is Next.js App Router, not Vite, so the snippet below must be ADAPTED to `app/layout.tsx`:

> Source: `primer/react-template` @ `src/index.jsx` (`vite`). Apply in your framework's root element — Next.js App Router: `app/layout.tsx` (inside `<body>`), Next.js Pages Router: `pages/_app.tsx`, Vite: `src/main.tsx`, CRA: `src/index.tsx`.

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Routes } from '@generouted/react-router'
import { ThemeProvider, BaseStyles } from '@primer/react'

import './reset.css'
import './globals.css'

import ColorModeSwitcher from './components/ColorModeSwitcher'

const rootElement = document.getElementById('root')
const root = createRoot(rootElement)

root.render(
    <StrictMode>
        <ThemeProvider colorMode="auto">
            <BaseStyles>
                <ColorModeSwitcher />
                <Routes />
            </BaseStyles>
        </ThemeProvider>
    </StrictMode>
)
```

Source: https://github.com/primer/react-template/blob/main/src/index.jsx (lines 1-21)

Companion: `index.html` sets `lang="en"` on `<html>` (https://github.com/primer/react-template/blob/main/index.html). Notes — `<ThemeProvider colorMode="auto">` reads OS preference; pass `"day"` or `"night"` to pin a single mode. `<BaseStyles>` is component-shaped wiring — render it once inside the provider; it applies `var(--fgColor-default)` over `var(--bgColor-default)` and the base font stack to the descendant tree. `<ColorModeSwitcher />` is illustrative application code, not wiring — lift the provider + `BaseStyles` + CSS imports verbatim; treat the switcher as the consumer's own UI.

## Import rules

- Canonical: `import { Banner } from "@/ds/components/Banner";` and the matching `@/ds/components/<Name>` paths for the other five components.
- Each wrapper re-exports from `@primer/react`, except `DataTable` which re-exports from `@primer/react/experimental` (the `/experimental` subpath is part of the public Primer API).
- Never deep-import from `@primer/react/lib-esm/...` or any other internal subpath — always go through the local `ds/components/<Name>.tsx` wrapper.

## Source-of-truth rules

- **Wrapper source** (highest authority for what is in scope): `ds/components/<Name>.tsx` — the named exports define the surface. `ds/components/<Name>.docs.tsx` carries the per-component headline rules (variant semantics, controlled-state pairing, slot composition, snapshot pattern, etc.).
- **Underlying types**: `node_modules/@primer/react/dist/index.d.ts` and `node_modules/@primer/react/experimental/index.d.ts` (for `DataTable`). Wins on conflict with prose docs.
- **Token CSS**: `node_modules/@primer/primitives/dist/css/functional/themes/light.css` (and the matching `dark.css`). Grep every cited `--bgColor-*` / `--fgColor-*` / `--borderColor-*` variable against this file to confirm it ships.
- **Foundation prose**: https://primer.style/product/getting-started/foundations/color-usage/ — six rules extracted into `references/tokens.md`. Cite anchors when referring back.
- **Wiring reference project**: https://github.com/primer/react-template — provider tree + CSS imports lifted verbatim into the Setup section above.
- Private / inaccessible: none in scope this run.

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| User asks for a component — banner, action menu, action list, data table, page header, or select panel | `references/components.md` | One `## <ComponentName>` section per component, each carrying Public imports / When to use / Key props / Best Practices / Composition example / Source references / Common mistakes / Things to never invent |
| User writes CSS or chooses colors / borders / text contrast / on-emphasis pairings | `references/tokens.md` | Six foundation rules (token-pairing, mode-aware, contrast-minimum, semantic-role) extracted from the Primer color-usage page; cited `### token/<slug>` subsections |
| Maintainer asks "what was inherited from where" or "what is in scope" | `AGENTS.md` | Cross-agent letter, source-by-source ledger, common-failure-modes |

## Hard rules

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. When a copy / naming / casing rule surfaces ("Title Case the label", "placeholder is action-oriented"), recognize it, route it — mention it as a candidate for a sibling copy skill — but do NOT extract it here.

- Any prop, variant, token, or asset that cannot be grounded in `ds/components/<Name>.tsx`, the published Primer types, or the shipped `@primer/primitives` CSS gets an inline `[VERIFY]` marker. Do not ship a guess.
- Never invent props or subcomponents. The local wrappers preserve every Primer subcomponent — they do not add any. If a prop is not in the underlying `@primer/react` type, it does not exist on the local wrapper.
- Never reference base-scale CSS variables (`--color-scale-*` such as `--color-scale-pink-5`). They are not exported as CSS in `@primer/primitives@11.9.0`. Use functional tokens only — see the token/functional-mode-binding rule in `references/tokens.md`.
- Report blockers instead of guessing. A missing types entry, a docs anchor that no longer resolves, or behavior the wrapper does not preserve is a blocker — surface it, do not paper over it.

## Final checks

After generating UI, emit a short summary: every component used cited to `ds/components/<Name>.tsx`, every CSS variable used cited to its `--bgColor-*` / `--fgColor-*` / `--borderColor-*` family in `references/tokens.md`, every `[VERIFY]` marker left unresolved, and the screen-level prompt the agent just built.
