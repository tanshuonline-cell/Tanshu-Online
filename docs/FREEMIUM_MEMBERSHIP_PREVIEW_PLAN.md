# TANSHU ONLINE Freemium Membership — Preview Implementation

## Owner-approved customer experience (2026-11-11)

- Public visitors can browse the website and open tools without signing in.
- A visitor may import/upload a photo into a tool for free.
- Any tool action or feature marked Paid must show a clear Membership Upgrade prompt before it runs.
- Final downloads/exports/print actions are Paid by default unless the owner changes the rule.
- The owner must be able to choose which tools and individual features are Free or Paid from the Admin Panel.
- Do not show a fake technical error on a locked action. Show a clear upgrade dialog with the three plans.
- A visitor must be able to preview the tool and understand what it does before being asked to pay.
- Entitlements must be enforced in the application and, wherever server-side processing exists, on the server. Client-only gates are a UX control and must not be described as tamper-proof.

## Unpaid preview watermark (owner-approved, 2026-11-11)

- Until a verified active membership entitlement exists, show a visible TANSHU ONLINE watermark over the photo/studio preview area.
- Use a repeated diagonal pattern across the preview, not a single corner logo that can be cropped out. The mark should be legible in screenshots while retaining enough visibility to understand the tool.
- The watermark must be applied to every relevant preview surface (main photo canvas, sheet preview, crop/final preview, and any other preview that could otherwise expose an unmarked result).
- Do not rely on a CSS-only overlay for downloadable output protection. Paid export, download, and print actions remain locked by default and must check entitlement before producing the final file.
- For any preview/export path that can produce a file before entitlement, compose the watermark into the generated image/PDF itself. A screenshot watermark is a deterrent, not a guarantee against capture or tampering.
- Remove the watermark only after the server confirms a valid, unexpired entitlement for the required tier. Never trust a browser-only flag, local storage value, or client-supplied plan name.
- Keep the watermark brand text as “TANSHU ONLINE”; do not invent or expose a personal phone number or address.

## Approved plans

| Plan | Price | Duration | Billing |
|---|---:|---:|---|
| Basic | ₹49 | 1 day (24 hours from verified payment) | One-time |
| Standard | ₹199 | 30 days from verified payment | One-time |
| Premium | ₹599 | 90 days from verified payment | One-time; display “No discount” |

No recurring mandate, subscription debit, or automatic renewal is to be created. Customers must make a new one-time purchase when they choose to renew.

## Customer identity

- Google Sign-In is the customer login/signup method.
- Use verified Google identity (subject, email, display name, avatar).
- A visitor may use free features without login.
- Require Google login only when a paid action is attempted and the visitor chooses to upgrade/checkout.
- Use secure server-issued HttpOnly/Secure/SameSite cookies; do not trust browser-supplied identity or plan status.

## Payment and entitlement

- Use Cashfree Payment Gateway one-time PG Orders, not Cashfree Subscriptions/mandates.
- Server creates the order using a trusted plan ID and server-side amount; ignore client-supplied price.
- Keep the membership order pending until Cashfree payment is verified server-side.
- Verify the order/payment status against Cashfree and process signed webhooks idempotently.
- Only a verified successful payment activates an entitlement.
- Compute expiry from the verified payment timestamp using exact durations: 24 hours, 30 days, 90 days.
- Keep existing one-time video purchase flow independent; do not modify its tables, routes, or payment rules.
- Preview deployments must use Cashfree Sandbox credentials and sandbox endpoints only. Never use Production credentials/endpoints in this branch.

## Feature access rules

- Create a central feature-key registry with tool ID, feature key, display name, and default access rule.
- Initial default: photo/file import is Free; all other editing/processing/export actions are Paid until the owner configures them.
- Admin can set each registered feature as Free or Paid and optionally set the minimum membership tier.
- Unknown/unregistered actions must fail closed for paid export/processing endpoints, but must not block opening the tool or importing a file.
- Paid actions should show an Upgrade dialog rather than a browser error.
- On successful login, reload membership entitlement and current feature rules.
- Membership expiry immediately removes paid entitlements on the next server/session check.

## Admin owner-access bypass (owner-approved, 2026-11-11)

- Provide a separate, secure Admin Login using the existing authenticated Admin account and server-verified Admin role.
- When the verified Admin uses tools while signed in, bypass customer membership checks: all Free and Paid features are available without purchasing a plan.
- Admin tool use must not show the customer Upgrade popup or unpaid-customer watermark.
- Exclude Admin tool activity from customer usage logs, customer quotas, and customer-facing analytics so the owner can demonstrate tools in tutorial videos without consuming a customer allowance or appearing as a customer.
- Never grant this bypass from a client-side flag, URL parameter, local storage value, or editable role field. Verify Admin role on the server for protected actions.
- Keep essential security/audit records for Admin sign-in and sensitive Admin changes (such as changing roles, feature rules, or payment records); these are security records, not customer usage logs. Do not record ordinary Admin tool interactions as customer activity.
- Customer sessions remain subject to their purchased plan and feature rules; an Admin bypass must never leak into another user's session.

### Preview implementation status (2026-11-11)

- Implemented in `AdvancedPhotoStudioShell.tsx`: on Studio mount, the UI calls the existing same-origin `GET /api/admin/auth` endpoint with the HttpOnly session cookie and only enables the bypass when the response confirms `authenticated: true` and `role: superadmin`.
- A failed, expired, or missing Admin session keeps the customer preview locks and watermark in place.
- The current customer membership entitlement is still not connected; this preview bypass is specifically for verified Admin sessions.
- The Studio component does not currently write ordinary tool interactions to a customer usage-log endpoint. Do not interpret this as a completed, system-wide log exclusion until all analytics/usage event producers are audited.
- Not yet browser-tested or build-verified. Admin login must be tested on the Cloudflare Preview deployment before relying on the bypass.

## Admin controls

- Reuse the existing authenticated Admin session and role checks; never weaken admin authentication.
- Add a Membership/Feature Access area to the existing Admin Panel.
- Admin can view customers, verified payments, active plan, start/expiry, and change feature Free/Paid/minimum-tier rules.
- Do not add unapproved public contact details.
- Private member chat is a later separate phase; do not represent it as live until its server-side persistence, upload security, ownership checks, and Admin inbox are implemented and tested.

## Release guardrails

- Work only on `feature/freemium-membership-integration-preview-2026-11-11`.
- Branch starts from `feature/membership-plans-pricing-preview-2026-11-11`, which is based on the current `main` (not the older divergent membership branch).
- Do not merge to `main`, change Production settings, apply Production migrations, or enable Live Cashfree payments without the owner's separate approval.
- The earlier `feature/membership-system-v1-preview` branch is 32 commits behind and contains a monthly recurring billing design; do not merge that branch wholesale. Port only reviewed Google OAuth concepts/files and reimplement billing as one-time orders.
- Preserve the existing homepage, tools, language switcher, Digital Seva area, photo studio behavior, and video purchase flow.
- Before preview handoff, run TypeScript/build checks and verify free import, paid action prompts, Google OAuth, payment verification, expiry, and plan gating. Report any checks blocked by unavailable Cloudflare bindings or sandbox credentials.
