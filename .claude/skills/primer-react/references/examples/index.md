# Examples

Composition exemplars lifted from the reference project. Each file is verbatim; see references/reference-project.md for the lift recipe.

- [dashboard](./dashboard.md) — Stat cards are token-painted `<div>`s (`var(--bgColor-default)` + `var(--borderColor-default)` + `var(--borderRadius-large, 12px)` + `var(--shadow-resting-small)`) inside a horizontal Stack with `wrap="wrap"` and `flex: "1 1 200px"` — responsive card grid without a grid component.
- [empty](./empty.md) — Empty states are the experimental `Blankslate` entrypoint (`@primer/react/experimental`), not a hand-rolled centered div — slots: `Visual` (octicon size 32), `Heading`, `Description`, `PrimaryAction`, `SecondaryAction`.
- [home](./home.md) — Route-index cards are plain `<Link>` elements painted entirely with tokens: `var(--borderColor-default)` border, `var(--borderRadius-medium, 8px)` radius, `var(--bgColor-default)` background — a card surface without any Card component.
- [new](./new.md) — The form surface is one token-painted card `<div>` (`var(--bgColor-default)` + `var(--borderColor-default)` + `var(--borderRadius-large, 12px)` + `var(--shadow-resting-medium)` + `var(--base-size-24, 1.5rem)` padding) wrapping a single vertical Stack of rows.
- [repos](./repos.md) — List-page skeleton: `PageLayout` > `PageHeader` (TitleArea + Description + `Actions` slot carrying the primary `Button leadingVisual={PlusIcon}`) > filter row > table — the "New X" action lives in the PageHeader.Actions slot, not floating beside the table.
- [settings](./settings.md) — Sidebar-nav skeleton: `PageLayout` with `Pane position="start" width="medium"` carrying a `NavList`, and `Content` carrying the form sections — the pane/content split is PageLayout regions, not CSS columns.
