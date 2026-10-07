import type { PublicPackage, PublicAssignedPlan } from "@/services/api/package.service";

export interface DurationPriceOption {
  key: string;
  label: string;
  subLabel: string;
  days: number;
  price: number;
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
}

/**
 * Extract active discount details from package if assigned and active.
 */
export function getPackageDiscount(pkg?: PublicPackage | null): PackageDiscountInfo | null {
  if (!pkg) return null;
  const d = pkg.active_discount || pkg.discount;
  if (d && typeof d.percentage === "number" && d.percentage > 0) {
    return {
      id: d.id,
      name: d.name || "SALE",
      percentage: d.percentage,
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

    return {
      key: p.plan_id || `plan-${idx}`,
      planId: p.plan_id,
      planType,
      durationLimit,
      label,
      subLabel,
      days,
      price,
      unit,
      badge: isBestValue ? "BEST VALUE" : undefined,
      description,
      rules,
    };
  });
}
