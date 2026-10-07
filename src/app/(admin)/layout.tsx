"use client";

import { useEffect } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar/admin-sidebar";
import { useBackToHome } from "@/hooks/use-back-to-home";

/**
 * Admin layout — Includes AdminSidebar and main content container.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Intercept browser back button and redirect to home page
  useBackToHome();
  useEffect(() => {
    // If restored from browser Back/Forward Cache (bfcache) after logout, force reload to re-evaluate middleware
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handlePageShow as EventListener);
    return () => window.removeEventListener("pageshow", handlePageShow as EventListener);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-slate-50 text-slate-900 font-poppins">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-slate-50/50">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
