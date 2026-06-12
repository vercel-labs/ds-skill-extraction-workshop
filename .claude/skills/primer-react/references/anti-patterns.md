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
| `<BaseStyles style={{ backgroundColor: "var(--bgColor-default)", height: "100vh" }}>` copied as-is into the consumer app | `<BaseStyles style={{ backgroundColor: "var(--bgColor-default)", minHeight: "100vh" }}>` | fixed height clips content taller than the viewport and breaks page scrolling; `minHeight` preserves the fill intent. The Setup lift is verbatim (the reference project is a single-screen showcase) — the presence of the construct is the trap. `shell/fixed-viewport-height` |

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
| `<Select placeholder="Choose">` without `required`, treated as non-selectable | `<Select placeholder="Choose" required>` (or an explicit `defaultValue`) | the placeholder doubles as the implicit default (`defaultValue ?? placeholder`); its empty option is only `disabled`/`hidden` when `required` is set. |
| `<Stack direction="row">` | `<Stack direction="horizontal">` | the direction union is `'horizontal' \| 'vertical'`; CSS flex vocabulary does not work. |
| `<Stack gap="xs">` or `gap="md"` | `<Stack gap="condensed">`, `gap="normal"`, etc. | the gap scale is `none/tight/condensed/cozy/normal/spacious`; T-shirt names do not exist. |
| `<Stack justify="space-around">` | `<Stack justify="space-evenly">` | justify is `'start' \| 'center' \| 'end' \| 'space-between' \| 'space-evenly'`; no `space-around`. |
| `<Stack direction="horizontal" align="end">` over a captioned FormControl beside a caption-less one | `align="start"` + an explicit spacer, or give both controls a caption slot | Stack aligns boxes, not baselines — the captioned control's label rides up. Duplicated in `components/stack.md` and `components/form-control.md`. |
| `<Label variant="open">PR #42</Label>` | `<StateLabel status="pullOpened">Open</StateLabel>` | Label is metadata only; lifecycle states are StateLabel's `status` keyed to the lifecycle octicon map. Never build a lifecycle capsule from Label. |
| `<Text variant="muted">` | `<Text style={{ color: 'var(--fgColor-muted)' }}>` | Text has no `variant` prop; muted color goes through `style`. |
| `<Text weight="bold">` | `<Text weight="semibold">` | weight union is `'light' \| 'normal' \| 'medium' \| 'semibold'`; no `bold`. |
| `<Heading as="div">` | `<Heading as="h2">` | `as` is `'h1' \| 'h2' \| ... \| 'h6'`; not polymorphic to `div`/`span`. |
| `<BranchName>main</BranchName>` rendered inside a card whose outer `<a>` links to the PR | `<BranchName as="span">main</BranchName>` | BranchName's `as` defaults to `'a'`; nested anchors break keyboard navigation. |
| `<StateLabel status="merged">` | `<StateLabel status="pullMerged">` | the merged-PR key is `pullMerged`; the status union is `keyof typeof octiconMap`. |
| `<Flash variant="info">` | `<Flash variant="default">` | Flash's variant union is `'default' \| 'warning' \| 'success' \| 'danger'`; no `info`. |
| `<CounterLabel scheme="primary">` | `<CounterLabel variant="primary">` | `scheme` is deprecated; use `variant`. |
| `<SearchIcon style={{ color: 'var(--fgColor-muted)' }} />` | `<span style={{ color: 'var(--fgColor-muted)' }}><SearchIcon /></span>` | octicon `IconProps` is a CLOSED surface (`aria-label`/`className`/`fill`/`size`/`verticalAlign`) — `style` fails typecheck; the SVG inherits via `fill="currentColor"` from the parent. `asset/closed-prop-surface` |
| `import { Button } from '@primer/react/lib-esm/Button'` | `import { Button } from '@primer/react'` | only the root barrel is public; internal paths break across versions. |

## Asset rules — octicons

The three slugs below live as `### asset/<slug>` subsections in `references/foundations/octicons.md` (the first two extracted from `https://primer.style/octicons/`; the third verified against the package d.ts). Listed here as a registry so cross-references resolve.

- **`asset/octicon-size-buckets`** — Octicons ship in discrete size buckets (12px utility set, 16/24px general-purpose, 48/96px special-purpose). Pick the bucket matching the rendered size; do not scale a 16px icon up. See `references/foundations/octicons.md`.
- **`asset/octicon-name-size-suffix`** — Catalog identities are `{name}-{size}` in kebab-case with variant modifiers in the name (`-fill`, `-slash`); React imports drop the suffix and PascalCase the name (`ChevronDownIcon` + `size={12}`). The exhaustive React export inventory is `node_modules/@primer/octicons-react/dist/icons.d.ts`. See `references/foundations/octicons.md`.
- **`asset/closed-prop-surface`** — octicon components expose a prop surface NARROWER than `React.SVGProps`: exactly `aria-label` / `className` / `fill` / `size` / `verticalAlign` (`node_modules/@primer/octicons-react/dist/icons.d.ts:6-12`). `style` is rejected at typecheck (mechanically verified: `NEGATIVE:SearchIcon.style` PASS). Never pass `style` to an octicon — wrap in a parent element that sets `color` and let the SVG inherit via `fill="currentColor"`. See `references/foundations/octicons.md`.

## Layer C — Meta-skill craft (verbatim, not extracted)

The following rules are inherited verbatim from the meta-skill (`extract-ds-skill`) and apply uniformly to every produced DS skill, not just primer-react. They are NOT extracted from any DS source.

- **`craft/regenerated-not-copied`** — `references/design-craft.md` ships via `scaffold.sh`'s verbatim `cp` from the meta-skill's `assets/design-craft.md`. Never paraphrase, trim, reorder, or "adapt" the file to the DS. Hash: `1d09044e35ad17d60ce9c9998f082690c502a2d3`.
- **`wiring/css-prose-summary`** — never write "imports the full token surface" or similar paraphrases in the Setup section in place of actual `@import` lines. Verbatim CSS lives in `### Companion CSS — <path>` subheadings inside SKILL.md, not in `references/foundations/<page>.md` (which carries rules, not wiring).
- **`component/slate-contract-missing`** — every slate component declared in SKILL.md's `## Component slate` MUST have its own contract section under `references/components/<name>.md`. Riding on a composition exemplar or another component's file is a coverage failure.
