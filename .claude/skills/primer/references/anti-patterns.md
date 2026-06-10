# Anti-patterns — primer

The rows under `shell/*` are the canonical wiring failures — every one corresponds to a `## Hard rules` bullet in `SKILL.md`. Other rows capture token-pairing and component-API mistakes surfaced during extraction.

## Shell invariants (paint + provider + mode wiring)

| Slug | Bad | Good | Why |
|---|---|---|---|
| `shell/unpainted-body` | `body { /* no background-color */ }` in `globals.css` | `body { background-color: var(--bgColor-default); color: var(--fgColor-default); }` in `globals.css` | Even with `<BaseStyles>` painted, the `<body>` behind it remains browser-default white; on overscroll or route transition the white body bleeds through and breaks dark mode at the page level. |
| `shell/basestyles-surface-paint` | `<BaseStyles>{children}</BaseStyles>` (no `style` prop) | `<BaseStyles style={{ backgroundColor: "var(--bgColor-default)", height: "100vh" }}>{children}</BaseStyles>` | `<BaseStyles>` does not paint its own surface by default; without the inline style, token-painted children float on the browser-default white surface. |
| `shell/basestyles-wrap` | `<ThemeProvider><BaseStyles /></ThemeProvider>{children}` (siblings) | `<ThemeProvider><BaseStyles>{children}</BaseStyles></ThemeProvider>` | `<BaseStyles>` applies Primer's body-level defaults (font, size, line-height) only to its descendants; rendering `children` as a sibling skips the defaults. |
| `shell/provider-wrap` | `<ThemeProvider />{children}` (siblings) | `<ThemeProvider colorMode="auto"><BaseStyles>{children}</BaseStyles></ThemeProvider>` | Provider context only reaches descendants; rendered as a sibling, every child gets Primer's default colorMode regardless of the configured prop. |
| `shell/html-color-mode-attrs` | `<html>` with `data-color-mode="auto"` only | `<html lang="en" data-color-mode="auto" data-light-theme="light" data-dark-theme="dark" suppressHydrationWarning>` | Missing `data-light-theme` / `data-dark-theme` leaves the theme CSS files unapplied for that mode; missing `suppressHydrationWarning` produces a hydration mismatch error because `<ThemeProvider>` mutates `<html>` attrs client-side to resolve `auto`. |
| `shell/theme-css-imports` | `globals.css` imports only `themes/light.css` | `globals.css` imports BOTH `themes/light.css` AND `themes/dark.css` | If only `light.css` is imported, the mode attribute toggles to dark but functional tokens stay at their light values — the page "switches" but the colors do not change. |
| `shell/use-client-root-layout` | `app/layout.tsx` without `"use client"` at the top | `app/layout.tsx` with `"use client";` as line 1 | `<ThemeProvider>` and `<BaseStyles>` read browser preference at boot; server-rendering without the directive produces a hydration mismatch on first render. |

## Token-pairing mistakes

| Bad | Good | Why |
|---|---|---|
| `<Button variant="primary">` with text painted by `var(--fgColor-accent)` | `<Button variant="primary">` with the default text color (the variant pairs `--bgColor-accent-emphasis` with `--fgColor-onEmphasis` automatically) | Semantic foregrounds are tuned for default/muted surfaces; on the saturated emphasis surface they read as washed-out. See `references/foundations/colors.md` `token/emphasis-onEmphasis-pairing`. |
| Surface painted with `#0d1117` (raw hex) | Surface painted with `var(--bgColor-default)` | The CSS custom property reads the `data-*-theme` cascade and swaps with mode; raw hex never swaps and breaks dark mode. See `references/foundations/colors.md` `token/default-mode-aware`. |
| Border painted with `var(--borderColor-muted)` on an interactive control on `--bgColor-muted` | Border painted with `var(--borderColor-default)` on the same control | Interactive borders need step-8 contrast minimum against `bgColor-muted`; the muted border (step 7) disappears on the muted surface. See `references/foundations/colors.md` `token/text-icon-contrast-minimum`. |

## Component-API mistakes

(Sourced from the per-component "Common mistakes" tables in `references/components.md`; surfaced here for cross-component grep.)

| Bad | Good | Why |
|---|---|---|
| `<Stack gap={16}>` | `<Stack gap="normal">` | Numeric `gap` is silently ignored; only named tokens (`condensed | normal | spacious | none`) resolve. |
| `<PageLayout.Pane width={240}>` | `<PageLayout.Pane width="medium">` | Pixel widths bypass Primer's responsive collapse. |
| `<Heading variant="h1">title</Heading>` | `<Heading as="h1" variant="large">title</Heading>` | `variant` is a visual scale, `as` is the semantic tag; they are independent. |
| `<Text muted>` | `<Text style={{ color: "var(--fgColor-muted)" }}>` | `<Text>` has no `muted` prop; inline color via the muted foreground token is canonical. |
| `<TextInput aria-label="email" />` (bare) | `<FormControl><FormControl.Label>Email</FormControl.Label><TextInput /></FormControl>` | Bare inputs lose label association and the `aria-describedby` wiring for captions. |
| `<Button leadingVisual={<PlusIcon />}>` | `<Button leadingVisual={PlusIcon}>` | `leadingVisual` accepts the component reference, not the rendered element. |
| `<Label variant="red">` | `<Label variant="danger">` | Color-named variants don't exist; semantic-role variants do. |
| Deep import: `import { Button } from "@primer/react/lib-esm/Button"` | Barrel: `import { Button } from "@primer/react"` | Deep paths are internal and break across versions; the barrel is the canonical surface. |
