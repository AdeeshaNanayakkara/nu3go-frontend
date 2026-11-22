/**
 * "We received your message" confirmation sent to the person who filled the contact form.
 */

import type { ContactFormInput } from "@/schemas/contact.schema";
import { escapeHtml, stripLinks, toHtmlParagraphs, truncate } from "@/lib/email/sanitize";
import {
  BODY_FONT,
  BRAND_NAME,
  EMAIL_COLORS as C,
  HEADING_FONT,
  MONO_FONT,
  button,
  buttonRow,
  renderEmailLayout,
} from "@/lib/email/templates/layout";

/** Max characters of the visitor's message quoted back in the confirmation. */
const MESSAGE_EXCERPT_MAX = 300;

interface UserConfirmationOptions {
  data: ContactFormInput;
  appUrl: string;
  logoSrc: string;
  referenceId: string;
  /** Admin inbox the "Contact us" button writes to (CONTACT_ADMIN_EMAIL). */
  adminEmail: string;
}

export function renderUserConfirmationEmail({
  data,
  appUrl,
  logoSrc,
  referenceId,
  adminEmail,
}: UserConfirmationOptions) {
  // Deliverability / anti-abuse: echo only a short, link-free excerpt of what the
  // visitor typed. Contact forms are abused to push spam links to third-party inboxes
  // via the confirmation mail, and filters penalise unknown links in such mails.
  const safeSubjectText = stripLinks(data.subject);
  const excerptText = truncate(stripLinks(data.message), MESSAGE_EXCERPT_MAX);

  const firstName = escapeHtml(data.firstName);
  const subject = escapeHtml(safeSubjectText);
  const message = toHtmlParagraphs(excerptText);
  const ref = escapeHtml(referenceId);

  // "Contact us" opens a new email to the admin, pre-filled with the reference
  // so the team can match it with the original enquiry. The subject is URL-encoded
  // (user input can't break out of the href); adminEmail comes from server env.
  const contactHref = `mailto:${adminEmail.replace(/["<>\s]/g, "")}?subject=${encodeURIComponent(
    `Re: ${safeSubjectText} [${referenceId}]`,
  )}`;

  const body = `
    <p style="margin:0 0 16px;font-family:${BODY_FONT};font-size:14px;line-height:22px;color:${C.ink};">
      Hi <strong>${firstName}</strong>,
    </p>
    <p style="margin:0 0 28px;font-family:${BODY_FONT};font-size:14px;line-height:22px;color:${C.muted};">
      Thank you for reaching out to ${BRAND_NAME}. We've received your message and our wellness team
      will get back to you <strong style="color:${C.ink};">within 24 hours</strong>.
    </p>

    <!-- Message summary -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};border-radius:16px;border-left:4px solid ${C.green};">
      <tr>
        <td style="padding:22px 24px;">
          <span style="font-family:${HEADING_FONT};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.subtle};">Your message</span>
          <p style="margin:8px 0 10px;font-family:${HEADING_FONT};font-size:15px;line-height:21px;font-weight:700;text-transform:uppercase;color:${C.ink};">${subject}</p>
          <p style="margin:0;font-family:${BODY_FONT};font-size:13px;line-height:21px;color:${C.muted};">${message}</p>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 30px;font-family:${BODY_FONT};font-size:12px;line-height:19px;color:${C.subtle};">
      Reference: <span style="font-family:${MONO_FONT};color:${C.ink};">${ref}</span><br />
      Need to add something? Just reply to this email.
    </p>

    <p style="margin:0 0 6px;font-family:${HEADING_FONT};font-size:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${C.ink};">
      Have more questions?
    </p>
    <p style="margin:0 0 18px;font-family:${BODY_FONT};font-size:13px;line-height:20px;color:${C.muted};">
      Email our team directly, or explore our meal plans while you wait.
    </p>
    ${buttonRow(
      button(contactHref, "Contact us"),
      button(`${appUrl}/plans`, "View meal plans", "outline"),
    )}

    <p style="margin:22px 0 0;font-family:${BODY_FONT};font-size:13px;line-height:20px;color:${C.muted};">
      Eat well, live well,<br />
      <strong style="color:${C.greenDark};">The ${BRAND_NAME} team</strong>
    </p>`;

  const html = renderEmailLayout({
    title: `We received your message — ${BRAND_NAME}`,
    preheader: `Thanks ${firstName}, we've got your message about "${subject}" and will reply within 24 hours.`,
    eyebrow: "Message received",
    headline: "We&#39;ll be in<br />touch shortly",
    body,
    appUrl,
    logoSrc,
    footerNote: `You're receiving this because you contacted ${BRAND_NAME} through our website.`,
  });

  const text = [
    `Hi ${data.firstName},`,
    "",
    `Thank you for reaching out to ${BRAND_NAME}. We've received your message and our wellness team will get back to you within 24 hours.`,
    "",
    `Subject: ${safeSubjectText}`,
    "",
    excerptText,
    "",
    `Reference: ${referenceId}`,
    "Need to add something? Just reply to this email.",
    "",
    `Contact us: ${adminEmail}`,
    `Explore our meal plans: ${appUrl}/plans`,
    "",
    "Eat well, live well,",
    `The ${BRAND_NAME} team`,
  ].join("\n");

  return { html, text };
}
