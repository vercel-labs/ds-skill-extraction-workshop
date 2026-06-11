# AGENTS — primer-react

Any agent touching this skill reads `SKILL.md` first, then the per-domain files in `references/`. The routing table in SKILL.md is the dispatch contract; do not skip it.

## Letter to future agents

The Primer React surface is large (78 components in `@primer/react@38.26.0`), but this skill covers a **pinned 15-component slate** chosen to support the two wow prompts (form/status surfaces). If a screen the user asks for needs a component outside the slate (`PageHeader`, `DataTable`, `SelectPanel`, `ActionMenu`, `ActionList`, `Dialog`, …), say so — do not invent a substitute from inside the slate. Coverage gaps land via the harvest convergence loop (workshop issue #33) before the final extraction run, not by hallucinating inside individual screens.

The d.ts files in `node_modules/@primer/react/dist/**/*.d.ts` are the canonical source. Whenever a `references/components/*.md` claim feels uncertain, read the d.ts line cited in the bullet and confirm. Docs sites lag; the types do not.

Primer's theming is unusual:

1. The trio `data-color-mode` / `data-light-theme` / `data-dark-theme` lives on `<html>`.
2. The attribute values use **underscores** (`dark_dimmed`) while the matching theme **CSS file names** use dashes (`dark-dimmed.css`). Mixing them produces a silent fallback to the default theme.
3. Mode attributes only set the resolution context. The actual values come from theme CSS files. Both `light.css` AND `dark.css` must be `@import`-ed in `globals.css` when `data-color-mode="auto"` is set.

`<BaseStyles>` is the body-painting wrapper. `<ThemeProvider>` is the React-context provider that drives `useTheme()` and the `colorMode="auto"` runtime preference detection. They wrap together — the provider on the outside, BaseStyles inside, children inside BaseStyles.

## Common agent failure modes

- **Painting a card with `var(--bgColor-default)` while the body stays browser-default white.** Token-painted component on an unpainted shell — the canonical mode-mismatch bug. See `references/anti-patterns.md` `shell/unpainted-body`.
- **Setting `data-color-mode="auto"` without importing `dark.css`.** The mode attribute toggles but functional tokens never resolve in dark mode. See `shell/mode-attribute-without-theme-import`.
- **Treating Label as a lifecycle pill.** Label is metadata (`accent`, `success`, `attention`, `danger`, `done`, …). For PR/issue open/closed/merged states, use StateLabel — its required `status` is keyed to the lifecycle octicon map. See `references/components/StateLabel.md`.
- **Wrapping BranchName around a `<span>` by passing `children={<span>main</span>}`.** BranchName already renders an `<a>` (`as: Component = 'a'`). For a non-link branch chip, pass `as="span"` directly on BranchName. See `references/components/BranchName.md`.
- **Adding a tooltip to an IconButton with a `description` prop and a visible label.** IconButton's `aria-label` IS the accessible name AND the tooltip — duplicating it as `description` produces a redundant ARIA announcement. Use `description` only for additional context beyond the label. See `references/components/IconButton.md`.
- **Importing from `@primer/react/lib-esm/<Component>` because it "feels more direct".** Only `@primer/react` (root barrel) is public — internal paths break across version bumps. See SKILL.md "Import rules".
- **Adding a Flash `variant="info"` because most banner systems have one.** Primer Flash has only `default | warning | success | danger`. If the source d.ts does not export it, it does not exist. See `references/components/Flash.md`.
- **Reaching for `Stack direction="row"`.** The Primer scale uses `horizontal | vertical`, not the CSS flexbox vocabulary. See `references/components/Stack.md`.
- **Setting `Stack gap="xs"` or `Stack justify="around"`.** Primer Stack has a named scale (`none | tight | condensed | cozy | normal | spacious` for gap; `start | center | end | space-between | space-evenly` for justify). The Tailwind/CSS shortcuts do not exist on this surface.
