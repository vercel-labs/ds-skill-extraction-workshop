# Anti-patterns — primer-react

Three layers of anti-patterns surface during composition. Layer A is "shell" — the layout-level wiring contracts that break the whole page when violated. Layer B is "component" — per-component traps the d.ts already constrains. Layer C is meta-skill craft rules (verbatim, not extracted) that govern how a produced skill ships.

## Layer A — Shell invariants

| Bad | Good | Why |
|---|---|---|
| `<body>` painted with `background: #fff` or unstyled | `<BaseStyles style={{ backgroundColor: "var(--bgColor-default)" }}>{children}</BaseStyles>` + `body { background-color: var(--bgColor-default); }` in globals.css | token-painted components float on a browser-default white surface; the "card painted, body unpainted" mode-mismatch bug. `shell/unpainted-body` |
| `<ThemeProvider />` followed by sibling `<App />` | `<ThemeProvider><BaseStyles>{children}</BaseStyles></ThemeProvider>` | provider context only reaches descendants; siblings render with Primer's defaults regardless of `colorMode`. `shell/provider-not-sibling` |
| `<ThemeProvider><BaseStyles /></ThemeProvider>` (no children passed to BaseStyles) | `<ThemeProvider><BaseStyles>{children}</BaseStyles></ThemeProvider>` | BaseStyles' reset (line-height, font family, link color) only reaches children of the wrap. `shell/content-wrap-base-styles` |
| `<html data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">` with only `@import ".../themes/light.css"` | both `@import ".../themes/light.css"` AND `@import ".../themes/dark.css"` in globals.css | the mode attribute selects which imported theme resolves; an unimported branch leaves functional tokens at their fallback values. `shell/mode-attribute-without-theme-import` |
| `<html ...>` with `ThemeProvider` mounted but no `suppressHydrationWarning` | `<html ... suppressHydrationWarning>` | the provider writes the resolved color-mode attribute during hydration; React warns about server/client mismatch otherwise. `shell/suppress-hydration-warning` |

## Layer B — Component traps

| Bad | Good | Why |
|---|---|---|
| `<Button variant="warning">` | `<Button variant="default">` + sibling `<Flash variant="warning">` | Button's variant union is `default \| primary \| invisible \| danger \| link`. Warnings are banner-tier, not button-tier. |
| `<Button>{busy ? <Spinner /> : 'Save'}</Button>` | `<Button loading={busy} loadingAnnouncement="Saving">Save</Button>` | the `loading` prop keeps focus on the button and announces the busy state to SRs via `loadingAnnouncement`. |
| `<Button aria-label="Save">Save</Button>` | `<Button>Save</Button>` | duplicate accessible name; SR reads "Save, Save". |
| `<IconButton icon={XIcon} />` (no `aria-label`) | `<IconButton icon={XIcon} aria-label="Close dialog" />` | the type union requires `aria-label` or `aria-labelledby`; the label IS the accessible name AND the tooltip. |
| `<IconButton tooltipDirection="top">` | `<IconButton tooltipDirection="n">` | `tooltipDirection` uses compass points (`n/ne/e/se/s/sw/w/nw`), not CSS direction names. |
| `<TextInput icon={SearchIcon}>` | `<TextInput leadingVisual={SearchIcon}>` | `icon` is deprecated; use `leadingVisual` / `trailingVisual`. |
| `<TextInput validationStatus="warning">` | `<TextInput validationStatus="error">` or sibling `<Flash variant="warning">` | `FormValidationStatus` is `'error' \| 'success'`; no warning member. |
| `<Textarea resize="auto">` | `<Textarea resize="vertical">` + `minHeight={N}` | `resize` is `'none' \| 'both' \| 'horizontal' \| 'vertical'`; no `auto`. |
| `<Select multiple>` | `<SelectPanel>` (not in this skill's slate) | `multiple` is explicitly omitted from Primer Select's prop type. |
| `<Stack direction="row">` | `<Stack direction="horizontal">` | the direction union is `'horizontal' \| 'vertical'`; CSS flex vocabulary does not work. |
| `<Stack gap="xs">` or `gap="md"` | `<Stack gap="condensed">`, `gap="normal"`, etc. | the gap scale is `none/tight/condensed/cozy/normal/spacious`; T-shirt names do not exist. |
| `<Stack justify="space-around">` | `<Stack justify="space-evenly">` | justify is `'start' \| 'center' \| 'end' \| 'space-between' \| 'space-evenly'`; no `space-around`. |
| `<Label variant="open">PR #42</Label>` | `<StateLabel status="pullOpened">Open</StateLabel>` | Label is metadata only; lifecycle states are StateLabel's `status` keyed to the lifecycle octicon map. Never build a lifecycle capsule from Label. |
| `<Text variant="muted">` | `<Text style={{ color: 'var(--fgColor-muted)' }}>` | Text has no `variant` prop; muted color goes through `style`. |
| `<Text weight="bold">` | `<Text weight="semibold">` | weight union is `'light' \| 'normal' \| 'medium' \| 'semibold'`; no `bold`. |
| `<Heading as="div">` | `<Heading as="h2">` | `as` is `'h1' \| 'h2' \| ... \| 'h6'`; not polymorphic to `div`/`span`. |
| `<BranchName>main</BranchName>` rendered inside a card whose outer `<a>` links to the PR | `<BranchName as="span">main</BranchName>` | BranchName's `as` defaults to `'a'`; nested anchors break keyboard navigation. |
| `<StateLabel status="merged">` | `<StateLabel status="pullMerged">` | the merged-PR key is `pullMerged`; the status union is `keyof typeof octiconMap`. |
| `<Flash variant="info">` | `<Flash variant="default">` | Flash's variant union is `'default' \| 'warning' \| 'success' \| 'danger'`; no `info`. |
| `<CounterLabel scheme="primary">` | `<CounterLabel variant="primary">` | `scheme` is deprecated; use `variant`. |
| `import { Button } from '@primer/react/lib-esm/Button'` | `import { Button } from '@primer/react'` | only the root barrel is public; internal paths break across versions. |

## Asset rules — octicon naming

The two slugs below are extracted from `https://primer.style/octicons/` and live as `### asset/<slug>` subsections in `references/foundations/octicons.md`. Listed here as a registry so cross-references resolve.

- **`asset/octicon-size-buckets`** — Octicons ship in discrete size buckets (12px utility set, 16px full library, 24px near-parallel, 48/96px reserved). Pick the bucket matching the rendered size; do not scale a 16px icon up. See `references/foundations/octicons.md`.
- **`asset/octicon-name-size-suffix`** — Catalog names are `{name}-{size}` in kebab-case with variant modifiers BEFORE the size suffix (e.g. `alert-fill-16`); React imports drop the suffix and PascalCase the name (`AlertIcon`). The exhaustive React export inventory is `node_modules/@primer/octicons-react/dist/icons.d.ts`. See `references/foundations/octicons.md`.

## Layer C — Meta-skill craft (verbatim, not extracted)

The following rules are inherited verbatim from the meta-skill (`extract-ds-skill`) and apply uniformly to every produced DS skill, not just primer-react. They are NOT extracted from any DS source.

- **`craft/regenerated-not-copied`** — `references/design-craft.md` ships via `scaffold.sh`'s verbatim `cp` from the meta-skill's `assets/design-craft.md`. Never paraphrase, trim, reorder, or "adapt" the file to the DS. Hash: `1d09044e35ad17d60ce9c9998f082690c502a2d3`.
- **`wiring/css-prose-summary`** — never write "imports the full token surface" or similar paraphrases in the Setup section in place of actual `@import` lines. Verbatim CSS lives in `### Companion CSS — <path>` subheadings inside SKILL.md, not in `references/foundations/<page>.md` (which carries rules, not wiring).
- **`component/slate-contract-missing`** — every slate component declared in SKILL.md's `## Component slate` MUST have its own contract section under `references/components/<name>.md`. Riding on a composition exemplar or another component's file is a coverage failure.
