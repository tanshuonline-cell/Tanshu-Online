-- Digital Seva refunds and official government-deposit evidence.
-- Preview D1 only. Do not apply to Production without a separately reviewed release migration.
CREATE TABLE IF NOT EXISTS digital_seva_refunds (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  refund_id TEXT NOT NULL UNIQUE,
  amount REAL NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
  status TEXT NOT NULL CHECK (status IN ('PENDING','SUCCESS','FAILED','UNKNOWN','CANCELLED')),
  cashfree_refund_id TEXT,
  refund_note TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES digital_seva_checkout_orders(order_id)
);
CREATE INDEX IF NOT EXISTS idx_digital_seva_refunds_order ON digital_seva_refunds(order_id, created_at DESC);

CREATE TABLE IF NOT EXISTS digital_seva_government_deposit_evidence (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  government_payment_reference TEXT NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  original_file_name TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('application/pdf','image/jpeg','image/png')),
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 5242880),
  sha256 TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES digital_seva_bookings(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_digital_seva_deposit_evidence_booking
ON digital_seva_government_deposit_evidence(booking_id, created_at DESC);
