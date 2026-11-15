-- Durable encrypted recovery for paid Digital Seva requests.
-- Apply to the dedicated Digital Seva Preview D1 database only.
CREATE TABLE IF NOT EXISTS digital_seva_paid_drafts (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  identity_key TEXT NOT NULL,
  service_id TEXT NOT NULL,
  encrypted_draft_json TEXT NOT NULL,
  saved_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES digital_seva_checkout_orders(order_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_digital_seva_paid_drafts_identity
  ON digital_seva_paid_drafts(identity_key, saved_at DESC);
