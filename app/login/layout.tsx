import "@primer/primitives/dist/css/functional/themes/light.css";
import "@primer/primitives/dist/css/functional/size/size.css";
import "@primer/primitives/dist/css/functional/typography/typography.css";

import type { ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
