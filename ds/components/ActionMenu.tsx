import { ActionMenu as PrimerActionMenu } from "@primer/react";
import type { ComponentProps } from "react";

/**
 * DS-scoped action menu.
 *
 * Thin re-export of Primer's compound `ActionMenu`. Public API only — do not
 * deep-import from `@primer/react`. The compound subcomponents (`Button`,
 * `Anchor`, `Overlay`, `Divider`) are preserved.
 *
 * ActionMenu's children come from `ActionList` (a sibling primitive wrapped
 * at `ds/components/ActionList.tsx`). Pair them inside `<ActionMenu.Overlay>`.
 *
 * Controlled-state rule: if `open` is passed, `onOpenChange` MUST also be
 * wired — TypeScript does not enforce the pairing. See `ActionMenu.docs.tsx`.
 */
export const ActionMenu = PrimerActionMenu;

export type ActionMenuProps = ComponentProps<typeof PrimerActionMenu>;
