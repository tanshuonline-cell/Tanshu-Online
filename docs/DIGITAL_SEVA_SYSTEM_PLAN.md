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
- No document uploads or payment credential collection until the private R2 bucket, document migration, consent wording, retention/deletion policy and admin-only retrieval are implemented and verified.

## Phase 3 — secure document upload (in progress)
- Dedicated Preview D1 is provisioned and bound as `DIGITAL_SEVA_DB`; migration `0003_digital_seva_documents.sql` adds upload-token and document metadata fields.
- Next: create a dedicated private R2 bucket `digital-seva-preview-docs` and bind it only to Preview as `DIGITAL_SEVA_DOCS`.
- Uploads must be tied to an existing booking using a short-lived, one-time-purpose token; no public object URLs.
- Allow only PDF, JPEG and PNG after server-side file-signature validation; maximum 5 MB per file and a small per-booking file-count cap.
- Admin document listing/download must require the existing signed administrator session; never expose raw R2 keys to the browser.
- Do not enable real customer uploads until retention/deletion policy, privacy consent, access controls and backups are reviewed. Use dummy files only in Preview.

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


## Fee disclosure and separate policy consent — Preview implementation (7 November 2026)
- A service-wise fee/refund registry now covers all 32 catalogue services in `src/features/digital-seva/serviceFeeRegistry.ts`.
- Official fee amounts are shown only where the reviewed official source supports the exact route. PAN, Bihar RTPS, ration, scheme and other route-dependent services remain live-quote-required.
- Previously accepted TANSHU ONLINE rates are applied to PAN, Aadhaar download/print/PVC, certificates, Voter ID, ration, form filling, PDF/image/signature and scan services. Remaining unpriced items stay explicitly unconfigured.
- Service details show Government/Provider Fee, official refund rule, TANSHU service fee/refund basis, official source link, review date and service-specific caveat.
- Booking now requires separate unticked Terms & Conditions and Refund Policy checkboxes in addition to the existing contact permission. Full text is expandable before submission.
- Booking API validates both policy booleans and policy-version identifiers, requires email, and writes separate server timestamps/version strings.
- Admin booking list displays both acceptance records and policy versions.
- Migration `0004_digital_seva_policy_consents.sql` adds the four audit columns. It is prepared only; it has NOT been applied to any D1 database.
- Until migration 0004 is reviewed and applied to the dedicated Preview D1, new booking inserts that include these columns fail closed. Do not accept real requests through this Preview.
- No fee collection, Cashfree, document upload or Production deployment is enabled by this work.
