# Examples

Composition exemplars lifted from the reference project. Each file is verbatim; see references/reference-project.md for the lift recipe.

- [dashboard](./dashboard.md) — A stat-card row is a horizontal `Stack` with `wrap="wrap"`; each card is a token-painted `<div>` (`flex: 1 1 200px`) carrying the same surface/border/radius/shadow token quartet as the form card, with `--shadow-resting-small` for the lighter resting elevation.
- [empty](./empty.md) — An empty state is a `Blankslate` (from `@primer/react/experimental`) composed of `Blankslate.Visual` (a sized octicon) + `Blankslate.Heading` + `Blankslate.Description` + a `PrimaryAction`/`SecondaryAction` pair — never an ad-hoc centered `<div>`.
- [home](./home.md) — Page body is a single vertical `Stack` with `gap="spacious"`, width-capped and centered via inline `style` (`maxWidth`, `margin: "0 auto"`) — the DS owns rhythm, the page owns the measure.
- [new](./new.md) — A form lives in a token-painted card: `backgroundColor: var(--bgColor-default)` + `border: 1px solid var(--borderColor-default)` + `borderRadius: var(--borderRadius-large)` + `boxShadow: var(--shadow-resting-medium)`. The card-on-surface contrast is what makes it read as a real DS screen.
- [repos](./repos.md) — A list page is `PageLayout` → `PageLayout.Header` carrying a `PageHeader` (Title + Description + Actions slot) over `PageLayout.Content`.
- [settings](./settings.md) — A sidebar-nav page uses `PageLayout` with three regions: `PageLayout.Header` (page title), `PageLayout.Pane position="start"` (the nav), `PageLayout.Content` (the form sections).
