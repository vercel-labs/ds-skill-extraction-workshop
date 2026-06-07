/**
 * IconButton — documentary example.
 *
 * `aria-label` is required — there is no visible text for screen readers to
 * announce. Pass the icon component to `icon` (`icon={HeartIcon}`), not JSX.
 */
import { HeartIcon } from "@primer/octicons-react";
import { IconButton } from "./IconButton";

export function IconButtonExample() {
  return <IconButton icon={HeartIcon} aria-label="Star" variant="default" />;
}
