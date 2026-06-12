# Examples

Composition exemplars lifted from the reference project. Each file is verbatim; see references/reference-project.md for the lift recipe.

- [dashboard](./dashboard.md) — Multi-section page shape: `PageLayout` regions (`Header` / `Content`) with a vertical `Stack` `gap="spacious"` separating sections inside Content.
- [empty](./empty.md) — Empty-state shape: `Blankslate` (from `@primer/react/experimental`) inside `PageLayout.Content` so the empty surface still reads as a routed page, not a floating card.
- [home](./home.md) — Route-index shape: a vertical `Stack` with `gap="spacious"` caps page width via `style={{ maxWidth: 768, margin: "0 auto" }}` — the layout primitive carries rhythm, inline style carries the measure.
- [new](./new.md) — Form-page shape: `PageLayout containerWidth="medium"` with the title block in `PageLayout.Header` (Heading + muted descriptive `Text` in a condensed vertical Stack) and the form card in `PageLayout.Content`.
- [repos](./repos.md) — List-page shape: `PageLayout containerWidth="large"` → `PageHeader` (TitleArea + Description + Actions) → filter row → `Table.Container`.
- [settings](./settings.md) — Sidebar-nav shape: `PageLayout` with `PageLayout.Pane position="start" width="medium"` carrying a `NavList`, and `PageLayout.Content` carrying the form sections.
