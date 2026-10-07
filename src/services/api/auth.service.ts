/**
 * Auth service — client-side layer.
 * All calls go to Next.js BFF routes (/api/auth/*) which securely
 * proxy to the real backend and manage HttpOnly cookies.
 */

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role?: "ADMIN" | "CUSTOMER";
}

export interface UserRes {
  id: string;
  email: string;
  role: string;
  is_active?: boolean;
  is_verified?: boolean;
  profile_picture_url?: string;
  google_id?: string;
}

export interface AuthServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

export const authService = {
  /**
   * Login via BFF → backend POST /auth/login
   * Returns the user object on success. Tokens are stored in HttpOnly cookies.
   */
  async login(payload: LoginPayload): Promise<UserRes> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data: AuthServiceResponse<{ user: UserRes }> = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data?.error?.message || "Login failed. Check your credentials.");
    }

    return data.data!.user;
  },

  /**
   * Register via BFF → backend POST /auth/register
   * Returns the created user. The backend sends an OTP to the user's email.
   */
  async register(payload: RegisterPayload): Promise<UserRes> {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data: AuthServiceResponse<UserRes> = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data?.error?.message || "Registration failed. Please try again.");
    }

    return data.data!;
  },

  /**
   * Verify OTP via BFF → backend POST /auth/verify
   * Returns user object and stores tokens in HttpOnly cookies.
   */
  async verifyOTP(email: string, otp: string): Promise<UserRes> {
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data: AuthServiceResponse<{ user: UserRes }> = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data?.error?.message || "Invalid or expired OTP code.");
    }

    return data.data!.user;
  },

  /**
   * Google Sign In via BFF → backend POST /auth/google
   * Receives the Google ID token from the GoogleLogin component (GIS credential).
   * Returns user object and stores tokens in HttpOnly cookies.
   */
  async loginWithGoogle(idToken: string): Promise<UserRes> {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken }),
    });

    const data: AuthServiceResponse<{ user: UserRes }> = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data?.error?.message || "Google sign-in failed. Please try again.");
    }

    return data.data!.user;
  },

  /**
   * Send Forgot Password OTP via BFF → backend POST /auth/forgot-password
   */
  async forgotPassword(email: string): Promise<void> {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data: AuthServiceResponse<void> = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to send reset OTP. Please try again.");
    }
  },

  /**
   * Reset Password with OTP via BFF → backend POST /auth/reset-password
   */
  async resetPassword(payload: { email: string; new_password: string; otp: string }): Promise<void> {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data: AuthServiceResponse<void> = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to reset password. Please check your OTP.");
    }
  },

  /**
   * Logout via BFF → backend POST /auth/logout (revokes refresh token)
   * Also clears HttpOnly cookies.
   */
  async logout(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST" });
  },

  /**
   * Get current user from the HttpOnly cookie via BFF /api/auth/me
   * Used to restore session on page load.
   */
  async getMe(): Promise<UserRes | null> {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      const data: AuthServiceResponse<{ user: UserRes }> = await res.json();
      return data.success ? data.data!.user : null;
    } catch {
      return null;
    }
  },
};
