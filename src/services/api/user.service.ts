import { apiClient } from "@/services/api/client";

export interface BillingProfileRes {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  profile_complete?: boolean;
}

export interface UpdateBillingProfileReq {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  profile_complete?: boolean;
  profile_picture_url?: string;
  is_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
  dietary_preferences?: string[];
  allergies?: string[];
}

export const userService = {
  /**
   * Fetch current user profile details
   */
  async getProfile(): Promise<UserProfile | null> {
    try {
      const response = await apiClient.get<Record<string, unknown>>("/api/v1/users/me");
      const resBody = response.data;
      if (resBody && typeof resBody === "object") {
        if (resBody.data && typeof resBody.data === "object") {
          return resBody.data as UserProfile;
        }
        if (resBody.id) return resBody as unknown as UserProfile;
      }
      return null;
    } catch {
      try {
        const response2 = await apiClient.get<{ data?: UserProfile; user?: UserProfile }>("/api/auth/me");
        if (response2.data?.data) return response2.data.data;
        if (response2.data?.user) return response2.data.user;
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
      return null;
    }
  },

  /**
   * Fetch authenticated user's billing profile from /api/v1/me/profile
   */
  async getBillingProfile(): Promise<BillingProfileRes | null> {
    try {
      const response = await apiClient.get<{ success?: boolean; data?: BillingProfileRes } | BillingProfileRes>(
        "/api/v1/me/profile"
      );
      const resBody = response.data;
      if (resBody && typeof resBody === "object") {
        if ("data" in resBody && resBody.data) return resBody.data;
        if ("first_name" in resBody) return resBody as BillingProfileRes;
      }
      return null;
    } catch (err) {
      console.warn("Failed to fetch billing profile:", err);
      return null;
    }
  },

  /**
   * Update authenticated user's billing profile via PUT /api/v1/me/profile
   */
  async updateBillingProfile(payload: UpdateBillingProfileReq): Promise<BillingProfileRes | null> {
    try {
      const response = await apiClient.put<{ success?: boolean; data?: BillingProfileRes } | BillingProfileRes>(
        "/api/v1/me/profile",
        payload
      );
      const resBody = response.data;
      if (resBody && typeof resBody === "object") {
        if ("data" in resBody && resBody.data) return resBody.data;
        if ("first_name" in resBody) return resBody as BillingProfileRes;
      }
      return null;
    } catch (err) {
      console.error("Failed to update billing profile:", err);
      throw err;
    }
  },

  /**
   * Update user details
   */
  async updateProfile(id: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const response = await apiClient.put<Record<string, unknown>>(`/api/v1/users/${id}`, data);
      const resBody = response.data;
      if (resBody && typeof resBody === "object") {
        if (resBody.data && typeof resBody.data === "object") {
          return resBody.data as UserProfile;
        }
        if (resBody.id) return resBody as unknown as UserProfile;
      }
      return null;
    } catch (err) {
      console.error("Failed to update user profile:", err);
      throw err;
    }
  },
};
