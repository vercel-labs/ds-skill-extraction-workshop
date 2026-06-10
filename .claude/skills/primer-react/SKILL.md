---
name: primer-react
description: Build accessible GitHub-style UI with the Primer React design system (Button, IconButton, TextInput, Textarea, Select, Checkbox, FormControl, Flash, Label, CounterLabel, Heading, Text, Stack) wired through this project's @/ds/components wrappers over @primer/react. Use when the user asks for a Primer-styled page, a GitHub-style form/list/settings screen, a FormControl-wrapped field, a token-painted card, or a repo header. Triggers: 'primer', 'primer-react', '@primer/react', 'ds component', 'github-style'. Scope: components, tokens, assets. Out of scope: tone of voice and marketing copy — route copy rules to a sibling skill. IMPORTANT: this file is an orchestrator. Load the references/ files named in the routing table; SKILL.md alone is insufficient.
---

## Mission

A `primer-react` skill is an adapter that teaches an agent how to build high-fidelity apps with Primer React. It is not a copy of the documentation. It tells the agent what to read, what APIs are public, what sources are authoritative, and how to verify that generated UI uses the system correctly.

This project consumes Primer through thin local wrappers at `@/ds/components/*` (each a verbatim re-export of `@primer/react`). Components not wrapped locally (PageHeader, PageLayout, NavList, Timeline, Link, RelativeTime, SelectPanel, and the experimental DataTable/Table/Blankslate) are imported directly from `@primer/react` / `@primer/react/experimental` — see the composition exemplars in `references/examples/`.

## Scope

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. When you encounter a copy/naming/casing rule (e.g. "Title Case the label", "placeholder is action-oriented"), recognize it, route it — mention it as a candidate for a sibling copy skill — but do NOT apply it from this skill.

## Setup

Install Primer React, its design-token package (Primer Primitives), and the icon package:

```bash
npm install @primer/react @primer/primitives @primer/octicons-react
```

Wire the provider and base surface once, at the app root. Lifted verbatim from the reference project's `app/layout.tsx` (Next.js App Router):

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

`ThemeProvider` establishes the Primer theme context; `BaseStyles` paints the root surface and applies base typography. The `data-color-mode` / `data-light-theme` / `data-dark-theme` trio on `<html>` selects which theme's token values resolve; `suppressHydrationWarning` is required because `auto` resolves client-side. `"use client"` is required because `ThemeProvider`/`BaseStyles` are client components.

Source: vercel-labs/primer-nextjs-template @ app/layout.tsx:1-31 — https://github.com/vercel-labs/primer-nextjs-template/blob/main/app/layout.tsx

### Companion CSS — app/globals.css

Imported by `layout.tsx` above. Ship it verbatim — the `@import` set is the token baseline every component and exemplar reads; the theme imports define the values the `<html>` mode attributes select; the `body` rule paints the shell so token-painted components never float on the browser-default surface.

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

- Canonical project import is the local wrapper: `import { Button } from "@/ds/components/Button"`. Each wrapper is a verbatim re-export of the same-named `@primer/react` component, so `import { Button } from "@primer/react"` is equivalent and is what the composition exemplars use.
- The barrel is `@primer/react`. Experimental components (`DataTable`, `Table`, `Blankslate`) import from `@primer/react/experimental`. Do not deep-import from internal paths like `@primer/react/lib-esm/...`.
- Icons import from `@primer/octicons-react` (e.g. `import { RepoIcon } from "@primer/octicons-react"`). The icon component type is `Icon`.

## Source-of-truth rules

- Local wrappers: `ds/components/*.tsx` (proposing set) and their `*.docs.tsx` annotations (DS-author-elevated rules). Cited by `file:line`.
- Upstream component contracts: `@primer/react@38.26.0` published types. Code wins over docs on any prop-signature conflict.
- Design tokens: `@primer/primitives@11.9.0` CSS custom properties under `dist/css/{base,functional}/`. See `references/tokens.md`.
- Foundation rules (color, type, layout, responsive, icons): `references/foundations/` — extracted from https://primer.style/product/getting-started/foundations.
- Icons: `@primer/octicons-react@19.28.0`.

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| user asks for an action button | references/components/button.md | filled/danger/invisible variants, icon visual slots |
| user asks for an icon-only button | references/components/iconbutton.md | `aria-label` required |
| user asks for a single-line text field | references/components/textinput.md | wrap in FormControl |
| user asks for a multi-line text field | references/components/textarea.md | wrap in FormControl |
| user asks for a dropdown / select | references/components/select.md | compound `Select.Option`; wrap in FormControl |
| user asks for a checkbox | references/components/checkbox.md | Checkbox before FormControl.Label |
| user wires a form field | references/components/formcontrol.md | label/caption/validation association |
| user asks for an inline message / callout | references/components/flash.md | prefer Flash over experimental Banner here |
| user asks for a status pill / tag | references/components/label.md | variant-driven status |
| user asks for a count badge | references/components/counterlabel.md | numeric counter |
| user asks for a heading | references/components/heading.md | `as` for outline, `variant` for size |
| user asks for body text | references/components/text.md | size/weight + muted foreground |
| user asks for layout / spacing | references/components/stack.md | flex+gap primitive, named gaps |
| user asks how colors pair / invert across modes | references/foundations/colors.md | functional vs base tokens, emphasis pairing, contrast |
| user asks about font weights / sizes / heading order | references/foundations/typography.md | weight/size tokens, semantic order, rem |
| user asks about breakpoints / page width / padding | references/foundations/spacing-layout.md | breakpoint scale, width caps, region padding |
| user asks about touch targets / zoom / preferences | references/foundations/responsive.md | min target, viewport floor, prefers-* |
| user asks about icon a11y / sizing | references/foundations/icons.md | decorative-by-default, contentful labeling, named sizing |
| user reviews available foundation rules | references/foundations/index.md | one entry per extracted foundation page |
| user asks about token names / values / discipline | references/tokens.md | inventory + always-tokens-never-raw rule |
| user reviews token / shell anti-patterns | references/anti-patterns.md | Bad/Good/Why table + shell wiring rows |
| user reviews available composition exemplars | references/examples/index.md | one entry per exemplar lifted from the reference project |
| home: route index of token-painted cards | references/examples/home.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/page.tsx |
| dashboard: stat cards + activity Timeline | references/examples/dashboard.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/dashboard/page.tsx |
| repos: PageHeader + DataTable + SelectPanel list | references/examples/repos.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/repos/page.tsx |
| settings: PageLayout.Pane NavList + form sections | references/examples/settings.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/settings/page.tsx |
| new: token-painted form card + action footer | references/examples/new.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/new/page.tsx |
| empty: Blankslate empty state | references/examples/empty.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/empty/page.tsx |

## Hard rules

- The body/root MUST paint with `var(--bgColor-default)` (and text with `var(--fgColor-default)`) — via the `<BaseStyles style={{ backgroundColor: "var(--bgColor-default)" }}>` prop AND/OR `body { background-color: var(--bgColor-default); color: var(--fgColor-default); }` in `globals.css`. A token-painted component on an unpainted shell is the canonical mode-mismatch bug — see `references/anti-patterns.md` `shell/unpainted-body`.
- The `<html data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">` mode attributes MUST be paired with the matching theme CSS imports in `globals.css` (`@import "@primer/primitives/dist/css/functional/themes/light.css"` + `dark.css`). The attributes set the token-resolution context; the imports define the values. Attributes without the imports leave functional tokens like `var(--bgColor-default)` at their fallback — see `shell/mode-attribute-no-theme-import`.
- `<ThemeProvider>` and `<BaseStyles>` MUST wrap children, not render as siblings: `<ThemeProvider><BaseStyles>{children}</BaseStyles></ThemeProvider>`. Provider context only reaches descendants; a sibling provider gives every component the default theme and `var(--bgColor-default)` resolves off-context — see `shell/provider-missing-content-wrap`.
- Re-confirm the three shell rules above after ANY edit to the root layout / providers / `globals.css`, not only on greenfield setup. A layout that already looks "wired" can still be missing a theme import or a body paint.
- Always use Primer tokens, never raw values. Every color, space, size, radius, border, and type value comes from a `var(--...)` Primer Primitives custom property — see `references/tokens.md` and `references/anti-patterns.md`.
- Any prop, variant, token, or asset you cannot ground in source gets a literal `[VERIFY]` marker inline. Mark unverifiable facts `[VERIFY]`; report blockers instead of guessing.

## Final checks

After generating UI, emit a short closing summary: cite each component used to its source file (`ds/components/<Name>.tsx` or `@primer/react`), list any `[VERIFY]` markers you had to leave, name the screen-level prompt you built, AND confirm shell parity — the page/root surface paints with a surface token (`var(--bgColor-default)`); the `<html>` mode attributes match the imported theme CSS files; `ThemeProvider`/`BaseStyles` wrap children, not siblings. Shell parity is checked after any edit to the root layout / providers / `globals.css`, re-grounded from this skill's `## Hard rules`, not from memory of how the file looked before the edit.
