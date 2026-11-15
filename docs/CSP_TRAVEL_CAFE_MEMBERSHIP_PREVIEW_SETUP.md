# CSP & Travel Cafe membership preview setup

This feature is isolated on branch `csp-travel-cafe-membership-preview` and a draft pull request. It does not replace the existing admin login or video-management endpoints.

## Included in this preview

- Gmail-only customer registration/login using email OTP (no phone login).
- Server-generated six-digit OTP, ten-minute expiry, maximum five verification attempts, three OTP requests per 15 minutes per Gmail address and ten per 15 minutes per IP (stored as a keyed hash).
- HttpOnly customer session cookie (30 days).
- Free-signup access for Photo & Signature Resizer, Auto Document Cropper and Photo Background Remover.
- Monthly plans: BASIC ₹99, ADVANCED ₹199, PREMIUM ₹299; pricing is editable in the existing Admin Dashboard.
- Cumulative paid access: BASIC = Passport Photo Studio; ADVANCED = BASIC + PVC Card Maker + Multi Customer Photo Maker; PREMIUM = ADVANCED + WhatsApp Selfie to Passport Photo.
- Manual membership activation only after payment is independently verified. No payment gateway, auto-debit or auto-renewal is added.
- Admin customer list, suspend/restore/expire actions, manual activation, payment audit history, editable plan pricing, per-tool enable/disable switches and audit records.
- Separate scheduled Worker source for 7/3/1-day expiry reminder emails.

## Zero-cost Gmail email setup (recommended)

Brevo's free tier is an option only if you already control a custom domain. Brevo says free sender domains such as `@gmail.com` cannot be authenticated and recommends a domain you own; do not buy a domain just for this project. The preview includes a Google Apps Script mail relay so you can use a Gmail account you already own without buying a domain.

1. Open [Google Apps Script](https://script.google.com/) while signed into the Gmail account that should send TANSHU ONLINE OTP emails.
2. Create a new project and copy the contents of `google-apps-script/CspOtpMailer.gs` into its editor.
3. In **Project Settings → Script properties**, add `CSP_MAILER_SECRET` with a new random value (at least 32 bytes). Do not put this secret in the source file.
4. Click **Deploy → New deployment → Web app**. Set **Execute as: Me** and **Who has access: Anyone**, then deploy and authorize the requested Mail permission. Copy the Web app URL.
5. In Cloudflare Pages → TANSHU ONLINE → Settings → Variables and Secrets, configure these in the **Preview** environment only:
   - `CSP_MAILER_URL` = the Apps Script Web app URL
   - `CSP_MAILER_SECRET` = exactly the same secret stored in Apps Script
   - `CSP_OTP_SECRET` = a different random secret (at least 32 bytes)
   - `CSP_SESSION_SECRET` = another different random secret (at least 32 bytes)
   - Existing `DB` D1 binding must be available in Preview.
6. The Apps Script consumer Gmail quota is currently 100 email recipients per day. Google says quotas can change without notice; when the quota is exhausted, OTP sends stop with an error until it resets. No paid upgrade or automatic charge is used.

Google's current quota reference: https://developers.google.com/apps-script/guides/services/quotas

## D1 migration (required)

Apply `migrations/0012_csp_customer_memberships.sql` to the same existing D1 database bound as `DB` for the current `/api/admin/videos` and `/api/admin/purchases` functions. Do not apply it to the separate Digital Seva preview database. This migration is not applied automatically.

## Optional Brevo alternative

If you already own and control a custom domain, you may instead set `BREVO_API_KEY` and `CSP_SENDER_EMAIL` in Cloudflare Preview and authenticate that domain in Brevo. Brevo's free tier has a daily sending quota, but a free Gmail sender address cannot be authenticated under current sender requirements. No Brevo account or paid plan is required when using the Google Apps Script route.

## Expiry reminders

The reminder Worker is separate so the Pages app remains unchanged. Before deploying `wrangler.csp-reminders.toml`, replace the D1 database name and ID with the same D1 database identifiers and set `CSP_MAILER_URL`. Add `CSP_MAILER_SECRET` as a Worker secret, then deploy the Worker. Its cron runs daily at 10:00 AM IST. Do not deploy this Worker until the Preview D1 environment and Gmail relay have been confirmed.

## Important implementation notes

- The app returns a clear setup error instead of pretending to send OTP when the mail relay/D1 secrets are missing.
- Customer-facing prices are read from D1; admin price changes affect new activations. Existing memberships keep their recorded amount and expiry.
- The membership UI gates tool entry in the browser. Because the photo tools perform image processing locally, this preview does not turn those tools into server-hosted protected downloads; do not treat a client-side gate as DRM or as a guarantee against a technically skilled user bypassing browser code.
- The 7/3/1 reminder Worker is a separate deployment and will not send emails until it is configured with the correct D1 database and Gmail relay.
- Existing video admin, Digital Seva, other tools, homepage layout and language controls are intentionally left outside this feature branch's scope.
