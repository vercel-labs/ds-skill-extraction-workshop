import { TextInput as PrimerTextInput } from "@primer/react";
import type { ComponentProps } from "react";

/**
 * DS-scoped text input.
 *
 * Thin wrapper over Primer's `TextInput`. Public API only — do not deep-import
 * from `@primer/react`. The wrapper exists so the workshop's design system has
 * a single named export per component for the meta-skill to discover.
 */
export type TextInputProps = ComponentProps<typeof PrimerTextInput>;

export function TextInput(props: TextInputProps) {
  return <PrimerTextInput {...props} />;
}
