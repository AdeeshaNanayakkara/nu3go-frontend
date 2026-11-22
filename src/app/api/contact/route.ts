import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import {
  CONTACT_HONEYPOT_FIELD,
  CONTACT_MIN_FILL_TIME_MS,
  validateContactForm,
} from "@/schemas/contact.schema";
import { createRateLimiter } from "@/lib/rate-limit";
import { stripHeaderChars, truncate } from "@/lib/email/sanitize";
import {
  getFromHeader,
  getLogoAssets,
  getMailConfig,
  getTransporter,
  MailConfigError,
} from "@/lib/email/mailer";
import { BRAND_NAME } from "@/lib/email/templates/layout";
import { renderAdminNotificationEmail } from "@/lib/email/templates/admin-notification";
import { renderUserConfirmationEmail } from "@/lib/email/templates/user-confirmation";

/**
 * POST /api/contact
 *
 * Contact form → SMTP (Nodemailer).
 *  1. Security gates: same-origin check, JSON content type, body size cap
 *  2. Rate limiting per IP and per email address
 *  3. Spam traps: honeypot field + minimum fill time (silently "succeed" for bots)
 *  4. Server-side validation (same rules as the client — never trust the browser)
 *  5. Sends the admin notification (required) and the customer confirmation (best effort)
 *
 * Nodemailer needs Node.js APIs, so this route must not run on the Edge runtime.
 */
export const runtime = "nodejs";

const MAX_BODY_BYTES = 10 * 1024; // 10 KB is plenty for this form

// 5 submissions / 15 min per IP, 3 / hour per email address.
const ipLimiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });
const emailLimiter = createRateLimiter({ limit: 3, windowMs: 60 * 60 * 1000 });

type ErrorCode =
  | "FORBIDDEN"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "PAYLOAD_TOO_LARGE"
  | "INVALID_JSON"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "MAIL_NOT_CONFIGURED"
  | "MAIL_FAILED";

function errorResponse(
  status: number,
  code: ErrorCode,
  message: string,
  extra?: { fields?: Record<string, string>; headers?: Record<string, string> },
) {
  return NextResponse.json(
    { success: false, error: { code, message, ...(extra?.fields ? { fields: extra.fields } : {}) } },
    { status, headers: { "Cache-Control": "no-store", ...extra?.headers } },
  );
}

function successResponse(referenceId?: string) {
  return NextResponse.json(
    {
      success: true,
      message: `Thank you for contacting ${BRAND_NAME}. Our team will reach out within 24 hours.`,
      ...(referenceId ? { data: { referenceId } } : {}),
    },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * Client IP. x-forwarded-for is only trustworthy behind a proxy you control
 * (Vercel, Nginx, a load balancer) that overwrites it — see deployment notes.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Allow only requests sent by our own pages (blocks cross-site form posting / CSRF). */
function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  // Browsers always send Origin on cross-origin and same-origin POST fetches.
  // Missing Origin = non-browser client: allow in development for curl/Postman testing.
  if (!origin) return process.env.NODE_ENV !== "production";

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }

  const allowed = new Set<string>();
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (host) allowed.add(host);

  const configured = [process.env.NEXT_PUBLIC_APP_URL, ...(process.env.CONTACT_ALLOWED_ORIGINS ?? "").split(",")];
  for (const value of configured) {
    if (!value?.trim()) continue;
    try {
      allowed.add(new URL(value.trim()).host);
    } catch {
      // ignore malformed entries
    }
  }

  return allowed.has(originHost);
}

export async function POST(request: NextRequest) {
  // ── 1. Security gates ─────────────────────────────────────────────────────
  if (!isAllowedOrigin(request)) {
    return errorResponse(403, "FORBIDDEN", "This request is not allowed.");
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return errorResponse(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json.");
  }

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return errorResponse(413, "PAYLOAD_TOO_LARGE", "Your message is too large.");
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Could not read the request.");
  }
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
    return errorResponse(413, "PAYLOAD_TOO_LARGE", "Your message is too large.");
  }

  let body: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    body = parsed;
  } catch {
    return errorResponse(400, "INVALID_JSON", "Invalid request body.");
  }

  // ── 2. Rate limit by IP ───────────────────────────────────────────────────
  const ip = getClientIp(request);
  const ipCheck = ipLimiter.check(`ip:${ip}`);
  if (!ipCheck.success) {
    return errorResponse(
      429,
      "RATE_LIMITED",
      `Too many messages. Please try again in ${Math.ceil(ipCheck.retryAfterSeconds / 60)} minute(s).`,
      { headers: { "Retry-After": String(ipCheck.retryAfterSeconds) } },
    );
  }

  // ── 3. Spam traps — pretend success so bots don't learn they were caught ──
  const honeypot = body[CONTACT_HONEYPOT_FIELD];
  const elapsedMs = Number(body.elapsedMs);
  if (
    (typeof honeypot === "string" && honeypot.trim() !== "") ||
    (Number.isFinite(elapsedMs) && elapsedMs < CONTACT_MIN_FILL_TIME_MS)
  ) {
    console.warn(`[contact] Spam trap triggered from ${ip}`);
    return successResponse();
  }

  // ── 4. Server-side validation ─────────────────────────────────────────────
  const result = validateContactForm(body);
  if (!result.success) {
    return errorResponse(422, "VALIDATION_ERROR", "Please correct the highlighted fields.", {
      fields: result.errors as Record<string, string>,
    });
  }
  const data = result.data;

  const emailCheck = emailLimiter.check(`email:${data.email}`);
  if (!emailCheck.success) {
    return errorResponse(
      429,
      "RATE_LIMITED",
      "You've sent several messages recently. Our team will get back to you soon.",
      { headers: { "Retry-After": String(emailCheck.retryAfterSeconds) } },
    );
  }

  // ── 5. Send emails ────────────────────────────────────────────────────────
  let config;
  try {
    config = getMailConfig();
  } catch (err) {
    if (err instanceof MailConfigError) console.error(`[contact] ${err.message}`);
    else console.error("[contact] Mail config error:", err);
    return errorResponse(
      503,
      "MAIL_NOT_CONFIGURED",
      "Our contact service is temporarily unavailable. Please email us directly.",
    );
  }

  const transporter = getTransporter();
  const from = getFromHeader();
  const referenceId = `NU3-${randomUUID().slice(0, 8).toUpperCase()}`;
  const submittedAt = new Date();
  const fullName = stripHeaderChars(`${data.firstName} ${data.lastName}`);
  const { logoSrc, attachments } = getLogoAssets();

  const admin = renderAdminNotificationEmail({
    data,
    appUrl: config.appUrl,
    logoSrc,
    referenceId,
    submittedAt,
    meta: {
      ip,
      userAgent: truncate(stripHeaderChars(request.headers.get("user-agent") || "unknown"), 200),
      pageUrl: truncate(stripHeaderChars(request.headers.get("referer") || "unknown"), 200),
    },
  });

  // Admin notification is the critical one — if it fails, the user must know.
  try {
    await transporter.sendMail({
      from,
      to: config.adminRecipients,
      replyTo: { name: fullName, address: data.email },
      // Fixed wording only — visitor-typed text in the Subject is a strong spam signal.
      subject: `New Contact Enquiry from ${fullName}`,
      html: admin.html,
      text: admin.text,
      attachments,
      headers: { "X-Nu3go-Reference": referenceId },
    });
  } catch (err) {
    console.error(`[contact] Admin email failed (${referenceId}):`, err);
    return errorResponse(
      502,
      "MAIL_FAILED",
      "We couldn't send your message right now. Please try again in a few minutes.",
    );
  }

  // Customer confirmation is best effort — the enquiry already reached the team.
  try {
    const confirmation = renderUserConfirmationEmail({
      data,
      appUrl: config.appUrl,
      logoSrc,
      referenceId,
      adminEmail: config.adminRecipients[0],
    });
    await transporter.sendMail({
      from,
      to: { name: fullName, address: data.email },
      replyTo: config.adminRecipients[0],
      subject: `We received your message — ${BRAND_NAME}`,
      html: confirmation.html,
      text: confirmation.text,
      attachments,
      headers: {
        "X-Nu3go-Reference": referenceId,
        // RFC 3834: marks this as an automatic reply, so out-of-office bots don't answer it.
        "Auto-Submitted": "auto-replied",
        "X-Auto-Response-Suppress": "OOF, AutoReply",
      },
    });
  } catch (err) {
    console.error(`[contact] Confirmation email failed (${referenceId}):`, err);
  }

  return successResponse(referenceId);
}
