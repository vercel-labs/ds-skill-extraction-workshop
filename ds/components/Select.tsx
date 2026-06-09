import { Select as PrimerSelect } from "@primer/react";
import type { ComponentProps } from "react";

/**
 * DS-scoped select.
 *
 * Thin re-export of Primer's compound `Select`. `Select.Option` is
 * preserved. Always wrap in `FormControl`.
 */
export const Select = PrimerSelect;

export type SelectProps = ComponentProps<typeof PrimerSelect>;
