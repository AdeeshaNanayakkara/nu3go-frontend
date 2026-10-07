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
  checkout_params: PreapprovalParams;
}

export interface SubscriptionLocationInput {
  location_id: string;
  dates?: string[];
}

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
  locations?: { id: string; location_id: string; date?: string }[];
  started_at?: string;
  valid_until?: string;
  next_billing_date?: string;
  cancelled_at?: string;
  created_at?: string;
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
};


/**
 * Utility to launch PayHere preapproval checkout window or form submit
 */
export function triggerPayHereCheckout(checkoutParams: PreapprovalParams) {
  if (typeof window === "undefined") return;

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

  // Preapproval endpoint for subscription card tokenization
  const payhereUrl =
    process.env.NEXT_PUBLIC_PAYHERE_PREAPPROVE_URL ||
    process.env.NEXT_PUBLIC_PAYHERE_CHECKOUT_URL ||
    "https://sandbox.payhere.lk/pay/preapprove";

  const form = document.createElement("form");
  form.method = "POST";
  form.action = payhereUrl;
  form.target = "_self";

  Object.entries(checkoutParams).forEach(([key, val]) => {
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
