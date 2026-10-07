import type { BaseEntity } from "./common";

/**
 * Category type definitions.
 */
export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description: string;
  image?: string;
  icon?: string;
  serviceCount: number;
  parentId?: string;
  children?: Category[];
}
