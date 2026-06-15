"use client";

import type { ReactNode } from "react";
import { ThemeProvider, BaseStyles } from "@primer/react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider colorMode="auto" dayScheme="light" nightScheme="dark">
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
