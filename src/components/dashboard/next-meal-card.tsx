"use client";

import Image from "next/image";
import {
  Utensils,
  Flame,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  Award,
} from "lucide-react";

interface NextMealCardProps {
  mealName?: string;
  category?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  imageUrl?: string;
  deliveryTime?: string;
  deliveryAddress?: string;
  chefNote?: string;
}

export function NextMealCard({
  mealName = "Avocado, Grilled Herb Chicken & Quinoa Super Bowl",
  category = "High-Protein Breakfast",
  calories = 520,
  protein = 42,
  carbs = 38,
  fat = 14,
  imageUrl = "/images/hero-dish.png",
  deliveryTime = "Tomorrow • 7:00 AM – 8:30 AM",
  deliveryAddress = "Primary Address",
  chefNote = "Freshly prepared overnight oats, grilled chicken breast & superfood seed blend.",
}: NextMealCardProps) {
  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 relative overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full font-poppins">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-[#15803D]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-oswald text-[11px] font-bold uppercase tracking-wider text-[#15803D] block">
              Next Delivery
            </span>
            <span className="text-xs font-semibold text-neutral-900">{deliveryTime}</span>
          </div>
        </div>

        <span className="font-oswald text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
          {category}
        </span>
      </div>

      {/* Dish Showcase Area */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center my-2 flex-1">
        {/* Dish Image */}
        <div className="sm:col-span-4 relative flex items-center justify-center">
          <div className="w-32 h-32 sm:w-36 sm:h-36 relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 shadow-sm group">
            <Image
              src={imageUrl}
              alt={mealName}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 128px, 144px"
              priority
            />
          </div>
        </div>

        {/* Dish Info & Macros */}
        <div className="sm:col-span-8 space-y-3">
          <h3 className="font-oswald text-lg sm:text-xl font-bold uppercase text-neutral-900 leading-snug tracking-tight">
            {mealName}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-normal">
            {chefNote}
          </p>

          {/* Macros Pills */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] text-slate-500 block font-medium">Calories</span>
              <span className="font-oswald text-xs font-black text-[#15803D]">{calories} kcal</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] text-slate-500 block font-medium">Protein</span>
              <span className="font-oswald text-xs font-black text-neutral-900">{protein}g</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] text-slate-500 block font-medium">Carbs</span>
              <span className="font-oswald text-xs font-black text-neutral-900">{carbs}g</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] text-slate-500 block font-medium">Fat</span>
              <span className="font-oswald text-xs font-black text-neutral-900">{fat}g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Address */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-[#36D068] shrink-0" />
          <span className="truncate">Delivering to: {deliveryAddress}</span>
        </div>
        <div className="flex items-center gap-1 text-[#15803D] font-oswald text-xs font-bold uppercase tracking-wider shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Confirmed</span>
        </div>
      </div>
    </div>
  );
}
