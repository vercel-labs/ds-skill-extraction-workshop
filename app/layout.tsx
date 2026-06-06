import "./globals.css";
import "@primer/primitives/dist/css/functional/themes/light.css";
import "@primer/primitives/dist/css/functional/size/size.css";
import "@primer/primitives/dist/css/functional/typography/typography.css";

import type { ReactNode } from "react";
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-color-mode="light"
      data-light-theme="light"
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
