# Digital Seva Booking & Tracking System — isolated feature

## Safety boundary
- This feature is developed only on `feature/digital-seva-booking-system-2026`.
- Branch base: production `main` commit `f1b94927ec5dfb9cc34fa3b3c061298b596d1476`.
- Do not merge to `main`, deploy production, alter existing routes, homepage sections, tools, video/payment flows, global styles, existing D1 tables, or existing storage.
- New public route namespace: `/digital-seva`.
- New API namespace reserved: `/api/digital-seva/*`.
- All feature-specific UI and data live under `src/features/digital-seva/`.

## Phase 1 — catalogue and UI preview
- Searchable bilingual service catalogue with everyday Hindi/English phrases and aliases.
- Government service categories: PAN, Aadhaar, Certificates, Voter ID, Ration Card, Government Schemes, Online Forms.
- Separate Document & PDF Services category.
- Service details show documents, service fee placeholder, government fee source, availability and assistance type.
- No real booking, payment, document upload, tracking lookup or customer-data persistence in this phase. UI explicitly identifies itself as a preview.

## Phase 2 — booking workflow (code implemented; Preview database setup pending)
- Consent-first booking form with minimal customer details (name, mobile, optional email).
- Server-generated booking reference and status history.
- Server-side validation, same-origin checks, isolate-level rate limiting and idempotency key.
- Separate private admin route using the existing signed superadmin session; booking list and audited status updates.
- Booking APIs fail closed until the dedicated `DIGITAL_SEVA_DB` Preview binding and migration are configured.
- No Aadhaar/PAN number, OTP, biometric, portal password, document upload or payment credential collection.

## Phase 3 — isolated infrastructure (database creation and binding pending)
- A dedicated Cloudflare D1 database for Digital Seva; do not reuse the existing video/payment D1 database or tables.
- A dedicated private R2 bucket for customer documents; no public bucket or public object URLs.
- Separate preview bindings and production bindings; never point preview at production customer data.
- Confirm actual Cloudflare account bindings, retention, backups, access controls and deletion policy before enabling uploads.

## Phase 4 — payments and operations (not started)
- Cashfree sandbox first, with server-side order creation and signed webhook verification.
- Dedicated payment tables and idempotent event handling; never modify video payment tables.
- Separate admin roles, audit trail, status workflow, invoice/receipt generation and refund policy.

## Legal and service accuracy
- TANSHU ONLINE is an independent assistance platform, not a government department.
- Government fees and rules must be checked against the live official portal before launch; do not hardcode unverified fees.
- Aadhaar C/O is an address-field detail and must be handled only through UIDAI's applicable address-update route.
- Do not alter issued government certificates, marksheets, identity documents or financial records to misrepresent facts. Corrections must use the issuing authority's official process.
- Privacy notice, consent, DPDP/consumer-law review, document retention/deletion and grievance process are launch gates.

## Acceptance checklist before preview handoff
- `npm run build`
- `npm run lint`
- Verify /digital-seva and mobile layout.
- Verify existing homepage, 89 tools, /videos, /video/:id, /admin and existing payment paths remain unchanged.
- Verify no migration is applied to the current production D1.
- User must explicitly approve any merge or production deployment.
