import type { ReactNode } from "react";
import { BaseStyles, ThemeProvider } from "@primer/react";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-color-mode="auto" data-light-theme="light" data-dark-theme="dark">
      <body>
        <ThemeProvider>
          <BaseStyles>{children}</BaseStyles>
        </ThemeProvider>
      </body>
    </html>
  );
}
