"use client"

import { ThemeProvider } from "@primer/react"
import { PrMergedTheater } from "@/components/showcase/pr-merged-theater"

export default function Page() {
  return (
    <ThemeProvider colorMode="auto" preventSSRMismatch>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--bgColor-default, #ffffff)",
        }}
      >
        <PrMergedTheater />
      </div>
    </ThemeProvider>
  )
}
