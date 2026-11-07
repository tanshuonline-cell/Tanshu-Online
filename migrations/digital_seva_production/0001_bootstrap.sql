-- Production bootstrap schema for the dedicated digital_seva_production_db ONLY.
-- Apply this ONE file to a brand-new, empty Digital Seva Production D1 database.
-- Never apply to DB / tanshu_online_db / tansu_online_preview_db / digital_seva_preview_db.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS digital_seva_bookings (
  id TEXT PRIMARY KEY,
  booking_reference TEXT NOT NULL UNIQUE,
  idempotency_key TEXT NOT NULL UNIQUE,
  service_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  requester_type TEXT,
  application_for TEXT,
  operator_name TEXT,
  operator_phone TEXT,
  operator_email TEXT,
  centre_name TEXT,
  centre_address TEXT,
  agency_name TEXT,
  agency_address TEXT,
  application_details_json TEXT,
  checkout_order_id TEXT,
  document_upload_token_hash TEXT,
  document_upload_token_expires_at TEXT,
  document_consent_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('RECEIVED','IN_REVIEW','WAITING_FOR_CUSTOMER','IN_PROGRESS','COMPLETED','CANCELLED')) DEFAULT 'RECEIVED',
  consent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  terms_accepted_at TEXT,
  terms_policy_version TEXT,
  refund_policy_accepted_at TEXT,
  refund_policy_version TEXT,
  estimated_completion_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ds_prod_bookings_created ON digital_seva_bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ds_prod_bookings_status ON digital_seva_bookings(status);
CREATE INDEX IF NOT EXISTS idx_ds_prod_bookings_phone ON digital_seva_bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_ds_prod_bookings_requester ON digital_seva_bookings(requester_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ds_prod_bookings_operator_phone ON digital_seva_bookings(operator_phone);
CREATE INDEX IF NOT EXISTS idx_ds_prod_bookings_terms ON digital_seva_bookings(terms_policy_version, terms_accepted_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ds_prod_bookings_checkout_order ON digital_seva_bookings(checkout_order_id) WHERE checkout_order_id IS NOT NULL;

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
CREATE INDEX IF NOT EXISTS idx_ds_prod_events_booking ON digital_seva_booking_events(booking_id, created_at DESC);

CREATE TABLE IF NOT EXISTS digital_seva_documents (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  original_file_name TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('application/pdf','image/jpeg','image/png')),
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 5242880),
  sha256 TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES digital_seva_bookings(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ds_prod_documents_booking ON digital_seva_documents(booking_id, created_at DESC);

-- Retained for compatibility with historical/admin payment reporting.
-- New customer submissions use digital_seva_checkout_orders below, not payment links.
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
CREATE INDEX IF NOT EXISTS idx_ds_prod_payments_booking ON digital_seva_payments(booking_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ds_prod_payments_status ON digital_seva_payments(status, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ds_prod_one_pending_payment_per_booking
  ON digital_seva_payments(booking_id) WHERE status = 'PENDING';

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
CREATE INDEX IF NOT EXISTS idx_ds_prod_checkout_status ON digital_seva_checkout_orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ds_prod_checkout_phone ON digital_seva_checkout_orders(customer_phone, created_at DESC);
