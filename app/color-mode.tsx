"use client";

import { createContext, useContext } from "react";

export type ResolvedMode = "light" | "dark";

export type ColorModeContextValue = {
  /** The resolved mode actually painted right now ("light" | "dark"). */
  resolvedMode: ResolvedMode;
  /** Flip between light and dark on demand. */
  toggle: () => void;
};

export const ColorModeContext = createContext<ColorModeContextValue | null>(null);

export function useColorModeToggle(): ColorModeContextValue {
  const value = useContext(ColorModeContext);
  if (!value) {
    throw new Error("useColorModeToggle must be used within the color-mode provider");
  }
  return value;
}
