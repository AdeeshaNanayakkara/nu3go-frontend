"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

/**
 * Hydrates auth store from the HttpOnly cookie on app mount.
 * Runs once on first render — calls /api/auth/me to restore session.
 */
export function AuthHydrator() {
  const hydrateFromCookie = useAuthStore((s) => s.hydrateFromCookie);

  useEffect(() => {
    hydrateFromCookie();
  }, [hydrateFromCookie]);

  return null;
}
