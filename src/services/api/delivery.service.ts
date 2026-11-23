import { apiClient } from "@/services/api/client";

export interface DeliveryListItem {
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  phone?: string;
  mobile?: string;
  mobile_number?: string;
  contact_number?: string;
  user_phone?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  delivered: boolean;
  delivered_at?: string;
  delivery_id?: string;
  delivery_note?: string;
  delivery_type?: string;
  location_address?: string;
  location_id?: string;
  meal_id?: string;
  meal_name?: string;
  meal_source?: string;
  plan_type?: string; // "FIXED" | "CUSTOM" | string
  subscription_id: string;
  user_id: string;
}

export function formatDeliveryType(type?: string): string {
  if (!type) return "—";
  switch (type.toUpperCase()) {
    case "CALL_AND_HANDOVER":
      return "Call & Hand Over";
    case "LEAVE_AT_GUARDROOM":
      return "Leave at Guardroom";
    case "LEAVE_AT_GUARDROOM_AND_NOTIFY":
      return "Leave at Guardroom & Notify";
    case "HANG_AT_DESIGNATED_LOCATION":
      return "Hang at Location";
    case "LEAVE_AT_DESIGNATED_LOCATION":
      return "Leave at Location";
    case "CALL_FOR_COLLECTION":
      return "Call for Collection";
    default:
      return type
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

export function getCustomerPhone(item: DeliveryListItem): string {
  const phone =
    item.customer_phone ||
    item.phone ||
    item.mobile ||
    item.mobile_number ||
    item.contact_number ||
    item.user_phone;
  if (phone && phone.trim()) return phone.trim();
  return "—";
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

export interface MealCountRes {
  meal_id: string;
  meal_name: string;
  total: number;
  menu: number;
  optional: number;
  emergency: number;
}

export interface DayMealSummaryRes {
  date: string;
  weekday: string;
  total_deliveries: number;
  unassigned: number;
  meals: MealCountRes[];
}

export interface MealSummaryRes {
  from: string;
  to: string;
  total_deliveries: number;
  unassigned: number;
  days: DayMealSummaryRes[];
  totals: MealCountRes[];
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
   * Admin: Meal preparation counts for a date range
   * GET /api/v1/deliveries/meal-summary?from=YYYY-MM-DD&to=YYYY-MM-DD
   */
  async getMealSummary(from: string, to: string): Promise<MealSummaryRes> {
    try {
      const response = await apiClient.get<any>("/api/v1/deliveries/meal-summary", {
        params: { from, to },
      });
      const body = response.data;
      if (body && body.data) return body.data as MealSummaryRes;
      return body as MealSummaryRes;
    } catch (err: any) {
      const msg = err?.message || err?.error?.message || "Failed to load meal summary";
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
