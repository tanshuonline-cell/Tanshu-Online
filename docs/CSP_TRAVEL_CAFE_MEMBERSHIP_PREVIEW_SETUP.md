# CSP & Travel Cafe membership preview setup

This feature is isolated on branch `csp-travel-cafe-membership-preview`. It does not replace the existing admin login or video-management endpoints.

## Included in this preview

- Gmail-only customer registration/login using email OTP (no phone login).
- Server-generated six-digit OTP, ten-minute expiry, maximum five verification attempts and three OTP requests per 15 minutes per Gmail address.
- HttpOnly customer session cookie (30 days).
- Free-signup access for Photo & Signature Resizer, Auto Document Cropper and Photo Background Remover.
- Monthly plans: BASIC ₹99, ADVANCED ₹199, PREMIUM ₹299; pricing is editable in the existing Admin Dashboard.
- Cumulative paid access: BASIC = Passport Photo Studio; ADVANCED = BASIC + PVC Card Maker + Multi Customer Photo Maker; PREMIUM = ADVANCED + WhatsApp Selfie to Passport Photo.
- Manual membership activation only after payment is independently verified. No payment gateway, auto-debit or auto-renewal is added.
- Admin customer list, suspend/restore/expire actions, manual activation, payment audit history and audit records.
- Separate scheduled Worker source for 7/3/1-day expiry reminder emails.

## Required Cloudflare setup (not performed by this code change)

1. **D1 migration:** Apply `migrations/0012_csp_customer_memberships.sql` to the same existing D1 database bound as `DB` for the current `/api/admin/videos` and `/api/admin/purchases` functions. Do not apply it to the separate Digital Seva preview database. This migration is not applied automatically.
2. **Brevo Free account:** Create a Brevo account on its free tier, verify a sender identity/domain and complete the SPF/DKIM DNS records Brevo supplies. Use a sender address on a domain you control. Brevo's free sending quota is subject to Brevo's current plan limits; this code does not purchase credits or upgrade plans.
3. **Cloudflare Pages Preview secrets/variables:** In the Preview environment only, configure:
   - `BREVO_API_KEY` (secret from Brevo)
   - `CSP_SENDER_EMAIL` (verified sender address)
   - `CSP_SENDER_NAME` (optional; defaults to TANSHU ONLINE)
   - `CSP_OTP_SECRET` (random secret, at least 32 bytes)
   - `CSP_SESSION_SECRET` (a different random secret, at least 32 bytes)
   - Existing `DB` D1 binding must be available in Preview.
4. **Preview deployment:** Deploy this branch as a Cloudflare Pages Preview deployment and test Gmail delivery, OTP verification, tool access and admin actions. Do not merge or deploy to Production until the site owner approves.
5. **Expiry reminders:** The reminder Worker is separate so the Pages app remains unchanged. Before deploying `wrangler.csp-reminders.toml`, replace the D1 database name and ID with the existing production/preview database identifiers, set `CSP_SENDER_EMAIL`, and add the Brevo key as a Worker secret. Its cron runs daily at 10:00 AM IST. Do not deploy this Worker until the Preview D1 environment and email sender have been confirmed.

Generate secrets locally or with a password manager; never paste them into chat or commit them to GitHub. For example, a local terminal can generate independent random values with `openssl rand -hex 32`.

## Important implementation notes

- The app will return a clear setup error instead of pretending to send OTP when Brevo/D1 secrets are missing.
- Customer-facing prices are read from D1; admin price changes affect new activations. Existing memberships keep their recorded amount and expiry.
- The membership UI gates tool entry in the browser. Because the photo tools perform image processing locally, this preview does not turn those tools into server-hosted protected downloads; do not treat a client-side gate as DRM or as a guarantee against a technically skilled user bypassing browser code.
- The 7/3/1 reminder Worker is a separate deployment and will not send emails until it is configured with the correct D1 database and Brevo sender.
- Existing video admin, Digital Seva, other tools, homepage layout and language controls are intentionally left outside this feature branch's scope.
