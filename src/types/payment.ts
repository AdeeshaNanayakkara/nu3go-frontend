import type { BaseEntity } from "./common";

/**
 * Payment type definitions.
 */
export interface Payment extends BaseEntity {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  receiptUrl?: string;
}

export type PaymentMethod = "card" | "bank_transfer" | "wallet";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "refunded";
