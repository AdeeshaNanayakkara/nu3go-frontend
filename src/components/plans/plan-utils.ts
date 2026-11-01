import type { PublicPackage, PublicAssignedPlan } from "@/services/api/package.service";

export interface DurationPriceOption {
  key: string;
  label: string;
  subLabel: string;
  days: number;
  price: number;
  returnPrice?: number;
  unit: string;
  badge?: string;
  description: string;
  rules: string[];
  planId?: string;
  planType?: "FIXED" | "CUSTOM" | string;
  durationLimit?: number;
}

export interface PackageDiscountInfo {
  id?: string;
  name: string;
  percentage: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Checks if a discount is currently active and has not expired.
 * Verifies percentage > 0, optional is_active boolean flag,
 * start_date (must not be in the future), and end_date (must not be in the past).
 */
export function isDiscountActive(discount?: {
  percentage?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
} | null): boolean {
  if (!discount || typeof discount.percentage !== "number" || discount.percentage <= 0) {
    return false;
  }

  // Explicit is_active flag check
  if (discount.is_active === false) {
    return false;
  }

  const now = new Date();

  // If start_date is set, ensure the promotion has started
  if (discount.start_date) {
    const start = new Date(discount.start_date);
    if (!isNaN(start.getTime()) && start.getTime() > now.getTime()) {
      return false;
    }
  }

  // If end_date is set, ensure the promotion has not expired
  if (discount.end_date) {
    let end = new Date(discount.end_date);
    // If end_date is formatted as a pure date 'YYYY-MM-DD', treat it as valid through the end of that day UTC
    if (typeof discount.end_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(discount.end_date.trim())) {
      end = new Date(`${discount.end_date.trim()}T23:59:59.999Z`);
    }
    if (!isNaN(end.getTime()) && end.getTime() < now.getTime()) {
      return false;
    }
  }

  return true;
}

/**
 * Extract active discount details from package or plan if assigned and strictly active (unexpired).
 * Returns null if no discount exists or if the discount has expired.
 */
export function getPackageDiscount(
  pkg?: PublicPackage | null,
  plan?: PublicAssignedPlan | null
): PackageDiscountInfo | null {
  if (!pkg && !plan) return null;

  // Check plan-level discount first if assigned, then fallback to package-level discount
  const d =
    plan?.active_discount ||
    plan?.discount ||
    pkg?.active_discount ||
    pkg?.discount;

  if (d && isDiscountActive(d)) {
    return {
      id: d.id,
      name: d.name || "SALE",
      percentage: d.percentage,
      startDate: d.start_date,
      endDate: d.end_date,
    };
  }

  return null;
}

/**
 * Calculate final price after percentage discount deduction.
 */
export function calculateDiscountedPrice(actualPrice: number, percentage?: number): number {
  if (!percentage || percentage <= 0) return actualPrice;
  const discounted = actualPrice * (1 - percentage / 100);
  return Math.round(discounted * 100) / 100;
}

/**
 * Calculates per-meal price using return_price fetched from response if available,
 * otherwise falls back to calculating price / days.
 */
export function getPerMealPrice(
  plan?: { return_price?: number; price?: number; duration_limit?: number } | null,
  duration?: { returnPrice?: number; price: number; days: number } | null,
  discountPercentage?: number
): number {
  const returnPrice =
    typeof plan?.return_price === "number" && plan.return_price > 0
      ? plan.return_price
      : typeof duration?.returnPrice === "number" && duration.returnPrice > 0
        ? duration.returnPrice
        : null;

  if (returnPrice !== null) {
    if (discountPercentage && discountPercentage > 0) {
      return calculateDiscountedPrice(returnPrice, discountPercentage);
    }
    return returnPrice;
  }

  // Fallback: calculate price / days
  const basePrice = duration?.price || plan?.price || 0;
  const days = duration?.days || plan?.duration_limit || 1;
  const price =
    discountPercentage && discountPercentage > 0
      ? calculateDiscountedPrice(basePrice, discountPercentage)
      : basePrice;
  return Math.round(price / (days > 0 ? days : 1));
}

/**
 * Match a package from the API response list by name (case-insensitive).
 * Matches "Power", "Classic", "Iskool", "Fourtig", with sensible aliases.
 */
export function matchPackageByName(
  packages: PublicPackage[] | null | undefined,
  targetName: string
): PublicPackage | undefined {
  if (!packages || !Array.isArray(packages)) return undefined;
  const target = targetName.trim().toLowerCase();

  // 1. Exact match
  const exact = packages.find(
    (p) => (p.name || "").trim().toLowerCase() === target
  );
  if (exact) return exact;

  // 2. Substring & alias match
  return packages.find((p) => {
    const name = (p.name || "").trim().toLowerCase();
    if (name.includes(target) || target.includes(name)) return true;

    // Aliases
    if (target === "power" && name.includes("power")) return true;
    if (target === "classic" && name.includes("classic")) return true;
    if (
      target === "iskool" &&
      (name.includes("iskool") || name.includes("school") || name.includes("kid"))
    ) {
      return true;
    }
    if (
      target === "fourtig" &&
      (name.includes("fourtig") ||
        name.includes("4tig") ||
        name.includes("40") ||
        name.startsWith("four"))
    ) {
      return true;
    }

    return false;
  });
}

/**
 * Map dynamic assigned plans of a package to the DurationPriceOption array used by duration toggle buttons.
 * Falls back to hardcoded defaults if package has no plans or is missing.
 */
export function mapPackagePlansToDurations(
  pkg: PublicPackage | null | undefined,
  fallbackDurations: DurationPriceOption[],
  planTypeDescription: string = "Nutritious Breakfast Meals • Monday to Friday delivery"
): DurationPriceOption[] {
  if (!pkg || !pkg.plans || !Array.isArray(pkg.plans) || pkg.plans.length === 0) {
    return fallbackDurations;
  }

  // Find the plan with maximum duration_limit or monthly to award BEST VALUE badge
  const maxDays = Math.max(...pkg.plans.map((p) => Number(p.duration_limit) || 0));

  return pkg.plans.map((p: PublicAssignedPlan, idx: number) => {
    const nameLower = (p.name || "").toLowerCase();
    const days = Number(p.duration_limit) > 0 ? Number(p.duration_limit) : 1;
    const price = Number(p.price) || 0;

    // Smart unit calculation
    let unit = `per ${days} days`;
    if (nameLower.includes("monthly") || days >= 20) {
      unit = "per month";
    } else if (nameLower.includes("weekly") || (days >= 5 && days <= 7)) {
      unit = "per week";
    } else if (days === 1) {
      unit = "per meal";
    }

    // Sub-label for toggle button
    let subLabel = `${days} Days`;
    if (nameLower.includes("monthly") || days === 20) {
      subLabel = `${days} Weekdays`;
    } else if (nameLower.includes("hybrid") || nameLower.includes("flex")) {
      subLabel = `${days} Days (Flexible)`;
    }

    // Best Value badge (awarded only to the single highest-value or longest plan)
    const isBestValue =
      (days === maxDays && maxDays >= 7) ||
      (nameLower.includes("monthly") && !nameLower.includes("weekly"));

    // Formatted label
    const label = (p.name || `PLAN ${idx + 1}`).toUpperCase();

    // Standard schedule rules
    const rules = [
      "Doorstep delivery",
      `${days} chef-crafted fresh meals included`,
      "Subscription confirmation before 5:00 PM previous day",
      "Missed meals added to credit",
    ];

    const description = `${days} ${planTypeDescription}`;

    const planType = p.type || (nameLower.includes("custom") || nameLower.includes("flex") ? "CUSTOM" : "FIXED");
    const durationLimit = Number(p.duration_limit) > 0 ? Number(p.duration_limit) : days;
    const returnPrice = typeof p.return_price === "number" && p.return_price > 0 ? p.return_price : undefined;

    return {
      key: p.plan_id || `plan-${idx}`,
      planId: p.plan_id,
      planType,
      durationLimit,
      label,
      subLabel,
      days,
      price,
      returnPrice,
      unit,
      badge: isBestValue ? "BEST VALUE" : undefined,
      description,
      rules,
    };
  });
}
