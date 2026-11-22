This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contact form (SMTP email)

The contact page form (`src/components/contact/contact-card-section.tsx`) posts to
`POST /api/contact` (`src/app/api/contact/route.ts`), which sends two emails with Nodemailer:

1. **Admin notification** → `CONTACT_ADMIN_EMAIL` (Reply-To = the customer)
2. **Customer confirmation** → the address entered in the form

| Piece | Location |
|---|---|
| Shared validation (client + server) | `src/schemas/contact.schema.ts` |
| SMTP transport / env config | `src/lib/email/mailer.ts` |
| Email templates | `src/lib/email/templates/` |
| HTML escaping, header-injection guard | `src/lib/email/sanitize.ts` |
| Rate limiter | `src/lib/rate-limit.ts` |

**Protection:** same-origin check, JSON-only, 10 KB body cap, honeypot field + minimum fill time,
server-side validation, rate limit (5 / 15 min per IP, 3 / hour per email), HTML escaping in templates.

### Local setup

```bash
cp .env.example .env.local   # then fill in the SMTP_* / MAIL_* / CONTACT_* values
npm run dev
```

Gmail / Google Workspace needs 2-Step Verification and an **App Password** for `SMTP_PASS`.

### Production deployment

- Set every variable from `.env.example` in the hosting dashboard (Vercel → Project → Settings →
  Environment Variables, or the server's environment). Never commit `.env.local`.
- Set `NEXT_PUBLIC_APP_URL` to the real https domain — it is used for the origin check and email links.
  Add other domains (e.g. staging) to `CONTACT_ALLOWED_ORIGINS`.
- Use port 587 (STARTTLS) or 465 (`SMTP_SECURE=true`); in production the transport refuses to
  send credentials without TLS.
- Use a sender on your own domain (`MAIL_FROM_ADDRESS`) with **SPF, DKIM and DMARC** records,
  otherwise mails may land in spam. For volume, prefer a transactional provider's SMTP
  (Amazon SES, SendGrid, Brevo, Mailgun, …) over a personal mailbox.
- The rate limiter is in-memory: correct for a single `next start` server. On serverless /
  multiple instances, replace its store with Redis (e.g. Upstash) for a shared limit.
- The client IP comes from `x-forwarded-for`. Run behind a proxy that sets it (Vercel, Nginx,
  a load balancer); if you expose Node directly, the header can be spoofed.
