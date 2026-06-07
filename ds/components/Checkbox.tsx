import { Checkbox as PrimerCheckbox } from "@primer/react";
import type { ComponentProps } from "react";

/**
 * DS-scoped checkbox.
 *
 * Thin re-export of Primer's `Checkbox`. Always wrap in `FormControl`.
 */
export const Checkbox = PrimerCheckbox;

export type CheckboxProps = ComponentProps<typeof PrimerCheckbox>;
