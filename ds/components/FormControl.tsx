import { FormControl as PrimerFormControl } from "@primer/react";
import type { ComponentProps } from "react";

/**
 * DS-scoped form control.
 *
 * Thin re-export of Primer's compound `FormControl`. Public API only — do not
 * deep-import from `@primer/react`. The wrapper exists so the workshop's
 * design system has a single named export per component for the meta-skill
 * to discover.
 *
 * Compound subcomponents are preserved:
 *   <FormControl>
 *     <FormControl.Label>Email</FormControl.Label>
 *     <TextInput name="email" />
 *     <FormControl.Caption>We never share your email.</FormControl.Caption>
 *     <FormControl.Validation variant="error">Invalid email</FormControl.Validation>
 *   </FormControl>
 */
export const FormControl = PrimerFormControl;

export type FormControlProps = ComponentProps<typeof PrimerFormControl>;
