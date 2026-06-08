# Examples

Composition exemplars lifted from the reference project. Each file is verbatim; see references/reference-project.md for the lift recipe.

- [dashboard](./dashboard.md) — `PageLayout containerWidth="large"` wraps a dashboard with `PageLayout.Header` for the `PageHeader` and `PageLayout.Content` for all body sections — use the Header slot for the page title, not a raw heading in Content.
- [empty](./empty.md) — `Blankslate` comes from `@primer/react/experimental` — not the root entrypoint; the import path is load-bearing.
- [home](./home.md) — Page-level chrome: outer `<Stack direction="vertical" gap="spacious">` with `PageHeader.TitleArea` + `PageHeader.Title` + `PageHeader.Description` establishes a consistent page heading contract before any content.
- [new](./new.md) — Form card: a token-painted `div` (not a Primer component) with `--bgColor-default`, `--borderColor-default`, `--borderRadius-large`, `--shadow-resting-medium`, and `--base-size-24` padding wraps the entire form — this is the canonical card surface for standalone form pages.
- [repos](./repos.md) — `PageHeader.Actions` slot: put primary CTAs (`<Button variant="primary" leadingVisual={PlusIcon}>`) in the Actions slot, not beside the `PageHeader` in the layout — the slot positions them correctly at all viewport widths.
- [settings](./settings.md) — Two-panel layout: `<PageLayout.Pane position="start" width="medium">` renders the sidebar nav before `<PageLayout.Content>` — `position="start"` pins the pane to the left; `width="medium"` is the canonical settings-nav width.
