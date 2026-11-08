-- Cashfree Payment Links for the dedicated Digital Seva Preview D1 only.
-- Apply ONLY to digital_seva_preview_db. Never apply to the production/video/payment database.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS digital_seva_payments (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount > 0 AND amount <= 100000),
  currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
  cashfree_link_id TEXT NOT NULL UNIQUE,
  link_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING','PAID','FAILED','CANCELLED','SUPERSEDED')) DEFAULT 'PENDING',
  cashfree_link_status TEXT,
  cashfree_link_paid_amount REAL NOT NULL DEFAULT 0,
  paid_at TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES digital_seva_bookings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_digital_seva_payments_booking ON digital_seva_payments(booking_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_digital_seva_payments_status ON digital_seva_payments(status, created_at DESC);
