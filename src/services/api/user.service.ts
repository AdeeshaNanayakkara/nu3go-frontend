import { apiClient } from "@/services/api/client";

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
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
      const response = await apiClient.get<any>("/api/v1/users/me");
      const resBody = response.data;
      if (resBody && typeof resBody === "object") {
        if (resBody.data && typeof resBody.data === "object") {
          return resBody.data;
        }
        if (resBody.id) return resBody;
      }
      return null;
    } catch {
      try {
        const response2 = await apiClient.get<any>("/api/auth/me");
        if (response2.data?.data) return response2.data.data;
        if (response2.data?.user) return response2.data.user;
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
      return null;
    }
  },

  /**
   * Update user details
   */
  async updateProfile(id: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const response = await apiClient.put<any>(`/api/v1/users/${id}`, data);
      const resBody = response.data;
      if (resBody && typeof resBody === "object") {
        if (resBody.data && typeof resBody.data === "object") {
          return resBody.data;
        }
        if (resBody.id) return resBody;
      }
      return null;
    } catch (err) {
      console.error("Failed to update user profile:", err);
      throw err;
    }
  },
};
