# Foundation: Octicons

Source URL: https://primer.style/octicons/ (fetched 2026-06-11, HTTP 200)

## What this covers

- The Octicons icon catalog — "A scalable set of icons handcrafted by GitHub" — size buckets and the name/size naming convention.

### asset/octicon-size-buckets

Octicons ship in discrete size buckets — 12px (small utility set: alerts, chevrons, x, check/no-entry fills), 16px (the full library), 24px (near-parallel set), with 48px/96px existing only for `copilot-48`/`copilot-96` — pick the bucket matching the rendered size instead of scaling a 16px icon up.

**When it bites:** scaling a 16px octicon to 24+ renders soft strokes and uneven optical weight next to true 24px icons; assuming a 24px variant exists for every icon fails for the 12px-only utility set.

| Bad | Good | Why |
|---|---|---|
| `<AlertIcon size={24} />` assuming all icons have a 24 bucket | check the catalog; use the size the set ships | buckets are per-icon, not universal |

Source: https://primer.style/octicons/#16px

### asset/octicon-name-size-suffix

Catalog names follow `{name}-{size}` in kebab-case with variant modifiers BEFORE the size suffix (`alert-fill-16`, `bell-slash-16`, `x-circle-fill-16`); React imports drop the suffix and PascalCase the name (`alert-16` → `AlertIcon` from `@primer/octicons-react`, sized via the `size` prop). Minor cross-size inconsistencies exist (`bookmark-filled-16` vs `bookmark-fill-24`). [VERIFY: anchor did not resolve in fetched page — naming convention observed across the icon listing; the page has no dedicated naming heading]

**When it bites:** guessing a React export from a catalog name with the modifier in the wrong position (`FillAlertIcon`) or assuming a variant exists at every size produces an import that does not resolve.

| Bad | Good | Why |
|---|---|---|
| inventing `AlertFill24Icon` | grep `node_modules/@primer/octicons-react/dist/icons.d.ts` for the export | the icons.d.ts inventory is the source of truth |

Source: https://primer.style/octicons/
(grep-resolved: 12/12 exemplar-consumed icon exports in `node_modules/@primer/octicons-react/dist/icons.d.ts` @19.28.0)
