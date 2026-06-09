import { FormControl as PrimerFormControl } from "@primer/react";
import type { ComponentProps } from "react";

/**
 * DS-scoped form field wrapper.
 *
 * Thin re-export of Primer's compound `FormControl`. Subcomponents
 * (`Label`, `Caption`, `Validation`) are preserved. See `FormControl.docs.tsx`.
 */
export const FormControl = PrimerFormControl;

export type FormControlProps = ComponentProps<typeof PrimerFormControl>;
