import { SelectPanel as PrimerSelectPanel } from "@primer/react";

/**
 * DS-scoped select panel.
 *
 * Thin re-export of Primer's `SelectPanel`. Public API only — do not
 * deep-import from `@primer/react`. The attached subcomponents
 * (`SecondaryActionButton`, `SecondaryActionLink`, `Message`) are preserved.
 *
 * Single vs multi-select is determined by the shape of `selected` /
 * `onSelectedChange`:
 *   - Single: `selected: ItemInput | undefined`
 *   - Multi:  `selected: ItemInput[]`
 *
 * For multi-select, snapshot `selected` when the panel opens and restore that
 * snapshot in `onCancel` — see `SelectPanel.docs.tsx`.
 */
export const SelectPanel = PrimerSelectPanel;

export type {
  SelectPanelProps,
  SelectPanelItemInput as ItemInput,
} from "@primer/react";
