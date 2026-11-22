import type { ContactFieldErrors, ContactFormInput } from "@/schemas/contact.schema";

export interface ContactSubmitPayload extends ContactFormInput {
  /** Honeypot — must stay empty. */
  website: string;
  /** Time between form mount and submit, for bot detection. */
  elapsedMs: number;
}

export type ContactSubmitResult =
  | { ok: true; message: string; referenceId?: string }
  | { ok: false; message: string; fieldErrors?: ContactFieldErrors; status: number };

const REQUEST_TIMEOUT_MS = 20_000;

/**
 * POST the contact form to the BFF route `/api/contact`.
 * Never throws — always resolves to a typed result the UI can render.
 */
export async function submitContactForm(payload: ContactSubmitPayload): Promise<ContactSubmitResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const body = await res.json().catch(() => null);

    if (res.ok && body?.success) {
      return { ok: true, message: body.message, referenceId: body.data?.referenceId };
    }

    return {
      ok: false,
      status: res.status,
      message: body?.error?.message || "Something went wrong. Please try again.",
      fieldErrors: body?.error?.fields,
    };
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === "AbortError";
    return {
      ok: false,
      status: 0,
      message: aborted
        ? "The request timed out. Please check your connection and try again."
        : "Network error. Please check your internet connection and try again.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
