import { apiClient } from "@/services/api/client";

export interface DeliveryListItem {
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  phone?: string;
  mobile?: string;
  mobile_number?: string;
  contact_number?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  delivered: boolean;
  delivered_at?: string;
  delivery_id?: string;
  location_address?: string;
  location_id?: string;
  plan_type?: string; // "FIXED" | "CUSTOM" | string
  subscription_id: string;
  user_id: string;
}

export interface DeliveryPaginationMeta {
  has_next: boolean;
  has_prev: boolean;
  limit: number;
  page: number;
  total_pages: number;
  total_rows: number;
}

export interface ListDeliveriesRes {
  data: DeliveryListItem[];
  pagination: DeliveryPaginationMeta;
}

export interface GetDeliveriesParams {
  date: string; // YYYY-MM-DD
  page?: number;
  limit?: number;
}

export interface MarkDeliveredReq {
  delivery_date: string; // YYYY-MM-DD
  subscription_ids: string[];
}

export interface MarkDeliveredRes {
  delivery_date: string;
  marked: string[];
  already_marked?: string[];
  invalid?: string[];
}

export const deliveryService = {
  /**
   * Admin: Get the delivery list for a specific date
   * GET /api/v1/deliveries?date=YYYY-MM-DD&page=1&limit=20
   */
  async getDeliveries(params: GetDeliveriesParams): Promise<ListDeliveriesRes | null> {
    try {
      const queryParams: Record<string, any> = { date: params.date };
      if (params.page !== undefined) queryParams.page = params.page;
      if (params.limit !== undefined) queryParams.limit = params.limit;

      const response = await apiClient.get<any>("/api/v1/deliveries", {
        params: queryParams,
      });

      const body = response.data;
      if (!body) return null;

      if (body.data && body.data.data) {
        return body.data as ListDeliveriesRes;
      }
      if (body.data && Array.isArray(body.data)) {
        return body as ListDeliveriesRes;
      }
      return body as ListDeliveriesRes;
    } catch (err: any) {
      const msg = err?.message || err?.error?.message || "Failed to load deliveries";
      const customErr = new Error(msg);
      (customErr as any).status = err?.status;
      throw customErr;
    }
  },

  /**
   * Admin: Mark one or many subscriptions as delivered for a date
   * POST /api/v1/deliveries
   */
  async markDelivered(payload: MarkDeliveredReq): Promise<MarkDeliveredRes> {
    try {
      const response = await apiClient.post<any>("/api/v1/deliveries", payload);
      const body = response.data;
      if (body && body.data) {
        return body.data as MarkDeliveredRes;
      }
      return body as MarkDeliveredRes;
    } catch (err: any) {
      const msg = err?.message || err?.error?.message || "Failed to mark deliveries";
      const customErr = new Error(msg);
      (customErr as any).status = err?.status;
      throw customErr;
    }
  },

  /**
   * Admin: Undo a marked delivery
   * DELETE /api/v1/deliveries/{id}
   */
  async undoDelivery(deliveryId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<any>(`/api/v1/deliveries/${deliveryId}`);
      return response.status === 200 || response.status === 204;
    } catch (err: any) {
      const msg = err?.message || err?.error?.message || "Failed to undo delivery";
      const customErr = new Error(msg);
      (customErr as any).status = err?.status;
      throw customErr;
    }
  },
};
