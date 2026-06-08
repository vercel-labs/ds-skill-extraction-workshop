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
4. **Bonus composition wrapped inside the provider.** Sometimes the application wraps additional elements between the provider and `{children}` — `<CSSReset />` (Chakra), `<CssBaseline />` (MUI), `<Notifications />` (Mantine), `<Toaster />` (shadcn), `<InitColorSchemeScript />` (MUI mode boot). Lift these too; they are part of the wiring contract.
5. **Companion CSS files (verbatim contents, recursively).** For each `import './X.css'` line surfaced in step 2 — and each `import './Y.css'` line surfaced inside files lifted earlier in this step — resolve the path within the consumer-app source tree (`app/`, `src/`) and lift the resolved CSS file's **full contents** verbatim into the scratch workspace. Recurse depth 3. Stay inside the consumer-app tree: `@import "@pkg/..."` lines inside CSS files are NOT followed (their content lives under `node_modules/`) — they stay as paths, and `scripts/check-token-coverage.sh` is what validates that those `@pkg/...` imports cover every `var(--X)` the produced exemplars consume. Relative `@import "./Z.css"` lines inside lifted CSS files are followed using the same depth-3 budget. If recursion hits depth 3 with files unresolved, emit `[VERIFY: CSS import depth exceeded — manually review additional files at <paths>]` and continue.

   The verbatim contents matter because the produced `SKILL.md` Setup section is the *only* place the downstream agent will see the wiring. Summarizing as prose ("imports the full token surface") is the failure mode the `wiring/css-prose-summary` anti-pattern bans — see `references/anti-patterns.md` Layer C. The downstream agent cannot reconstruct a 15-line `@import` block from a one-line summary.

Anything below the provider tree (route-specific layout, conditional logic, error boundaries, analytics scripts) is application code, not wiring. Stop lifting at the first child element that is application-specific.

---

## Composition exemplar extraction

Additive to the wiring lift above. When `[example:project]` is in scope, Phase 2 ALSO walks the reference project for **composition exemplars** — real, multi-component pages and showcases the produced skill ships verbatim so downstream agents have full compositions to pattern-match against, not just API surface. The wiring lift and the exemplar lift run in parallel against the scratch workspace; neither blocks the other.

The block below is the canonical contract. A companion PRD living alongside the reference project (`<reference-project>/PRD-composition-exemplars.md`) quotes this block verbatim under its "Contract reference" section. Edits to either copy must land in both copies in the same commit; otherwise the meta-skill scans paths the reference project does not ship, or the reference project ships pages the meta-skill ignores.

> **Composition exemplar extraction (Phase 2, additive to wiring lift).**
>
> When `[example:project]` is in scope, Phase 2 scans the reference
> project for composition exemplars in addition to lifting the root
> wiring. Two globs are walked top-to-bottom; both run, results
> concatenated:
>
> 1. `app/**/page.tsx` — Next.js App Router route pages (including the
>    root `app/page.tsx` when present).
> 2. `components/showcase/*.tsx` — non-routed showcase compositions.
>
> For each file matched, Phase 2 writes one file to
> `.extract-ds-skill-scratch/examples/<basename>.md`, where
> `<basename>` is the parent directory name for
> `app/<dir>/page.tsx` files (e.g. `app/issues/page.tsx` →
> `issues.md`), the literal `home` for the root `app/page.tsx`, or the
> file's basename without extension for `components/showcase/<name>.tsx`
> files (e.g. `create-repo-card.tsx` → `create-repo-card.md`).
>
> Each scratch example file follows the per-example template:
>
> ```markdown
> # Example: <title-cased-basename>
>
> Lifted from `<reference-project>/<relative-path>` (<framework>).
>
> ## Required imports
>
> - `<ds-package>`: <comma-separated list of named imports>
> - `<ds-asset-package>`: <comma-separated list of named imports, or "(none)">
> - Other: <one line per non-DS import, or "(none)">
>
> ## Composition (verbatim)
>
> ```tsx
> <verbatim copy of the file body from the first relevant import to
> the close of the default-exported component>
> ```
>
> ## What to copy
>
> - <one bullet per composition pattern the example demonstrates, sourced
>   from re-reading the lifted file>
> - <patterns, not data — e.g. "Action footer is a horizontal Stack with
>   `justify='end'`: invisible Cancel then primary submit", NOT "form has
>   a Cancel button">
> ```
>
> `app/layout.tsx` is **excluded** from the example scan — it remains
> the wiring source defined in the existing Extraction recipe above. The
> recipe runs both extractions in parallel against the scratch workspace.
>
> Phase 3 materializes each scratch file to
> `.claude/skills/<slug>/references/examples/<basename>.md` verbatim,
> and writes a `.claude/skills/<slug>/references/examples/index.md`
> sub-index with one row per file: `- [<basename>](./<basename>.md) —
> <one-line summary lifted from the example file's first bullet>`.
>
> The produced `SKILL.md` routing table replaces the single
> `**Validated examples:** references/examples/` row with the
> `**Examples index:** references/examples/index.md` row plus one row
> per example file:
> `- **<basename>:** references/examples/<basename>.md — <one-line summary>`.
>
> **Fallback.** When neither glob matches (no `app/**/page.tsx` and no
> `components/showcase/*.tsx`), Phase 2 skips this step entirely. The
> produced skill's `references/examples/` directory is omitted, and the
> routing table omits both the examples-index row and the per-file
> rows. No `[VERIFY]` marker fires — an empty example set is a valid
> state for reference projects that ship wiring only.

### Slug derivation (enforced by the scaffolder)

The basename rule is implemented in `scripts/scaffold.sh` and re-asserted by `scripts/check-skill-docs.sh`. Prose cites the rule; the script enforces it. The mapping:

- `app/page.tsx` → `home.md`
- `app/<dir>/page.tsx` → `<dir>.md` (the parent directory name is the basename, not the file name — basename-from-file would produce N colliding `page.md` files)
- `components/showcase/<name>.tsx` → `<name>.md`

When two source paths collide on the same output basename (e.g. `app/empty/page.tsx` and `components/showcase/empty.tsx` both want `empty.md`), the `app/` glob wins and a `[VERIFY: example basename collision <name> — kept app/ source, dropped components/showcase/ source]` marker fires.

### "What to copy" bullets — patterns, not data

After the verbatim copy lands in the scratch file, re-read the lifted file and write 3-6 bullets describing the composition patterns the example demonstrates. The separation between **patterns** and **data** is what lets the downstream agent generalize the example instead of literally copying it:

- **Pattern (write this):** "Action footer is a horizontal Stack with `justify='end'`: invisible Cancel then primary submit."
- **Data (do NOT write this):** "Form has a Cancel button labeled 'Cancel' and a primary submit button labeled 'Create repository'."

The pattern phrasing teaches the composition; the data phrasing reads as transcription and the agent learns to copy literally instead of compose.

### Worked example — extraction against a generic reference project (illustrative)

The block below uses placeholders to ground the recipe. The skill makes no assumption about which DS or which reference project the user passes — substitute the user's `<reference-project>`, `<ds-package>`, and the components actually exported by the DS in scope.

Suppose the reference project ships:

- `app/page.tsx` — a home page composing a header bar, a feature grid, and a footer.
- `app/<route>/page.tsx` — a list page composing a header, a filter row, and a table primitive.
- `components/showcase/<name>.tsx` — a non-routed card showing a multi-input form with an action footer.

Phase 2 walks the two globs and writes three scratch files:

- `.extract-ds-skill-scratch/examples/home.md` (from `app/page.tsx`)
- `.extract-ds-skill-scratch/examples/<route>.md` (from `app/<route>/page.tsx`)
- `.extract-ds-skill-scratch/examples/<name>.md` (from `components/showcase/<name>.tsx`)

Each follows the per-example template above. Shape of one of them:

```markdown
# Example: <Route>

Lifted from `<reference-project>/app/<route>/page.tsx` (next-app).

## Required imports

- `<ds-package>`: <ComponentA>, <ComponentB>, <ComponentC>, ...
- `<ds-asset-package>`: <IconA>, <IconB>
- Other: (none)

## Composition (verbatim)

​```tsx
<verbatim copy of app/<route>/page.tsx from the first relevant import
to the close of the default-exported component>
​```

## What to copy

- Page chrome is a layout primitive with a header painted on the muted surface token and content painted on the default surface token; the contrast between the two is what makes the page read as a real DS screen rather than components arranged.
- Filter row is a horizontal stack primitive with `justify='space-between'`: a filter input on the left, a button group on the right.
- The table primitive carries an explicit `aria-label`; column headers use the DS's status-pill primitive rather than raw text.
```

Phase 3 then copies the three scratch files verbatim into `<slug>/references/examples/`, writes `<slug>/references/examples/index.md` listing all three with their one-line summaries, and updates the produced `SKILL.md` routing table to point at the index plus one row per example file. A reference project that ships only `app/layout.tsx` (the wiring source) and no `app/**/page.tsx` or `components/showcase/*.tsx` falls through silently to the wiring-only path — `references/examples/` is omitted from the produced skill, the routing table carries no example rows, and no `[VERIFY]` marker fires.

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

## Companion CSS file (verbatim) — <relative-path-from-consumer-app-root>

```css
<verbatim full contents of the resolved CSS file — no paraphrase, no truncation>
```

## Companion CSS file (verbatim) — <next-relative-path>

```css
<verbatim full contents of the next resolved CSS file>
```

## Notes

- <one line per non-obvious choice — e.g. "InitColorSchemeScript must precede ThemeProvider per upstream README">
```

The `## Companion CSS file (verbatim) — <path>` block repeats once per CSS file lifted in step 5 of the Extraction recipe (the JS `import './X.css'` line in the entry file resolves to the first block; each further file the recursion surfaces gets its own block, in import order, depth-first). When the entry file imports zero CSS files, the block is omitted entirely — there is no "## Companion CSS file (verbatim)" placeholder with empty contents.

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
- **Do not summarize Companion CSS files as prose.** The CSS files surfaced in step 5 of the Extraction recipe ship verbatim into `wiring-extracted.md` and Phase 3 lifts them verbatim into the produced `SKILL.md` Setup section. Never write "imports the full token surface" or "includes the size + typography + motion stack" in place of the actual `@import` lines. Never cross-ref to `references/foundations/<page>.md` for the "verbatim CSS" — foundation files document rules, not wiring. The rule is registered as `wiring/css-prose-summary` in `references/anti-patterns.md` Layer C; the produced-mode `check-skill-docs.sh` and the Phase 2 hard gate `check-token-coverage.sh` both enforce it.

---

## Worked examples

Two illustrative examples below cover Next.js App Router with two different DSs. The recipe applies the same way to Vite (`src/main.tsx`), Next.js Pages Router (`pages/_app.tsx`), and CRA (`src/index.tsx`) — only the root-entry file changes; the lift-the-provider-and-the-imports contract is constant.

### Example output — extraction against a Mantine-shaped target (illustrative)

The block below uses a public Mantine Next.js App Router example to ground the shape. The skill makes no assumption that the user's DS is Mantine; the same recipe applies to whichever DS the user passes.

```markdown
# Wiring extracted from mantine-next-app-template @ app/layout.tsx

**Framework:** next-app
**Source:** https://github.com/mantinedev/next-app-template/blob/master/app/layout.tsx:1-30

## Root entry file (verbatim)

```tsx
import '@mantine/core/styles.css';

import React from 'react';
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import { theme } from '../theme';

export const metadata = {
  title: 'Mantine Next.js template',
  description: 'I am using Mantine with Next.js!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
```

## CSS imports referenced

- `@mantine/core/styles.css` (line 1)

## Root-element attributes (Next App Router — applied directly to `<html>` in layout.tsx)

- `lang="en"` on `<html>` (line 15)
- `{...mantineHtmlProps}` spread on `<html>` (line 15) — Mantine's helper expands to `data-mantine-color-scheme` and other framework-required attributes; treat the spread as part of the wiring, not application code.

## Notes

- `<ColorSchemeScript />` MUST render in `<head>` before any provider so the initial paint matches the stored preference; placing it in `<body>` produces a one-frame flash of the wrong color scheme.
- `<MantineProvider theme={theme}>` imports the theme object from a sibling file rather than declaring it inline — link to that file in the lifted notes; do NOT copy its contents into `wiring-extracted.md` (the Setup section is about HOW to wire, not WHAT the theme contains).
- `mantineHtmlProps` is the canonical way to apply Mantine's required `<html>` attributes; hand-typing the attributes risks drift when Mantine adds a new one in a minor version.
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

Both examples extracted the same three contract surfaces (provider element, CSS imports, root-element attributes) from the same entry-file role (Next App Router's `app/layout.tsx`). The wiring differs in shape — Mantine's static-CSS-import + ColorSchemeScript model vs MUI's runtime-emitted styles + SSR cache provider — but the recipe is the same. A reader handed a third DS (Geist, Chakra, Radix, an internal DS) would walk the same four steps and produce the same scratch-file structure.

---

## Verifying the worked examples

Before committing changes to this file, verify every cited URL via `gh api repos/<owner>/<repo>/contents/<path>` (or a browser click). The hard-gate rule from `references/foundation-extraction.md` (unresolved citation → mandatory `[VERIFY]`) applies symmetrically here: a worked example that cites a path the live repo does not carry is a hallucination, and the WORKED_EXAMPLE_DS_BIAS check (see `scripts/check-skill-docs.sh`) will surface single-DS-hostname bias but not stale citations — staleness is the author's responsibility, caught at review time.
