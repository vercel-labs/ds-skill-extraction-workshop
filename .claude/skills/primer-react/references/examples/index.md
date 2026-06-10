# Examples

Composition exemplars lifted from the reference project. Each file is verbatim; see references/reference-project.md for the lift recipe.

- [dashboard](./dashboard.md) — Multi-section page: a `wrap="wrap"` horizontal `Stack` of token-painted stat cards on top, a `<section>` with a `Timeline` below, all inside one vertical `Stack gap="spacious"`.
- [empty](./empty.md) — Empty states use the experimental `Blankslate` composed from named subcomponents: `Visual` (an octicon at `size={32}`), `Heading`, `Description`, `PrimaryAction`, `SecondaryAction` — in that order.
- [home](./home.md) — Page is a single vertical `Stack` with `gap="spacious"` and a `maxWidth` + `margin: 0 auto` style for a centered reading column — the outer Stack owns layout, not a wrapper div.
- [new](./new.md) — Form lives inside a token-painted card: `--bgColor-default` surface, `--borderColor-default` border, `--borderRadius-large` radius, `--shadow-resting-medium` shadow, `--base-size-24` padding — the full card recipe, not just a border.
- [repos](./repos.md) — List page shape is `PageLayout > PageLayout.Header (PageHeader) > PageLayout.Content`; the page-level primary action lives in `PageHeader.Actions`, not floating above the table.
- [settings](./settings.md) — Sidebar-nav layout uses three `PageLayout` regions: `Header`, `Pane position="start" width="medium"`, and `Content` — the pane is where the nav lives, not a hand-built column.
