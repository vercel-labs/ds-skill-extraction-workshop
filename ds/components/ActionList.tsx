import { ActionList as PrimerActionList } from "@primer/react";
import type { ComponentProps } from "react";

/**
 * DS-scoped action list.
 *
 * Thin re-export of Primer's compound `ActionList`. Public API only — do not
 * deep-import from `@primer/react`. The compound subcomponents (`Item`,
 * `Group`, `Divider`, `LeadingVisual`, `TrailingVisual`, `Description`,
 * `Heading`, `LinkItem`, `TrailingAction`) are preserved.
 *
 * Within `ds`, `ActionList` is the primitive used INSIDE `ActionMenu.Overlay`
 * to render menu items. Destructive items use `<ActionList.Item variant="danger">`.
 * See `ActionMenu.docs.tsx` for the composition.
 */
export const ActionList = PrimerActionList;

export type ActionListProps = ComponentProps<typeof PrimerActionList>;
