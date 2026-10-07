import { ROUTES } from "./routes";

/**
 * Navigation link definitions for menus.
 */

export interface NavLink {
  title: string;
  href: string;
  description?: string;
  icon?: string;
  children?: NavLink[];
}

export const MAIN_NAV_LINKS: NavLink[] = [
  { title: "Home", href: ROUTES.HOME },
  { title: "Services", href: ROUTES.SERVICES },
  { title: "Categories", href: ROUTES.CATEGORIES },
  { title: "Blog", href: ROUTES.BLOG },
  { title: "About", href: ROUTES.ABOUT },
  { title: "Contact", href: ROUTES.CONTACT },
];

export const USER_NAV_LINKS: NavLink[] = [
  { title: "Dashboard", href: ROUTES.DASHBOARD, icon: "LayoutDashboard" },
  { title: "Profile", href: ROUTES.PROFILE, icon: "User" },
  { title: "Orders", href: ROUTES.ORDERS, icon: "ShoppingBag" },
  { title: "Payments", href: ROUTES.PAYMENTS, icon: "CreditCard" },
  { title: "Settings", href: ROUTES.SETTINGS, icon: "Settings" },
];

export const ADMIN_NAV_LINKS: NavLink[] = [
  { title: "Dashboard", href: ROUTES.ADMIN_DASHBOARD, icon: "LayoutDashboard" },
  { title: "Users", href: ROUTES.ADMIN_USERS, icon: "Users" },
  { title: "Services", href: ROUTES.ADMIN_SERVICES, icon: "Briefcase" },
  { title: "Orders", href: ROUTES.ADMIN_ORDERS, icon: "ShoppingBag" },
  { title: "Settings", href: ROUTES.ADMIN_SETTINGS, icon: "Settings" },
];

export const FOOTER_LINKS = {
  company: [
    { title: "About", href: ROUTES.ABOUT },
    { title: "Blog", href: ROUTES.BLOG },
    { title: "Contact", href: ROUTES.CONTACT },
  ],
  services: [
    { title: "All Services", href: ROUTES.SERVICES },
    { title: "Categories", href: ROUTES.CATEGORIES },
  ],
  legal: [
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms of Service", href: "/terms" },
  ],
} as const;
