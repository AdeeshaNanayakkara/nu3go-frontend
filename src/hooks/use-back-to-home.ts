"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Hook to intercept browser back button on dashboard routes (User & Admin)
 * and direct the user to the home page ('/').
 */
export function useBackToHome() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Push state into history so that clicking the browser back button fires popstate
    window.history.pushState({ dashboardTrap: true }, "", window.location.href);

    const handlePopState = () => {
      // Intercept browser back button and redirect directly to home page
      window.location.replace("/");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname]);
}
