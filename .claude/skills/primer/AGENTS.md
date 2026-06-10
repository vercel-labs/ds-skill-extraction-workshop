# AGENTS — primer

Cross-agent brief. Any agent touching this skill reads `SKILL.md` first, then the per-domain files in `references/`. This file collects guidance that does not fit cleanly into the routing table.

## Letter to future agents

You are wiring or maintaining a Primer-based app. The single most common failure mode is the "card painted, body unpainted" bug: a `<Card>` or `<BaseStyles>` child paints with `var(--bgColor-default)`, the user toggles dark mode, the card flips dark, the body stays white — and the page reads as half-dark. Every Hard rule in `SKILL.md` exists to prevent that bug. If you find yourself editing `app/layout.tsx` or `app/globals.css`, re-read `## Hard rules` and `references/anti-patterns.md` (the `shell/*` rows) before saving. Do not trust that an existing layout is correctly wired just because it renders without errors — Primer's `colorMode="auto"` will silently fall back to light mode if the theme imports are missing, and the resulting page passes manual smoke tests in light mode every time.

The four wiring elements travel together: `<html>` mode attrs + `<ThemeProvider>` + painted `<BaseStyles>` + `body` paint in `globals.css`. Drop any one and dark mode breaks at a different layer.

## Common agent failure modes

- **Treating `var(--bgColor-default)` as optional on `<BaseStyles>`.** Without the `style={{ backgroundColor: ... }}` prop, the wrapper is transparent and children float on whatever the browser paints — usually white. The Primer docs do not emphasize this; the reference project's `app/layout.tsx` is the source.
- **Inventing a `Stack gap` value.** `gap` accepts named values (`condensed | normal | spacious | none`), not pixel numbers. Numeric `gap` ignores at runtime — there is no error.
- **Forgetting `suppressHydrationWarning` on `<html>`.** `<ThemeProvider colorMode="auto">` mutates `data-color-mode` client-side to resolve `auto`; without `suppressHydrationWarning`, React logs a hydration mismatch on every page load.
- **Using `<Heading>` without `as`.** `<Heading>` defaults to `h2`; an agent placing it as a page title without `as="h1"` breaks semantic heading order. The `variant` prop controls visual scale; `as` controls the rendered tag — keep them independent.
- **Reaching for raw hex.** `#0969da` instead of `var(--fgColor-accent)` looks correct in light mode and breaks in dark mode. The `data-*-theme` cascade only reads CSS custom properties — raw hex never swaps.
- **Importing from `@primer/react/lib-esm/...`.** Deep paths are internal; they break across versions. The barrel `@primer/react` is the canonical surface.
