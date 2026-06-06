---
title: SelectPanel
description: Filterable single/multi-select overlay anchored to a trigger. Multi-select must snapshot `selected` on open and restore in `onCancel`.
---

## Public imports

```ts
import { SelectPanel, type ItemInput } from "@/ds/components/SelectPanel";
```

The wrapper re-exports `SelectPanelProps` and renames Primer's `SelectPanelItemInput` to `ItemInput` for consumer convenience.

## When to use

Use `SelectPanel` for a filterable picker — labels on an issue, reviewers on a PR, a list of long-ish but bounded options the user wants to type-narrow. For fewer than ~5 fixed options without filtering, a plain `<select>` is enough. For free-form text entry, use a text input, not `SelectPanel`.

## Key props

- `open: boolean` — controlled visibility. (SelectPanel.d.ts)
- `onOpenChange: (open: boolean) => void` — required pair to `open`. Snapshot `selected` here when transitioning to `true`. (SelectPanel.d.ts)
- `items: ItemInput[]` — the filtered item set the panel renders. Filter upstream of the prop. (SelectPanel.d.ts)
- `selected: ItemInput | undefined` (single) OR `ItemInput[]` (multi) — chooses single vs multi-select by shape alone. (SelectPanel.d.ts, ds/components/SelectPanel.tsx:11-15)
- `onSelectedChange` — fires as the user toggles; type matches `selected`. (SelectPanel.d.ts)
- `filterValue: string` + `onFilterChange: (v: string) => void` — controlled filter input.
- `renderAnchor: (props) => ReactNode` — render-prop for the trigger element. Always receives `children` + a11y `aria-*` attrs to spread.
- `onCancel: () => void` — only required in `variant="modal"`, but providing it in the default `variant="anchored"` is what enables the snapshot/restore pattern for multi-select. (ds/components/SelectPanel.docs.tsx:13-15)
- `title: string` — visible header for the panel.

## Best Practices

### When to use

- Use for filterable pickers (labels, reviewers, repositories). For ≤5 fixed options, prefer `<select>`. For free-form input, use a text field.

### Behavior

- Single-select panels commit on selection; they typically have no Cancel affordance. The snapshot/restore pattern only applies to multi-select. (ds/components/SelectPanel.docs.tsx:8-10)
- For **multi-select**: snapshot the current `selected` array when the panel opens (`onOpenChange(true)`), and restore that snapshot inside `onCancel`. Without this, the user's mid-flight toggles persist after pressing "Cancel" — which a user reading "Cancel" does not expect. (ds/components/SelectPanel.docs.tsx:3-7)
- `items` is the already-filtered list. Filter upstream — the component does not own the filter state.

### Accessibility

- The trigger rendered by `renderAnchor` must spread the `aria-*` props the render prop receives. Dropping them breaks the SR announcement of the popover relationship.
- Provide a meaningful `title` — it becomes the panel's accessible name.

## Composition examples

```tsx
import { useRef, useState } from "react";
import { SelectPanel, type ItemInput } from "@/ds/components/SelectPanel";

const LABELS: ItemInput[] = [
  { id: 1, text: "bug" },
  { id: 2, text: "enhancement" },
  { id: 3, text: "docs" },
  { id: 4, text: "good-first-issue" },
];

export function LabelFilter() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ItemInput[]>([]);
  const [filter, setFilter] = useState("");
  const snapshotRef = useRef<ItemInput[]>([]);

  return (
    <SelectPanel
      title="Filter by label"
      renderAnchor={({ children, ...anchorProps }) => (
        <button type="button" {...anchorProps}>
          {children ?? "Labels"}
        </button>
      )}
      placeholder="Select labels"
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) snapshotRef.current = selected;
        setOpen(nextOpen);
      }}
      items={LABELS.filter((item) =>
        (item as { text?: string }).text
          ?.toLowerCase()
          .includes(filter.toLowerCase()),
      )}
      selected={selected}
      onSelectedChange={setSelected}
      filterValue={filter}
      onFilterChange={setFilter}
      onCancel={() => {
        setSelected(snapshotRef.current);
        setOpen(false);
      }}
    />
  );
}
```

## Source references

- `ds/components/SelectPanel.tsx:17` — wrapper (re-export of `@primer/react` `SelectPanel`).
- `ds/components/SelectPanel.tsx:20-23` — re-exported types (`SelectPanelProps`, `ItemInput`).
- `ds/components/SelectPanel.docs.tsx:3-7` — multi-select cancel snapshot rule with runnable example.
- `node_modules/@primer/react/dist/SelectPanel/SelectPanel.d.ts` — single vs multi-select type discrimination.
- `node_modules/@primer/react/dist/index.d.ts:107` — `SelectPanelItemInput` root re-export.

## Common mistakes

| Bad | Good | Why |
|-----|------|-----|
| Multi-select panel with no snapshot/restore, just `onCancel={() => setOpen(false)}` | Snapshot `selected` in `onOpenChange(true)`; restore it in `onCancel` | "Cancel" that does not restore is not cancel; it's "close keeping my edits", which surprises users. |
| `selected: undefined` paired with `onSelectedChange: (next: ItemInput[]) => void` | Match shapes: either single (`ItemInput \| undefined`) or multi (`ItemInput[]`) on both sides | The single-vs-multi mode is discriminated by the shape of `selected` alone. Mixed shapes are a type error. |
| `renderAnchor={() => <button>Labels</button>}` (no prop spread) | `renderAnchor={({ children, ...rest }) => <button {...rest}>{children ?? "Labels"}</button>}` | The render prop receives the ARIA wiring; dropping it breaks the popover relationship for SR users. |
| Letting `items` be the full unfiltered list while passing `filterValue` | Filter `items` upstream using `filterValue` | `SelectPanel` displays exactly what you give it. The component does not own filter logic. |

## Things to never invent

- `<SelectPanel mode="multi">` — there is no `mode` prop. Multi-select is inferred from the shape of `selected`.
- `onConfirm` / `onApply` — no such props. Multi-select commits via `onSelectedChange` per toggle.
- Custom filter algorithms inside the component — `items` is the visible-result array, period.
