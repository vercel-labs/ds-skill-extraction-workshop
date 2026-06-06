/**
 * ActionMenu — documentary example.
 *
 * Controlled-state rule: if `open` is passed, `onOpenChange` MUST also be
 * wired. Passing `open` without `onOpenChange` leaves the menu unable to
 * close (the user clicks outside and nothing happens); passing
 * `onOpenChange` without `open` falls back to uncontrolled and the handler
 * never fires. The types do NOT enforce the pairing.
 *
 * Composition rule: `ActionMenu.Overlay` takes an `ActionList` (wrapped at
 * `ds/components/ActionList.tsx`) as its child. Destructive items use
 * `<ActionList.Item variant="danger">` — never a custom red className. The
 * announced role is `menuitem`; do not override to `menuitemcheckbox` unless
 * the item is actually a toggle.
 *
 * Trigger composition: prefer `ActionMenu.Button` for the trigger. Reach for
 * `ActionMenu.Anchor` only when the trigger must be a custom element (an
 * icon-only button, a submenu inside another ActionList). `ActionMenu.Anchor`
 * is for wrapping; `ActionMenu.Button` is the default.
 */
import { useState } from "react";
import { ActionList } from "./ActionList";
import { ActionMenu } from "./ActionMenu";

export function ActionMenuExample() {
  const [open, setOpen] = useState(false);

  return (
    <ActionMenu open={open} onOpenChange={setOpen}>
      <ActionMenu.Button>Open menu</ActionMenu.Button>
      <ActionMenu.Overlay width="medium">
        <ActionList>
          <ActionList.Item onSelect={() => setOpen(false)}>Pin</ActionList.Item>
          <ActionList.Item onSelect={() => setOpen(false)}>Lock</ActionList.Item>
          <ActionList.Item onSelect={() => setOpen(false)}>Transfer</ActionList.Item>
          <ActionList.Divider />
          <ActionList.Item variant="danger" onSelect={() => setOpen(false)}>
            Delete
          </ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
}
