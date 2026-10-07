/**
 * General utility functions.
 * Includes the cn() helper for Tailwind class merging (used by shadcn/ui).
 *
 * NOTE: clsx and tailwind-merge will be installed when shadcn/ui is set up.
 * For now, this is a placeholder.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with conflict resolution.
 * Used by all shadcn/ui components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
