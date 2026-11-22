/**
 * Email sanitisation helpers.
 *
 * Every user-supplied value that ends up in an email must pass through these:
 *  - escapeHtml()      → before interpolating into HTML templates (prevents HTML/script injection)
 *  - toHtmlParagraphs()→ escapes and keeps the user's line breaks
 *  - stripHeaderChars()→ before using a value in a header such as Subject (prevents header injection)
 */

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
  "=": "&#61;",
};

/** Escape characters that have meaning in HTML. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"'`=]/g, (char) => HTML_ESCAPES[char]);
}

/** Escape text and turn newlines into <br /> so multi-line messages keep their shape. */
export function toHtmlParagraphs(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

/** Remove CR/LF and other control characters so a value can't inject extra mail headers. */
export function stripHeaderChars(value: string): string {
  return value.replace(/[\r\n\t\u0000-\u001F\u007F]+/g, " ").trim();
}

/**
 * Replace URLs, bare domains and email addresses with "[link removed]".
 * Used for text echoed back to the visitor, so the confirmation mail can't be
 * abused to deliver links (and doesn't trip spam filters on unknown URLs).
 */
export function stripLinks(value: string): string {
  return value
    .replace(/\b(?:https?:\/\/|www\.)\S+/gi, "[link removed]")
    .replace(/\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b/g, "[link removed]")
    .replace(/\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|io|xyz|info|biz|ru|cn|top|lk|co|me|app|site|online|link|click|ly)\b(?:\/\S*)?/gi, "[link removed]");
}

/**
 * "Defang" links so they stay readable but are no longer clickable or auto-linked:
 *   https://evil.com/x → hxxps://evil[.]com/x,  www.site.lk → www[.]site[.]lk,  a@b.com → a@b[.]com
 * Used for visitor text shown to the admin: the team can still read what was sent,
 * but the notification carries no live third-party links (safer + better inbox placement).
 */
export function defangLinks(value: string): string {
  return value
    .replace(/\bhttp(s?):\/\//gi, "hxxp$1://")
    .replace(
      /\b((?:[a-z0-9-]+\.)+(?:[a-z]{2,24}))\b/gi,
      // TLD must be all-lowercase or all-uppercase, so "it.Thanks" (missing space) is left alone.
      (match) => (/\.(?:[a-z]{2,24}|[A-Z]{2,24})$/.test(match) ? match.replace(/\./g, "[.]") : match),
    );
}

/** Shorten a value for header use (e.g. Subject) with an ellipsis. */
export function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}
