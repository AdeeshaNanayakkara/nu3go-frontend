"use client";

import { useState, useEffect } from "react";
import { UserSidebar } from "@/components/layout/user-sidebar/user-sidebar";
import { UserTopbar } from "@/components/layout/user-topbar/user-topbar";
import { useBackToHome } from "@/hooks/use-back-to-home";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Intercept browser back button and redirect to home page
  useBackToHome();

  useEffect(() => {
    // If restored from browser Back/Forward Cache (bfcache) after logout, reload to re-evaluate middleware
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handlePageShow as EventListener);
    return () => window.removeEventListener("pageshow", handlePageShow as EventListener);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-neutral-900 flex flex-col font-poppins relative selection:bg-[#36D068] selection:text-black overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-[#36D068]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      {/* Responsive Sidebar */}
      <UserSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
        <UserTopbar onMobileMenuToggle={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
