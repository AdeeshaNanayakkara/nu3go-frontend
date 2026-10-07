import type { Metadata } from "next";
import { AuthBackground } from "@/components/layout/auth-background";

export const metadata: Metadata = {
  title: "Admin Portal Sign In — Nu3Go",
  description: "Secure administrator authentication and operations control.",
};

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen lg:h-screen lg:max-h-screen w-full font-poppins flex flex-col justify-center items-center overflow-x-hidden overflow-y-auto lg:overflow-hidden selection:bg-[#36D068] selection:text-[#0B3B17] bg-[#0c1a11]">
      {/* ─── Clean Seamless Culinary Background ─── */}
      <AuthBackground />

      {/* ─── Main Admin Auth Card Container (Centered, No Dark Box Backdrop) ─── */}
      <main className="w-full max-w-[460px] sm:max-w-[490px] px-4 sm:px-6 py-6 relative z-10 flex items-center justify-center">
        {children}
      </main>
    </div>
  );
}

