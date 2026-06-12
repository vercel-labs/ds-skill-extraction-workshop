---
name: primer-react
description: Build accessible UI with Primer React, GitHub's design system (Button, IconButton, TextInput, Textarea, Select, Checkbox, FormControl, Heading, Text, Stack, Label, CounterLabel, Flash, StateLabel, BranchName). Use when the user asks for a Primer-styled page, a GitHub-style screen, or wires Primer tokens through @primer/primitives. Triggers: 'primer', 'primer react', '@primer/react', 'github ui', 'octicons'. Scope: components, tokens, assets. Out of scope: tone of voice and marketing copy — route copy rules to a sibling skill. IMPORTANT: this file is an orchestrator. Load the references/ files named in the routing table; SKILL.md alone is insufficient.
---

## Mission

A `primer-react` skill is an adapter that teaches an agent how to build high-fidelity apps with Primer React. It is not a copy of the documentation. It tells the agent what to read, what APIs are public, what sources are authoritative, and how to verify that generated UI uses the system correctly.

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. When you encounter a copy/naming/casing rule during generation (e.g. "Title Case the label", "placeholder is action-oriented"), recognize it, route it — mention it as a candidate for a sibling copy skill — but do NOT extract it into this DS skill.

## Setup

Install:

```bash
npm install @primer/react @primer/primitives @primer/octicons-react
```

Wire the provider in `app/layout.tsx` (verbatim from `vercel-labs/primer-nextjs-template@app/layout.tsx`):

```tsx
"use client";

import "./globals.css";

import { BaseStyles, ThemeProvider } from "@primer/react";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-color-mode="auto"
      data-light-theme="light"
      data-dark-theme="dark"
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider colorMode="auto">
          <BaseStyles
            style={{
              backgroundColor: "var(--bgColor-default)",
              height: "100vh",
            }}
          >
            {children}
          </BaseStyles>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Source: `vercel-labs/primer-nextjs-template@app/layout.tsx`.

`"use client"` is required because `ThemeProvider colorMode="auto"` reads the browser preference at runtime. `suppressHydrationWarning` on `<html>` is required because the provider writes the resolved mode attribute during hydration.

### Companion CSS — app/globals.css

```css
/* Primer Primitives — design tokens (CSS custom properties).
   Base + functional primitives establish the token baseline that the
   composition exemplars read (size, border, shadow, typography). Themes
   live in this file too so all primitives CSS lives in one place. */
@import "@primer/primitives/dist/css/base/size/size.css";
@import "@primer/primitives/dist/css/base/typography/typography.css";
@import "@primer/primitives/dist/css/base/motion/motion.css";
@import "@primer/primitives/dist/css/functional/motion/motion.css";
@import "@primer/primitives/dist/css/functional/size/border.css";
@import "@primer/primitives/dist/css/functional/size/breakpoints.css";
@import "@primer/primitives/dist/css/functional/size/radius.css";
@import "@primer/primitives/dist/css/functional/size/size-coarse.css";
@import "@primer/primitives/dist/css/functional/size/size-fine.css";
@import "@primer/primitives/dist/css/functional/size/size.css";
@import "@primer/primitives/dist/css/functional/size/viewport.css";
@import "@primer/primitives/dist/css/functional/spacing/space.css";
@import "@primer/primitives/dist/css/functional/typography/typography.css";

@import "@primer/primitives/dist/css/functional/themes/light.css";
@import "@primer/primitives/dist/css/functional/themes/dark.css";

html,
body {
  min-height: 100%;
}

body {
  background-color: var(--bgColor-default);
  color: var(--fgColor-default);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}
```

Source: `vercel-labs/primer-nextjs-template@app/globals.css`.

Both `light.css` AND `dark.css` MUST be imported when `data-color-mode="auto"` is set. Importing only one branch leaves the other unpainted — the canonical mode-mismatch bug.

## Import rules

- Canonical import path is `@primer/react`. Do NOT reach for `@primer/react/lib-esm/<Component>`, `@primer/react/dist/<Component>`, or any other internal subpath — those are not public. Source: `node_modules/@primer/react/package.json` (`exports` field; root export is the only public surface).
- Icons import from `@primer/octicons-react`: `import { AlertIcon } from '@primer/octicons-react'`. Source: `node_modules/@primer/octicons-react/dist/icons.d.ts`.
- Tokens are consumed as CSS variables (`var(--bgColor-default)`), not via the legacy `theme` JS object. Source: `https://primer.style/product/primitives/#css-variables`.

## Source-of-truth rules

- **Canonical source (code, wins on conflict):** `node_modules/@primer/react/dist/**/*.d.ts` — prop signatures, variant unions, native-attribute passthroughs. Every positive prop claim in `references/components/*.md` is cited to a `dist/**/*.d.ts:line`.
- **Tokens (code):** `node_modules/@primer/primitives/dist/css/functional/themes/{light,dark}.css` — the per-mode functional token definitions.
- **Assets (code):** `node_modules/@primer/octicons-react/dist/icons.d.ts` — the exhaustive export inventory; never invent a `*Icon` name.
- **Docs (prose, cited not extracted for prop claims):** `https://primer.style/product/`, `https://primer.style/product/primitives/`, `https://primer.style/octicons/`, `https://primer.style/accessibility/` — extracted prose rules (tokens, octicons) live in `references/foundations/*.md` with per-URL citations.
- **Storybook:** the Primer Storybook is JS-rendered; do not fetch it for prop claims. Story sources live alongside the component code at `packages/react/src/<Component>/<Component>.stories.tsx` in the `primer/react` repo.
- **Reference project:** `vercel-labs/primer-nextjs-template@main` — the verbatim wiring source for Setup above and for the 6 composition exemplars under `references/examples/`.

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| user asks for a button (filled/danger/loading) | references/components/button.md | per-component file |
| user asks for an icon-only button | references/components/icon-button.md | aria-label is the accessible name + tooltip text |
| user asks for a single-line input | references/components/text-input.md | leading/trailing visuals, loading, validationStatus |
| user asks for a multi-line input | references/components/textarea.md | resize, characterLimit, validationStatus |
| user asks for a select | references/components/select.md | styled native `<select>`; `multiple` is omitted |
| user asks for a checkbox | references/components/checkbox.md | indeterminate, required, ARIA-only validationStatus |
| user wires a form (label + caption + validation) | references/components/form-control.md | a11y composition rules (Label/Caption/Validation/LeadingVisual subcomponents) |
| user asks for a heading | references/components/heading.md | semantic `as` + visual `variant` |
| user asks for inline text | references/components/text.md | size/weight; no semantic foreground variant |
| user asks for a layout container | references/components/stack.md | gap/direction/align/justify/wrap/padding scales, Stack.Item |
| user asks for a metadata badge | references/components/label.md | metadata only — never a lifecycle capsule |
| user asks for a numeric count badge | references/components/counter-label.md | numeric count next to a label |
| user asks for an inline banner / alert | references/components/flash.md | variant: default/warning/success/danger; `full` for edge-to-edge |
| user asks for a PR/issue lifecycle pill | references/components/state-label.md | required `status` keyed to the lifecycle octicon map |
| user asks for a branch chip / branch name | references/components/branch-name.md | renders `<a>` by default; `as="span"` for non-link chips |
| user composes a screen, page, or section layout | references/design-craft.md | DS-agnostic design-craft defaults, shipped verbatim by the meta-skill — the DS wins on conflict |
| user picks tokens for color, spacing, radius, shadow | references/tokens.md | consumed-token ledger (12 tokens) + foundation rule subsections |
| user reads token and theme foundation prose | references/foundations/index.md | per-URL extracted foundation rules |
| user reviews available composition exemplars | references/examples/index.md | one entry per composition exemplar lifted from `vercel-labs/primer-nextjs-template` |
| home: route-index with token-painted link cards | references/examples/home.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/page.tsx |
| repos: list page with PageHeader + table + filter | references/examples/repos.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/repos/page.tsx |
| new: form page with token-painted card + action footer | references/examples/new.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/new/page.tsx |
| settings: sidebar-nav page | references/examples/settings.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/settings/page.tsx |
| empty: blankslate visual + heading + action | references/examples/empty.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/empty/page.tsx |
| dashboard: multi-section stat cards + timeline | references/examples/dashboard.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/dashboard/page.tsx |
| user reads a known anti-pattern (shell, body-paint, mode-attr) | references/anti-patterns.md | Bad/Good/Why table, shell/* rows |

## Component slate

- `Button` — action trigger; variant/size/loading/inactive, leadingVisual/trailingVisual slots, count
- `IconButton` — icon-only button; `aria-label` required, doubles as tooltip unless `unsafeDisableTooltip`
- `TextInput` — single-line input; leading/trailingVisual, loading, validationStatus, monospace
- `Textarea` — multi-line input; resize, characterLimit, validationStatus
- `Select` — styled native select; block/contrast/placeholder/validationStatus
- `Checkbox` — controlled boolean input; indeterminate, validationStatus
- `FormControl` — input wrapper; Label/Caption/Validation/LeadingVisual subcomponents for label association
- `Heading` — semantic heading; `as="h2"` default, variant scale
- `Text` — inline text primitive; size/weight/whiteSpace
- `Stack` — flex layout primitive; gap/direction/align/justify, Stack.Item
- `Label` — small metadata badge; variant/size
- `CounterLabel` — numeric count badge; scheme/variant
- `Flash` — inline banner; variant default/success/warning/danger, full-width option
- `StateLabel` — lifecycle state capsule; required `status` keyed to the lifecycle octicon map (open/merged/closed)
- `BranchName` — branch chip; renders `<a>` by default (`as` defaults to `'a'`)

## Hard rules

- The body/root MUST paint with `var(--bgColor-default)` via either the `<BaseStyles style={{ backgroundColor: "var(--bgColor-default)" }}>` style prop OR `body { background-color: var(--bgColor-default); color: var(--fgColor-default); }` in `globals.css` — both belt-and-braces is the wiring lifted from the reference project. A token-painted component on an unpainted shell is the canonical mode-mismatch bug — see `references/anti-patterns.md` `shell/unpainted-body`.
- The `<ThemeProvider>` MUST wrap children, not render as a sibling: `<ThemeProvider><BaseStyles>{children}</BaseStyles></ThemeProvider>`. Provider context only reaches descendants — see `shell/provider-not-sibling`.
- `<BaseStyles>` MUST receive `{children}` (not siblings) — descendants inherit Primer's reset (line-height, font, link color) only through the wrap — see `shell/content-wrap-base-styles`.
- `<html data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">` MUST be paired with BOTH `@import "@primer/primitives/dist/css/functional/themes/light.css"` AND `@import ".../dark.css"` in `globals.css`. The attribute sets the resolution context; the imports provide the values — see `shell/mode-attribute-without-theme-import`.
- `suppressHydrationWarning` MUST be set on `<html>` when ThemeProvider is mounted. The provider writes the resolved color-mode attribute during hydration and React would otherwise warn — see `shell/suppress-hydration-warning`.
- Any prop, variant, token, or asset the agent cannot ground in source gets a literal `[ VERIFY ]` (no spaces in actual use) marker inline — see the skill's open VERIFY tally in references/foundations/octicons.md:23.
- Report blockers instead of guessing.

## Final checks

After generating UI: cite each component used to its source file (`node_modules/@primer/react/dist/<Component>/<Component>.d.ts:<line>` for prop claims, `vercel-labs/primer-nextjs-template@<path>` for composition lifts); list any unverified facts (`[ VERIFY ]` markers, written without internal spaces) that had to remain; name the screen-level prompt that was built; and confirm shell parity: the page/root surface paints with `var(--bgColor-default)`, the mode-attribute trio on `<html>` matches the imported theme CSS files (`light.css` + `dark.css`), and `<ThemeProvider>` wraps `<BaseStyles>{children}</BaseStyles>` rather than rendering as a sibling. Shell parity is re-checked after ANY edit to the consumer app's `layout.tsx` / providers / `globals.css`, not only on greenfield creation.
