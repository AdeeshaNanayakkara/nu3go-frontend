"use client";

/**
 * Composes all application providers.
 */

import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { GoogleProvider } from "@/providers/google-provider";
import { AuthHydrator } from "@/providers/auth-hydrator";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <GoogleProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthHydrator />
          {children}
        </ToastProvider>
      </ThemeProvider>
    </GoogleProvider>
  );
}
