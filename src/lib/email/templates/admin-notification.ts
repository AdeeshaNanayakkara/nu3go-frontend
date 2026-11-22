/**
 * New contact enquiry notification sent to the nu3go admin inbox.
 * Reply-To is set to the customer, so the admin can answer directly from the mail client.
 *
 * Inbox placement: everything the visitor typed is escaped, and any links in it are
 * "defanged" (shown as text, not clickable). The notification then contains no live
 * third-party links — only mailto/tel actions and the site URL — which keeps spam
 * filters from judging our mail by links a stranger submitted.
 */

import type { ContactFormInput } from "@/schemas/contact.schema";
import { defangLinks, escapeHtml, toHtmlParagraphs, truncate } from "@/lib/email/sanitize";
import {
  BODY_FONT,
  BRAND_NAME,
  EMAIL_COLORS as C,
  HEADING_FONT,
  MONO_FONT,
  button,
  buttonRow,
  detailRow,
  renderEmailLayout,
} from "@/lib/email/templates/layout";

interface AdminNotificationOptions {
  data: ContactFormInput;
  appUrl: string;
  logoSrc: string;
  referenceId: string;
  submittedAt: Date;
  meta: { ip: string; userAgent: string; pageUrl: string };
}

function formatColomboTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Colombo",
  }).format(date);
}

/**
 * Only the path of the page the form was sent from (e.g. "/contact").
 * A full URL — even defanged as "hxxp://…" — looks like a phishing indicator to filters.
 */
function pagePath(referer: string): string {
  try {
    const { pathname } = new URL(referer);
    return pathname || "/";
  } catch {
    return "unknown";
  }
}

/** First letters of first + last name for the avatar circle. */
function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export function renderAdminNotificationEmail({
  data,
  appUrl,
  logoSrc,
  referenceId,
  submittedAt,
  meta,
}: AdminNotificationOptions) {
  const subjectText = defangLinks(data.subject);
  const messageText = defangLinks(data.message);
  const pageText = pagePath(meta.pageUrl);

  const fullName = escapeHtml(`${data.firstName} ${data.lastName}`);
  const firstName = escapeHtml(data.firstName);
  const email = escapeHtml(data.email);
  const phone = data.phone ? escapeHtml(data.phone) : "";
  const subject = escapeHtml(subjectText);
  const headline = escapeHtml(truncate(subjectText, 70));
  const message = toHtmlParagraphs(messageText);
  const when = escapeHtml(formatColomboTime(submittedAt));
  const ref = escapeHtml(referenceId);
  const avatar = escapeHtml(initials(data.firstName, data.lastName));

  // data.email / data.phone are validated by the schema (no quotes, spaces or markup).
  const replyHref = `mailto:${data.email}?subject=${encodeURIComponent(
    `Re: ${data.subject} [${referenceId}]`,
  )}`;
  const telHref = data.phone ? `tel:${data.phone.replace(/[^\d+]/g, "")}` : "";

  const actions = telHref
    ? buttonRow(button(replyHref, "Reply by email"), button(telHref, `Call ${firstName}`, "outline"))
    : button(replyHref, "Reply by email");

  const body = `
    <p style="margin:0 0 22px;font-family:${BODY_FONT};font-size:14px;line-height:22px;color:${C.muted};">
      You have a new enquiry from the website <strong style="color:${C.ink};">Contact</strong> page.
      Hit <strong style="color:${C.ink};">Reply</strong> to answer ${firstName} directly.
    </p>

    <!-- Customer card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};border-radius:16px;">
      <tr>
        <td style="padding:20px 22px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="46" style="width:46px;vertical-align:middle;">
                <div style="width:42px;height:42px;line-height:42px;border-radius:21px;background:${C.greenDark};color:${C.green};text-align:center;font-family:${HEADING_FONT};font-size:15px;font-weight:700;letter-spacing:1px;">${avatar}</div>
              </td>
              <td style="padding-left:12px;vertical-align:middle;">
                <p style="margin:0;font-family:${BODY_FONT};font-size:15px;line-height:20px;font-weight:700;color:${C.ink};">${fullName}</p>
                <p style="margin:2px 0 0;font-family:${BODY_FONT};font-size:13px;line-height:19px;color:${C.muted};">
                  <a href="mailto:${data.email}" style="color:${C.greenDark};font-weight:600;text-decoration:none;">${email}</a>${
                    phone
                      ? ` &nbsp;&middot;&nbsp; <a href="${telHref}" style="color:${C.greenDark};font-weight:600;text-decoration:none;">${phone}</a>`
                      : ""
                  }
                </p>
              </td>
            </tr>
          </table>
          <div style="margin-top:18px;">${actions}</div>
        </td>
      </tr>
    </table>

    <!-- Enquiry details -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;border-top:1px solid ${C.border};">
      ${detailRow("Subject", `<strong>${subject}</strong>`)}
      ${detailRow("Received", `${when} <span style="color:${C.subtle};">(Colombo time)</span>`)}
      ${phone ? "" : detailRow("Phone", `<span style="color:${C.subtle};">Not provided</span>`)}
      ${detailRow("Reference", `<span style="font-family:${MONO_FONT};">${ref}</span>`)}
    </table>

    <!-- Message -->
    <p style="margin:26px 0 10px;font-family:${HEADING_FONT};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.subtle};">Message</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};border-radius:16px;border-left:4px solid ${C.green};">
      <tr>
        <td style="padding:18px 22px;font-family:${BODY_FONT};font-size:14px;line-height:22px;color:${C.ink};">${message}</td>
      </tr>
    </table>
    <p style="margin:8px 0 0;font-family:${BODY_FONT};font-size:11px;line-height:16px;color:${C.subtle};">
      For safety, any links in the message are shown as plain text (e.g. example[.]com).
    </p>

    <!-- Technical details -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;border-top:1px dashed ${C.border};">
      <tr>
        <td style="padding-top:14px;font-family:${MONO_FONT};font-size:10px;line-height:16px;color:${C.subtle};">
          IP: ${escapeHtml(meta.ip)}<br />
          Page: ${escapeHtml(pageText)}<br />
          Browser: ${escapeHtml(meta.userAgent)}
        </td>
      </tr>
    </table>`;

  const html = renderEmailLayout({
    title: `New Contact Enquiry: ${subject}`,
    preheader: `${fullName} wrote: ${escapeHtml(truncate(messageText.replace(/\s+/g, " "), 110))}`,
    eyebrow: "New contact enquiry",
    headline,
    body,
    appUrl,
    logoSrc,
    footerNote: `Automated notification from the ${BRAND_NAME} website contact form.`,
    webFonts: false,
  });

  const text = [
    "New Contact Enquiry",
    `${BRAND_NAME} website — Contact page`,
    "",
    `Name:      ${data.firstName} ${data.lastName}`,
    `Email:     ${data.email}`,
    `Phone:     ${data.phone || "Not provided"}`,
    `Subject:   ${subjectText}`,
    `Received:  ${formatColomboTime(submittedAt)} (Colombo time)`,
    `Reference: ${referenceId}`,
    "",
    "Message:",
    messageText,
    "",
    "Reply to this email to answer the customer directly.",
    "",
    "---",
    `IP: ${meta.ip}`,
    `Page: ${pageText}`,
    `Browser: ${meta.userAgent}`,
  ].join("\n");

  return { html, text };
}
