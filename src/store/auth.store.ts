import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  hydrateFromCookie: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        });
      },

      logout: async () => {
        try {
          // Call BFF logout — this clears HttpOnly cookies on the server
          await fetch("/api/auth/logout", { method: "POST" });
        } catch (err) {
          console.error("[AuthStore] Logout error:", err);
        }

        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      /**
       * Hydrate auth state from the access_token cookie via /api/auth/me.
       * Called on app mount to restore session after page refresh.
       */
      hydrateFromCookie: async () => {
        if (get().isLoading) return;
        set({ isLoading: true });

        try {
          const res = await fetch("/api/auth/me");
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data?.user) {
              const current = get().user;
              set({
                user: {
                  ...current,
                  ...data.data.user,
                  email: data.data.user.email || current?.email || "",
                  name: data.data.user.name || current?.name || "",
                  profile_picture_url:
                    data.data.user.profile_picture_url || current?.profile_picture_url,
                },
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }
          } else if (res.status === 401) {
            // Unauthenticated response from server
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }
        } catch (err) {
          console.error("[AuthStore] Hydrate error:", err);
        }

        set({ isLoading: false });
      },
    }),
    {
      name: "nu3go-auth-store",
      // Only persist user info — not tokens (they live in HttpOnly cookies)
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
