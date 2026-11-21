/**
 * API response types used across all service files.
 */

/** Successful API response wrapper */
export interface ApiResponse<T> {
  data: T;
  status: number;
}

/** API error shape */
export interface ApiError {
  status: number;
  message: string;
  errors: ApiFieldError[];
  /** Backend `error.details` — the specific reason (e.g. which day/field failed) */
  details?: string;
  /** Backend `error.message` on its own, without details appended */
  title?: string;
}

/** Individual field validation error */
export interface ApiFieldError {
  field: string;
  message: string;
}

/** Type guard for API errors */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "message" in error
  );
}
