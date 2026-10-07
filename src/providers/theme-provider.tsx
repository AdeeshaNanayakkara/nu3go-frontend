"use client";

/**
 * Theme provider for dark/light mode.
 * Uses next-themes when installed, placeholder until then.
 *
 * TODO: Install next-themes and replace with:
 * import { ThemeProvider as NextThemesProvider } from "next-themes";
 */

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Placeholder — replace with next-themes ThemeProvider
  return <>{children}</>;
}
