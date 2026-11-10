# Digital Seva Production Configuration

This is a separate, production-only setup for `digital_seva_production_db`. Do not use the general `tanshu_online_db` or either Preview database.

## 1. Production D1 schema

1. Confirm the Pages **Production** binding `DIGITAL_SEVA_DB` points to `digital_seva_production_db`.
2. Take a D1 backup/export before making schema changes.
3. Execute the single SQL file `migrations/production/0001_digital_seva_production_baseline.sql` against **digital_seva_production_db only**.
4. Verify that these tables exist: `digital_seva_bookings`, `digital_seva_booking_events`, `digital_seva_documents`, `digital_seva_payments`, `digital_seva_checkout_orders`.
5. Verify `digital_seva_documents.document_type` exists. Do not run the Preview migration files 0002–0010 against Production.

The baseline is idempotent for a fresh database. It does not migrate existing customer data and must not be pointed at another database.

## 2. Production document storage

Create a **private** bucket named `digital-seva-production-docs` in the intended Supabase project. Do not make it public. In Cloudflare Pages → TANSHU ONLINE → Settings → Variables and Secrets → Production, configure:

- `SUPABASE_URL`: the intended Supabase project URL
- `SUPABASE_SECRET_KEY`: Supabase server-side secret key (encrypted secret)
- `DIGITAL_SEVA_STORAGE_BUCKET`: `digital-seva-production-docs`
- `DIGITAL_SEVA_PII_SECRET`: a unique random secret of at least 32 characters (encrypted secret)

Keep Preview on its existing private bucket. Never paste secret values into GitHub, chat, or source files.

## 3. Cashfree

Do not enable live payments until Cashfree has issued Production credentials and the webhook endpoint is configured. In Cloudflare Pages → Settings → Variables and Secrets → Production:

- `CASHFREE_ENVIRONMENT`: `PRODUCTION`
- `CASHFREE_APP_ID`: Production App ID (encrypted secret)
- `CASHFREE_SECRET_KEY`: Production Secret Key (encrypted secret)
- `CASHFREE_WEBHOOK_SECRET`: the dedicated webhook signing secret from Cashfree (encrypted secret)

Configure both Cashfree webhook URLs to the production domain:
- `/api/digital-seva/cashfree-webhook`
- `/api/digital-seva/cashfree-order-webhook`

Use the matching Cashfree event types for Payment Links and Orders. Verify a successful test payment and a failed/cancelled payment before advertising online payment. The application defaults to Sandbox unless `CASHFREE_ENVIRONMENT=PRODUCTION` is explicitly set.

## 4. Other required Production secrets

Confirm the Production environment has its own strong values for `ADMIN_SECRET_TOKEN` and `DIGITAL_SEVA_PII_SECRET`. Do not reuse Preview secrets. Keep the admin credentials private.

## 5. Release order

1. Finish the Preview checks on the current PR.
2. Create the private Production bucket and configure Production-only variables/secrets.
3. Back up `digital_seva_production_db`, then run the production baseline SQL against that database only.
4. Verify the five tables and `document_type` column.
5. Only then approve and merge the release PR. Recheck the Production binding after merge.
6. Keep live payments disabled until Cashfree Production credentials and webhooks are independently verified.

No Production database, storage bucket, secret, or live payment setting is changed by a GitHub commit.
