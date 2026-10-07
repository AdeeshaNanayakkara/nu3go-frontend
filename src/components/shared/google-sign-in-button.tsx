"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/api/auth.service";

import { useSearchParams } from "next/navigation";

interface GoogleSignInButtonProps {
  label?: string;
  callbackUrl?: string | null;
  preventAdminLogin?: boolean;
  onAdminDetected?: () => void;
}

function getSafeRedirectUrl(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback;
  if (url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }
  return fallback;
}

/**
 * Google Sign In button.
 *
 * Uses the official `<GoogleLogin>` component from `@react-oauth/google`.
 * This renders Google's own GIS iframe button which:
 *   - Is always clickable in production (Google controls the iframe click handler)
 *   - Returns a signed `id_token` (credential JWT) directly — no client secret needed
 *   - Handles all consent, account selection, and credential issuance internally
 *
 * Why NOT useGoogleLogin hook?
 *   - `flow: 'implicit'` → Token Client, returns only `access_token`, NEVER `id_token`
 *   - `flow: 'auth-code'` → requires GOOGLE_CLIENT_SECRET in the BFF for code exchange
 *   The `<GoogleLogin>` component avoids both problems.
 *
 * Appearance:
 *   The GIS iframe renders Google's own branded button. We wrap it in a styled
 *   container and use CSS to override the iframe's border-radius and size so it
 *   fits the design system. Google's Brand Guidelines require showing the G logo
 *   and "Sign in with Google" text, which GIS enforces — our styling just makes
 *   the button match the surrounding form card.
 *
 * Architecture:
 *   Google GIS popup → credential (id_token JWT)
 *     → POST /api/auth/google (BFF)
 *       → POST /api/v1/auth/google (backend)
 *         → Validate id_token → return user + tokens
 *     → HttpOnly cookies set → redirect by role
 *
 * Requires:
 *   - NEXT_PUBLIC_GOOGLE_CLIENT_ID in Vercel / .env
 *   - GoogleOAuthProvider wrapping the app (via AppProviders)
 *   - Google Cloud Console: production domain in Authorized JavaScript Origins
 */
export function GoogleSignInButton({
  label = "Sign in with Google",
  callbackUrl = null,
  preventAdminLogin = false,
  onAdminDetected,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const effectiveCallback =
    callbackUrl ||
    searchParams.get("callbackUrl") ||
    searchParams.get("redirect") ||
    searchParams.get("next");

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      setError("Google sign-in failed — no credential received.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = await authService.loginWithGoogle(idToken);
      const isAdmin = user.role?.toUpperCase() === "ADMIN";

      if (isAdmin && (preventAdminLogin || onAdminDetected)) {
        await useAuthStore.getState().logout();
        if (onAdminDetected) {
          onAdminDetected();
        } else {
          setError("Administrator account detected. Please use the Admin Portal to sign in.");
        }
        return;
      }

      setUser(user);
      if (isAdmin) {
        const target = effectiveCallback && effectiveCallback.startsWith("/admin") ? effectiveCallback : "/admin";
        window.location.replace(target);
        return;
      }

      const target = getSafeRedirectUrl(effectiveCallback, "/");
      window.location.replace(target);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setError("Google sign-in failed. Please try again.");
  };

  if (!clientId) {
    return (
      <p className="text-amber-600 text-xs font-medium text-center w-full">
        Google Sign-In is not configured (missing NEXT_PUBLIC_GOOGLE_CLIENT_ID).
      </p>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {isLoading ? (
        /* Loading overlay — shown while the BFF call is in-flight */
        <div className="gsi-loading-btn" aria-busy="true">
          <svg className="gsi-loading-btn__spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
            <path
              fill="currentColor"
              opacity="0.8"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Signing in with Google…</span>
        </div>
      ) : (
        /*
         * The GoogleLogin component renders Google's GIS button in an iframe.
         * containerProps.className applies our wrapper styles.
         * The inner CSS class "gsi-btn-frame" targets the iframe itself via
         * descendant selectors in globals.css to adjust border-radius / size.
         */
        <div className="gsi-btn-frame flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            text="signin_with"
            shape="rectangular"
            theme="outline"
            size="large"
            logo_alignment="center"
            width="350"
            containerProps={{ className: "gsi-btn-container w-full flex justify-center" }}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="text-red-500 text-xs font-medium text-center w-full px-1 leading-snug">
          {error}
        </p>
      )}
    </div>
  );
}
