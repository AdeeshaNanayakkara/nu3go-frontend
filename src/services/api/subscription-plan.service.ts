import { apiClient } from "@/services/api/client";

export type SubscriptionPlanType = "FIXED" | "CUSTOM";

export type BillingCycle = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";

export const BILLING_CYCLES: { value: BillingCycle; label: string; description: string }[] = [
  { value: "WEEKLY", label: "Weekly", description: "Billed every 7 days" },
  { value: "BIWEEKLY", label: "Biweekly", description: "Billed every 14 days" },
  { value: "MONTHLY", label: "Monthly", description: "Billed once per month" },
  { value: "QUARTERLY", label: "Quarterly", description: "Billed every 3 months" },
  { value: "YEARLY", label: "Yearly", description: "Billed once per year" },
];

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: SubscriptionPlanType;
  billing_cycle?: BillingCycle;
  duration_limit?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSubscriptionPlanPayload {
  name: string;
  type: SubscriptionPlanType;
  billing_cycle?: BillingCycle;
  duration_limit?: number;
  is_active?: boolean;
}

export interface UpdateSubscriptionPlanPayload {
  name?: string;
  type?: SubscriptionPlanType;
  billing_cycle?: BillingCycle;
  duration_limit?: number;
  is_active?: boolean;
}

export interface GetSubscriptionPlansParams {
  search?: string;
  is_active?: boolean;
  type?: SubscriptionPlanType;
  page?: number;
  limit?: number;
}

export interface SubscriptionPlanApiResponse<T> {
  success?: boolean;
  data?: T | { data: T; pagination?: unknown };
  error?: {
    code?: number;
    details?: string;
    message?: string;
  };
}

export const subscriptionPlanService = {
  /**
   * Fetch all subscription plans with optional filters
   */
  async getSubscriptionPlans(
    params?: GetSubscriptionPlansParams,
    config?: { skipAuthRedirect?: boolean }
  ): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<
      SubscriptionPlanApiResponse<SubscriptionPlan[]> | SubscriptionPlan[]
    >("/api/admin/subscription-plans", {
      params: params as Record<string, string | number | boolean | undefined>,
      skipAuthRedirect: config?.skipAuthRedirect,
    });

    const resBody = response.data;

    if (Array.isArray(resBody)) return resBody;
    if (resBody && typeof resBody === "object") {
      if ("data" in resBody && resBody.data) {
        const payloadData = resBody.data;
        if (Array.isArray(payloadData)) {
          return payloadData;
        }
        if (
          typeof payloadData === "object" &&
          "data" in payloadData &&
          Array.isArray((payloadData as { data: SubscriptionPlan[] }).data)
        ) {
          return (payloadData as { data: SubscriptionPlan[] }).data;
        }
      }
    }
    return [];
  },

  /**
   * Fetch single subscription plan detail by ID
   */
  async getSubscriptionPlanById(id: string): Promise<SubscriptionPlan> {
    const response = await apiClient.get<
      SubscriptionPlanApiResponse<SubscriptionPlan>
    >(`/api/admin/subscription-plans/${id}`);
    const resBody = response.data;
    if (resBody && typeof resBody === "object" && "data" in resBody && resBody.data) {
      return resBody.data as SubscriptionPlan;
    }
    return resBody as unknown as SubscriptionPlan;
  },

  /**
   * Create a new subscription plan (defaults to active: true)
   */
  async createSubscriptionPlan(
    payload: CreateSubscriptionPlanPayload
  ): Promise<SubscriptionPlan> {
    const response = await apiClient.post<
      SubscriptionPlanApiResponse<SubscriptionPlan>
    >("/api/admin/subscription-plans", {
      is_active: true, // Default active
      ...payload,
    });
    const resBody = response.data;
    if (resBody && typeof resBody === "object" && "data" in resBody && resBody.data) {
      return resBody.data as SubscriptionPlan;
    }
    return resBody as unknown as SubscriptionPlan;
  },

  /**
   * Update an existing subscription plan by ID
   */
  async updateSubscriptionPlan(
    id: string,
    payload: UpdateSubscriptionPlanPayload
  ): Promise<SubscriptionPlan> {
    const response = await apiClient.put<
      SubscriptionPlanApiResponse<SubscriptionPlan>
    >(`/api/admin/subscription-plans/${id}`, payload);
    const resBody = response.data;
    if (resBody && typeof resBody === "object" && "data" in resBody && resBody.data) {
      return resBody.data as SubscriptionPlan;
    }
    return resBody as unknown as SubscriptionPlan;
  },

  /**
   * Soft delete a subscription plan by ID
   */
  async deleteSubscriptionPlan(id: string): Promise<void> {
    await apiClient.delete(`/api/admin/subscription-plans/${id}`);
  },

  /**
   * Toggle subscription plan active / inactive status
   */
  async updateSubscriptionPlanStatus(
    id: string,
    is_active: boolean
  ): Promise<void> {
    await apiClient.patch(`/api/admin/subscription-plans/${id}/status`, {
      is_active,
    });
  },
};
