# AGENTS — ds

## Letter to future agents

The `ds` design system is **not** a fork of Primer — it is a thin per-project wrapper. Every file under `ds/components/<Name>.tsx` is a `export const <Name> = Primer<Name>;` re-export (plus a `ComponentProps<typeof Primer<Name>>` type alias). The wrappers exist for two reasons: a stable per-project import path (`@/ds/components/<Name>`) and a per-project `.docs.tsx` file capturing the headline rule.

What this means in practice:

- The Primer types are the source of truth for prop shapes, subcomponents, and variants. The wrappers add nothing. If a prop is not on `@primer/react`'s `<Name>`, it is not on the wrapper.
- The `.docs.tsx` files are the source of truth for *project-specific judgment calls* about how the component is used. They are not exhaustive; they capture the project's headline rule (variant semantics for Banner, controlled-state pairing for ActionMenu, slot placement for PageHeader, etc.).
- `DataTable` lives at `@primer/react/experimental`, not `@primer/react`. The `/experimental` subpath is part of Primer's public API, and the wrapper preserves the distinction by importing from that subpath.

## Source-by-source ledger (what was inherited from where)

| Source | Inherited | Authority |
|---|---|---|
| `ds/components/<Name>.tsx` | Named export, type alias | Definitive — sets the surface of the local DS |
| `ds/components/<Name>.docs.tsx` | Headline rule per component (variant semantics, slot rules, snapshot pattern, controlled-state pairing) | Definitive for project judgment |
| `node_modules/@primer/react/dist/index.d.ts` | Top-level types (Banner, ActionMenu, ActionList, PageHeader, SelectPanel) | Definitive for prop shapes |
| `node_modules/@primer/react/experimental/index.d.ts` | DataTable types | Definitive for prop shapes |
| `node_modules/@primer/primitives/dist/css/functional/themes/light.css` | Functional CSS variable inventory (`--bgColor-*`, `--fgColor-*`, `--borderColor-*`, control / focus tokens) | Definitive for token availability |
| https://primer.style/product/getting-started/foundations/color-usage/ | Six foundation rules (token-pairing, mode-aware, contrast-minimum, semantic-role) | Authoritative for prose rules; cite anchors |
| https://github.com/primer/react-template @ `src/index.jsx` | Provider tree (`<StrictMode><ThemeProvider colorMode="auto"><BaseStyles>...</BaseStyles></ThemeProvider></StrictMode>`), CSS imports (`./reset.css`, `./globals.css`), root-element attrs (`lang="en"`) | Authoritative for wiring; lift verbatim |
| Primer Storybook | (not used this run) | Reference only — wrapper + types + docs.tsx already cover the surface |
| Figma | (not used this run) | Out of scope |

## Common agent failure modes

- **Inventing props that Primer does not ship.** The wrapper preserves the Primer type via `ComponentProps<typeof Primer<Name>>`. Any prop the agent reaches for that does not appear in `node_modules/@primer/react/dist/index.d.ts` (or `experimental/index.d.ts` for `DataTable`) is fabrication. Run `pnpm typecheck` before claiming the API is correct.
- **Deep-importing `@primer/react/lib-esm/...` or `@primer/react/components/...`.** Internal subpaths are not part of the public API. Go through `@/ds/components/<Name>`. The `/experimental` subpath IS public (used by `DataTable`); no other deep subpath is.
- **Reaching for `--color-scale-*` base-scale tokens.** They appear in the Primer foundation docs as illustrative examples ("don't do this"), but they are NOT exported as CSS by `@primer/primitives@11.9.0`. A `var(--color-scale-pink-5)` reference 404s at runtime. Use functional tokens (`--bgColor-*`, `--fgColor-*`, `--borderColor-*`) exclusively — `references/tokens.md` lists every one that grep-resolves in `light.css`.
- **Putting `PageHeader.Actions` inside `PageHeader.TitleArea`.** The model wants to do this because the actions "belong with the title." They do not — `Actions`, `ContextArea`, `TrailingAction`, and `Navigation` are direct children of `<PageHeader>`, NOT of `<PageHeader.TitleArea>`. Only `LeadingVisual`, `Title`, and `TrailingVisual` go inside `TitleArea`. See `ds/components/PageHeader.docs.tsx`.
- **Picking `Banner variant="critical"` for any red-looking design.** `critical` carries `role="alert"` semantics and stronger screen-reader urgency. It is for blocking failures only. Non-blocking-but-red is `warning`; informational-red-tinted is `info`. See `ds/components/Banner.docs.tsx`.
- **Omitting `onCancel` on a multi-select SelectPanel.** Without it, the snapshot-and-restore pattern cannot run, and the user's mid-flight toggles persist after they press Cancel — exactly what "Cancel" implies should not happen. The `onCancel` prop is required by Primer's type only for `variant="modal"`, but supplying it in the default `variant="anchored"` is what enables the pattern. See `ds/components/SelectPanel.docs.tsx`.
- **Passing `open` to `ActionMenu` without `onOpenChange`.** TypeScript does not enforce the pairing. Missing the handler leaves the menu unable to close (the user clicks outside and nothing happens). Always wire both, or pass neither (uncontrolled). See `ds/components/ActionMenu.docs.tsx`.
- **Forgetting `rowHeader: true` on a `DataTable` column.** Exactly one column must set it. Zero loses the screen-reader row-name announcement; more than one fights itself. `Title` is the conventional pick.
- **Skipping the foundation-token pairing rules.** `--fgColor-default` on `--bgColor-accent-emphasis` collapses to a low-contrast pairing in dark mode. The on-emphasis foreground (`--fgColor-onEmphasis`) is the only correct choice on any `--bgColor-*-emphasis` surface. See the token/emphasis-onemphasis-pairing rule in `references/tokens.md`.
- **Reconstructing wiring from memory instead of lifting it.** The `ThemeProvider` + `BaseStyles` order, the CSS-import location, and the `colorMode="auto"` default all live in https://github.com/primer/react-template @ `src/index.jsx`. Lift verbatim; do not paraphrase, reorder, or "tidy."
