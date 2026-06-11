# Examples

Composition exemplars lifted from the reference project. Each file is verbatim; see references/reference-project.md for the lift recipe.

- [dashboard](./dashboard.md) — Stat-card row is a horizontal Stack with `wrap="wrap"`: each card has `flex: "1 1 200px"` + `minWidth: 200` so 4 cards lay out as one row on wide screens, two-then-two on tablet, single column on phone — no media query, just flex tokens.
- [empty](./empty.md) — Empty state composes `Blankslate` slots in fixed order: `.Visual` (icon at 32px), `.Heading` (single short sentence), `.Description` (one short paragraph), `.PrimaryAction` (recovery path), optional `.SecondaryAction` (alternative path). Reordering the slots breaks the visual rhythm; omit instead of reorder.
- [home](./home.md) — Route index is a centred column (`maxWidth: 768`, `margin: "0 auto"`) of token-painted link cards inside an outer vertical Stack with `gap="spacious"` — the spacious gap separates the page title block from the navigation list.
- [new](./new.md) — Form lives inside a token-painted card div: four tokens fully define its surface (`var(--bgColor-default)` background, `var(--borderColor-default)` border, `var(--borderRadius-large, 12px)` corners, `var(--shadow-resting-medium)` elevation) — no raw hex, no Tailwind classes.
- [repos](./repos.md) — PageHeader uses three slots in this order: `.TitleArea > .Title` for the H1, `.Description` for the muted-foreground subtitle, `.Actions` for the right-aligned primary button — the slot order in JSX matches the visual order; do not reorder.
- [settings](./settings.md) — Settings page uses `PageLayout` with two regions: `.Pane` (sidebar nav) and `.Content` (forms). The Pane carries `position="start"` (left side) and `width="medium"` — Pane vs Content is the right primitive for sidebar-shell layouts; do NOT build the sidebar with bare flex.
