"use client"

import type { ReactNode } from "react"
import { ThemeProvider, BaseStyles } from "@primer/react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider colorMode="auto">
      <BaseStyles>{children}</BaseStyles>
    </ThemeProvider>
  )
}
