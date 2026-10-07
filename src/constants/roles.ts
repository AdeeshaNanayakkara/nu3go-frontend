/**
 * User role constants for role-based access control (RBAC).
 */
export enum UserRole {
  User = "user",
  Customer = "customer",
  Admin = "admin",
}

export type RoleType = "ADMIN" | "CUSTOMER" | "admin" | "customer" | "user";

/**
 * Permissions mapped to roles.
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  customer: [
    "dashboard:view",
    "profile:view",
    "profile:edit",
    "orders:view",
    "payments:view",
    "settings:view",
    "settings:edit",
    "notifications:view",
  ],
  user: [
    "dashboard:view",
    "profile:view",
    "profile:edit",
    "orders:view",
    "payments:view",
    "settings:view",
    "settings:edit",
    "notifications:view",
  ],
  admin: [
    "dashboard:view",
    "profile:view",
    "profile:edit",
    "orders:view",
    "payments:view",
    "settings:view",
    "settings:edit",
    "notifications:view",
    "admin:dashboard",
    "admin:users:view",
    "admin:users:edit",
    "admin:users:delete",
    "admin:services:view",
    "admin:services:create",
    "admin:services:edit",
    "admin:services:delete",
    "admin:orders:view",
    "admin:orders:edit",
    "admin:settings:view",
    "admin:settings:edit",
  ],
};

export type Permission = string;
