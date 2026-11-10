-- Direct Cashfree Checkout orders for the dedicated Digital Seva Preview database only.
-- Apply ONLY to digital_seva_preview_db. Never apply to the existing TANSHU ONLINE DB or Production.
PRAGMA foreign_keys = ON;

ALTER TABLE digital_seva_bookings ADD COLUMN checkout_order_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_digital_seva_bookings_checkout_order
ON digital_seva_bookings(checkout_order_id)
WHERE checkout_order_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS digital_seva_checkout_orders (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  idempotency_key TEXT NOT NULL UNIQUE,
  service_id TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount > 0 AND amount <= 100000),
  currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
  payment_session_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING','PAID','CLAIMED','FAILED','CANCELLED','EXPIRED')) DEFAULT 'PENDING',
  booking_id TEXT UNIQUE,
  paid_at TEXT,
  claimed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES digital_seva_bookings(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_digital_seva_checkout_orders_status
ON digital_seva_checkout_orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_digital_seva_checkout_orders_phone
ON digital_seva_checkout_orders(customer_phone, created_at DESC);
