import { apiClient } from "@/services/api/client";

export interface CreateOptionalMealRequestReq {
  subscription_id: string;
  delivery_date: string; // YYYY-MM-DD
  meal_id: string;
}

export interface OptionalMealRequestRes {
  id: string;
  subscription_id: string;
  delivery_date: string;
  meal_id: string;
  menu_id?: string;
  day?: string;
  requested_by_user_id?: string;
  cancelled_at?: string | null;
  cancelled_by_user_id?: string | null;
  created_at?: string;
}

export interface ListOptionalMealRequestsParams {
  subscription_id?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  is_cancelled?: boolean;
  page?: number;
  limit?: number;
}

export const optionalMealRequestService = {
  /**
   * Request an optional meal for a subscription on a given delivery date.
   * POST /api/v1/optional-meal-requests
   */
  async createRequest(payload: CreateOptionalMealRequestReq): Promise<OptionalMealRequestRes> {
    const response = await apiClient.post<{ success?: boolean; data?: OptionalMealRequestRes; message?: string }>(
      "/api/v1/optional-meal-requests",
      payload
    );

    const root = response.data as any;
    if (root && root.data) {
      return root.data;
    }
    return root as unknown as OptionalMealRequestRes;
  },

  /**
   * List optional meal requests for a specific subscription.
   * GET /api/v1/subscriptions/{id}/optional-meal-requests
   */
  async getSubscriptionRequests(
    subscriptionId: string,
    params?: { date_from?: string; date_to?: string; is_cancelled?: boolean }
  ): Promise<OptionalMealRequestRes[]> {
    try {
      const response = await apiClient.get<any>(
        `/api/v1/subscriptions/${subscriptionId}/optional-meal-requests`,
        { params: params as any }
      );
      const root = response.data;
      if (!root) return [];
      if (Array.isArray(root)) return root;
      if (root.data && Array.isArray(root.data)) return root.data;
      if (root.data?.data && Array.isArray(root.data.data)) return root.data.data;
      return [];
    } catch (err) {
      console.warn(`[optionalMealRequestService] Failed to load requests for subscription ${subscriptionId}:`, err);
      return [];
    }
  },

  /**
   * Cancel an optional meal request before its delivery date passes.
   * POST /api/v1/optional-meal-requests/{id}/cancel
   */
  async cancelRequest(requestId: string): Promise<OptionalMealRequestRes | void> {
    const response = await apiClient.post<{ success?: boolean; data?: OptionalMealRequestRes; message?: string }>(
      `/api/v1/optional-meal-requests/${requestId}/cancel`,
      {}
    );
    const root = response.data as any;
    if (root && root.data) {
      return root.data;
    }
    return root as unknown as OptionalMealRequestRes;
  },

  /**
   * Admin: List all optional meal requests
   * GET /api/v1/optional-meal-requests
   */
  async getAllRequests(params?: ListOptionalMealRequestsParams): Promise<{
    data: OptionalMealRequestRes[];
    pagination?: {
      page: number;
      limit: number;
      total?: number;
      total_pages?: number;
    };
  }> {
    try {
      const response = await apiClient.get<any>("/api/v1/optional-meal-requests", {
        params: params as any,
      });

      const root = response.data;
      let items: OptionalMealRequestRes[] = [];
      let pagination = {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: 0,
        total_pages: 1,
      };

      if (root && root.data) {
        if (Array.isArray(root.data)) {
          items = root.data;
        } else if (Array.isArray(root.data.data)) {
          items = root.data.data;
          if (root.data.pagination) {
            pagination = {
              page: root.data.pagination.page ?? pagination.page,
              limit: root.data.pagination.limit ?? pagination.limit,
              total: root.data.pagination.total_rows ?? root.data.pagination.total ?? 0,
              total_pages: root.data.pagination.total_pages ?? 1,
            };
          }
        }
      } else if (Array.isArray(root)) {
        items = root;
      }

      return { data: items, pagination };
    } catch (err) {
      console.warn("[optionalMealRequestService] Error loading all requests:", err);
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, total_pages: 1 },
      };
    }
  },
};
