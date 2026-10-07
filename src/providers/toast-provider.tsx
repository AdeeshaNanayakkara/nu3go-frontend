"use client";

/**
 * Toast notification provider.
 * Uses shadcn/ui Toaster when installed.
 *
 * TODO: Replace with shadcn/ui <Toaster /> component once installed.
 */

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      {/* <Toaster /> — add shadcn/ui Toaster here */}
    </>
  );
}
