---
name: ds
description: Build accessible UI with the project's `ds` design system — a thin wrapper around @primer/react that tightens Primer's a11y floor. Components in scope (Button, TextInput, Checkbox, FormControl). Use when the user asks for a form, an input, a submit flow, a settings screen, or any UI styled with `ds`. Triggers — `ds`, `Primer`, `Primer React`, `FormControl`. Scope — components, tokens, assets. In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting; route copy rules to a sibling skill. IMPORTANT: this file is an orchestrator. Load the references/ files named in the routing table; SKILL.md alone is insufficient.
---

# ds — design-system skill

## Mission

A `ds` skill is an adapter that teaches an agent how to build high-fidelity UI with `ds`. It is not a copy of the documentation. It tells the agent what to read, what APIs are public, what sources are authoritative, and how to verify that generated UI uses the system correctly. `ds` is a thin wrapper over @primer/react that exists to tighten the parts where Primer's defaults are wrong for the project's a11y bar; the canonical example is `disabled` vs `inactive` on submit buttons (`ds/DESIGN.md:12-14`).

## Setup

Both packages ship in the project's `package.json` (`@primer/react@38.26.0`, `@primer/primitives@11.9.0`). No provider mount is required for the components currently in scope — Primer's CSS-modules build is loaded transitively by the components themselves. To use the tokens, import the primitives CSS once from your root layout (`app/layout.tsx`):

```tsx
import "@primer/primitives/dist/css/functional/themes/light.css";
import "@primer/primitives/dist/css/functional/size/size.css";
import "@primer/primitives/dist/css/functional/typography/typography.css";
```

These CSS files expose CSS custom properties (`--bgColor-*`, `--fgColor-*`, `--button-*`, etc.) consumed by the components and available to your own CSS.

## Import rules

- Import every component from its `ds` wrapper, not from `@primer/react` directly:
  - `import { Button } from "@/ds/components/Button"` — wraps `@primer/react` `Button` (`ds/components/Button.tsx:17-19`).
  - `import { TextInput } from "@/ds/components/TextInput"` — wraps `@primer/react` `TextInput` (`ds/components/TextInput.tsx:13-15`).
  - `import { Checkbox } from "@/ds/components/Checkbox"` — wraps `@primer/react` `Checkbox` (`ds/components/Checkbox.tsx:13-15`).
  - `import { FormControl } from "@/ds/components/FormControl"` — re-export of Primer's compound `FormControl`, preserving `FormControl.Label`, `FormControl.Caption`, `FormControl.Validation` (`ds/components/FormControl.tsx:20-22`).
- Do NOT deep-import from `@primer/react` (e.g. `@primer/react/dist/Button/Button`). The JSDoc on each wrapper explicitly forbids it — the wrapper is the public API.
- Do NOT bypass a `ds` wrapper to import the underlying `@primer/react` component directly. The wrapper is where future tightening will land; bypassing it skips the floor.

## Source-of-truth rules

Authority order (code wins on conflict, top wins on tie):

1. `ds/DESIGN.md` — the floor doc. Headline rules live here.
2. `ds/components/*.docs.tsx` — per-component documentary examples with embedded a11y rules.
3. `node_modules/@primer/react/dist/**/*.d.ts` — published types for prop signatures and unions.
4. `node_modules/@primer/primitives/dist/css/functional/**` — canonical token sources.
5. `ds/components/*.tsx` — the wrappers themselves (1:1 re-exports today; the place future overrides will live).

Known conflict: the JSDoc on `ds/components/Button.tsx:12-13` says "prefer `inactive` over `disabled`". This directly contradicts `ds/DESIGN.md:12-14` and `ds/components/Button.docs.tsx`. DESIGN.md wins. See `references/components.md` → Button → Common mistakes.

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| User asks for any button, input, checkbox, form, or composes a form | [references/components.md](references/components.md) | Per-component contract: imports, props, a11y, composition, source citations. Always load before writing JSX. |
| User asks about colors, spacing, typography, or reaches for a raw hex/px | [references/tokens.md](references/tokens.md) | Headline rule lives here: never use raw values. |
| About to ship anything resembling a known trap (disabled-vs-inactive, bare input, redundant aria-label) | [references/anti-patterns.md](references/anti-patterns.md) | Bad / Good / Why for every rule slug below. |

## Hard rules

- Do not invent props, variants, slots, or tokens. If the published types file does not export it, it does not exist. The verified prop surfaces are enumerated in `references/components.md`; anything outside that list is a hallucination.
- Any rule, prop, or value the agent cannot ground in source gets a literal `[VERIFY]` marker inline. Mark unverifiable facts `[VERIFY]`. Report blockers instead of guessing.
- Do not bypass `ds` wrappers to deep-import `@primer/react`. The wrapper is the public API; deep paths are unstable and skip the project's a11y floor.
- Do not encourage raw CSS values when a Primer primitive token covers the case. The primitives CSS file states it at line 3: "Never use raw values (hex/px). Use semantic tokens ONLY." (`@primer/primitives/dist/css/functional/themes/light.css:3`).
- The conflict between `ds/components/Button.tsx:12-13` JSDoc and `ds/DESIGN.md:12-14` is resolved in favor of DESIGN.md. Do not let the wrapper's JSDoc mislead the rule choice.

## Final checks

After generating UI, the agent must emit a closing block:

- Cite every `ds` component used to its wrapper file (`ds/components/<Name>.tsx`).
- List every `[VERIFY]` marker left in the generated code or in the explanation.
- Name the screen-level prompt it just built (one phrase, e.g. "billing settings screen", "login form").
- Confirm no raw hex / px values made it into the output (or call out the exception with a reason).
