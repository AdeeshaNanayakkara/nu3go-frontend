import { apiClient } from "@/services/api/client";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";

export interface ZoneItem {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateZonePayload {
  name: string;
}

export interface UpdateZonePayload {
  name: string;
}

export interface ZoneApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: {
    code?: number;
    details?: string;
    message?: string;
  };
}

export const zoneService = {
  /**
   * Fetch all available delivery zones from public BFF /api/zones with direct backend fallback
   */
  async getZones(): Promise<ZoneItem[]> {
    try {
      const response = await apiClient.get<ZoneApiResponse<ZoneItem[]> | ZoneItem[]>("/api/zones", {
        skipAuthRedirect: true,
      });
      const resBody = response.data;
      if (Array.isArray(resBody) && resBody.length > 0) return resBody;
      if (resBody && typeof resBody === "object" && "data" in resBody && Array.isArray(resBody.data) && resBody.data.length > 0) {
        return resBody.data;
      }
    } catch {
      // Ignore and proceed to direct backend fallback
    }

    try {
      const res = await fetch(BACKEND_ENDPOINTS.ZONES.LIST);
      if (res.ok) {
        const json = await res.json();
        if (json?.data && Array.isArray(json.data)) return json.data;
        if (Array.isArray(json)) return json;
      }
    } catch {
      // Graceful degradation
    }

    return [];
  },

  /**
   * Create a new available zone
   */
  async createZone(data: CreateZonePayload): Promise<ZoneItem> {
    const response = await apiClient.post<ZoneApiResponse<ZoneItem>>("/api/admin/zones", data);
    const resBody = response.data;
    if (resBody && typeof resBody === "object" && "data" in resBody && resBody.data) {
      return resBody.data;
    }
    return resBody as unknown as ZoneItem;
  },

  /**
   * Update an existing available zone by ID
   */
  async updateZone(id: string, data: UpdateZonePayload): Promise<ZoneItem> {
    const response = await apiClient.put<ZoneApiResponse<ZoneItem>>(`/api/admin/zones/${id}`, data);
    const resBody = response.data;
    if (resBody && typeof resBody === "object" && "data" in resBody && resBody.data) {
      return resBody.data;
    }
    return resBody as unknown as ZoneItem;
  },

  /**
   * Delete an available zone by ID
   */
  async deleteZone(id: string): Promise<void> {
    await apiClient.delete(`/api/admin/zones/${id}`);
  },
};
