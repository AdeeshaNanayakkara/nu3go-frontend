"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

interface GoogleProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps the app with the Google OAuth context.
 * Requires NEXT_PUBLIC_GOOGLE_CLIENT_ID to be set in environment variables.
 */
export function GoogleProvider({ children }: GoogleProviderProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  if (!clientId) {
    // Render children without Google provider if not configured
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}

