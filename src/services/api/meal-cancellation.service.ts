import { apiClient } from "@/services/api/client";

export interface CancelMealReq {
  subscription_id: string;
  delivery_date: string; // YYYY-MM-DD
  reason: string;
}

export interface MealCancellationRes {
  id: string;
  subscription_id: string;
  delivery_date: string;
  reason: string;
  refund_amount?: number;
  refund_tier?: string;
  created_at?: string;
  reverted_at?: string;
  admin_note?: string;
}

export interface ListCancellationsRes {
  data: MealCancellationRes[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export const mealCancellationService = {
  /**
   * Customers cancel a specific meal delivery date
   * POST /api/v1/meal-cancellations
   */
  async cancelMeal(payload: CancelMealReq): Promise<MealCancellationRes> {
    const response = await apiClient.post<{ success?: boolean; data?: MealCancellationRes; message?: string }>(
      "/api/v1/meal-cancellations",
      payload
    );

    const root = response.data as any;
    if (root && root.data) {
      return root.data;
    }
    return root as unknown as MealCancellationRes;
  },

  /**
   * List all cancellations scoped to a specific subscription ID
   * GET /api/v1/subscriptions/{id}/meal-cancellations
   */
  async getSubscriptionCancellations(subscriptionId: string): Promise<MealCancellationRes[]> {
    try {
      const response = await apiClient.get<any>(
        `/api/v1/subscriptions/${subscriptionId}/meal-cancellations`
      );
      const root = response.data;
      if (!root) return [];
      if (Array.isArray(root)) return root;
      if (root.data && Array.isArray(root.data)) return root.data;
      if (root.data?.data && Array.isArray(root.data.data)) return root.data.data;
      return [];
    } catch (err) {
      console.warn(`[mealCancellationService] Failed to load cancellations for subscription ${subscriptionId}:`, err);
      return [];
    }
  },

  /**
   * Admin: List all meal cancellations
   * GET /api/v1/meal-cancellations
   */
  async getAllCancellations(params?: {
    page?: number;
    limit?: number;
    subscription_id?: string;
    user_id?: string;
    refund_tier?: string;
    date_from?: string;
    date_to?: string;
    is_reverted?: boolean;
  }): Promise<{
    data: MealCancellationRes[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  }> {
    try {
      const response = await apiClient.get<any>("/api/v1/meal-cancellations", {
        params: params as any,
      });

      const root = response.data;
      let items: MealCancellationRes[] = [];
      let pagination = {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: 0,
        total_pages: 1,
      };

      if (Array.isArray(root)) {
        items = root;
        pagination.total = root.length;
      } else if (root?.data?.data && Array.isArray(root.data.data)) {
        items = root.data.data;
        if (root.data.pagination) {
          pagination = { ...pagination, ...root.data.pagination };
        }
      } else if (root?.data && Array.isArray(root.data)) {
        items = root.data;
        if (root.pagination) {
          pagination = { ...pagination, ...root.pagination };
        }
      } else if (Array.isArray(root?.items)) {
        items = root.items;
      }

      return { data: items, pagination };
    } catch (err) {
      console.error("[mealCancellationService] Failed to load admin cancellations:", err);
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, total_pages: 1 },
      };
    }
  },

  /**
   * Admin: Revert a cancellation
   * POST /api/v1/meal-cancellations/{id}/revert
   */
  async revertCancellation(id: string): Promise<any> {
    const response = await apiClient.post<any>(`/api/v1/meal-cancellations/${id}/revert`, {});
    return response.data;
  },
};
