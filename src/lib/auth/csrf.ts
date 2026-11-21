import { APP_CONFIG } from "@/constants/config";

/** Reads the double-submit CSRF cookie (browser only). */
export function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + APP_CONFIG.COOKIES.CSRF_TOKEN + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[1]) : "";
}

/** Headers to add to any state-changing fetch that does not go through apiClient. */
export function csrfHeaders(): Record<string, string> {
  const token = getCsrfToken();
  return token ? { "X-CSRF-Token": token } : {};
}
