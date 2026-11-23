import { apiClient } from "@/services/api/client";

export interface PreapprovalParams {
  merchant_id: string;
  order_id: string;
  items: string;
  amount: string;
  currency: string;
  hash: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  return_url?: string;
  cancel_url?: string;
  notify_url?: string;
  sandbox?: boolean;
}

export interface CheckoutRes {
  order_id: string;
  checkout_params?: PreapprovalParams | null;
  fully_covered_by_wallet?: boolean;
  grand_total_payable?: number;
  wallet_credit_applied?: number;
}

export interface SubscriptionLocationInput {
  location_id: string;
  dates?: string[];
}

export type DeliveryType =
  | "CALL_AND_HANDOVER"
  | "LEAVE_AT_GUARDROOM"
  | "LEAVE_AT_GUARDROOM_AND_NOTIFY"
  | "HANG_AT_DESIGNATED_LOCATION"
  | "LEAVE_AT_DESIGNATED_LOCATION"
  | "CALL_FOR_COLLECTION";

export interface CreateSubscriptionReq {
  package_id: string;
  subscription_plan_id: string;
  plan_id?: string;
  location_id?: string;
  zone_id?: string;
  discount_id?: string;
  auto_renew?: boolean;
  return_url?: string;
  cancel_url?: string;
  locations?: SubscriptionLocationInput[];
  use_wallet_credit?: boolean;
  days_count?: number;
  delivery_type?: DeliveryType;
}

export interface SubscriptionScheduledDate {
  id: string;
  location_id: string;
  date: string;
  locked?: boolean;
  editable_until?: string;
}

export interface SubscriptionResItem {
  id: string;
  user_id?: string;
  package_id?: string;
  subscription_plan_id?: string;
  package_name?: string;
  package?: { id: string; name: string };
  plan_name?: string;
  plan?: { id: string; name: string };
  status: "PENDING" | "ACTIVE" | "PAYMENT_FAILED" | "EXPIRED" | "CANCELLED" | string;
  auto_renew: boolean;
  delivery_type?: DeliveryType;
  locations?: SubscriptionScheduledDate[];
  started_at?: string;
  valid_until?: string;
  next_billing_date?: string;
  cancelled_at?: string;
  created_at?: string;
  /** CUSTOM plan day balance (total days purchased, incl. extra day top-ups). */
  purchased_days?: number;
  /** CUSTOM plan: days not yet scheduled on the calendar. */
  remaining_days?: number;
  /** CUSTOM plan: days already scheduled with a date + location. */
  scheduled_days?: number;
  return_price?: number;
  unused_days_refund?: number;
}

export interface AddSubscriptionDatesReq {
  dates: string[];
  location_id: string;
}

export interface UpdateSubscriptionDateReq {
  new_date?: string;
  location_id?: string;
}

export const subscriptionService = {
  /**
   * Post subscription payload to initiate checkout and retrieve PayHere preapproval parameters
   */
  async createSubscription(payload: CreateSubscriptionReq): Promise<CheckoutRes> {
    const response = await apiClient.post<{ success?: boolean; data?: CheckoutRes }>("/api/v1/subscriptions", payload);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data as unknown as CheckoutRes;
  },

  /**
   * Retrieve subscriptions list for current user
   */
  async getSubscriptions(): Promise<SubscriptionResItem[]> {
    try {
      const response = await apiClient.get<any>("/api/v1/subscriptions");
      const root = response.data;
      if (!root) return [];

      // 1. Direct array: [ { id: "..." } ]
      if (Array.isArray(root)) return root;

      // 2. Wrapped in data: { success: true, data: { data: [ ... ], pagination: { ... } } }
      if (root.data && typeof root.data === "object") {
        if (Array.isArray(root.data)) return root.data;
        if (Array.isArray(root.data.data)) return root.data.data;
        if (Array.isArray(root.data.subscriptions)) return root.data.subscriptions;
        if (root.data.id) return [root.data]; // Single subscription object
      }

      // 3. Wrapped in subscriptions: { subscriptions: [ ... ] }
      if (Array.isArray(root.subscriptions)) return root.subscriptions;

      // 4. Single subscription at root: { id: "...", package_id: "..." }
      if (root.id && (root.package_id || root.subscription_plan_id)) return [root];

      return [];
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
      return [];
    }
  },

  /**
   * Retrieve single subscription by ID
   */
  async getSubscriptionById(id: string): Promise<SubscriptionResItem | null> {
    try {
      const response = await apiClient.get<any>(`/api/v1/subscriptions/${id}`);
      const resBody = response.data;
      if (resBody && typeof resBody === "object") {
        if (resBody.data && typeof resBody.data === "object") {
          return resBody.data;
        }
        if (resBody.id) return resBody;
      }
      return null;
    } catch (err) {
      console.error(`Failed to fetch subscription ${id}:`, err);
      return null;
    }
  },

  /**
   * Retry failed billing for subscription
   */
  async retryBilling(id: string): Promise<void> {
    await apiClient.post(`/api/v1/subscriptions/${id}/retry-billing`);
  },

  /**
   * Cancel an active subscription by ID
   */
  async cancelSubscription(id: string): Promise<void> {
    await apiClient.post(`/api/v1/subscriptions/${id}/cancel`);
  },

  /**
   * Cancel auto renewal for a subscription
   */
  async cancelAutoRenewal(id: string): Promise<void> {
    await apiClient.post(`/api/v1/subscriptions/${id}/cancel-renewal`);
  },

  /**
   * CUSTOM plan: Schedule delivery dates against a saved location, drawing down
   * the subscription's remaining (unscheduled) day balance.
   * POST /api/v1/subscriptions/{id}/dates
   */
  async addSubscriptionDates(id: string, dates: string[], locationId: string): Promise<SubscriptionResItem | null> {
    try {
      const response = await apiClient.post<any>(`/api/v1/subscriptions/${id}/dates`, {
        dates,
        location_id: locationId,
      } as AddSubscriptionDatesReq);
      const body = response.data;
      if (body && body.data) return body.data as SubscriptionResItem;
      return (body as SubscriptionResItem) ?? null;
    } catch (err: any) {
      throw new Error(err?.message || err?.error?.message || "Failed to schedule delivery dates.");
    }
  },

  /**
   * CUSTOM plan: Unschedule a date before its cutoff; the day returns to the
   * remaining balance (no wallet refund).
   * DELETE /api/v1/subscriptions/{id}/dates/{date}
   */
  async removeSubscriptionDate(id: string, date: string): Promise<SubscriptionResItem | null> {
    try {
      const response = await apiClient.delete<any>(`/api/v1/subscriptions/${id}/dates/${date}`);
      const body = response.data;
      if (body && body.data) return body.data as SubscriptionResItem;
      return (body as SubscriptionResItem) ?? null;
    } catch (err: any) {
      throw new Error(err?.message || err?.error?.message || "Failed to remove scheduled date.");
    }
  },

  /**
   * CUSTOM plan: Move a scheduled date and/or change its delivery location.
   * PATCH /api/v1/subscriptions/{id}/dates/{date}
   */
  async updateSubscriptionDate(
    id: string,
    date: string,
    payload: UpdateSubscriptionDateReq
  ): Promise<SubscriptionResItem | null> {
    try {
      const response = await apiClient.patch<any>(`/api/v1/subscriptions/${id}/dates/${date}`, payload);
      const body = response.data;
      if (body && body.data) return body.data as SubscriptionResItem;
      return (body as SubscriptionResItem) ?? null;
    } catch (err: any) {
      throw new Error(err?.message || err?.error?.message || "Failed to update scheduled date.");
    }
  },
};


/**
 * Utility to launch PayHere preapproval checkout window or form submit
 */
export function triggerPayHereCheckout(checkoutParams: PreapprovalParams) {
  if (typeof window === "undefined") return;

  // PayHere rejects the request ("Unauthorized payment request") when the amount
  // doesn't match the hash. Strip thousands separators and force 2 decimals so
  // values like "1,244.00" are submitted as "1244.00".
  if (checkoutParams.amount !== undefined && checkoutParams.amount !== null) {
    const numericAmount = parseFloat(String(checkoutParams.amount).replace(/[,\s]/g, ""));
    if (!Number.isNaN(numericAmount)) {
      checkoutParams = { ...checkoutParams, amount: numericAmount.toFixed(2) };
    }
  }

  // Debug aid: inspect exactly what is handed to PayHere (no secrets involved —
  // these same values are visible in the submitted form).
  console.debug("[PayHere] checkout params:", checkoutParams);

  // Check if PayHere JavaScript SDK is present on window
  const win = window as unknown as {
    payhere?: {
      startPayment: (params: PreapprovalParams) => void;
      onCompleted?: (orderId: string) => void;
      onDismissed?: () => void;
      onError?: (error: string) => void;
    };
  };

  if (win.payhere && typeof win.payhere.startPayment === "function") {
    const origin = window.location.origin;
    const currentPath = window.location.pathname || "/plans";
    const returnUrl = checkoutParams.return_url || `${origin}${currentPath}?payment=success`;
    const cancelUrl = checkoutParams.cancel_url || `${origin}${currentPath}?payment=cancelled`;

    win.payhere.onCompleted = function onCompleted(orderId: string) {
      const sep = returnUrl.includes("?") ? "&" : "?";
      window.location.href = `${returnUrl}${sep}order_id=${encodeURIComponent(orderId || checkoutParams.order_id || "")}`;
    };

    win.payhere.onDismissed = function onDismissed() {
      const sep = cancelUrl.includes("?") ? "&" : "?";
      window.location.href = `${cancelUrl}${sep}status=cancelled&order_id=${encodeURIComponent(checkoutParams.order_id || "")}`;
    };

    win.payhere.onError = function onError(error: string) {
      const sep = cancelUrl.includes("?") ? "&" : "?";
      window.location.href = `${cancelUrl}${sep}status=failed&message=${encodeURIComponent(error || "Payment authorization failed")}&order_id=${encodeURIComponent(checkoutParams.order_id || "")}`;
    };

    win.payhere.startPayment(checkoutParams);
    return;
  }

  // Preapproval endpoint for subscription card tokenization.
  // Honour the backend's sandbox flag: live merchant credentials posted to the
  // sandbox host (or vice versa) trigger PayHere's "Unauthorized payment request".
  const payhereHost =
    checkoutParams.sandbox === false ? "https://www.payhere.lk" : "https://sandbox.payhere.lk";
  const payhereUrl =
    process.env.NEXT_PUBLIC_PAYHERE_PREAPPROVE_URL ||
    process.env.NEXT_PUBLIC_PAYHERE_CHECKOUT_URL ||
    `${payhereHost}/pay/preapprove`;

  const form = document.createElement("form");
  form.method = "POST";
  form.action = payhereUrl;
  form.target = "_self";

  Object.entries(checkoutParams).forEach(([key, val]) => {
    // "sandbox" is an SDK-only flag, not a PayHere form field
    if (key === "sandbox") return;
    if (val !== undefined && val !== null) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(val);
      form.appendChild(input);
    }
  });

  document.body.appendChild(form);
  form.submit();
}
