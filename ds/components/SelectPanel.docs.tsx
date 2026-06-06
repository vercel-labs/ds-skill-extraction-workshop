/**
 * SelectPanel — documentary example.
 *
 * Multi-select cancel rule: when the panel opens, snapshot the current
 * `selected` value. On `onCancel`, restore that snapshot. Without this, the
 * user's mid-flight toggles persist after they press "Cancel" — which a user
 * reading "Cancel" does not expect.
 *
 * Single-select panels typically commit on selection and have no Cancel
 * affordance, so the snapshot pattern only matters for multi-select.
 *
 * `open` + `onOpenChange` are required by the type; `onCancel` is required
 * only in `variant="modal"`, but providing it in `variant="anchored"` (the
 * default) is what enables the snapshot pattern.
 */
import { useRef, useState } from "react";
import { SelectPanel, type ItemInput } from "./SelectPanel";

const LABELS: ItemInput[] = [
  { id: 1, text: "bug" },
  { id: 2, text: "enhancement" },
  { id: 3, text: "docs" },
  { id: 4, text: "good-first-issue" },
];

export function SelectPanelExample() {
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
        (item as { text?: string }).text?.toLowerCase().includes(filter.toLowerCase()),
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
