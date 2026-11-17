# CSP & Travel Cafe membership preview setup

This feature is isolated on branch `feature/four-tool-membership-safe-integration-preview-2026-11-17`. It is Preview-only and has not been merged or deployed to Production. It does not replace the existing admin login or video-management endpoints.

## Included in this preview

- Gmail-only customer registration/login using email OTP (no phone login).
- Preview-first access: all seven workspaces open before sign-up or payment; customers can upload and edit before export.
- Server-generated six-digit OTP, ten-minute expiry, maximum five verification attempts, three OTP requests per 15 minutes per Gmail address and ten per 15 minutes per IP (stored as a keyed hash).
- HttpOnly customer session cookie (30 days).
- The four paid tools ask for Gmail OTP and a membership only when the customer tries to download or print. Plan requests are recorded as pending manual payments for the existing admin dashboard.
- BASIC, ADVANCED and PREMIUM are the current draft plan names. Prices and durations start inactive and must be configured by the site owner in the Preview Admin Dashboard before customers can request a plan. No unapproved price is shown.
- Draft access mapping in code: BASIC = Passport Photo Studio; ADVANCED = Passport Photo Studio + PVC Card Maker + Multi Customer Photo Maker; PREMIUM = all four tools including WhatsApp Selfie to Passport Photo. Confirm this mapping before activating any plan.
- Manual membership activation only after payment is independently verified. No payment gateway, auto-debit or auto-renewal is added.
- Admin customer list, suspend/restore/expire actions, manual activation, payment audit history, editable plan pricing, per-tool enable/disable switches and audit records.

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

Apply `migrations/0012_csp_customer_memberships.sql` only to the dedicated Preview D1 database bound as `DB` for this Pages Preview, after independently confirming the Preview database ID. Do not apply it to Production D1 or the separate Digital Seva Preview database. This migration is not applied automatically and has not been run.

## Optional Brevo alternative

If you already own and control a custom domain, you may instead set `BREVO_API_KEY` and `CSP_SENDER_EMAIL` in Cloudflare Preview and authenticate that domain in Brevo. Brevo's free tier has a daily sending quota, but a free Gmail sender address cannot be authenticated under current sender requirements. No Brevo account or paid plan is required when using the Google Apps Script route.

## Not included in this Preview

- No Cashfree checkout, payment webhook, automatic activation, auto-renewal, refunds or scheduled expiry-reminder Worker.
- No Preview D1 migration has been applied yet. Do not activate customer plans until the Preview database, Gmail relay and approved plan settings are verified.

## Important implementation notes

- The app returns a clear setup error instead of pretending to send OTP when the mail relay/D1 secrets are missing.
- Customer-facing prices are read from D1; admin price changes affect new activations. Existing memberships keep their recorded amount and expiry.
- The membership UI gates export actions in the browser. Because the photo tools perform image processing locally, this preview does not turn those tools into server-hosted protected downloads; do not treat a client-side gate as DRM or as a guarantee against a technically skilled user bypassing browser code.
- Existing tool-specific DP watermark code is preserved; the membership wrapper does not add another watermark layer or alter the four tools' watermark implementations.
- Existing video admin, Digital Seva, other tools, homepage layout and language controls are intentionally left outside this feature branch's scope.
