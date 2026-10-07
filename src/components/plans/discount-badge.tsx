"use client";

import { Sparkles, Tag, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PackageDiscountInfo } from "./plan-utils";

interface DiscountBadgeProps {
  discount: PackageDiscountInfo;
  actualPrice?: number;
  className?: string;
  theme?: "dark" | "light";
}

/**
 * Eye-catching 3D Ribbon / Banner style discount badge matching the promotional sale aesthetic.
 * Displays discount name and percentage in a prominent, high-converting banner.
 */
export function DiscountBadge({
  discount,
  actualPrice,
  className,
  theme = "dark",
}: DiscountBadgeProps) {
  const savings =
    actualPrice && discount.percentage > 0
      ? Math.round(actualPrice * (discount.percentage / 100))
      : null;

  return (
    <div className={cn("inline-flex items-center gap-2 flex-wrap select-none", className)}>
      {/* ─── 3D Promotional Sale Ribbon Tag ─── */}
      <div className="relative inline-flex items-stretch rounded-xl overflow-hidden shadow-lg shadow-red-500/25 border border-red-500/40 transform transition-all duration-300 hover:scale-105 active:scale-95 group">
        {/* Left Segment: Discount Campaign Name (Vibrant Yellow / Gold) */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-2.5 sm:px-3 py-1 flex items-center justify-center gap-1">
          <Flame className="w-3.5 h-3.5 text-red-600 fill-red-600 animate-pulse" />
          <span className="font-oswald text-[11px] sm:text-xs font-black tracking-wider uppercase text-neutral-950 drop-shadow-2xs whitespace-nowrap">
            {discount.name || "SALE"}
          </span>
        </div>

        {/* Right Segment: Discount Percentage (Vibrant Fire Red Ribbon) */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-2.5 sm:px-3 py-1 flex items-center justify-center gap-1 relative overflow-hidden">
          {/* Shimmer Highlight */}
          <div className="absolute inset-0 bg-white/20 skew-x-12 opacity-60 pointer-events-none group-hover:translate-x-full transition-transform duration-700" />
          <span className="font-oswald text-xs sm:text-sm font-black tracking-tight uppercase text-white drop-shadow-sm whitespace-nowrap">
            {discount.percentage}% OFF
          </span>
        </div>
      </div>

      {/* ─── Instant Savings Amount Callout ─── */}
      {savings && (
        <span
          className={cn(
            "text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-lg inline-flex items-center gap-1 border",
            theme === "dark"
              ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-400 shadow-sm"
              : "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs"
          )}
        >
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <span>Save LKR {savings.toLocaleString("en-US")}</span>
        </span>
      )}
    </div>
  );
}
