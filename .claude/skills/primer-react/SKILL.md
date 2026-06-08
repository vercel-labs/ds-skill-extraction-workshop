---
name: primer-react
description: Build accessible GitHub-style UI with the Primer React design system (Button, FormControl, TextInput, Select, PageLayout, Stack). Use when the user asks for a Primer-styled page, a Primer form, a GitHub-like settings/dashboard/repo screen, or wires ThemeProvider/BaseStyles. Triggers: 'primer', 'primer react', '@primer/react', 'primer form', 'octicons'. Scope: components, tokens, assets. Out of scope: tone of voice and marketing copy — route copy rules to a sibling skill. IMPORTANT: this file is an orchestrator. Load the references/ files named in the routing table; SKILL.md alone is insufficient.
---

# primer-react

A `primer-react` skill is an adapter that teaches an agent how to build high-fidelity apps with Primer (GitHub's design system). It is not a copy of the documentation. It tells the agent what to read, what APIs are public, what sources are authoritative, and how to verify that generated UI uses the system correctly.

Scope reminder: In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. When you encounter a copy/naming/casing rule, recognize it, route it to a sibling copy skill — do NOT extract it here.

## Setup

Install the design system, its primitives (tokens), and the icon package:

```bash
npm install @primer/react@38.26.0 @primer/primitives@11.9.0 @primer/octicons-react@19.28.1
```

Mount `ThemeProvider` + `BaseStyles` at the application root and set the color-mode attributes on `<html>`. Wiring lifted verbatim from the reference project:

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

Source: vercel-labs/primer-nextjs-template @ app/layout.tsx:1-30

- `data-color-mode="auto"` selects light/dark by system preference; functional tokens re-resolve when it changes.
- `data-light-theme` / `data-dark-theme` name the themes applied in each mode.
- `suppressHydrationWarning` travels with `data-color-mode="auto"` — the mode resolves client-side and would otherwise trip a hydration mismatch on `<html>`.
- `BaseStyles` must wrap content *inside* `ThemeProvider`; it applies Primer's base typography/color resets and is where the `--bgColor-default` page background is set.

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

Source: vercel-labs/primer-nextjs-template @ app/globals.css

## Import rules

- Canonical import is the barrel: `import { Button, FormControl, TextInput, Select, PageLayout, Stack } from '@primer/react'`.
- Icons import from the octicons package: `import { PlusIcon } from '@primer/octicons-react'`.
- A few components are published only from the experimental entrypoint: `import { Blankslate } from '@primer/react/experimental'`. The path is load-bearing — these are NOT on the root barrel.
- Never deep-import internal paths (`@primer/react/lib-esm/Button`). The barrel and the documented `/experimental` entrypoint are the only public surfaces.

## Source-of-truth rules

Code wins on conflict with docs.

- Prop tables: `@primer/react/generated/components.json` (the published, generated prop manifest) and `@primer/react/dist/index.d.ts`.
- Tokens: CSS custom properties under `@primer/primitives@11.9.0/dist/css/` (functional themes + base + size + typography).
- Icons: `@primer/octicons-react@19.28.1/dist/icons.d.ts` (the export list is the inventory — do not invent icon names).
- Foundations prose: https://primer.style/product/getting-started/foundations (extracted into `references/foundations/`).
- Wiring: lifted verbatim from `vercel-labs/primer-nextjs-template`.

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| user asks for any of Button / FormControl / TextInput / Select / PageLayout / Stack | references/components.md | single-file: one `## <Component>` section each, all 8 subsections |
| user picks colors, surfaces, emphasis, or mode-aware styling | references/foundations/colors.md | functional token pairing, contrast, base-token prohibition |
| user sets type sizes, weights, or heading order | references/foundations/typography.md | rem-unit + weight-token rules |
| user composes page regions, panes, or content max-width | references/foundations/spacing-layout.md | viewport ranges + pane positioning |
| user makes a layout responsive | references/foundations/responsive.md | min viewport, touch targets, user-preference media |
| user adds icons | references/foundations/icons.md | decorative vs contentful a11y contracts |
| user wants a raw token name + value | references/tokens.md | per-token entries (color/size/type) |
| user reviews available foundation rules | references/foundations/index.md | sub-index of every foundation page |
| user reviews available composition exemplars | references/examples/index.md | one entry per exemplar lifted from the reference project |
| home: page chrome with PageHeader title contract | references/examples/home.md | composition exemplar lifted from primer-nextjs-template/app/page.tsx |
| dashboard: PageLayout Header+Content sections | references/examples/dashboard.md | composition exemplar lifted from primer-nextjs-template/app/dashboard/page.tsx |
| repos: PageHeader.Actions with primary CTA | references/examples/repos.md | composition exemplar lifted from primer-nextjs-template/app/repos/page.tsx |
| settings: two-panel Pane + Content layout | references/examples/settings.md | composition exemplar lifted from primer-nextjs-template/app/settings/page.tsx |
| new: standalone token-painted form card | references/examples/new.md | composition exemplar lifted from primer-nextjs-template/app/new/page.tsx |
| empty: Blankslate empty state | references/examples/empty.md | composition exemplar lifted from primer-nextjs-template/app/empty/page.tsx |
| user reaches for a raw hex / px value or a forbidden import | references/anti-patterns.md | Bad \| Good \| Why rows |

## Hard rules

- Any prop, variant, token, or asset the agent cannot ground in source gets a literal `[VERIFY]` marker inline. Report blockers instead of guessing.
- Color, spacing, radius, shadow, and type come from Primer tokens (`var(--bgColor-*)`, `var(--fgColor-*)`, `var(--borderColor-*)`, `var(--shadow-*)`, `var(--base-size-*)`). Never raw hex or px when a token exists.
- Every form field is wrapped in `<FormControl>` with `FormControl.Label`. Bare inputs lose label association and fail a11y.
- Icons come from `@primer/octicons-react`. Never hand-roll SVG; never invent an icon name not in the package exports.
- Do not invent props or variant values. If `generated/components.json` / the types file does not export it, it does not exist.

## Final checks

After generating UI, emit a closing summary that:

1. Cites each Primer component used to `references/components.md` (`## <Component>`).
2. Lists any `[VERIFY]` markers left in the output.
3. Names the screen-level prompt just built and confirms tokens (not raw values) carry all color/space/type.
