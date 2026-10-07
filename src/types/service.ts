import type { BaseEntity, Status } from "./common";

/**
 * Service type definitions.
 */
export interface Service extends BaseEntity {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  currency: string;
  images: string[];
  thumbnail: string;
  categoryId: string;
  category?: ServiceCategory;
  status: Status;
  rating: number;
  reviewCount: number;
  features: string[];
  tags: string[];
}

export interface ServiceCategory extends BaseEntity {
  name: string;
  slug: string;
  description: string;
  image?: string;
  serviceCount: number;
  parentId?: string;
}
