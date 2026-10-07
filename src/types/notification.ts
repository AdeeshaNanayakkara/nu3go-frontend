import type { BaseEntity } from "./common";

/**
 * Notification type definitions.
 */
export interface Notification extends BaseEntity {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
}

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "order"
  | "payment"
  | "system";
