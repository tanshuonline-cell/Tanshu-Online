-- Production release migration for the dedicated digital_seva_production_db only.
-- Apply ONLY after a fresh backup/bookmark and the preflight checks below.
-- This migration is intentionally separate from Preview migrations 0012/0013.
--
-- Preflight confirmed on 2026-11-15:
--   * digital_seva_bookings has none of the five government-fee columns.
--   * digital_seva_refunds and digital_seva_government_deposit_evidence do not exist.
--   * Production baseline defines digital_seva_checkout_orders.order_id as UNIQUE
--     and digital_seva_bookings.id as PRIMARY KEY, matching the foreign keys below.
--
-- IMPORTANT:
--   * Run exactly once against digital_seva_production_db.
--   * Do NOT run against digital_seva_preview_db, tansu_online_preview_db,
--     or tanshu_online_db.
--   * This file does not UPDATE, DELETE, DROP, or rewrite any existing row.
--   * Existing Cashfree payment/order/event/document tables are not modified.
--   * Existing bookings receive only the declared defaults for the new columns.
--   * Do not use Preview migration 0013 verbatim: its final UPDATE resets PAID
--     government-payment records and clears references.
--
-- Keep the whole file as one migration so D1 can apply it atomically.

PRAGMA foreign_keys = ON;

ALTER TABLE digital_seva_bookings
  ADD COLUMN government_fee REAL NOT NULL DEFAULT 0;

ALTER TABLE digital_seva_bookings
  ADD COLUMN tanshu_service_fee REAL NOT NULL DEFAULT 0;

ALTER TABLE digital_seva_bookings
  ADD COLUMN government_payment_status TEXT NOT NULL DEFAULT 'UNVERIFIED'
  CHECK (government_payment_status IN ('UNVERIFIED','NOT_REQUIRED','PENDING','PAID'));

ALTER TABLE digital_seva_bookings
  ADD COLUMN government_payment_reference TEXT;

ALTER TABLE digital_seva_bookings
  ADD COLUMN government_paid_at TEXT;

CREATE INDEX IF NOT EXISTS idx_digital_seva_bookings_government_payment
  ON digital_seva_bookings(government_payment_status, created_at DESC);

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

CREATE INDEX IF NOT EXISTS idx_digital_seva_refunds_order
  ON digital_seva_refunds(order_id, created_at DESC);

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
