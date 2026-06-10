# Examples

Composition exemplars lifted from the reference project. Each file is verbatim; see references/reference-project.md for the lift recipe.

- [dashboard](./dashboard.md) — `<PageLayout containerWidth="large">` with `Header` + `Content` regions is the page-frame primitive for app-shell pages; reach for `medium`/`small` only when the page is form-led.
- [empty](./empty.md) — Empty states use `<Blankslate>` from `@primer/react/experimental` — not a hand-rolled card. The component carries `Visual / Heading / Description / PrimaryAction / SecondaryAction` slots in that order.
- [home](./home.md) — Page chrome is a single vertical `<Stack gap="spacious">` capped at `maxWidth: 768` and centered with `margin: "0 auto"` — the wrap pattern for narrow content-led pages.
- [new](./new.md) — Form pages render their fields inside a token-painted card `<div>` (background + border + radius + shadow + padding all from tokens) — same paint recipe as the dashboard stat cards but with `shadow-resting-medium` and `base-size-24` padding for the heavier surface.
- [repos](./repos.md) — List pages reach for `<DataTable>` + `<Table.Container>` from `@primer/react/experimental`, not a hand-rolled `<table>`. `Table.Title` + `Table.Subtitle` provide the accessible-name surface via `aria-labelledby` / `aria-describedby`.
- [settings](./settings.md) — Sidebar-nav pages use `<PageLayout>` with all three regions: `Header`, `Pane position="start" width="medium"` (the sidebar), and `Content`. Pane width tokens are `small | medium | large`, not pixel values.
