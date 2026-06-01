/**
 * FormControl — documentary example.
 *
 * Composition floor: Wrap every TextInput / Checkbox in a `<FormControl>`.
 * Bare inputs lose the label association and fail axe.
 */
import { FormControl } from "./FormControl";
import { TextInput } from "./TextInput";

export function FormControlExample() {
  return (
    <FormControl>
      <FormControl.Label>Email</FormControl.Label>
      <TextInput name="email" />
    </FormControl>
  );
}
