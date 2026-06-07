import { TextInput as PrimerTextInput } from "@primer/react";
import type { ComponentProps } from "react";

/**
 * DS-scoped single-line input.
 *
 * Thin re-export of Primer's `TextInput`. Always wrap in `FormControl`.
 * Pass icon components to `leadingVisual` / `trailingVisual`, not JSX.
 */
export const TextInput = PrimerTextInput;

export type TextInputProps = ComponentProps<typeof PrimerTextInput>;
