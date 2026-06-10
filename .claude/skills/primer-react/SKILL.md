---
name: primer-react
description: Build accessible UI with Primer, GitHub's React design system (PageLayout, PageHeader, Stack, Heading, Text, Button, FormControl, TextInput). Use when the user asks for a Primer-styled page, a GitHub-style screen, a Primer form, or wires Primer color modes. Triggers: 'primer', 'primer react', '@primer/react', 'octicons', 'github design system'. Scope: components, tokens, assets. Out of scope: tone of voice and marketing copy — route copy rules to a sibling skill. IMPORTANT: this file is an orchestrator. Load the references/ files named in the routing table; SKILL.md alone is insufficient.
---

## Mission

A `primer-react` skill is an adapter that teaches an agent how to build high-fidelity apps with Primer, GitHub's React design system. It is not a copy of the documentation. It tells the agent what to read, what APIs are public, what sources are authoritative, and how to verify that generated UI uses the system correctly.

## Scope

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. When you encounter a copy/naming/casing rule (e.g. "Title Case the label", "placeholder is action-oriented"), route it to a sibling copy skill — do not apply it from here.

## Setup

Install:

```bash
npm install @primer/react @primer/primitives @primer/octicons-react
```

Provider wiring, copied verbatim from a real consumer app. Source: `vercel-labs/primer-nextjs-template @ app/layout.tsx:1-31` (https://github.com/vercel-labs/primer-nextjs-template/blob/main/app/layout.tsx), framework: Next.js App Router.

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

Notes lifted with the wiring:

- `"use client"` is required at the top of `app/layout.tsx` — `ThemeProvider` and `BaseStyles` are client components; omitting the directive fails the App Router build with a server-component error.
- Color mode is driven by `data-*` attributes on `<html>` (`data-color-mode` / `data-light-theme` / `data-dark-theme`), not CSS classes. `ThemeProvider colorMode="auto"` must agree with `data-color-mode="auto"` — the attrs select which imported theme CSS file's variables resolve; the provider syncs React-side context.
- `suppressHydrationWarning` on `<html>` prevents the hydration mismatch warning when the color-mode attributes are adjusted client-side.

### Companion CSS — app/globals.css

Source: `vercel-labs/primer-nextjs-template @ app/globals.css` (https://github.com/vercel-labs/primer-nextjs-template/blob/main/app/globals.css). Copy-paste verbatim:

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

- Canonical import path is the barrel: `import { Button, Stack, FormControl } from '@primer/react'`. Subcomponents are dotted properties of their parent (`PageLayout.Header`, `FormControl.Label`), not separate imports.
- One public deep path exists: `@primer/react/experimental` — `Blankslate`, `DataTable`, and `Table` import from there, not from the root (the root import fails to resolve; see `references/examples/empty.md` and `references/examples/repos.md`).
- Icons import from `@primer/octicons-react` (e.g. `import { RepoIcon } from '@primer/octicons-react'`), a separate package.
- Every other deep path (`@primer/react/lib-esm/...`, `@primer/react/dist/...`) is internal and forbidden.

## Source-of-truth rules

- Code wins on conflict with docs. The published types under `@primer/react/dist/**/*.d.ts` (v38.26.0) are the prop source of truth.
- Token source of truth: `@primer/primitives/dist/css/` (v11.9.0). Docs: https://primer.style/product/getting-started/foundations (foundation pages extracted into `references/foundations/`).
- Known docs divergence: the typography foundations page's Do-example names `--test-subtitle-weight`; the package ships `--text-subtitle-weight`. Docs typo — package wins.
- Asset source of truth: `@primer/octicons-react@19.28.0` exports (`icons.d.ts`).
- Reference consumer app: https://github.com/vercel-labs/primer-nextjs-template — wiring and composition exemplars were lifted from it verbatim.

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| user asks for any covered component (PageLayout, PageHeader, Stack, Heading, Text, Button, FormControl, TextInput) | references/components.md | one `##` section per component, 8 subsections each |
| user styles with colors, spacing, type, radius, or shadows | references/tokens.md | 37 grep-resolved tokens + use-when prose |
| user asks which foundation rules exist | references/foundations/index.md | one entry per extracted foundation page |
| user picks colors or pairs fg/bg tokens | references/foundations/colors.md | 6 token rules (functional-over-base, emphasis pairing, …) |
| user sets type scale, weights, or heading levels | references/foundations/typography.md | 4 token rules |
| user lays out pages, panes, or containers | references/foundations/spacing-layout.md | 5 token rules |
| user targets breakpoints, hover, or user-preference modes | references/foundations/responsive.md | 4 token rules |
| user places icons or raw SVG | references/foundations/icons.md | 3 token rules (octicon fallbacks, size prop) |
| user asks where the foundation crawl started | references/foundations/foundations.md | crawl-root index page (0 rules by design) |
| user reviews available composition exemplars | references/examples/index.md | one entry per composition exemplar lifted from the reference project |
| home: token-painted card link list under a PageHeader | references/examples/home.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/page.tsx |
| dashboard: stat cards + timeline inside PageLayout | references/examples/dashboard.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/dashboard/page.tsx |
| empty: Blankslate empty state (experimental import) | references/examples/empty.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/empty/page.tsx |
| new: token-painted form card with FormControl rows | references/examples/new.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/new/page.tsx |
| repos: DataTable list page with SelectPanel filter | references/examples/repos.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/repos/page.tsx |
| settings: sidebar-nav page with PageLayout.Pane + NavList | references/examples/settings.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/settings/page.tsx |
| user writes raw hex, off-grid px, or ad-hoc font sizes | references/anti-patterns.md | Bad / Good / Why table + shell rows |

## Hard rules

- The body/root MUST paint with `var(--bgColor-default)` via BOTH the `<BaseStyles style={{ backgroundColor: "var(--bgColor-default)", height: "100vh" }}>` style prop AND `body { background-color: var(--bgColor-default); color: var(--fgColor-default); }` in `globals.css` — the lifted wiring carries both; a token-painted component on an unpainted shell is the canonical mode-mismatch bug — see `references/anti-patterns.md` `shell/unpainted-body`.
- The mode attributes on `<html>` (`data-color-mode="auto" data-light-theme="light" data-dark-theme="dark"`) MUST be paired with the matching theme CSS imports (`@import "@primer/primitives/dist/css/functional/themes/light.css";` + `dark.css`). The attribute sets the token-resolution context; the import provides the values (`var(--bgColor-default)` stays unresolved without it) — see `shell/mode-attr-without-theme-import`.
- Conversely, the theme CSS imports MUST cover every mode the app declares, and the attributes must be present (with `ThemeProvider colorMode="auto"` agreeing) for the imports to take effect — otherwise `prefers-color-scheme` is ignored and the default mode renders regardless of user preference (`var(--bgColor-default)` never switches) — see `shell/theme-import-without-mode-attr`.
- `<ThemeProvider colorMode="auto">` MUST wrap children, not render as a sibling: `<ThemeProvider colorMode="auto"><BaseStyles>{children}</BaseStyles></ThemeProvider>`. Provider context only reaches descendants; a sibling provider leaves every theme-aware surface (e.g. `var(--bgColor-default)`) on the Primer default theme — see `shell/provider-not-wrapping`.
- `<BaseStyles>` inside the provider MUST receive children — content rendered outside it loses Primer's base text/color resets (`var(--fgColor-default)` foreground, `var(--fontStack-system)` type) and falls back to browser styles — see `shell/basestyles-missing-children`.
- Any prop, variant, token, or asset the agent cannot ground in source gets a literal `[VERIFY]` marker inline.
- Report blockers instead of guessing.

## Final checks

After generating UI, emit a closing summary that: cites each component used to its source file under `@primer/react/dist/`; lists any `[VERIFY]` markers left; names the screen-level prompt just built; AND confirms shell parity — the page/root surface paints with a surface token, the mode attributes (when present) match the imported theme CSS files, and the provider (when present) wraps children, not siblings. Shell parity is checked after ANY edit to the consumer app's root layout / providers / globals.css, not only on greenfield app creation — an agent editing an existing layout that already looks "wired" must re-confirm the shell invariants from `## Hard rules`, not from its memory of how the file looked before the edit.
