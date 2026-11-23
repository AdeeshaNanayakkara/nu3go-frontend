"use client";

import { Toaster } from "sonner";
import { APP_CONFIG } from "@/constants/config";

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={APP_CONFIG.TOAST_DURATION_MS}
        toastOptions={{
          style: {
            fontFamily: "Poppins, sans-serif",
            fontSize: "13px",
            fontWeight: "600",
            borderRadius: "16px",
          },
        }}
      />
    </>
  );
}
