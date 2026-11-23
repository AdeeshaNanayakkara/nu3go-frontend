import { create } from "zustand";
import { csrfHeaders } from "@/lib/auth/csrf";

export interface User {
  id: string;
  email: string;
  role: string; // "ADMIN" | "CUSTOMER"
  name?: string;
  is_active?: boolean;
  is_verified?: boolean;
  profile_picture_url?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True once the first session check (/api/auth/me) has finished */
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  hydrateFromCookie: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      isHydrated: true,
    });
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: csrfHeaders(),
      });
    } catch (err) {
      console.error("[AuthStore] Logout error:", err);
    }

    set({ user: null, isAuthenticated: false, isLoading: false, isHydrated: true });
  },

  hydrateFromCookie: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });

    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.user) {
          set({
            user: data.data.user,
            isAuthenticated: true,
            isLoading: false,
            isHydrated: true,
          });
          return;
        }
      } else if (res.status === 401) {
        set({ user: null, isAuthenticated: false, isLoading: false, isHydrated: true });
        return;
      }
    } catch (err) {
      console.error("[AuthStore] Hydrate error:", err);
    }

    set({ isLoading: false, isHydrated: true });
  },
}));
