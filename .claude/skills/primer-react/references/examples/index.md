# Examples

Composition exemplars lifted from the reference project. Each file is verbatim; see references/reference-project.md for the lift recipe.

- [dashboard](./dashboard.md) — Page shell is `PageLayout containerWidth="large"` with the `PageHeader` inside `PageLayout.Header` and all body sections inside `PageLayout.Content`.
- [empty](./empty.md) — `Blankslate` imports from `@primer/react/experimental`, not the root entrypoint — the root import fails to resolve.
- [home](./home.md) — Page chrome is a vertical `Stack` with `gap="spacious"` and an inline-style content cap (`maxWidth` + `margin: "0 auto"`) — Primer ships no page-width primitive at this level, so the cap is plain CSS on the outermost Stack.
- [new](./new.md) — Form surface is a token-painted card `div` (`var(--bgColor-default)` + `var(--borderColor-default)` border + `var(--borderRadius-large, 12px)` + `var(--shadow-resting-medium)` + `var(--base-size-24, 1.5rem)` padding) inside `PageLayout.Content`; the form rows stack vertically inside it with `gap="normal"`.
- [repos](./repos.md) — `DataTable` and `Table` import from `@primer/react/experimental`; the rest stays on the root entrypoint — mixing the two import paths in one file is the expected shape.
- [settings](./settings.md) — Sidebar-nav shell is PageLayout regions: `PageLayout.Header` (page h1), `PageLayout.Pane position="start" width="medium"` (the nav), `PageLayout.Content` (the form sections).
