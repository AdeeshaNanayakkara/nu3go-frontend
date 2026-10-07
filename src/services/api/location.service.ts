import { apiClient } from "@/services/api/client";

export interface LocationItem {
  id: string;
  user_id?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateLocationPayload {
  address: string;
  latitude?: number;
  longitude?: number;
}

export const locationService = {
  /**
   * Fetch all customer delivery locations
   */
  async getLocations(): Promise<LocationItem[]> {
    try {
      const response = await apiClient.get<any>("/api/locations");
      const resBody = response.data;
      if (Array.isArray(resBody)) return resBody;
      if (resBody && typeof resBody === "object") {
        if (Array.isArray(resBody.data)) return resBody.data;
        if (resBody.data && typeof resBody.data === "object" && Array.isArray(resBody.data.data)) {
          return resBody.data.data;
        }
      }
      return [];
    } catch {
      try {
        const res2 = await apiClient.get<any>("/api/v1/locations");
        const resBody2 = res2.data;
        if (Array.isArray(resBody2)) return resBody2;
        if (resBody2 && typeof resBody2 === "object") {
          if (Array.isArray(resBody2.data)) return resBody2.data;
          if (resBody2.data && typeof resBody2.data === "object" && Array.isArray(resBody2.data.data)) {
            return resBody2.data.data;
          }
        }
      } catch {
        // Locations endpoint optional
      }
      return [];
    }
  },

  /**
   * Fetch a single delivery location by ID via GET /locations/{id}
   */
  async getLocationById(id: string): Promise<LocationItem | null> {
    try {
      const response = await apiClient.get<any>(`/api/locations/${id}`);
      const resBody = response.data;
      if (resBody && typeof resBody === "object") {
        if (resBody.data && typeof resBody.data === "object") {
          return resBody.data;
        }
        if (resBody.id) {
          return resBody;
        }
      }
      return null;
    } catch {
      try {
        const res2 = await apiClient.get<any>(`/api/v1/locations/${id}`);
        const resBody2 = res2.data;
        if (resBody2 && typeof resBody2 === "object") {
          if (resBody2.data && typeof resBody2.data === "object") {
            return resBody2.data;
          }
          if (resBody2.id) {
            return resBody2;
          }
        }
      } catch {
        // ignore
      }
      return null;
    }
  },

  /**
   * Create a new customer delivery location via POST /locations
   */
  async createLocation(payload: CreateLocationPayload): Promise<LocationItem | null> {
    const cleanPayload: CreateLocationPayload = {
      address: payload.address.trim(),
    };
    if (payload.latitude !== undefined && payload.latitude !== null && !isNaN(Number(payload.latitude))) {
      cleanPayload.latitude = Number(payload.latitude);
    }
    if (payload.longitude !== undefined && payload.longitude !== null && !isNaN(Number(payload.longitude))) {
      cleanPayload.longitude = Number(payload.longitude);
    }

    try {
      const response = await apiClient.post<any>("/api/locations", cleanPayload);
      const resBody = response.data;
      if (resBody && typeof resBody === "object") {
        if (resBody.data && typeof resBody.data === "object") {
          if (resBody.data.data && typeof resBody.data.data === "object") {
            return resBody.data.data;
          }
          return resBody.data;
        }
        if (resBody.id) {
          return resBody;
        }
      }
      return resBody as unknown as LocationItem;
    } catch {
      try {
        const res2 = await apiClient.post<any>("/api/v1/locations", cleanPayload);
        const resBody2 = res2.data;
        if (resBody2 && typeof resBody2 === "object") {
          if (resBody2.data && typeof resBody2.data === "object") {
            return resBody2.data;
          }
          if (resBody2.id) {
            return resBody2;
          }
        }
        return resBody2 as unknown as LocationItem;
      } catch (err) {
        console.error("Failed to create location:", err);
        throw err;
      }
    }
  },

  /**
   * Mark a location as default
   */
  async setDefaultLocation(id: string): Promise<void> {
    try {
      await apiClient.patch(`/api/locations/${id}/default`);
    } catch {
      await apiClient.patch(`/api/v1/locations/${id}/default`);
    }
  },

  /**
   * Delete a location by ID
   */
  async deleteLocation(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/locations/${id}`);
    } catch {
      await apiClient.delete(`/api/v1/locations/${id}`);
    }
  },
};
