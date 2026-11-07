# Digital Seva Phase 2 — Preview setup

This phase adds real booking requests and a private admin workspace, but it is intentionally disabled until the dedicated Preview database is connected.

## Required Cloudflare Preview-only setup
1. In Cloudflare Dashboard → Workers & Pages → TANSHU ONLINE Pages project → Settings → Functions → D1 database bindings, add a **Preview** binding named `DIGITAL_SEVA_DB`.
2. Create a new D1 database named `digital_seva_preview_db`. Do not reuse `tansu_online_preview_db`, any production database, or the video/payment database.
3. Bind the new database to the Preview environment only. Do not add this binding to Production.
4. Apply `migrations/0002_digital_seva_bookings.sql` to this new Preview database only.
5. Deploy the feature branch preview and test a booking, admin login, booking list, and status change.

## What this phase collects
- Customer name, 10-digit mobile number, optional email, selected service, consent timestamp.
- No Aadhaar/PAN numbers, OTPs, passwords, scans, document uploads, or payments.
- Public API writes only; booking reads and status changes require the existing signed TANSHU ONLINE superadmin session.
- Status changes are recorded in an append-only event history table.

## Routes
- Customer: `/digital-seva`
- Private admin: `/digital-seva-admin`
- Public create endpoint: `POST /api/digital-seva/bookings`
- Admin endpoint: `GET/PATCH /api/digital-seva/admin`

The customer booking endpoint returns HTTP 503 until `DIGITAL_SEVA_DB` is present. This fail-closed behavior prevents requests from being shown as saved when no database is connected.

## Before production launch
Set a separate Production D1 database and binding only after preview acceptance, then complete privacy notice, retention/deletion, backups, access review, abuse protection and legal review. No production merge or deployment is part of this work.
