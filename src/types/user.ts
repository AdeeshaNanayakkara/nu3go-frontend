import type { BaseEntity, Status } from "./common";

/**
 * User type definitions.
 */
export interface User extends BaseEntity {
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  role: string;
  status: Status;
  bio?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UserProfile extends User {
  totalOrders: number;
  totalSpent: number;
}
