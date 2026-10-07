import type { BaseEntity } from "./common";

/**
 * Order type definitions.
 */
export interface Order extends BaseEntity {
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  paymentId?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "completed"
  | "cancelled"
  | "refunded";
