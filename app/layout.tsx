"use client";

import "./globals.css";

import { BaseStyles, ThemeProvider } from "@primer/react";
import type { ReactNode } from "react";

// Provider shell lifted from vercel-labs/primer-nextjs-template@app/layout.tsx.
// - data-color-mode="auto" opens the page in the reader's system mode; the
//   in-UI toggle (see components/showcase/pr-merged-theater.tsx) overrides it
//   through the design system's own setColorMode, mirroring the resolved mode
//   back onto <html> so the page background recolors with the panel.
// - Both light.css AND dark.css are imported in globals.css; the trio below
//   sets the resolution context.
// - minHeight (not the reference project's fixed height: "100vh") fills the
//   viewport without clipping a panel taller than the screen.
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
        <ThemeProvider colorMode="auto">
          <BaseStyles
            style={{
              backgroundColor: "var(--bgColor-default)",
              minHeight: "100vh",
            }}
          >
            {children}
          </BaseStyles>
        </ThemeProvider>
      </body>
    </html>
  );
}
