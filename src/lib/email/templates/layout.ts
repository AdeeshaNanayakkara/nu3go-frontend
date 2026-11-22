/**
 * Shared email layout — matches the nu3go landing page look
 * (cream background, deep green header, #36D068 accent, Oswald uppercase headings,
 * Geist body text — the same font families as the website's globals.css).
 *
 * Email clients have weak CSS support, so this uses tables + inline styles only.
 * All dynamic values passed in MUST already be HTML-escaped by the caller.
 */

export const EMAIL_COLORS = {
  cream: "#F7F6F2",
  white: "#FFFFFF",
  green: "#36D068",
  greenDark: "#0B3B17",
  ink: "#171717",
  muted: "#525252",
  subtle: "#A3A3A3",
  border: "#E5E5E5",
} as const;

/** Brand name — always written in lowercase. */
export const BRAND_NAME = "nu3go";

/** Content-ID of the inline logo attachment (see getLogoAttachment in mailer.ts). */
export const LOGO_CID = "nu3go-logo";

// Same families as the website (globals.css). Clients that block web fonts (e.g. Gmail web)
// fall back to the closest system fonts listed after them.
export const HEADING_FONT = "'Oswald', 'Arial Narrow', Impact, Arial, sans-serif";
export const BODY_FONT =
  "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
export const MONO_FONT = "'Geist Mono', Consolas, Menlo, monospace";

interface LayoutOptions {
  /** <title> and hidden inbox preview text (already escaped). */
  title: string;
  preheader: string;
  /** Small uppercase label above the headline, e.g. "MESSAGE RECEIVED". */
  eyebrow: string;
  /** Large headline in the green header (already escaped). */
  headline: string;
  /** Main card content (HTML). */
  body: string;
  appUrl: string;
  /** White logo source (shown in the green header): "cid:nu3go-logo" or an absolute https URL. */
  logoSrc: string;
  /** Footer note (already escaped). */
  footerNote: string;
  /**
   * Load Oswald/Geist from Google Fonts (default true). Internal notifications turn it
   * off: an external stylesheet is one more spam-filter signal, and Gmail ignores it anyway.
   */
  webFonts?: boolean;
}

const C = EMAIL_COLORS;

/** Uppercase label + value row used in detail tables. */
export function detailRow(label: string, valueHtml: string): string {
  return `
  <tr>
    <td style="padding:14px 0;border-bottom:1px solid ${C.border};vertical-align:top;width:34%;">
      <span style="font-family:${HEADING_FONT};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.subtle};">${label}</span>
    </td>
    <td style="padding:14px 0;border-bottom:1px solid ${C.border};vertical-align:top;font-family:${BODY_FONT};font-size:13px;line-height:20px;color:${C.ink};">${valueHtml}</td>
  </tr>`;
}

/**
 * Bulletproof (table-based) CTA button.
 * "solid" = green filled (primary), "outline" = deep green border (secondary).
 */
export function button(href: string, label: string, variant: "solid" | "outline" = "solid"): string {
  const solid = variant === "solid";
  const bg = solid ? C.green : C.white;
  const border = solid ? C.green : C.greenDark;
  const color = solid ? C.ink : C.greenDark;

  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
    <tr>
      <td bgcolor="${bg}" style="border-radius:4px;background:${bg};border:2px solid ${border};">
        <a href="${href}" target="_blank" style="display:inline-block;padding:10px 24px;font-family:${HEADING_FONT};font-size:12px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:${color};text-decoration:none;border-radius:4px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

/** Two buttons side by side; stacks on narrow screens via the .btn-cell class. */
export function buttonRow(first: string, second: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
    <tr>
      <td class="btn-cell" style="padding:0 12px 12px 0;vertical-align:top;">${first}</td>
      <td class="btn-cell" style="padding:0 0 12px 0;vertical-align:top;">${second}</td>
    </tr>
  </table>`;
}

export function renderEmailLayout({
  title,
  preheader,
  eyebrow,
  headline,
  body,
  appUrl,
  logoSrc,
  footerNote,
  webFonts = true,
}: LayoutOptions): string {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${title}</title>
  ${webFonts ? `<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400&family=Oswald:wght@500;600;700&display=swap" rel="stylesheet" />` : ""}
  <style>
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; }
      .px { padding-left: 22px !important; padding-right: 22px !important; }
      .headline { font-size: 24px !important; line-height: 29px !important; }
      .btn-cell { display: block !important; padding-right: 0 !important; }
      .logo-cell { width: 84px !important; padding-left: 10px !important; }
      .logo { width: 84px !important; height: 33px !important; }
    }
    a { color: ${C.green}; }
  </style>
</head>
<body style="margin:0;padding:0;background:${C.cream};-webkit-text-size-adjust:100%;">
  <!-- Inbox preview text -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

          <!-- Green header: eyebrow + headline on the left, white logo on the right -->
          <tr>
            <td class="px" bgcolor="${C.greenDark}" style="background:${C.greenDark};border-radius:24px 24px 0 0;padding:34px 40px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:top;">
                    <span style="display:inline-block;font-family:${HEADING_FONT};font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${C.green};margin-bottom:12px;">${eyebrow}</span>
                    <h1 class="headline" style="margin:0;font-family:${HEADING_FONT};font-size:30px;line-height:35px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${C.cream};">${headline}</h1>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
                      <tr><td style="width:56px;height:4px;background:${C.green};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
                    </table>
                  </td>
                  <td class="logo-cell" align="right" width="120" style="width:120px;vertical-align:top;padding-left:16px;">
                    <a href="${appUrl}" target="_blank" style="text-decoration:none;display:inline-block;">
                      <img class="logo" src="${logoSrc}" width="120" height="47" alt="${BRAND_NAME}" style="display:block;width:120px;height:47px;border:0;outline:none;font-family:${HEADING_FONT};font-size:24px;font-weight:700;color:${C.white};" />
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- White card body -->
          <tr>
            <td class="px" bgcolor="${C.white}" style="background:${C.white};border-radius:0 0 24px 24px;padding:30px 40px 34px;border:1px solid ${C.border};border-top:0;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" class="px" style="padding:28px 24px 8px;font-family:${BODY_FONT};font-size:11px;line-height:17px;color:${C.subtle};">
              ${footerNote}<br />
              <span style="color:${C.muted};">&copy; ${year} ${BRAND_NAME} &middot; Fresh, healthy meals delivered across Sri Lanka</span><br />
              <a href="${appUrl}" target="_blank" style="color:${C.greenDark};text-decoration:underline;">Visit our website</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
