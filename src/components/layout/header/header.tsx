"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Logo } from "@/components/shared/logo";
import { ROUTES } from "@/constants/routes";
import { 
  Menu as MenuIcon, 
  X, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  Package, 
  Settings, 
  Shield, 
  ChevronDown 
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);

  // Auth store
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false);
  }, [user?.profile_picture_url]);

  // Monitor scroll for dynamic transparent-to-frosted glass transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu & profile dropdown on ESC key and outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setProfileDropdownOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    window.location.replace("/");
  };

  const navItems = [
    { label: "HOME", href: ROUTES.HOME },
    { label: "OUR MENU", href: "/services" },
    { label: "PLANS", href: ROUTES.PLANS },
    { label: "ABOUT", href: "/about" },
    { label: "CONTACT", href: "/contact" },
  ];

  // User display initial
  const userInitial = user
    ? (user.name || user.email || "U").charAt(0).toUpperCase()
    : "U";
  const userRole = user?.role?.toUpperCase() || "CUSTOMER";
  const isAdmin = userRole === "ADMIN";
  const dashboardHref = isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out ${
        mobileMenuOpen
          ? "bg-[#121212]/95 backdrop-blur-xl shadow-2xl py-3 border-b border-white/10"
          : isScrolled
          ? "bg-[#121212]/75 backdrop-blur-lg shadow-xl py-3 border-b border-white/10"
          : "bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5 sm:py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* ─── LEFT: Desktop Social Icons / Mobile Hamburger ─── */}
          <div className="w-24 sm:w-28 lg:w-1/4 flex items-center justify-start">
            {/* Desktop Social Icons */}
            <div className="hidden lg:flex items-center gap-6">
              {/* X / Twitter */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="text-white/90 hover:text-[#36D068] hover:scale-110 transition-all duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  className="w-[21px] h-[21px] fill-current"
                >
                  <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-white/90 hover:text-[#36D068] hover:scale-110 transition-all duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  className="w-[21px] h-[21px] fill-current"
                >
                  <path d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256c0 120 82.7 220.8 194.2 248.5V334.2h-52.8V256h52.8v-33.7c0-87.1 39.4-127.5 125-127.5 16.2 0 44.2 3.2 55.7 6.4V172c-6-.6-16.5-1-29.6-1-42 0-58.2 15.9-58.2 57.2V256h84.8l-13.2 78.2h-71.6V508.9C433.8 485.4 512 379.9 512 256z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white/90 hover:text-[#36D068] hover:scale-110 transition-all duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  className="w-[21px] h-[21px] fill-current"
                >
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                </svg>
              </a>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-white hover:text-[#36D068] transition-all"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>

          {/* ─── CENTER: Logo (Dead Center on Mobile, Stacked on Desktop) ─── */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Nu3Go Logo */}
            <div className="lg:mb-2.5 flex items-center justify-center">
              <Logo
                variant="white"
                imageClassName="h-8 sm:h-9 md:h-11 lg:h-12 w-auto object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-7 xl:space-x-10">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`text-xs xl:text-sm font-semibold tracking-[0.18em] uppercase transition-all duration-200 relative py-1 ${
                      isActive
                        ? "text-[#36D068]"
                        : "text-white/90 hover:text-[#36D068]"
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#36D068] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ─── RIGHT: Dashboard Button + Profile Icon (Logged In User) ─── */}
          <div className="w-auto lg:w-1/4 flex items-center justify-end">
            <div className="flex items-center">
              {/* Dashboard Button */}
              <Link
                href={dashboardHref}
                className="border border-white/80 hover:border-[#36D068] text-white hover:bg-[#36D068] hover:text-white px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 rounded-xs text-[10px] sm:text-xs xl:text-sm font-bold tracking-wider sm:tracking-[0.16em] uppercase transition-all duration-300 shadow-sm hover:shadow-[#36D068]/30 hover:shadow-lg text-center whitespace-nowrap"
              >
                Dashboard
              </Link>

              {/* Profile Dropdown (Centered in the gap between Dashboard button and UI right end) */}
              {isAuthenticated && user && (
                <div className="flex items-center justify-center px-2.5 sm:px-3.5 lg:px-4">
                  <div ref={profileDropdownRef} className="relative">
                    {/* Profile Avatar Button */}
                    <button
                      type="button"
                      onClick={() => setProfileDropdownOpen((prev) => !prev)}
                      aria-expanded={profileDropdownOpen}
                      aria-label="User profile menu"
                      className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full border-2 border-[#36D068] bg-[#0B3B17] hover:border-white text-white flex items-center justify-center font-oswald font-bold text-xs sm:text-sm shadow-md hover:scale-105 transition-all cursor-pointer relative"
                    >
                      {user.profile_picture_url && !avatarError ? (
                        <Image
                          src={user.profile_picture_url}
                          alt={user.email || "Profile"}
                          width={38}
                          height={38}
                          unoptimized
                          onError={() => setAvatarError(true)}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span>{userInitial}</span>
                      )}
                      {/* Active emerald indicator dot */}
                      <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#36D068] rounded-full ring-2 ring-[#121212] absolute bottom-0 right-0" />
                    </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2.5 w-64 sm:w-72 bg-[#121212]/98 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-2.5 z-50 text-white animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Header */}
                    <div className="px-3 py-2.5 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0B3B17] border border-[#36D068] text-[#36D068] flex items-center justify-center font-oswald font-bold text-sm shrink-0">
                        {user.profile_picture_url && !avatarError ? (
                          <Image
                            src={user.profile_picture_url}
                            alt={user.email || "Profile"}
                            width={36}
                            height={36}
                            unoptimized
                            onError={() => setAvatarError(true)}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span>{userInitial}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">
                          {user.name || user.email}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="bg-[#36D068]/20 text-[#36D068] border border-[#36D068]/40 text-[9px] px-2 py-0.5 rounded-full font-oswald uppercase font-bold tracking-wider">
                            {userRole}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Links */}
                    <div className="py-1.5 space-y-0.5">
                      <Link
                        href={dashboardHref}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#36D068]" />
                        <span>{isAdmin ? "Admin Dashboard" : "My Dashboard"}</span>
                      </Link>

                      <Link
                        href={ROUTES.PROFILE}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-[#36D068]" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        href={ROUTES.ORDERS}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Package className="w-4 h-4 text-[#36D068]" />
                        <span>My Orders &amp; Plans</span>
                      </Link>

                      <Link
                        href={ROUTES.SETTINGS}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-[#36D068]" />
                        <span>Account Settings</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          href={ROUTES.ADMIN_DASHBOARD}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-emerald-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-[#36D068]" />
                          <span>Admin Portal</span>
                        </Link>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/10 my-1" />

                    {/* Sign Out Button */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500/20 transition-all cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── MOBILE DRAWER (Full-width Overlay) ─── */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 w-full bg-[#121212]/98 backdrop-blur-2xl border-t border-b border-white/10 shadow-2xl overflow-y-auto max-h-[calc(100vh-80px)] transition-all duration-200 animate-in fade-in slide-in-from-top-2">
          <div className="px-6 py-8 flex flex-col items-center text-center space-y-5">
            {/* Mobile User Profile Section if Authenticated */}
            {isAuthenticated && user && (
              <div className="w-full max-w-xs p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between text-left">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#0B3B17] border-2 border-[#36D068] text-[#36D068] flex items-center justify-center font-oswald font-bold text-sm shrink-0">
                    {user.profile_picture_url && !avatarError ? (
                      <Image
                        src={user.profile_picture_url}
                        alt={user.email || "Profile"}
                        width={40}
                        height={40}
                        unoptimized
                        onError={() => setAvatarError(true)}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{userInitial}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {user.name || user.email}
                    </p>
                    <span className="inline-block bg-[#36D068]/20 text-[#36D068] text-[9px] px-2 py-0.5 rounded-full font-oswald uppercase font-bold tracking-wider">
                      {userRole}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            <nav className="flex flex-col items-center w-full max-w-xs space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full py-3 text-sm font-bold tracking-[0.2em] uppercase transition-all rounded-lg border-b border-white/5 ${
                      isActive
                        ? "text-[#36D068] bg-white/5"
                        : "text-white/90 hover:text-[#36D068] hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Primary CTA */}
            <div className="pt-2 w-full max-w-xs space-y-2">
              <Link
                href={dashboardHref}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block text-center bg-[#36D068] hover:bg-[#2EB959] text-white py-3.5 rounded-xs font-bold tracking-[0.18em] uppercase text-xs shadow-lg shadow-[#36D068]/25 active:scale-[0.99] transition-all"
              >
                Dashboard
              </Link>
            </div>

            {/* Mobile Social Media Icons */}
            <div className="pt-4 border-t border-white/10 w-full max-w-xs flex flex-col items-center gap-3">
              <span className="text-[11px] uppercase tracking-widest text-white/50 font-medium">
                Follow Nu3Go
              </span>
              <div className="flex items-center justify-center gap-6">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="p-2 rounded-full bg-white/5 hover:bg-[#36D068]/20 text-white/80 hover:text-[#36D068] transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className="w-4 h-4 fill-current"
                  >
                    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                  </svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="p-2 rounded-full bg-white/5 hover:bg-[#36D068]/20 text-white/80 hover:text-[#36D068] transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className="w-4 h-4 fill-current"
                  >
                    <path d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256c0 120 82.7 220.8 194.2 248.5V334.2h-52.8V256h52.8v-33.7c0-87.1 39.4-127.5 125-127.5 16.2 0 44.2 3.2 55.7 6.4V172c-6-.6-16.5-1-29.6-1-42 0-58.2 15.9-58.2 57.2V256h84.8l-13.2 78.2h-71.6V508.9C433.8 485.4 512 379.9 512 256z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="p-2 rounded-full bg-white/5 hover:bg-[#36D068]/20 text-white/80 hover:text-[#36D068] transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    className="w-[21px] h-[21px] fill-current"
                  >
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dimmed backdrop when mobile menu is open */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 z-[-1] bg-black/60 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}
    </header>
  );
}
