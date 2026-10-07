/**
 * Role-based access control middleware utilities.
 * Determines which routes require which roles.
 */

import { AUTH_ROUTES, PUBLIC_ROUTES, USER_ROUTES } from "@/constants/routes";

export type RouteType = "public" | "auth" | "user" | "admin" | "api" | "unknown";

/**
 * Determine the type of route based on the pathname.
 */
export function getRouteType(pathname: string): RouteType {
  // API routes
  if (pathname.startsWith("/api/")) return "api";

  // Auth routes (login, register, admin login, etc.)
  if (
    AUTH_ROUTES.some((route) => pathname === route) ||
    pathname === "/admin/login" ||
    pathname === "/admin-login"
  ) {
    return "auth";
  }

  // Admin protected routes (/admin/*)
  if (pathname.startsWith("/admin")) return "admin";

  // User protected routes
  if (USER_ROUTES.some((route) => pathname.startsWith(route))) return "user";

  // Public routes
  if (
    PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))
  ) {
    return "public";
  }

  return "public";
}

/**
 * Check if a role has access to a given route type.
 */
export function hasRoleAccess(role: string | undefined, routeType: RouteType): boolean {
  const normRole = role?.toLowerCase();

  switch (routeType) {
    case "public":
    case "auth":
    case "api":
      return true;
    case "user":
      return normRole === "user" || normRole === "customer" || normRole === "admin";
    case "admin":
      return normRole === "admin";
    default:
      return false;
  }
}
