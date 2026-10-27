import { apiClient } from "@/services/api/client";

export interface WalletBalanceRes {
  balance: number;
}

export interface WalletTransactionItem {
  id?: string;
  user_id?: string;
  type?: "CREDIT" | "DEBIT" | string;
  amount: number;
  description?: string;
  created_at?: string;
}

export const walletService = {
  /**
   * Fetch current customer's wallet balance
   * GET /api/v1/wallet/balance
   */
  async getBalance(userId?: string): Promise<number> {
    try {
      const response = await apiClient.get<any>("/api/v1/wallet/balance", {
        params: userId ? { user_id: userId } : undefined,
      });

      const body = response.data;
      if (body) {
        if (typeof body.balance === "number") return body.balance;
        if (typeof body.data?.balance === "number") return body.data.balance;
        if (typeof body.data === "number") return body.data;
        if (typeof body === "number") return body;
      }
      return 0;
    } catch (err) {
      console.warn("[walletService] Error fetching wallet balance:", err);
      return 0;
    }
  },
};
