# TANSHU ONLINE Membership System — Product Blueprint

## 1. Project guardrails

- Preview-only implementation branch: `feature/membership-system-v1-preview`.
- Exact approved starting point: `223f000fc53b9a9b03edc52c39af6e35982ab8a4` (`feature/photo-signature-resizer` baseline).
- Preserve the existing website, tools, language switcher, video learning area, photo/signature tools, copy behavior, and current admin authentication.
- Do not merge to `main`, deploy to production, or change production configuration without the owner's separate approval.
- Membership features must be isolated from the existing one-time video purchase flow.

## 2. Plans and confirmed inclusions

| Plan | Price | Billing |
|---|---:|---|
| Basic | ₹49 | Monthly recurring |
| Standard | ₹149 | Monthly recurring |
| Premium | ₹249 | Monthly recurring |
| Professional | ₹499 | Monthly recurring |

Confirmed for all four plans:
- Unlimited private chat with Admin.
- Information/help requests through the private chat.
- Admin may send private videos at Admin's discretion to members of any tier.
- Chat supports text, photo, and PDF attachments in both directions.

Professional additionally includes all available website tools/features. Do not invent or advertise further tier-specific entitlements until explicitly approved.

## 3. Identity and customer account

- Google Sign-In is the customer login method.
- Use the Google account's verified identity details (name, email, profile photo); do not provide an in-site profile-name/photo editor.
- One Google account may have only one active membership at a time.
- A customer may request an upgrade or downgrade from the account dashboard. The new plan takes effect at the next renewal boundary; the current paid plan remains active until then. Prevent overlapping active subscriptions and duplicate billing.

## 4. Subscription and payment lifecycle

1. Visitor opens Membership from the homepage or footer.
2. Visitor signs in with Google, selects a plan, reviews the monthly recurring amount and terms, and explicitly consents to recurring billing.
3. Payment/subscription is created through a recurring-capable payment gateway.
4. Activate membership only after server-side verification of the gateway result/webhook. Never trust a client-side success screen alone.
5. Store gateway subscription identifiers and billing events securely; never store card credentials.
6. On each successful renewal, extend the paid-through date and record the transaction.
7. On failed renewal/payment: immediately suspend membership chat access; no grace period. Mark payment failed and show renewal/payment recovery guidance.
8. On cancellation of auto-renewal: stop future recurring charges, but keep the already-paid membership active through its paid-through/expiry date.
9. At expiry: block member chat and private chat history/attachment access. Keep all prior messages and attachments securely available to Admin.
10. After a successful new purchase/renewal following expiry, restore chat access but start a fresh customer-visible conversation. Do not restore the previous chat history to the customer; Admin retains the old history.
11. A failed, duplicate, disputed, or reversed transaction must be reconciled against verified gateway events before changing entitlement state.

## 5. Cancellation and expiry reminders

- Customer can cancel auto-renewal at any time.
- Cancellation stops the next recurring charge; it does not remove access already paid for.
- Send an expiry reminder 7 days before expiry and a final reminder on the expiry date.
- Deliver reminders to the registered email and the website dashboard/inbox.
- Record reminder delivery attempts to avoid duplicate notifications.
- Keep the dashboard accessible after expiry so the customer can view account identity, previous membership/payment history, expiry status, and a Renew Membership action. Do not expose old chat messages or attachments while expired.

## 6. Refund policy

- Generally, no refund after a successful membership payment.
- If the gateway/payment is reported failed but money was debited, verify the transaction with the gateway and refund the confirmed debit.
- Refund duplicate payments (the extra duplicate transaction).
- Show refund status and reference details in the Admin Panel.
- Apply payment gateway rules and applicable law; do not describe the policy as overriding mandatory consumer rights.

## 7. Private chat

- Chat is available inside the website; do not publish a public WhatsApp number as the membership support channel.
- Members may send text, photos, and PDFs. Admin may reply with text, photos, PDFs, and private videos.
- Unlimited chat means no artificial message-count quota; it does not promise 24×7 or instant replies. Admin replies as available.
- Notify members of new Admin replies through the website dashboard and registered email, subject to notification preferences and delivery status.
- Enforce strict server-side ownership checks: one customer can only access their own active conversation. Admin access requires the existing authenticated Admin session and role checks.
- Enforce upload limits, MIME/type validation, file-size limits, safe storage, authorization on every download, and malware scanning where available. Never expose private attachment URLs publicly.
- Expired, payment-failed, or suspended members cannot read or send chat messages or download attachments. Admin can still access retained records.
- Admin can suspend/reactivate a member. Suspension blocks member access without deleting billing or chat records.

## 8. Customer dashboard

- Account identity from Google (name, email, avatar).
- Current/previous plan, status, start date, paid-through/expiry date, and payment history.
- Auto-renewal status and cancellation action.
- Upgrade/downgrade request with next-cycle effective date clearly shown.
- Renew Membership action for expired or payment-failed accounts.
- Chat entry only while membership access is active and not suspended.
- Expired dashboard remains available for account, history, and renewal actions, but not private chat history/attachments.

## 9. Admin membership tools

- Member list/search and member detail.
- Plan/status, start/expiry dates, auto-renewal status, and payment/refund history.
- Payment-failed, expired, cancelled, suspended, and active states.
- Chat inbox with member identity, unread state, and retained history.
- Send text, photo, PDF, and private video to any membership tier at Admin discretion.
- Suspend/reactivate members.
- Review refund status and payment reconciliation details.
- Admin actions and entitlement changes must be auditable.

## 10. Pages and navigation

- `/membership`: plan cards, inclusions, recurring price, terms, and checkout entry.
- `/account`: customer dashboard.
- `/account/chat`: private chat, available only when membership is active and not suspended.
- Existing `/admin`: add Membership Management and Chat Inbox using existing secure Admin authentication.
- Add Membership links to homepage navigation and footer.
- Keep existing video routes and one-time video purchases independent.

## 11. Security and data architecture

Use separate membership entities rather than overloading video purchases. Proposed data groups:
- Plans and plan prices.
- Membership/subscription records (customer, plan, status, current period, gateway subscription reference).
- Payment and refund transactions.
- Webhook/event idempotency records.
- Customer conversations and messages.
- Private attachment metadata/storage references.
- Admin actions/audit log and notification delivery log.

All entitlement decisions must be enforced server-side. Validate OAuth state/nonce and token issuer/audience, use secure HttpOnly sessions, protect state-changing requests against CSRF, rate-limit auth/chat/upload/payment endpoints, and verify signed gateway webhooks. Keep secrets in environment bindings, not source code. Confirm Cloudflare D1/R2/KV bindings and payment-gateway recurring-subscription support before implementing live billing.

## 12. Decisions delegated to implementation

Use conservative, customer-clear defaults and show them in the UI before checkout:
- Admin replies as available; no guaranteed response time.
- Message/email notifications can be muted by the customer where practical, but mandatory payment/expiry notices remain enabled.
- File upload limits and accepted file formats must be explicit before upload and enforced on the server.
- Do not silently charge a different amount, prorate mid-cycle, or activate an upgrade early. Any price/tax treatment must be clearly displayed at checkout.
- Do not add unapproved plan benefits, public contact channels, or new payment promises.

## 13. Release and test gates

Before presenting the preview:
- Confirm branch base SHA is the approved baseline.
- Verify existing homepage, language switcher, footer, tools, video pages, and admin login remain intact.
- Test Google auth success, denial, expired session, and account isolation.
- Test recurring consent, verified payment activation, webhook replay/idempotency, failed payment immediate lockout, cancellation, expiry reminders, expiry dashboard, and renewal with fresh chat.
- Test text/photo/PDF uploads, unauthorized download denial, expired member denial, Admin access, and file validation.
- Test duplicate payment/refund states and upgrade/downgrade next-cycle behavior.
- Run the project build and relevant automated checks; report any checks that cannot be performed because credentials or live gateway bindings are unavailable.
- Keep the branch/PR as a preview only. No merge or production deployment without explicit owner approval.


## 14. Repository implementation audit (2026-11-05)

The current repository implementation was inspected before adding live membership APIs.

- The current customer-facing membership plan page is a front-end preview. Its checkout controls remain disabled.
- The new `/account` and `/account/chat` routes are preview shells only. They do not authenticate a customer, retrieve real membership/payment data, or send/store messages.
- The inspected `server.ts` is an Express development/server mirror. Its existing video orders, access records, videos, and login-attempt counters use in-memory JavaScript `Map` objects. These are not durable membership storage and must not be reused for production subscriptions, chat, or audit records.
- The existing Cashfree implementation in `server.ts` creates and verifies one-time video purchase orders. This inspection does not establish recurring subscription support. Membership billing must use a separately verified recurring-capable gateway flow.
- The inspected `package.json` has Vite build and TypeScript lint scripts, but no membership-specific test script.
- Do not add customer login or chat based on browser state/localStorage, and do not treat a successful client redirect as payment confirmation.
- Before implementing live membership endpoints, inspect the deployed Cloudflare Pages Functions structure and confirm the actual D1/R2/KV bindings and secrets. Build persistent D1 schema/migrations and server-side entitlement checks there (or in the confirmed production API runtime), not in the Express in-memory maps.
- The existing Admin authentication code in the Express server is a development implementation; production membership administration must use the verified deployed Admin session mechanism and must never weaken or replace existing Admin authentication.

This audit is a release safety checkpoint: keep all customer account, chat, checkout, and admin membership actions visibly non-functional until the persistent backend, Google OAuth, recurring billing, webhook verification, and access-control tests are complete.


## 15. Cloudflare Pages configuration audit (2026-11-05)

On the membership preview branch, the following expected configuration paths were checked and were not present:
- `wrangler.toml`
- `wrangler.jsonc`
- `wrangler.json`
- `_routes.json`
- `functions/_middleware.ts`
- `functions/api/health.ts`
- `functions/api/[[path]].ts`

The repository has a Vite `build` script and a root `vite.config.ts`. This repository inspection alone cannot reveal Cloudflare dashboard-only bindings or prove that D1, R2, or KV resources exist in the Cloudflare account. It also does not prove that the Express `server.ts` is deployed on Cloudflare Pages; Pages static deployments normally serve the Vite build unless Pages Functions or a separately deployed Worker/API are configured.

Before creating live membership endpoints:
1. Inspect Cloudflare Pages project settings for the actual production and Preview deployment build configuration and runtime.
2. Check Functions/Workers routing and the deployed bindings list without exposing secret values.
3. Confirm whether D1 and R2 resources exist and whether Preview and Production bindings are separated.
4. Choose and document the actual API runtime (Pages Functions or a separately deployed Worker/API) before writing migrations or OAuth/payment routes.
5. Keep the approved photo/signature baseline and production deployment untouched.

No Cloudflare account settings, bindings, secrets, database, storage, or deployments were changed by this audit.
