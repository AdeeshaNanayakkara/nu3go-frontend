import { AuthBackground } from "@/components/layout/auth-background";

/**
 * Customer Auth Layout — Matching the Nu3Go landing page aesthetic.
 * Clean, footer-free layout with creative culinary backdrop.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen lg:h-screen lg:max-h-screen w-full font-poppins flex flex-col justify-center items-center overflow-x-hidden overflow-y-auto lg:overflow-hidden selection:bg-[#36D068] selection:text-[#0B3B17] bg-[#0c1a11]">
      {/* ─── Creative Culinary Background ─── */}
      <AuthBackground />

      {/* ─── Main Content Container (Centered Vertically & Horizontally) ─── */}
      <main className="w-full flex-1 flex items-center justify-center px-3 sm:px-4 lg:px-6 py-4 relative z-10 min-h-0">
        <div className="w-full flex justify-center">
          {children}
        </div>
      </main>
    </div>
  );
}
