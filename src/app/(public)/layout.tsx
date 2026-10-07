import { Suspense } from "react";
import { Header } from "@/components/layout/header/header";
import { Footer } from "@/components/layout/footer/footer";
import { PaymentResultModal } from "@/components/subscription/payment-result-modal";

/**
 * Public layout — includes sticky header, modern footer, and payment status modal
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Suspense fallback={null}>
        <PaymentResultModal />
      </Suspense>
    </div>
  );
}

