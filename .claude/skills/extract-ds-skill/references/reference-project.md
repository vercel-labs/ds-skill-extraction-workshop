# Reference-project extraction

How to lift wiring (provider mount, CSS imports, font setup, root-element attributes) from a **real consumer app** instead of reconstructing it from docs prose. Read this file once per Phase 2 extraction pass that includes a reference project. Re-read the *Framework auto-detection* section whenever the entry-file shape resists the first match.

Inherited claim (verbatim from SKILL.md Agent Stance and Anti-fabrication rules): "Copy wiring verbatim from a real consumer app; if none exists, lift from setup docs. Do not reconstruct from memory."

Scope reminder: In scope: tokens, assets, component descriptions, component APIs. Out of scope: tone of voice, marketing copy, product copywriting. A reference project may contain copy choices, naming conventions, or marketing prose alongside the wiring — extract the wiring only and route copy/voice rules out via the discovery summary, as elsewhere.

---

## When to load this file

Phase 2 only. Triggered when the Phase 1 discovery summary contains a source line tagged `[example:project]`. If no reference project is in scope, skip this file entirely — Phase 2 falls back to the docs-snippet path defined in `references/skill-template.md` (Foundation-docs wiring fallback subsection).

The reference-project extraction runs in parallel with the foundation-docs extraction step in `references/validate.md`: both write to the scratch workspace, neither writes to `.claude/skills/<slug>/` until Phase 3.

---

## Source-role definition

`[example:project]` is the tenth source role (after `[code]`, `[docs]`, `[docs:foundation]`, `[storybook]`, `[figma]`, `[private-blocker]`, etc. — see `references/discovery.md` for the full ledger). It is supplied by the user at Phase 1 input time as a URL (a GitHub repo + branch + path) or a local filesystem path the agent can read. The skill carries no default reference project — the user chooses one because the choice signals which framework, which version, and which idioms the produced wiring should reflect.

A reference project is authoritative for **wiring only**: the provider mount(s) at the application root, the global CSS imports, the font wiring, the root-element HTML attributes (e.g. a mode attribute like `data-color-mode` or a class like `.dark`), and any other setup the application performs once at boot. It is **not** authoritative for component API shapes, prop names, or token values — those come from `[code]` and `[docs]` as before.

---

## Framework auto-detection

The reference project's root entry file is whichever of the following resolves first. Walk the list top-to-bottom; first hit wins. Stop searching after the first match.

1. **Vite** — `src/main.{jsx,tsx}` or `src/index.{jsx,tsx}` (the `ReactDOM.createRoot(...).render(<App />)` site).
2. **Next.js App Router** — `app/layout.{tsx,jsx}` (the `<html><body>{children}</body></html>` site).
3. **Next.js Pages Router** — `pages/_app.{tsx,jsx}` (the `function MyApp({ Component, pageProps })` site).
4. **Create React App** — `src/index.{jsx,tsx}` (legacy; same shape as Vite's `main.tsx` but the wrapper differs).

If none of the four resolve, surface a `[VERIFY: reference project root entry not auto-detected — extracting from <best-guess-path>]` marker and ask the user in the Phase 2 proof-point to confirm the root file. Do not silently pick a deeper file; the root entry IS the contract.

---

## Extraction recipe

Once the root entry file resolves, walk it top-to-bottom and lift the following — verbatim, not paraphrased:

1. **Topmost provider element.** The JSX element whose tag-name contains `Provider` (e.g. `<ThemeProvider>`, `<AppRouterCacheProvider>`, `<MantineProvider>`) OR whose import path begins with `<ds-package>` (the DS package the skill is being extracted for). The provider is the element wrapping `{children}` (Next App Router), wrapping `<App />` (Vite/CRA), or wrapping `<Component {...pageProps} />` (Next Pages). Copy the JSX exactly, including props.
2. **Direct CSS imports.** Any `import './something.css'` or `import '<ds-package>/styles.css'` at the top of the entry file. Include each one verbatim with its quote style and path.
3. **Root-element HTML attributes.** When the entry file is a Next App Router `layout.tsx`, also lift the `<html>` element's attributes (e.g. `lang="en"`, `data-color-mode="auto"`, `suppressHydrationWarning`, `className={fontVariables}`). When it is a Vite `main.tsx`, the root-element attributes live in `index.html` instead — read that file too and lift the attributes from the `<html>` and `<body>` tags there.
4. **Bonus composition wrapped inside the provider.** Sometimes the application wraps additional elements between the provider and `{children}` — `<BaseStyles>` (Primer), `<CssBaseline />` (MUI), `<Toaster />` (shadcn), `<InitColorSchemeScript />` (MUI mode boot). Lift these too; they are part of the wiring contract.

Anything below the provider tree (route-specific layout, conditional logic, error boundaries, analytics scripts) is application code, not wiring. Stop lifting at the first child element that is application-specific.

---

## Output contract

Write the lifted wiring to `.extract-ds-skill-scratch/wiring-extracted.md`. The scratch file is throwaway — Phase 3 materializes it into the produced `SKILL.md` Setup section per `references/skill-template.md`. Format:

```markdown
# Wiring extracted from <reference-project> @ <root-entry-file>

**Framework:** <vite|next-app|next-pages|cra>
**Source:** <reference-project-url-or-path>:<line-range>

## Root entry file (verbatim)

```<lang>
<verbatim copy of the entry file from first relevant import to the close of the root element>
```

## CSS imports referenced

- `<import-path-1>` (line N)
- `<import-path-2>` (line M)

## Root-element attributes (when applicable)

- `<attr-name>="<attr-value>"` on `<html>` / `<body>` (file:line)

## Notes

- <one line per non-obvious choice — e.g. "InitColorSchemeScript must precede ThemeProvider per upstream README">
```

Phase 3 uses this file as the verbatim source for the produced `SKILL.md` Setup section. Phase 3 does NOT re-read the reference project; the scratch file is the contract surface.

---

## Framework-adaptation note

When the reference project's framework differs from the consumer's framework (the user's actual app is Next.js App Router but the reference project is Vite, or vice versa), the produced `SKILL.md` Setup section MUST include this disclaimer immediately above the verbatim wiring:

> Source: `<reference-project>` @ `<root-entry-file>` (`<source-framework>`). Apply in your framework's root element — Next.js App Router: `app/layout.tsx`, Next.js Pages Router: `pages/_app.tsx`, Vite: `src/main.tsx`, CRA: `src/index.tsx`.

The wiring stays verbatim; the disclaimer tells the agent where to paste it. A reader who skips the disclaimer and pastes a Vite `ReactDOM.createRoot(...).render(...)` into a Next.js project will discover the mismatch at build time, but the disclaimer is the cheap fix that catches it before they try.

---

## Fallback: no reference project provided

When the user does NOT pass a `[example:project]` source but a `[docs:foundation]` URL IS in scope, the produced `SKILL.md` Setup section falls back to the verbatim docs snippet path documented in `references/skill-template.md` (Foundation-docs wiring fallback subsection). The fallback lifts the setup snippet from the foundation docs page itself — the code-fence block, not the surrounding prose — and ships it under a `### Foundation wiring` subheading.

When the fallback fires, append this `[VERIFY]` marker to the proof-point line:

> `[VERIFY: no reference project provided — Setup section lifted from docs snippet; recommend re-running with a reference project for cleaner extraction]`

The marker is informational, not a defect — the docs-snippet path is the documented fallback. The marker exists so the user can choose to re-run with a reference project for higher-fidelity wiring.

When neither a `[example:project]` source nor a `[docs:foundation]` URL is in scope, the produced `SKILL.md` Setup section is empty — there is no wiring source to lift from, and the agent must NOT reconstruct one from memory. The post-emit `scripts/check-skill-docs.sh` will surface the empty Setup section; the user decides whether to add wiring manually or re-run with one of the two sources.

---

## Anti-fabrication rules

Symmetric to the rules in `references/foundation-extraction.md`. Apply to every wiring snippet before it lands in the scratch file:

- **Unresolved file path → `[VERIFY]`.** If the auto-detection fired but the resolved path does not actually exist in the reference project (e.g. `app/layout.tsx` was the guess but the repo uses `pages/_app.tsx`), do NOT silently fall through to the next candidate. Mark the rule `[VERIFY: auto-detected root entry path did not resolve in reference project]` and ask the user to confirm the entry path in the Phase 2 proof-point.
- **Unconfirmed provider element → drop the example.** If the entry file does NOT contain a JSX element whose name contains `Provider` or whose import path begins with `<ds-package>`, the reference project is not exercising the DS at the root — pick a different reference project or fall back to the docs snippet. Do not invent a provider that the entry file does not contain.
- **Do not paraphrase the verbatim copy.** The wiring is lifted character-for-character. Reformatting indentation, dropping comments, or "tidying" the import order silently changes the contract surface. Phase 3 will re-format if needed; Phase 2's job is fidelity, not aesthetics.
- **Do not pull wiring from files outside the entry-file chain.** A reference project may have a hundred files; the wiring is in the entry file (plus `index.html` for Vite). If a token value or theme object is imported from `<reference-project>/src/theme.ts`, link to that file — do not copy its contents into `wiring-extracted.md`. The Setup section is about HOW to wire, not WHAT the theme contains.

---

## Worked examples

Two illustrative examples below cover Next.js App Router with two different DSs. The recipe applies the same way to Vite (`src/main.tsx`), Next.js Pages Router (`pages/_app.tsx`), and CRA (`src/index.tsx`) — only the root-entry file changes; the lift-the-provider-and-the-imports contract is constant.

### Example output — extraction against a Primer-React-shaped target (illustrative)

The block below uses a public Primer-React Next.js example to ground the shape. The skill makes no assumption that the user's DS is Primer; the same recipe applies to whichever DS the user passes.

```markdown
# Wiring extracted from primer-react-nextjs-example @ src/app/layout.tsx

**Framework:** next-app
**Source:** https://github.com/primer/react/blob/main/examples/nextjs/src/app/layout.tsx:1-22

## Root entry file (verbatim)

```tsx
import './global.css'
import {ThemeProvider, BaseStyles} from '@primer/react'
import type {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'Next.js',
  description: 'Generated by Next.js',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" data-light-theme="light" data-dark-theme="dark" data-color-mode="auto" suppressHydrationWarning>
      <body>
        <ThemeProvider colorMode="auto">
          <BaseStyles style={{backgroundColor: 'var(--bgColor-default)', height: '100vh'}}>{children}</BaseStyles>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## CSS imports referenced

- `./global.css` (line 1)

## Root-element attributes (Next App Router — applied directly to `<html>` in layout.tsx)

- `lang="en"` on `<html>` (line 13)
- `data-light-theme="light"` on `<html>` (line 13)
- `data-dark-theme="dark"` on `<html>` (line 13)
- `data-color-mode="auto"` on `<html>` (line 13)
- `suppressHydrationWarning` on `<html>` (line 13)

## Notes

- `<BaseStyles>` carries an inline `backgroundColor: 'var(--bgColor-default)'` style — this is the surface-pairing rule from the foundation extraction in action; the reference project applies it at the root rather than relying on a `:root` CSS rule.
- `colorMode="auto"` on `ThemeProvider` reads `data-color-mode` from `<html>`; the two settings travel together.
```

### Example output — extraction against a Material-UI-shaped target (illustrative)

The block below uses a public Material-UI Next.js TypeScript example to ground the shape. The skill makes no assumption that the user's DS is MUI; the same recipe applies to whichever DS the user passes.

```markdown
# Wiring extracted from mui-material-nextjs-example @ src/app/layout.tsx

**Framework:** next-app
**Source:** https://github.com/mui/material-ui/blob/master/examples/material-ui-nextjs-ts/src/app/layout.tsx:1-25

## Root entry file (verbatim)

```tsx
import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import theme from '@/theme';
import ModeSwitch from '@/components/ModeSwitch';

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" />
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ModeSwitch />
            {props.children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
```

## CSS imports referenced

- None at the root entry file — MUI emits styles via `<CssBaseline />` and the SSR cache provider at runtime, not via static CSS imports.

## Root-element attributes (Next App Router — applied directly to `<html>` in layout.tsx)

- `lang="en"` on `<html>` (line 11)
- `suppressHydrationWarning` on `<html>` (line 11)

## Notes

- `<InitColorSchemeScript attribute="class" />` runs before any provider and toggles a class on `<html>` based on stored preference — the mode-attribute wiring from the foundation rule is implemented via a class, not a `data-*` attribute, in this DS.
- `<AppRouterCacheProvider>` MUST wrap `<ThemeProvider>` in Next App Router. Without it, MUI's emotion-style cache desynchronizes between server and client on first paint.
- `<CssBaseline />` is component-shaped wiring (not a CSS import) — render it once inside the provider; it injects the global resets at runtime.

Source: https://mui.com/material-ui/integrations/nextjs/#app-router
```

Both examples extracted the same three contract surfaces (provider element, CSS imports, root-element attributes) from the same entry-file role (Next App Router's `app/layout.tsx`). The wiring differs in shape — Primer's CSS-variable model vs MUI's runtime-emitted styles — but the recipe is the same. A reader handed a third DS (Geist, Chakra, Mantine, an internal DS) would walk the same four steps and produce the same scratch-file structure.

---

## Verifying the worked examples

Before committing changes to this file, verify every cited URL via `gh api repos/<owner>/<repo>/contents/<path>` (or a browser click). The hard-gate rule from `references/foundation-extraction.md` (unresolved citation → mandatory `[VERIFY]`) applies symmetrically here: a worked example that cites a path the live repo does not carry is a hallucination, and the WORKED_EXAMPLE_DS_BIAS check (see `scripts/check-skill-docs.sh`) will surface single-DS-hostname bias but not stale citations — staleness is the author's responsibility, caught at review time.
