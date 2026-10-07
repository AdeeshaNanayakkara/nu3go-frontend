"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentSuccessRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const orderId = searchParams.get("order_id") || searchParams.get("id") || "";
    const targetUrl = `/plans?payment=success${orderId ? `&order_id=${encodeURIComponent(orderId)}` : ""}`;
    router.replace(targetUrl);
  }, [searchParams, router]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F7F6F2] py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#0B3B17] border-t-transparent mb-4" />
      <p className="font-oswald text-sm font-bold uppercase tracking-wider text-slate-700">
        Redirecting to your subscription summary...
      </p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center bg-[#F7F6F2]">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#0B3B17] border-t-transparent" />
        </div>
      }
    >
      <PaymentSuccessRedirect />
    </Suspense>
  );
}
