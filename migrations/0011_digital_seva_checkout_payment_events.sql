-- Durable Cashfree payment-attempt history for Digital Seva Admin.
-- Apply to the Digital Seva D1 database in Preview first, then Production only after approval.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS digital_seva_checkout_payment_events (
  event_key TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  cf_payment_id TEXT,
  payment_message TEXT,
  payment_amount REAL,
  payment_currency TEXT,
  event_time TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES digital_seva_checkout_orders(order_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_digital_seva_checkout_payment_events_order
ON digital_seva_checkout_payment_events(order_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_digital_seva_checkout_payment_events_status
ON digital_seva_checkout_payment_events(payment_status, created_at DESC);
