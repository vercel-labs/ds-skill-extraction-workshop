"use client";

import { BaseStyles, ThemeProvider } from "@primer/react";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider colorMode="night">
      <BaseStyles
        style={{
          backgroundColor: "var(--bgColor-default)",
          minHeight: "100vh",
        }}
      >
        {children}
      </BaseStyles>
    </ThemeProvider>
  );
}
