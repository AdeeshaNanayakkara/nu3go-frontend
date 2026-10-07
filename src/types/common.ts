/**
 * Common shared types used across the application.
 */

/** Generic paginated response from the API */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/** Sort order for listings */
export type SortOrder = "asc" | "desc";

/** Generic sort configuration */
export interface SortConfig {
  field: string;
  order: SortOrder;
}

/** Generic query params for listing pages */
export interface ListQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
}

/** Generic ID-based entity */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/** Status type for various entities */
export type Status = "active" | "inactive" | "pending" | "archived";

/** Common action result */
export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
