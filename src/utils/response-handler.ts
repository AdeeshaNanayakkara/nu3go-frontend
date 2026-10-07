/**
 * Centralized API Response & User-Friendly Error Handler for Admin Dashboard.
 *
 * Translates technical backend errors, database constraint violations,
 * and HTTP status codes into clean, human-understandable messages.
 */

export interface FriendlyErrorOptions {
  fallback?: string;
  context?: "package" | "meal" | "menu" | "user" | "zone" | "faq" | "general";
}

/**
 * Maps raw backend technical error strings or HTTP statuses to user-friendly messages.
 */
export function formatUserFriendlyError(error: unknown, options: FriendlyErrorOptions = {}): string {
  const fallback = options.fallback || "An unexpected error occurred. Please try again.";

  if (!error) return fallback;

  let rawMessage = "";
  let statusCode: number | undefined;

  if (typeof error === "string") {
    rawMessage = error;
  } else if (error instanceof Error) {
    rawMessage = error.message;
    if ("status" in error && typeof (error as any).status === "number") {
      statusCode = (error as any).status;
    }
  } else if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, any>;
    rawMessage = errObj.message || errObj.error?.message || errObj.details || "";
    statusCode = errObj.status || errObj.statusCode;
  }

  const msgLower = rawMessage.toLowerCase();

  // ─── 1. Specific Business & System Rule Translations ───
  if (msgLower.includes("3 menus")) {
    return "A package must have exactly 3 configured menus before it can be set to Active. Please create 3 menus for this package first.";
  }

  if (msgLower.includes("invalid query parameters") || msgLower.includes("invalid query")) {
    return "The search or filter request contained invalid parameters. Please adjust your criteria and try again.";
  }

  if (msgLower.includes("failed to create menu") || msgLower.includes("create menu")) {
    return "Unable to save this menu schedule. Please ensure all mandatory main meals are selected for Monday through Friday.";
  }

  if (msgLower.includes("failed to update menu")) {
    return "Unable to update menu schedule. Please check meal assignments and try again.";
  }

  if (msgLower.includes("unauthorized") || msgLower.includes("access token missing") || statusCode === 401) {
    return "Your session has expired. Please log in again to continue.";
  }

  if (msgLower.includes("forbidden") || statusCode === 403) {
    return "You do not have permission to perform this administrative action.";
  }

  if (msgLower.includes("not found") || statusCode === 404) {
    return "The requested item could not be found. It may have been removed.";
  }

  if (msgLower.includes("duplicate") || msgLower.includes("already exists") || statusCode === 409) {
    return "An item with this name or identifier already exists.";
  }

  if (
    msgLower.includes("fetch failed") ||
    msgLower.includes("networkerror") ||
    msgLower.includes("failed to fetch")
  ) {
    return "Network connection issue. Please check your internet connection and try again.";
  }

  if (statusCode === 500) {
    return "The server encountered a temporary issue. Please try again shortly.";
  }

  // ─── 2. Clean Direct Message Fallback ───
  if (rawMessage && !rawMessage.startsWith("[object Object]") && rawMessage.length < 180) {
    // Capitalize first letter if needed
    return rawMessage.charAt(0).toUpperCase() + rawMessage.slice(1);
  }

  return fallback;
}

/**
 * Asserts API response status and extracts data or throws formatted user-friendly error.
 */
export function assertApiResponse<T>(
  response: { status: number; data?: any },
  fallbackErrorText: string
): T {
  if (response.status >= 400) {
    const rawError = response.data?.error?.message || response.data?.message || response.data;
    const userMessage = formatUserFriendlyError(rawError || `HTTP ${response.status}`, {
      fallback: fallbackErrorText,
    });
    throw new Error(userMessage);
  }

  const body = response.data;
  if (body && typeof body === "object" && "data" in body && body.data !== undefined) {
    return body.data as T;
  }
  return body as T;
}
