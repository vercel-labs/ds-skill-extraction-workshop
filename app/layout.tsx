import "./globals.css";

import type { ReactNode } from "react";

import { Providers } from "./providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-color-mode="auto"
      data-light-theme="light"
      data-dark-theme="dark"
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
