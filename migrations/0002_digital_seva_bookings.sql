-- Dedicated Digital Seva Preview database only.
-- Do NOT apply this migration to the existing TANSHU ONLINE video/payment database.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS digital_seva_bookings (
  id TEXT PRIMARY KEY,
  booking_reference TEXT NOT NULL UNIQUE,
  idempotency_key TEXT NOT NULL UNIQUE,
  service_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  status TEXT NOT NULL CHECK (status IN ('RECEIVED','IN_REVIEW','WAITING_FOR_CUSTOMER','IN_PROGRESS','COMPLETED','CANCELLED')) DEFAULT 'RECEIVED',
  consent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_digital_seva_bookings_created ON digital_seva_bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_digital_seva_bookings_status ON digital_seva_bookings(status);
CREATE INDEX IF NOT EXISTS idx_digital_seva_bookings_phone ON digital_seva_bookings(customer_phone);

CREATE TABLE IF NOT EXISTS digital_seva_booking_events (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  actor TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES digital_seva_bookings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_digital_seva_booking_events_booking ON digital_seva_booking_events(booking_id, created_at DESC);
