/**
 * Contact form validation schema.
 *
 * Shared by the client form (instant feedback) and the `/api/contact` route
 * (authoritative check — the server never trusts the browser's validation).
 * Dependency-free on purpose so it can run in both environments.
 */

export const CONTACT_LIMITS = {
  NAME_MAX: 50,
  EMAIL_MAX: 254,
  PHONE_MAX: 20,
  SUBJECT_MIN: 3,
  SUBJECT_MAX: 120,
  MESSAGE_MIN: 10,
  MESSAGE_MAX: 2000,
} as const;

/** Hidden anti-spam field. Real users never see or fill it. */
export const CONTACT_HONEYPOT_FIELD = "website";

/** Submissions faster than this (ms after the form mounted) are treated as bots. */
export const CONTACT_MIN_FILL_TIME_MS = 2500;

export const CONTACT_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "subject",
  "message",
] as const;

export type ContactField = (typeof CONTACT_FIELDS)[number];

export type ContactFormInput = Record<ContactField, string>;

export type ContactFieldErrors = Partial<Record<ContactField, string>>;

export type ContactValidationResult =
  | { success: true; data: ContactFormInput }
  | { success: false; errors: ContactFieldErrors };

export const EMPTY_CONTACT_FORM: ContactFormInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

// Pragmatic email check: local@domain.tld, no spaces, no consecutive dots.
const EMAIL_REGEX = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

// Letters (any language), spaces, apostrophes, hyphens, periods.
const NAME_REGEX = /^[\p{L}\p{M}' .-]+$/u;

// Digits with optional leading +, spaces, dashes, parentheses.
const PHONE_REGEX = /^\+?[0-9\s()-]{7,20}$/;

/** Trim and collapse internal runs of whitespace (keeps newlines in the message). */
function clean(value: unknown, keepNewlines = false): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (keepNewlines) {
    return trimmed.replace(/\r\n?/g, "\n").replace(/[^\S\n]+/g, " ").replace(/\n{3,}/g, "\n\n");
  }
  return trimmed.replace(/\s+/g, " ");
}

/** Validate a single field. Returns an error message, or undefined when valid. */
export function validateContactField(field: ContactField, rawValue: string): string | undefined {
  const value = field === "message" ? clean(rawValue, true) : clean(rawValue);

  switch (field) {
    case "firstName":
    case "lastName": {
      const label = field === "firstName" ? "First name" : "Last name";
      if (!value) return `${label} is required.`;
      if (value.length > CONTACT_LIMITS.NAME_MAX)
        return `${label} must be ${CONTACT_LIMITS.NAME_MAX} characters or fewer.`;
      if (!NAME_REGEX.test(value)) return `${label} contains invalid characters.`;
      return undefined;
    }
    case "email": {
      if (!value) return "Email is required.";
      if (value.length > CONTACT_LIMITS.EMAIL_MAX || !EMAIL_REGEX.test(value) || value.includes(".."))
        return "Please enter a valid email address.";
      return undefined;
    }
    case "phone": {
      if (!value) return undefined; // optional
      if (value.length > CONTACT_LIMITS.PHONE_MAX || !PHONE_REGEX.test(value))
        return "Please enter a valid phone number.";
      return undefined;
    }
    case "subject": {
      if (!value) return "Subject is required.";
      if (value.length < CONTACT_LIMITS.SUBJECT_MIN)
        return `Subject must be at least ${CONTACT_LIMITS.SUBJECT_MIN} characters.`;
      if (value.length > CONTACT_LIMITS.SUBJECT_MAX)
        return `Subject must be ${CONTACT_LIMITS.SUBJECT_MAX} characters or fewer.`;
      return undefined;
    }
    case "message": {
      if (!value) return "Message is required.";
      if (value.length < CONTACT_LIMITS.MESSAGE_MIN)
        return `Message must be at least ${CONTACT_LIMITS.MESSAGE_MIN} characters.`;
      if (value.length > CONTACT_LIMITS.MESSAGE_MAX)
        return `Message must be ${CONTACT_LIMITS.MESSAGE_MAX} characters or fewer.`;
      return undefined;
    }
  }
}

/**
 * Validate the whole form. Accepts `unknown` so the API route can pass the
 * parsed JSON body straight in. Returns normalised (trimmed) data on success.
 */
export function validateContactForm(input: unknown): ContactValidationResult {
  const source = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const errors: ContactFieldErrors = {};
  const data = { ...EMPTY_CONTACT_FORM };

  for (const field of CONTACT_FIELDS) {
    const raw = typeof source[field] === "string" ? (source[field] as string) : "";
    const error = validateContactField(field, raw);
    if (error) errors[field] = error;
    data[field] = field === "message" ? clean(raw, true) : clean(raw);
  }

  if (Object.keys(errors).length > 0) return { success: false, errors };
  data.email = data.email.toLowerCase();
  return { success: true, data };
}
