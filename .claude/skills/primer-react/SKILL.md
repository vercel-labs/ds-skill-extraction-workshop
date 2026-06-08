---
name: primer-react
description: Build accessible UI with GitHub's Primer React design system (Button, TextInput, FormControl, PageHeader) plus Primer Primitives tokens and Octicons. Use when the user asks for a Primer-styled page, a Primer form, a GitHub-like dashboard/settings/repos screen, or wraps inputs in FormControl. Triggers: 'primer', 'primer react', '@primer/react', 'octicons', 'github ui'. Scope: components, tokens, assets. Out of scope: tone of voice and marketing copy — route copy rules to a sibling skill. IMPORTANT: this file is an orchestrator. Load the references/ files named in the routing table; SKILL.md alone is insufficient.
---

# primer-react

A `primer-react` skill is an adapter that teaches an agent how to build high-fidelity apps with Primer React (`@primer/react`). It is not a copy of the documentation. It tells the agent what to read, what APIs are public, what sources are authoritative, and how to verify that generated UI uses the system correctly.

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. When you hit a copy/naming/casing rule (e.g. "Title Case the label", "placeholder is action-oriented"), recognize it and route it to a sibling copy skill — do not extract it here.

## Setup

Install the runtime, the design tokens, and the icon package:

```bash
npm install @primer/react @primer/primitives @primer/octicons-react
```

Wire the provider, theme, and base surface at the app root. Lifted verbatim from a real consumer app (Next.js App Router). Source: https://github.com/vercel-labs/primer-nextjs-template/blob/main/app/layout.tsx:1-33

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

Provider order is `ThemeProvider` → `BaseStyles` → `{children}`. `ThemeProvider` supplies the theme context; `BaseStyles` sets the base font + foreground and here paints the root surface via `style`. The `data-color-mode="auto"` / `data-light-theme` / `data-dark-theme` trio on `<html>` selects which theme resolves and must stay matched to the theme CSS imports below.

### Companion CSS — app/globals.css

Paste this verbatim into `app/globals.css`. The `@import` block establishes the Primer Primitives token baseline every component and exemplar reads; the `light.css` + `dark.css` theme imports back the mode attributes on `<html>`; the `body` rule paints the shell so token-painted components never float on the browser-default surface. Source: https://github.com/vercel-labs/primer-nextjs-template/blob/main/app/globals.css

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

## Import rules

- The canonical import path is the package barrel: `import { Button, TextInput, FormControl, PageHeader } from "@primer/react"`.
- A second public entrypoint, `@primer/react/experimental`, carries pre-stable components (`DataTable`, `Table`, `Blankslate`). It is public but explicitly experimental — import from it only for those components, and keep stable components on the root barrel.
- Icons import from `@primer/octicons-react` (e.g. `import { RepoIcon } from "@primer/octicons-react"`).
- Never import from internal deep paths such as `@primer/react/lib-esm/...` or `@primer/react/dist/...` — those are build artifacts, not public API.

## Source-of-truth rules

- Code wins on conflict with docs. The authoritative prop source is the package types under `node_modules/@primer/react/dist/<Component>/`.
- Tokens are CSS custom properties shipped by `@primer/primitives@11.9.0` under `dist/css/`. Functional + theme tokens auto-switch by color mode; base tokens (`--base-color-*`) must never be used directly.
- Docs: https://primer.style/product (foundations under `/getting-started/foundations/`). Octicons: https://primer.style/foundations/icons.
- This skill targets `@primer/react@38.26.0` + `@primer/primitives@11.9.0`.

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| user asks for a Button, TextInput, FormControl, or PageHeader | references/components.md | single-file: one `##` section per component, 8-section contract each |
| user picks or pairs color/surface/foreground/border tokens | references/foundations/colors.md | functional color pairing, mode inversion, contrast minimums, role map |
| user sets type, weight, or heading order | references/foundations/typography.md | shorthand `font` tokens, weight binding, semantic heading order |
| user lays out a page, sets spacing, or picks regions | references/foundations/spacing-layout.md | spacing scale, page-region roles, breakpoint tokens |
| user makes the UI responsive or touch-friendly | references/foundations/responsive.md | touch targets, user-preference media features, rem/zoom units |
| user adds icons | references/foundations/icons.md | Octicons size enum, decorative-vs-contentful a11y contract |
| user reviews available foundation rules | references/foundations/index.md | one entry per foundation page extracted |
| user emits raw hex/px or skips shell wiring | references/anti-patterns.md | token-discipline + shell-invariant Bad/Good/Why table |
| user reviews available composition exemplars | references/examples/index.md | one entry per exemplar lifted from the reference project |
| home: route-card landing grid | references/examples/home.md | composition exemplar lifted from primer-nextjs-template/app/page.tsx |
| dashboard: stat cards + activity Timeline | references/examples/dashboard.md | composition exemplar lifted from primer-nextjs-template/app/dashboard/page.tsx |
| repos: list page with DataTable + SelectPanel | references/examples/repos.md | composition exemplar lifted from primer-nextjs-template/app/repos/page.tsx |
| new: form page with FormControl rows | references/examples/new.md | composition exemplar lifted from primer-nextjs-template/app/new/page.tsx |
| settings: sidebar-nav page with PageLayout.Pane | references/examples/settings.md | composition exemplar lifted from primer-nextjs-template/app/settings/page.tsx |
| empty: Blankslate empty state | references/examples/empty.md | composition exemplar lifted from primer-nextjs-template/app/empty/page.tsx |

## Hard rules

- The body/root MUST paint with `var(--bgColor-default)` (foreground `var(--fgColor-default)`) via either the `<BaseStyles style={{ backgroundColor: "var(--bgColor-default)" }}>` prop OR a `body { background-color: var(--bgColor-default); color: var(--fgColor-default); }` rule in `globals.css`. A token-painted component on an unpainted shell is the canonical mode-mismatch bug — see `references/anti-patterns.md` `shell/unpainted-body`.
- The `<html data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">` mode-attribute trio MUST be paired with the matching theme CSS imports (`@import "@primer/primitives/dist/css/functional/themes/light.css";` + `dark.css`). The attributes set the resolution context for functional tokens like `var(--bgColor-default)`; without the imports the mode toggles but the values do not — see `shell/mode-attribute-no-theme-import`.
- `<ThemeProvider>` MUST wrap children, not render as a sibling: `<ThemeProvider><BaseStyles>{children}</BaseStyles></ThemeProvider>`. Provider context only reaches descendants, so a sibling provider renders every Primer component with the default theme and breaks `var(--bgColor-default)` resolution — see `shell/provider-missing-content-wrap`.
- Never emit a raw hex or px where a token exists — use `var(--bgColor-*)` / `var(--fgColor-*)` / `var(--base-size-*)` / `var(--borderRadius-*)`. See `references/anti-patterns.md` Layer B.
- Any prop, variant, token, or asset you cannot ground in the package types or token files gets a literal `[VERIFY]` marker inline.
- Report blockers instead of guessing. Do not invent props, variants, or token names.

## Final checks

After generating UI, emit a closing summary that: cites each Primer component used to its source (`references/components.md` section or the package types path); lists any `[VERIFY]` markers left in the output; names the screen-level prompt just built; AND confirms shell parity — the page/root surface paints with `var(--bgColor-default)`, the `<html>` mode attribute matches the imported theme CSS files, and `ThemeProvider` wraps children rather than rendering as a sibling. Re-confirm shell parity after ANY edit to the consumer app's root layout / providers / `globals.css`, not only on greenfield app creation — an "already wired" layout still needs the shell invariants re-checked from the `## Hard rules` above, not from memory.
