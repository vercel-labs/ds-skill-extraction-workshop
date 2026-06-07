/**
 * FormControl — documentary example.
 *
 * Composition rule: every interactive input (`TextInput`, `Textarea`,
 * `Select`, `Checkbox`) MUST live inside a `FormControl` with
 * `FormControl.Label` (and `FormControl.Caption` for help text). Bare
 * inputs lose label association and fail axe.
 *
 * Checkbox layout: put `Checkbox` before `FormControl.Label` inside the
 * control, matching Primer's documented pattern.
 */
import { Checkbox } from "./Checkbox";
import { FormControl } from "./FormControl";

export function FormControlExample() {
  return (
    <FormControl>
      <Checkbox defaultChecked />
      <FormControl.Label>Add a README file</FormControl.Label>
      <FormControl.Caption>
        This is where you can write a long description for your project.
      </FormControl.Caption>
    </FormControl>
  );
}
