# Anti-patterns — primer-react

This file is a slug-resolution / audit registry, **not** a generation-time load target. Every operational rule it points at already lives on a surface an agent loads while building UI: shell invariants in the always-loaded `## Hard rules` (SKILL.md), per-component traps in `references/components/<name>.md` (each file's `## Common mistakes` / `## Things to never invent`), token discipline in `references/tokens.md`, and octicon prose in `references/foundations/octicons.md`. An agent that has loaded `SKILL.md` plus the routed per-component and foundation files has every rule without opening this file.

It holds exactly two things:

1. the `shell/*` Bad/Good/Why table — the slug-resolution target the `## Hard rules` bullets cite, cross-checked by `check-skill-docs.sh` `SHELL_INVARIANTS`; and
2. a thin `asset/*` registry — one line per `asset/*` slug, naming the rule and pointing at the foundation page that holds the prose, required because `check-skill-docs.sh` check #4 resolves `asset/*` slugs only here.

## Layer B — Shell invariants (Bad/Good/Why)

These rows mirror the `## Hard rules` bullets in `SKILL.md` (the always-loaded fire-site). The Hard rules are what fire at every emit; this table is the registry the cited `shell/*` slugs resolve against.

| Bad | Good | Why |
|---|---|---|
| `<body>` painted with `background: #fff` or unstyled | `<BaseStyles style={{ backgroundColor: "var(--bgColor-default)" }}>{children}</BaseStyles>` + `body { background-color: var(--bgColor-default); }` in globals.css | token-painted components float on a browser-default white surface; the "card painted, body unpainted" mode-mismatch bug. `shell/unpainted-body` |
| `<ThemeProvider />` followed by sibling `<App />` | `<ThemeProvider><BaseStyles>{children}</BaseStyles></ThemeProvider>` | provider context only reaches descendants; siblings render with Primer's defaults regardless of `colorMode`. `shell/provider-not-sibling` |
| `<ThemeProvider><BaseStyles /></ThemeProvider>` (no children passed to BaseStyles) | `<ThemeProvider><BaseStyles>{children}</BaseStyles></ThemeProvider>` | BaseStyles' reset (line-height, font family, link color) only reaches children of the wrap. `shell/content-wrap-base-styles` |
| `<html data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">` with only `@import ".../themes/light.css"` | both `@import ".../themes/light.css"` AND `@import ".../themes/dark.css"` in globals.css | the mode attribute selects which imported theme resolves; an unimported branch leaves functional tokens at their fallback values. `shell/mode-attribute-without-theme-import` |
| `<html ...>` with `ThemeProvider` mounted but no `suppressHydrationWarning` | `<html ... suppressHydrationWarning>` | the provider writes the resolved color-mode attribute during hydration; React warns about server/client mismatch otherwise. `shell/suppress-hydration-warning` |
| `<BaseStyles style={{ backgroundColor: "var(--bgColor-default)", height: "100vh" }}>` copied as-is into the consumer app | `<BaseStyles style={{ backgroundColor: "var(--bgColor-default)", minHeight: "100vh" }}>` | fixed height clips content taller than the viewport and breaks page scrolling; `minHeight` preserves the fill intent. The Setup lift is verbatim (the reference project is a single-screen showcase) — the presence of the construct is the trap. `shell/fixed-viewport-height` |

## Asset rules — octicons

The three slugs below live as `### asset/<slug>` subsections in `references/foundations/octicons.md` (the first two extracted from `https://primer.style/octicons/`; the third verified against the package d.ts). Listed here as a registry so cross-references resolve.

- **`asset/octicon-size-buckets`** — Octicons ship in discrete size buckets (12px utility set, 16/24px general-purpose, 48/96px special-purpose). Pick the bucket matching the rendered size; do not scale a 16px icon up. See `references/foundations/octicons.md`.
- **`asset/octicon-name-size-suffix`** — Catalog identities are `{name}-{size}` in kebab-case with variant modifiers in the name (`-fill`, `-slash`); React imports drop the suffix and PascalCase the name (`ChevronDownIcon` + `size={12}`). The exhaustive React export inventory is `node_modules/@primer/octicons-react/dist/icons.d.ts`. See `references/foundations/octicons.md`.
- **`asset/closed-prop-surface`** — octicon components expose a prop surface NARROWER than `React.SVGProps`: exactly `aria-label` / `className` / `fill` / `size` / `verticalAlign` (`node_modules/@primer/octicons-react/dist/icons.d.ts:6-12`). `style` is rejected at typecheck (mechanically verified: `NEGATIVE:SearchIcon.style` PASS). Never pass `style` to an octicon — wrap in a parent element that sets `color` and let the SVG inherit via `fill="currentColor"`. See `references/foundations/octicons.md`.
