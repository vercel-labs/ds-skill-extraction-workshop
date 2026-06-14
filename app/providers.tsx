"use client";

import { BaseStyles, ThemeProvider } from "@primer/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ColorMode = "auto" | "light" | "dark";

type ColorModeControl = {
  /** The current explicit choice ('auto' until the reader flips it). */
  mode: ColorMode;
  /** Flip between light and dark, resolving 'auto' against the system first. */
  toggle: () => void;
};

const ColorModeContext = createContext<ColorModeControl | null>(null);

export function useColorModeControl(): ColorModeControl {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error("useColorModeControl must be used within <Providers>");
  }
  return ctx;
}

export function Providers({ children }: { children: ReactNode }) {
  // Start in 'auto' so the page opens in the reader's system color mode.
  const [mode, setMode] = useState<ColorMode>("auto");

  // Mirror the choice onto the document root so the resolved mode is observable
  // in the DOM (a headless test can assert this) and so the page background —
  // painted by `body`, which resolves against <html> — recolors, not just the card.
  useEffect(() => {
    document.documentElement.setAttribute("data-color-mode", mode);
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((prev) => {
      const resolved =
        prev === "auto"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : prev;
      return resolved === "dark" ? "light" : "dark";
    });
  }, []);

  return (
    <ColorModeContext.Provider value={{ mode, toggle }}>
      {/* ThemeProvider's colorMode is driven by the same state, so Primer's own
          color-mode mechanism (not a hand-rolled class/CSS swap) resolves every
          semantic token. */}
      <ThemeProvider colorMode={mode}>
        <BaseStyles
          style={{
            backgroundColor: "var(--bgColor-default)",
            minHeight: "100vh",
          }}
        >
          {children}
        </BaseStyles>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
