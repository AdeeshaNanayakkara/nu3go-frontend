"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentCancelRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const orderId = searchParams.get("order_id") || searchParams.get("id") || "";
    const message = searchParams.get("message") || searchParams.get("error") || "";
    const status = searchParams.get("status") || "cancelled";

    let targetUrl = `/plans?payment=${encodeURIComponent(status)}`;
    if (orderId) targetUrl += `&order_id=${encodeURIComponent(orderId)}`;
    if (message) targetUrl += `&message=${encodeURIComponent(message)}`;

    router.replace(targetUrl);
  }, [searchParams, router]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F7F6F2] py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#0B3B17] border-t-transparent mb-4" />
      <p className="font-oswald text-sm font-bold uppercase tracking-wider text-slate-700">
        Redirecting to plans...
      </p>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center bg-[#F7F6F2]">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#0B3B17] border-t-transparent" />
        </div>
      }
    >
      <PaymentCancelRedirect />
    </Suspense>
  );
}
