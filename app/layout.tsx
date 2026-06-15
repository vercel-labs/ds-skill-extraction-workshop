"use client";

import "./globals.css";

import { BaseStyles, ThemeProvider } from "@primer/react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ColorModeContext,
  type ColorModeContextValue,
  type ResolvedMode,
} from "./color-mode";

type ColorModeChoice = "auto" | ResolvedMode;

function systemMode(): ResolvedMode {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function RootLayout({ children }: { children: ReactNode }) {
  // Open in the reader's system color mode; an explicit choice overrides it.
  const [choice, setChoice] = useState<ColorModeChoice>("auto");
  const [system, setSystem] = useState<ResolvedMode>("light");

  // Track the live system preference so an "auto" choice resolves correctly.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setSystem(media.matches ? "dark" : "light");
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const resolvedMode: ResolvedMode = choice === "auto" ? system : choice;

  const toggle = useCallback(() => {
    setChoice((prev) => {
      const current = prev === "auto" ? systemMode() : prev;
      return current === "dark" ? "light" : "dark";
    });
  }, []);

  // The ThemeProvider colorMode mechanism is the source of truth; we mirror the
  // SAME value onto <html data-color-mode> so the page background (painted from
  // globals.css against the document root) recolors and a headless test can read
  // the resolved mode straight off the document root.
  const colorMode = choice; // "auto" | "light" | "dark"

  const ctx: ColorModeContextValue = useMemo(
    () => ({ resolvedMode, toggle }),
    [resolvedMode, toggle],
  );

  return (
    <html
      lang="en"
      data-color-mode={colorMode}
      data-light-theme="light"
      data-dark-theme="dark"
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider colorMode={colorMode}>
          <BaseStyles
            style={{
              backgroundColor: "var(--bgColor-default)",
              minHeight: "100vh",
            }}
          >
            <ColorModeContext.Provider value={ctx}>
              {children}
            </ColorModeContext.Provider>
          </BaseStyles>
        </ThemeProvider>
      </body>
    </html>
  );
}
