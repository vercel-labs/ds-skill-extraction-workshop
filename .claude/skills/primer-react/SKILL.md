---
name: primer-react
description: Build accessible GitHub-style UI with the Primer React design system (Button, IconButton, TextInput, Textarea, Select, Checkbox, FormControl, Heading, Text, Stack, Label, CounterLabel, Flash, StateLabel, BranchName). Use when the user asks for a Primer-styled page, a GitHub-style form, dashboard, settings screen, or status/lifecycle badges. Triggers: 'primer', 'primer react', '@primer/react', 'octicons', 'github style ui'. Scope: components, tokens, assets. Out of scope: tone of voice and marketing copy — route copy rules to a sibling skill. IMPORTANT: this file is an orchestrator. Load the references/ files named in the routing table; SKILL.md alone is insufficient.
---

# primer-react

## Mission

A `primer-react` skill is an adapter that teaches an agent how to build high-fidelity apps with Primer React, GitHub's design system. It is not a copy of the documentation. It tells the agent what to read, what APIs are public, what sources are authoritative, and how to verify that generated UI uses the system correctly.

In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting — route copy/naming/casing rules to a sibling copy skill.

Extracted from `@primer/react@38.26.0`, `@primer/primitives@11.9.0`, `@primer/octicons-react@19.28.0`, the `primer/react` component repo (`packages/react/src/<Component>/` machine-readable docs + stories), `https://primer.style/` foundation pages, and the `vercel-labs/primer-nextjs-template` reference project.

## Setup

Install the three packages (versions pinned to the extraction run):

```bash
pnpm add @primer/react@38.26.0 @primer/primitives@11.9.0 @primer/octicons-react@19.28.0
```

Root layout wiring, copied verbatim from the reference project. Source: vercel-labs/primer-nextjs-template @ app/layout.tsx:1-31

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

Wiring notes (lifted with the entry file):

- `"use client"` heads the root layout — `ThemeProvider`/`BaseStyles` are client components; omitting the directive fails the Next App Router server-component build.
- `data-color-mode="auto"` + `data-light-theme="light"` + `data-dark-theme="dark"` on `<html>` are the token-resolution context for the `@primer/primitives` functional themes; they pair with the `light.css` + `dark.css` `@import` lines in `app/globals.css` below — set one side without the other and tokens stay at fallback values.
- `suppressHydrationWarning` is required because `data-color-mode="auto"` resolves client-side; without it React logs hydration mismatches on first paint.

### Companion CSS — app/globals.css

Source: vercel-labs/primer-nextjs-template @ app/globals.css (verbatim, full file — copy-paste into your consumer app):

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

- Canonical import path is the barrel: `import { Button, Stack, FormControl } from '@primer/react'`. Every component on the slate below imports from the barrel.
- `@primer/react/experimental` is a PUBLIC deep entrypoint for components the package ships as experimental (`DataTable`, `Table`, `Blankslate` — used by the composition exemplars). Use it only for components the barrel does not export.
- Icons import from `@primer/octicons-react` (e.g. `import { RepoIcon } from '@primer/octicons-react'`), sized via the `size` prop.
- Every other deep path is forbidden — never import from the package's compiled output directories (`@primer/react/dist/...` or any other internal subpath). Internal paths are not part of the public API and break across patch releases.

## Source-of-truth rules

Code wins on conflict with docs. Authority order:

1. `node_modules/@primer/react/dist/**/*.d.ts` — the published types. A prop the types do not export does not exist.
2. `primer/react` repo @ `main`, `packages/react/src/<Component>/` — per-component machine-readable docs (`<Component>.docs.json`) and story files (`<Component>.stories.tsx`). Raw-fetch per file, slate-scoped; never clone. Exception: IconButton lives under `packages/react/src/Button/`.
3. `node_modules/@primer/primitives/dist/css/` — the token source. Grep here to verify any `var(--X)` name.
4. `node_modules/@primer/octicons-react/dist/icons.d.ts` — the icon inventory. Grep here to verify any icon export.
5. `https://primer.style/` — prose foundations (extracted into `references/foundations/`). Lower authority than types on prop signatures; cited, not trusted blind.

## When to Load References

| Trigger | Files to load | Notes |
|---|---|---|
| user asks for a button or action trigger | references/components/button.md | per-component contract |
| user asks for an icon-only button | references/components/icon-button.md | `aria-label` doubles as tooltip |
| user asks for a single-line text input | references/components/text-input.md | wrap in FormControl |
| user asks for a multi-line input | references/components/textarea.md | resize/characterLimit rules |
| user asks for a dropdown/select | references/components/select.md | styled native select |
| user asks for a checkbox | references/components/checkbox.md | control precedes label |
| user wires a form or labels an input | references/components/form-control.md | a11y composition rules |
| user asks for a page/section heading | references/components/heading.md | semantic levels vs visual variant |
| user styles inline text | references/components/text.md | size/weight primitive |
| user lays out siblings (rows, columns, gaps) | references/components/stack.md | gap scale, Stack.Item |
| user adds a metadata badge | references/components/label.md | metadata, never lifecycle |
| user adds a numeric count badge | references/components/counter-label.md | `variant`, not deprecated `scheme` |
| user adds an inline banner/alert | references/components/flash.md | variant enum is closed |
| user shows issue/PR lifecycle state | references/components/state-label.md | lifecycle, never Label |
| user renders a branch chip | references/components/branch-name.md | renders `<a>` by default |
| user consumes a design token / asks about theming or dark mode | references/tokens.md | 12-token ledger + foundation rule pointers |
| user needs theming/mode/token prose rules | references/foundations/primitives.md | token/* rules with citations |
| user picks or sizes an icon | references/assets.md | octicons inventory contract |
| user asks about icon naming/buckets | references/foundations/octicons.md | asset/* rules |
| user reviews available foundation pages | references/foundations/index.md | one entry per crawled URL |
| user reviews available composition exemplars | references/examples/index.md | one entry per composition exemplar lifted from the reference project |
| home: token-painted route-index cards | references/examples/home.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/page.tsx |
| dashboard: stat cards + Timeline activity feed | references/examples/dashboard.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/dashboard/page.tsx |
| empty: Blankslate empty state | references/examples/empty.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/empty/page.tsx |
| new: form card with FormControl rows | references/examples/new.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/new/page.tsx |
| repos: list page with DataTable + SelectPanel filter | references/examples/repos.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/repos/page.tsx |
| settings: PageLayout.Pane sidebar nav + form sections | references/examples/settings.md | composition exemplar lifted from vercel-labs/primer-nextjs-template/app/settings/page.tsx |
| any generated style or anti-pattern check | references/anti-patterns.md | Bad/Good/Why table + shell rows |

## Component slate

The confirmed extraction slate (operator-approved at the Phase 1 gate). Every name resolves to its own contract file under `references/components/`:

- `Button` — action trigger; variant/size/loading/inactive, leadingVisual/trailingVisual slots, count
- `Checkbox` — controlled boolean input; indeterminate, validationStatus
- `CounterLabel` — numeric count badge; scheme
- `Flash` — inline banner; variant default/success/warning/danger, full-width option
- `FormControl` — input wrapper; Label/Caption/Validation/LeadingVisual subcomponents for label association
- `Heading` — semantic heading; as="h2" default, variant scale
- `IconButton` — icon-only button; `aria-label` required, doubles as tooltip unless unsafeDisableTooltip
- `Label` — small metadata badge; variant/size
- `Select` — styled native select; block/contrast/placeholder/validationStatus
- `Stack` — flex layout primitive; gap/direction/align/justify, Stack.Item
- `Text` — inline text primitive; size/weight/whiteSpace
- `Textarea` — multi-line input; resize, characterLimit, validationStatus
- `TextInput` — single-line input; leading/trailingVisual, loading, validationStatus, monospace
- `StateLabel` — lifecycle state capsule; required `status` keyed to the lifecycle octicon map
- `BranchName` — branch chip; renders `<a>` by default (`as` defaults to "a")

Components outside this slate (overlays, navigation chrome, data display — e.g. ActionMenu, Dialog, PageHeader, DataTable) were excluded at the Phase 1 gate; the composition exemplars may use them, but this skill carries no contract for them. If a prompt requires one, verify its props against `node_modules/@primer/react/dist/<Component>/` before use.

## Hard rules

- The body/root MUST paint with `var(--bgColor-default)` on BOTH sides the reference wiring ships: `<BaseStyles style={{ backgroundColor: "var(--bgColor-default)", height: "100vh" }}>` in the root layout AND `body { background-color: var(--bgColor-default); color: var(--fgColor-default); }` in `globals.css`. A token-painted component on an unpainted shell is the canonical mode-mismatch bug — see `references/anti-patterns.md` `shell/unpainted-body`.
- The mode attributes on `<html>` (`data-color-mode="auto"` + `data-light-theme="light"` + `data-dark-theme="dark"`) MUST be paired with the matching theme CSS imports (`@import "@primer/primitives/dist/css/functional/themes/light.css"` + `dark.css` in `globals.css`); the imports must cover every mode the attributes can name. The attribute sets the resolution context; the import provides the values — see `shell/mode-attribute-no-theme-import`.
- `<ThemeProvider colorMode="auto">` MUST wrap children, not render as a sibling, and `<BaseStyles>` inside it MUST receive children: `<ThemeProvider><BaseStyles>{children}</BaseStyles></ThemeProvider>`. Provider context only reaches descendants — see `shell/provider-missing-content-wrap`.
- Never write raw color/size/shadow values where a token exists — consume tokens as CSS variables (`var(--fgColor-default)`), per `references/tokens.md` and `references/foundations/primitives.md`.
- Any prop, variant, token, or asset the agent cannot ground in source gets a literal `[VERIFY]` marker inline.
- Report blockers instead of guessing.

## Final checks

After generating UI with this skill, emit a closing summary that: cites each component used to its contract file under `references/components/`; lists any `[VERIFY]` markers left in the output; names the screen-level prompt just built; AND confirms shell parity — the page/root surface paints with a surface token (`var(--bgColor-default)`), the mode attributes on `<html>` (when present) match the imported theme CSS files, and the provider (when present) wraps children, not siblings. Shell parity is checked after ANY edit to the consumer app's root layout / providers / globals.css, not only on greenfield app creation — re-confirm the invariants from `## Hard rules` above, not from memory of how the file looked before the edit.
