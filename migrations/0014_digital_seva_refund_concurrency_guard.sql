-- Digital Seva refund concurrency guard.
-- Apply to the dedicated Preview D1 only, after migration 0013.
-- Refuse a second in-flight refund reservation for the same order at the database
-- level. This closes the read/check/insert race across concurrent Admin requests.
-- If this migration fails because duplicate unresolved rows already exist, stop
-- and reconcile those rows against Cashfree before retrying. Do not delete rows.

CREATE UNIQUE INDEX IF NOT EXISTS idx_digital_seva_refunds_one_unresolved_per_order
  ON digital_seva_refunds(order_id)
  WHERE status IN ('PENDING', 'UNKNOWN');
