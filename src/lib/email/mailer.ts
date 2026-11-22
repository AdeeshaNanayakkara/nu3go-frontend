/**
 * Nodemailer SMTP transport (server only).
 *
 * Import this ONLY from Route Handlers / server code — it reads SMTP secrets
 * from process.env. None of these variables use the NEXT_PUBLIC_ prefix, so
 * they are never bundled into client JavaScript.
 *
 * Required env (see .env.example):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM_ADDRESS, CONTACT_ADMIN_EMAIL
 * Optional:
 *   SMTP_SECURE ("true" for port 465), MAIL_FROM_NAME, NEXT_PUBLIC_APP_URL
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import nodemailer, { type Transporter } from "nodemailer";
import type { Attachment } from "nodemailer/lib/mailer";
import { LOGO_CID } from "@/lib/email/templates/layout";
import type SMTPPool from "nodemailer/lib/smtp-pool";

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromAddress: string;
  adminRecipients: string[];
  appUrl: string;
}

export class MailConfigError extends Error {
  constructor(missing: string[]) {
    super(`Missing or invalid mail environment variables: ${missing.join(", ")}`);
    this.name = "MailConfigError";
  }
}

let cachedConfig: MailConfig | null = null;
let cachedTransporter: Transporter<SMTPPool.SentMessageInfo> | null = null;

/** Read and validate mail settings once. Throws MailConfigError when incomplete. */
export function getMailConfig(): MailConfig {
  if (cachedConfig) return cachedConfig;

  const env = process.env;
  const port = Number(env.SMTP_PORT ?? 587);
  const adminRecipients = (env.CONTACT_ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const missing: string[] = [];
  if (!env.SMTP_HOST) missing.push("SMTP_HOST");
  if (!Number.isInteger(port) || port <= 0) missing.push("SMTP_PORT");
  if (!env.SMTP_USER) missing.push("SMTP_USER");
  if (!env.SMTP_PASS) missing.push("SMTP_PASS");
  if (!env.MAIL_FROM_ADDRESS) missing.push("MAIL_FROM_ADDRESS");
  if (adminRecipients.length === 0) missing.push("CONTACT_ADMIN_EMAIL");
  if (missing.length) throw new MailConfigError(missing);

  cachedConfig = {
    host: env.SMTP_HOST!,
    port,
    // Port 465 = implicit TLS. Ports 587/25 upgrade with STARTTLS.
    secure: env.SMTP_SECURE ? env.SMTP_SECURE === "true" : port === 465,
    user: env.SMTP_USER!,
    pass: env.SMTP_PASS!,
    fromName: env.MAIL_FROM_NAME || "nu3go",
    fromAddress: env.MAIL_FROM_ADDRESS!,
    adminRecipients,
    appUrl: (env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, ""),
  };
  return cachedConfig;
}

/** Shared pooled transporter — reused across requests in the same server process. */
export function getTransporter(): Transporter<SMTPPool.SentMessageInfo> {
  if (cachedTransporter) return cachedTransporter;
  const config = getMailConfig();

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    pool: true,
    maxConnections: 3,
    // Refuse to send credentials over an unencrypted connection in production.
    requireTLS: !config.secure && process.env.NODE_ENV === "production",
    tls: { minVersion: "TLSv1.2" },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  return cachedTransporter;
}

/** Formatted "Name <address>" sender. */
export function getFromHeader(): { name: string; address: string } {
  const { fromName, fromAddress } = getMailConfig();
  return { name: fromName, address: fromAddress };
}

// ─── Brand logo ──────────────────────────────────────────────────────────────

let cachedLogo: Buffer | null | undefined;

/**
 * The website logo (white version, public/images/nu3go_logo_white.png) as an inline CID attachment.
 * Embedding it means it shows in every mail client without the site being publicly
 * reachable (works on localhost) and isn't blocked as a remote image.
 * Returns null if the file isn't on disk (e.g. a serverless bundle without /public).
 */
function readLogo(): Buffer | null {
  if (cachedLogo !== undefined) return cachedLogo;
  try {
    cachedLogo = readFileSync(path.join(process.cwd(), "public", "images", "nu3go_logo_white.png"));
  } catch (err) {
    console.warn("[mailer] Logo file not found, falling back to hosted URL:", err);
    cachedLogo = null;
  }
  return cachedLogo;
}

/** `src` for the <img> in templates plus the attachment list to send with the mail. */
export function getLogoAssets(): { logoSrc: string; attachments: Attachment[] } {
  const logo = readLogo();
  if (logo) {
    return {
      logoSrc: `cid:${LOGO_CID}`,
      attachments: [
        { filename: "nu3go-logo.png", content: logo, contentType: "image/png", cid: LOGO_CID },
      ],
    };
  }
  return { logoSrc: `${getMailConfig().appUrl}/images/nu3go_logo_white.png`, attachments: [] };
}
