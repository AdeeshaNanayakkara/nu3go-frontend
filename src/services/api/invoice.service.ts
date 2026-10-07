import { apiClient } from "@/services/api/client";
import { subscriptionService, type SubscriptionResItem } from "@/services/api/subscription.service";

export interface InvoiceDiscountItem {
  id?: string;
  code?: string;
  name?: string;
  discount_id?: string;
  discount_amount?: number;
  percentage?: number;
}

export type InvoiceDiscount = InvoiceDiscountItem;

export type InvoiceStatus = "PENDING" | "PAID" | "FAILED" | "VOID" | "REFUNDED" | string;

export interface InvoiceItem {
  id: string;
  invoice_number: string;
  subscription_id?: string;
  status: InvoiceStatus;
  currency?: string;
  subtotal: number;
  discount_amount?: number;
  discounts?: InvoiceDiscountItem[];
  tax_amount?: number;
  wallet_credit_used?: number;
  grand_total: number;
  billing_start?: string;
  billing_end?: string;
  due_date?: string;
  paid_at?: string;
  created_at?: string;
}

export interface ListInvoicesParams {
  subscription_id?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ListInvoicesRes {
  data: InvoiceItem[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    total_pages?: number;
  };
}

export type ListInvoicesResponse = ListInvoicesRes;

export const invoiceService = {
  /**
   * Retrieves invoices specifically for all active subscriptions
   */
  async getActiveSubscriptionsInvoices(
    activeSubscriptions?: SubscriptionResItem[]
  ): Promise<InvoiceItem[]> {
    try {
      let subsToQuery = activeSubscriptions;
      if (!subsToQuery) {
        const allSubs = await subscriptionService.getSubscriptions();
        subsToQuery = (allSubs || []).filter(
          (s) => s.status?.toUpperCase() === "ACTIVE"
        );
      }

      if (!subsToQuery || subsToQuery.length === 0) {
        return [];
      }

      const invoicePromises = subsToQuery.map(async (sub) => {
        try {
          return await this.getSubscriptionInvoices(sub.id);
        } catch {
          return [];
        }
      });

      const nestedInvoices = await Promise.all(invoicePromises);
      const combined = nestedInvoices.flat();

      // Deduplicate by ID
      const seen = new Set<string>();
      const uniqueInvoices = combined.filter((inv) => {
        if (!inv || !inv.id) return false;
        if (seen.has(inv.id)) return false;
        seen.add(inv.id);
        return true;
      });

      // Sort by creation or paid date descending
      uniqueInvoices.sort((a, b) => {
        const timeA = new Date(a.created_at || a.paid_at || 0).getTime();
        const timeB = new Date(b.created_at || b.paid_at || 0).getTime();
        return timeB - timeA;
      });

      return uniqueInvoices;
    } catch (err) {
      console.error("[invoiceService] Error in getActiveSubscriptionsInvoices:", err);
      return [];
    }
  },
  /**
   * Retrieves invoices specifically for a given subscription ID
   */
  async getSubscriptionInvoices(
    subscriptionId: string,
    params?: { status?: string; page?: number; limit?: number }
  ): Promise<InvoiceItem[]> {
    if (!subscriptionId) return [];
    try {
      const response = await apiClient.get<any>(
        `/api/v1/subscriptions/${subscriptionId}/invoices`,
        { params: params as Record<string, string | number | boolean | undefined> }
      );

      const raw = response.data;
      if (!raw) return [];

      if (Array.isArray(raw)) return raw;

      if (raw.data) {
        if (Array.isArray(raw.data)) return raw.data;
        if (raw.data.data && Array.isArray(raw.data.data)) return raw.data.data;
        if (raw.data.invoices && Array.isArray(raw.data.invoices)) return raw.data.invoices;
        if (raw.data.id) return [raw.data];
      }

      if (raw.invoices && Array.isArray(raw.invoices)) return raw.invoices;

      return [];
    } catch (err) {
      console.error(`[invoiceService] Error fetching invoices for subscription ${subscriptionId}:`, err);
      return [];
    }
  },

  /**
   * Retrieves a list of invoices with optional filters
   */
  async getInvoices(params?: ListInvoicesParams): Promise<InvoiceItem[]> {
    if (params?.subscription_id) {
      return await this.getSubscriptionInvoices(params.subscription_id, {
        status: params.status,
        page: params.page,
        limit: params.limit,
      });
    }

    try {
      const query = new URLSearchParams();
      if (params?.status && params.status !== "ALL") query.append("status", params.status);
      if (params?.page) query.append("page", String(params.page));
      if (params?.limit) query.append("limit", String(params.limit));

      const url = `/api/v1/invoices${query.toString() ? `?${query.toString()}` : ""}`;
      const response = await apiClient.get<any>(url);

      const resBody = response.data;
      if (Array.isArray(resBody)) return resBody;
      if (resBody && typeof resBody === "object") {
        if (Array.isArray(resBody.data)) return resBody.data;
        if (resBody.data && typeof resBody.data === "object" && Array.isArray(resBody.data.data)) {
          return resBody.data.data;
        }
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
      return [];
    }
  },

  /**
   * Retrieves an invoice by its ID
   */
  async getInvoiceById(id: string): Promise<InvoiceItem | null> {
    try {
      const response = await apiClient.get<any>(`/api/v1/invoices/${id}`);
      const resBody = response.data;
      if (resBody && typeof resBody === "object") {
        if (resBody.data && typeof resBody.data === "object") {
          return resBody.data;
        }
        if (resBody.id) return resBody;
      }
      return null;
    } catch (err) {
      console.error(`Failed to fetch invoice ${id}:`, err);
      return null;
    }
  },

  /**
   * Retrieves the latest invoice for a specific subscription ID
   */
  async getLatestInvoiceForSubscription(subscriptionId: string): Promise<InvoiceItem | null> {
    try {
      const invoices = await this.getInvoices({ subscription_id: subscriptionId, limit: 1 });
      if (invoices && invoices.length > 0) {
        return invoices[0];
      }
      return null;
    } catch (err) {
      console.error("[invoiceService] Error fetching latest subscription invoice:", err);
      return null;
    }
  },

  /**
   * Marks an invoice as void (Admin only)
   */
  async voidInvoice(id: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/invoices/${id}/void`);
      return true;
    } catch (err) {
      console.error(`[invoiceService] Error voiding invoice ${id}:`, err);
      return false;
    }
  },
};
