import { apiClient } from "@/services/api/client";

export interface PaymentMethodItem {
  id: string;
  customer_reference?: string;
  type?: string;
  card_brand: string;
  masked_card_number: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
  provider?: string;
  created_at?: string;
}

export const paymentMethodService = {
  /**
   * Fetch all saved payment cards/methods for the customer
   */
  async getPaymentMethods(): Promise<PaymentMethodItem[]> {
    try {
      const response = await apiClient.get<any>("/api/v1/payment-methods");
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
      console.error("Failed to fetch payment methods:", err);
      return [];
    }
  },

  /**
   * Set a saved card as the default payment method
   */
  async setDefault(id: string): Promise<void> {
    await apiClient.put(`/api/v1/payment-methods/${id}/default`);
  },

  /**
   * Delete a saved payment method
   */
  async deletePaymentMethod(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/payment-methods/${id}`);
  },
};
