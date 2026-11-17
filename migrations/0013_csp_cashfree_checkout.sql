-- Cashfree Sandbox checkout metadata for CSP memberships.
-- Apply only to the Preview D1 database after reviewing this migration.
ALTER TABLE csp_payments ADD COLUMN gateway_order_id TEXT;
ALTER TABLE csp_payments ADD COLUMN gateway_payment_session_id TEXT;
ALTER TABLE csp_payments ADD COLUMN gateway_payment_id TEXT;
ALTER TABLE csp_payments ADD COLUMN gateway_payment_status TEXT;
ALTER TABLE csp_payments ADD COLUMN customer_phone TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_csp_payments_gateway_order ON csp_payments(gateway_order_id) WHERE gateway_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_csp_payments_gateway_status ON csp_payments(payment_method, gateway_payment_status, created_at DESC);
