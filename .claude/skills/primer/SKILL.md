---
name: primer
description: Build accessible UI with GitHub's Primer React design system (PageLayout, Stack, PageHeader, Heading, Text, Button, FormControl, Label) wired with `@primer/react` + `@primer/primitives` tokens + `@primer/octicons-react`. Use when the user asks for a Primer-styled page, a GitHub-styled UI, a Primer form, or wires `<ThemeProvider>` + `<BaseStyles>` into Next.js. Triggers: 'primer', 'primer react', '@primer/react', 'github ui', 'octicons'. Scope: components, tokens, assets. In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice and marketing copy — route copy rules to a sibling skill. IMPORTANT: this file is an orchestrator. Load the references/ files named in the routing table; SKILL.md alone is insufficient.
---

# Primer

## Mission

A `primer` skill is an adapter that teaches an agent how to build high-fidelity apps with Primer React (GitHub's design system). It is not a copy of the Primer documentation. It tells the agent what to read, what APIs are public, what sources are authoritative, and how to verify that generated UI uses the system correctly — including the mode-aware paint contract that breaks the moment the body is left unpainted.

## Setup

Install:

```bash
npm install @primer/react @primer/primitives @primer/octicons-react
```

Root layout (Next.js App Router), lifted verbatim from the reference project:

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

Source: `vercel-labs/primer-nextjs-template/app/layout.tsx:1-30` (https://github.com/vercel-labs/primer-nextjs-template/blob/main/app/layout.tsx)

The four wiring elements travel together: `<html>` `data-color-mode` / `data-light-theme` / `data-dark-theme` attrs + `suppressHydrationWarning`, `<ThemeProvider colorMode>`, `<BaseStyles>` with `backgroundColor: var(--bgColor-default)` inline, and the body-paint rule in `globals.css` below. Drop any one and the dark-mode surface paint breaks — see `## Hard rules` and `references/anti-patterns.md`.

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

Source: `vercel-labs/primer-nextjs-template/app/globals.css` (https://github.com/vercel-labs/primer-nextjs-template/blob/main/app/globals.css)

The `"use client"` directive on `app/layout.tsx` is required: `<ThemeProvider>` and `<BaseStyles>` read browser preference at boot, so server-rendering without the directive produces a hydration mismatch.

## Import rules

- Canonical import path: `@primer/react` (barrel). Use `import { Button, Heading } from "@primer/react";` — never a deep path like `@primer/react/lib-esm/Button`.
- Experimental components live behind a separate entry: `import { DataTable, Blankslate } from "@primer/react/experimental";`. The `repos` and `empty` exemplars use this path; treat it as a public sub-barrel, not internal.
- Icons import from `@primer/octicons-react`: `import { RepoIcon, GearIcon } from "@primer/octicons-react";`. The `Icon` type is also exported from this package for typed icon-as-prop patterns.
- Token CSS imports from `@primer/primitives/dist/css/...` — these are the only deep imports that ARE public. The full set is enumerated in the `globals.css` block above.

## Source-of-truth rules

Code wins on conflict with docs.

- Component implementations + types: `node_modules/@primer/react/lib-esm/` (after install). `@primer/react@38.26.0` is the validated version.
- Token CSS: `node_modules/@primer/primitives/dist/css/`. Every `var(--bgColor-*)`, `var(--fgColor-*)`, `var(--borderColor-*)`, `var(--base-size-*)`, `var(--borderRadius-*)` grep-resolves against this tree.
- Asset package: `@primer/octicons-react@19.28.0`. The exported set is the inventory; do not invent icon names.
- Docs site (cited, not authoritative for prop shapes): https://primer.style/
- Reference project (wiring source): https://github.com/vercel-labs/primer-nextjs-template

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| user asks for any component in the proposing set (PageLayout, Stack, PageHeader, Heading, Text, Button, FormControl, Label) | references/components.md | single-file mode (8 components < 10) — one `## <ComponentName>` section per component |
| user asks about tokens (color, surface, foreground, border, spacing, type) | references/tokens.md + references/foundations/colors.md | tokens.md is the index; per-token-rule subsections live in foundations/ |
| user wires color-mode / dark mode / `data-color-mode` / surface paint | references/foundations/colors.md | mode-aware token swaps, emphasis vs muted vs onEmphasis pairing, contrast minimums |
| user asks for typography / Heading scale / font weight | references/foundations/typography.md | rem-based scale, semantic heading order, weight-via-token |
| user asks for spacing / padding / page layout / Pane width | references/foundations/spacing-layout.md | page-type taxonomy, viewport ranges, Content/Pane padding |
| user asks about responsive breakpoints / user-preference media | references/foundations/responsive.md | breakpoints, prefers-* features, AA target-size minimum |
| user asks about icons / Octicon sizing | references/foundations/icons.md | Octicon size inventory (12/16/24/48/96); rules limited — see [VERIFY] |
| user reviews available composition exemplars | references/examples/index.md | one entry per composition exemplar lifted from the reference project |
| home: page chrome as a narrow vertical Stack capped at 768px | references/examples/home.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/page.tsx |
| repos: list page with DataTable + Table.Container | references/examples/repos.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/repos/page.tsx |
| new: form page with token-painted card + FormControl rows | references/examples/new.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/new/page.tsx |
| settings: sidebar-nav page with PageLayout.Pane | references/examples/settings.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/settings/page.tsx |
| empty: empty-state page with Blankslate from experimental | references/examples/empty.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/empty/page.tsx |
| dashboard: app-shell page with PageLayout containerWidth=large | references/examples/dashboard.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/dashboard/page.tsx |
| user trips a paint/wiring/mode bug (card painted, body unpainted; provider sibling; missing theme import) | references/anti-patterns.md | Bad/Good/Why rows for every shell invariant cited under `## Hard rules` |

## Hard rules

- The `<body>` MUST paint with `var(--bgColor-default)` and text with `var(--fgColor-default)` via `body { background-color: var(--bgColor-default); color: var(--fgColor-default); }` in `globals.css`. A token-painted component on an unpainted body produces the canonical "card painted, body unpainted" mode-mismatch bug on overscroll and route transitions — see `references/anti-patterns.md` `shell/unpainted-body`.
- The `<BaseStyles>` element MUST paint its surface via `style={{ backgroundColor: "var(--bgColor-default)" }}` so the wrapper itself carries the surface token; without it, token-painted children float on the browser-default white surface — see `shell/basestyles-surface-paint`.
- `<html data-color-mode="auto" data-light-theme="light" data-dark-theme="dark" suppressHydrationWarning>` MUST be paired with `@import "@primer/primitives/dist/css/functional/themes/light.css";` AND `@import "@primer/primitives/dist/css/functional/themes/dark.css";` in `globals.css`. The attribute sets the resolution context; the imports provide the values — see `shell/html-color-mode-attrs` and `shell/theme-css-imports`.
- `<ThemeProvider colorMode="auto">` MUST wrap children, not render as a sibling: `<ThemeProvider><BaseStyles>{children}</BaseStyles></ThemeProvider>`. Provider context only reaches descendants and reads `var(--bgColor-default)` for its surface — see `shell/provider-wrap`.
- `<BaseStyles>` MUST wrap children inside the provider; Primer's body-level defaults (font-family, font-size, line-height) apply only inside this wrapper, and the wrapper paints `var(--bgColor-default)` for the root surface — see `shell/basestyles-wrap`.
- `app/layout.tsx` MUST carry `"use client"` at the top; without it, `<ThemeProvider>` and `<BaseStyles>` produce a hydration mismatch on first render before the `data-color-mode` cascade resolves — see `shell/use-client-root-layout`.
- Paint surfaces with `var(--bgColor-default)` (and friends), never raw hex; the CSS var is what reads the `data-*-theme` cascade. Base-scale tokens (`var(--color-scale-gray-0)` and the like) are mode-blind — Primer states they "should never be used directly in code or design."
- Pair emphasis surfaces with `var(--fgColor-onEmphasis)`; pair muted/default surfaces with the semantic `var(--fgColor-accent)` / `var(--fgColor-success)` / `var(--fgColor-danger)` token. Mixing them breaks contrast — see `references/foundations/colors.md` `token/emphasis-onEmphasis-pairing` and `token/muted-semantic-pairing`.
- Any prop, variant, token, or icon the agent cannot ground in source gets a literal `[VERIFY]` marker inline.
- Report blockers instead of guessing.

## Final checks

After generating UI, the agent emits a closing summary that: cites each Primer component used to its source section in `references/components.md`; lists any `[VERIFY]` markers it had to leave; names the screen-level prompt it just built; AND confirms shell parity — the body and `<BaseStyles>` paint with `var(--bgColor-default)`, the `<html>` mode attrs match the imported `light.css` + `dark.css` theme files, and `<ThemeProvider>` wraps children rather than sitting as a sibling. Shell parity is checked after ANY edit to `app/layout.tsx`, `app/globals.css`, or any provider wiring — not only on greenfield app creation. An agent editing an existing layout that "already looks wired" must re-confirm the shell invariants from `## Hard rules`, not from memory of how the file looked before the edit.
