# Assets — primer-react (Octicons)

Icons ship in `@primer/octicons-react@19.28.0`, separate from the component package. The export inventory is the source of truth: `node_modules/@primer/octicons-react/dist/icons.d.ts`. Never invent an icon name — grep the inventory first.

## Usage contract

- Import the icon component from the package root: `import { RepoIcon } from '@primer/octicons-react'` (lifted from every composition exemplar).
- Size via the `size` prop (`<RepoIcon size={16} />`); 16 is the workhorse, 14 for dense numeric rows, 32 for empty-state visuals (lifted from `references/examples/repos.md` and `references/examples/empty.md`).
- Pass icons to component slots as component references, not elements: `leadingVisual={RepoIcon}`, `icon={HeartIcon}` (see `references/components/button.md`, `references/components/icon-button.md`).
- Type icon-valued data with the package's `Icon` type: `import { type Icon } from '@primer/octicons-react'` (lifted from `references/examples/home.md`).
- Never inline a raw `<svg>` when an octicon export exists (asset/raw-svg-instead-of-icon) — the package exports carry the catalog's sizing and viewBox contract.
- Catalog naming and size-bucket rules (`asset/octicon-size-buckets`, `asset/octicon-name-size-suffix`) live in `references/foundations/octicons.md`.

## Exemplar-consumed inventory (12/12 grep-resolved in icons.d.ts @19.28.0)

| Export | Used by exemplar |
|---|---|
| `BellIcon` | settings (notifications nav) |
| `CreditCardIcon` | settings (billing nav) |
| `GearIcon` | home (settings route card) |
| `GitPullRequestIcon` | dashboard (PR stat + timeline badge) |
| `GraphIcon` | home (dashboard route card) |
| `IssueOpenedIcon` | dashboard (issues stat + timeline badge) |
| `KeyIcon` | settings (SSH keys nav) |
| `PersonIcon` | settings (profile nav) |
| `PlusIcon` | home, repos (new-repository actions) |
| `RepoIcon` | home, dashboard, new, repos (repo rows + leading visuals) |
| `SearchIcon` | home, empty (empty-state visual) |
| `StarIcon` | dashboard, repos (star counts) |

Any icon outside this inventory is fine to use — but verify the export exists in `icons.d.ts` before importing.
