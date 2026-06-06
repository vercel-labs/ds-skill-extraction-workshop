"use client";

import { BaseStyles, ThemeProvider } from "@primer/react";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider colorMode="night">
      <BaseStyles>{children}</BaseStyles>
    </ThemeProvider>
  );
}
