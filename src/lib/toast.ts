import { toast as sonnerToast } from "sonner";
import { APP_CONFIG } from "@/constants/config";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastOptions {
  duration?: number;
  description?: string;
}

const AUTO_WINDOW_MS = 2000;
let lastAuto: { id: string; type: ToastType; at: number } | null = null;

function recentAuto() {
  return lastAuto && Date.now() - lastAuto.at < AUTO_WINDOW_MS ? lastAuto : null;
}

function show(message: string, type: ToastType, options?: ToastOptions, id?: string) {
  const opts = {
    id,
    duration: options?.duration ?? APP_CONFIG.TOAST_DURATION_MS,
    description: options?.description,
  };
  switch (type) {
    case "success":
      return sonnerToast.success(message, opts);
    case "error":
      return sonnerToast.error(message, opts);
    case "warning":
      return sonnerToast.warning(message, opts);
    case "info":
      return sonnerToast.info(message, opts);
  }
}

function showManual(message: string, type: ToastType, options?: ToastOptions) {
  const auto = recentAuto();
  if (auto && type === "error" && auto.type === "error") {
    // The automatic toast already carries the backend's exact message + details
    return auto.id;
  }
  if (auto && type === "success" && auto.type === "success") {
    sonnerToast.dismiss(auto.id);
  }
  return show(message, type, options);
}

export const toast = {
  success: (message: string, options?: ToastOptions) => showManual(message, "success", options),
  error: (message: string, options?: ToastOptions) => showManual(message, "error", options),
  warning: (message: string, options?: ToastOptions) => showManual(message, "warning", options),
  info: (message: string, options?: ToastOptions) => showManual(message, "info", options),
  dismiss: sonnerToast.dismiss,

  /**
   * Fired automatically by apiClient for every mutating request.
   * Identical messages share one toast id (so batched calls collapse into one).
   * A page-level success toast fired right after replaces it with more specific wording;
   * a page-level error toast is skipped so the backend's exact message + details stay visible.
   */
  auto: (message: string, type: "success" | "error", description?: string) => {
    const id = `auto:${type}:${message}:${description ?? ""}`;
    lastAuto = { id, type, at: Date.now() };
    return show(message, type, { description }, id);
  },
};
