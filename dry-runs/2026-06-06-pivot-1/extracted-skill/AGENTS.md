# AGENTS — ds

Cross-agent contract for the `ds` design-system skill. Any agent touching this skill reads `SKILL.md` first, then the per-domain files in `references/`.

## Letter to future agents

This DS is a thin Primer React wrapper. The wrappers exist precisely because Primer ships loose on a few things — slot composition (`PageHeader`), variant semantics (`Banner`), a11y wiring (`DataTable`), controlled-state coordination (`SelectPanel`, `ActionMenu`). The TypeScript types do NOT enforce most of the rules in this skill. They render. They render wrong, and the failure mode is visual, not a compiler error.

The first instinct when generating UI is to reach for what Primer's types accept. Don't stop there. Open `ds/components/<Name>.docs.tsx` and read the JSDoc — that's where the project floor lives. Every cited rule in `references/components/*.md` traces back to one of those files plus a corresponding type-file or wrapper line.

When in doubt: open the wrapper (`ds/components/<Name>.tsx`), open the docs file (`ds/components/<Name>.docs.tsx`), then open `node_modules/@primer/react/dist/<Name>/<Name>.d.ts`. The three together are the contract.

## Common agent failure modes

Specific to `ds`. Notes for the next agent that generates an issues page or a settings screen against this skill.

- **Dropping `PageHeader.Actions` inside `PageHeader.TitleArea`.** The words "header" and "title" feel synonymous; they are not. `TitleArea` is the inline cluster around the title text only. `Actions`, `TrailingAction`, `ContextArea`, and `Navigation` are chrome-level and go OUTSIDE `TitleArea`. TypeScript accepts the wrong shape; the layout grid silently breaks. See `references/components/page-header.md`.

- **Using `<Banner variant="critical">` for any red-coloured message.** `critical` is reserved for blocking failures the user must resolve before continuing (payment failed; deploy blocked; data loss imminent). A "two-factor required next month" message is `warning`, not `critical`. The variant is semantic — it maps to an `alert`-style landmark and stronger SR urgency, not a colour swap.

- **Forgetting to pre-sort `DataTable` data.** Setting `initialSortColumn` + `initialSortDirection` does NOT sort on mount — it only labels the column header arrow. If `data` is not already in that order, the rendered table looks unsorted and silently disagrees with its own header.

- **Zero or multiple `rowHeader: true` columns on `DataTable`.** Exactly one column must be the row header (typically the title). Zero loses the SR announcement; multiple fight each other.

- **Omitting `onCancel` snapshot/restore on multi-select `SelectPanel`.** Cancel that does not restore the pre-open selection is not a cancel; it is "close and keep my half-edited state", which the user did not ask for. Snapshot in `onOpenChange(true)`, restore in `onCancel`.

- **Passing `open` to `ActionMenu` without `onOpenChange`.** TypeScript does not catch the orphan controlled prop. The menu opens, the user clicks outside, nothing happens — because nothing is wired to set `open` back to `false`. The two props are a pair.

- **Reaching for `ActionMenu.Anchor` when `ActionMenu.Button` suffices.** `ActionMenu.Button` is the default trigger and handles the ARIA wiring out of the box. `ActionMenu.Anchor` is for wrapping a custom trigger element (an icon-only button, a submenu); use only when the default does not fit.

- **Styling a destructive item with a className instead of `variant="danger"`.** `ActionList.Item` ships `variant="danger"` for destructive actions. A red `className` paints the item but skips the destructive role wiring.

## What this skill does NOT cover

- **Copy** — button labels, placeholder strings, empty-state messaging, banner titles/descriptions as prose. If a copy rule surfaces, log it; do not extract it here.
- **Tokens** — `@primer/primitives` is a peer dep but no token rules are extracted in v1. `references/tokens.md` is intentionally a stub. When a token rule becomes necessary, extract it into the tokens file with a `Bad | Good | Why` row.
- **Assets** — octicons ship in `@primer/octicons-react`, a separate package. If the user requests icons, fetch that package and treat asset names as a separate skill surface.
- **Cross-component composition patterns** beyond what the routing-table cross-load already covers. If a recurring screen pattern emerges (e.g. "issues page composition"), promote it into `references/patterns.md` at that point.
