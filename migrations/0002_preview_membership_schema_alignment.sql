-- Align the manually created Preview D1 membership tables with 0001_membership_core.sql.
-- Safe only because the Preview database was checked and all four affected tables had zero rows.
-- This migration intentionally changes no customer, payment, subscription, video, or other tables.

DROP TABLE IF EXISTS membership_attachment_deletion_jobs;
DROP TABLE IF EXISTS membership_attachments;
DROP TABLE IF EXISTS membership_admin_audit;
DROP TABLE IF EXISTS membership_notification_deliveries;

CREATE TABLE IF NOT EXISTS membership_attachments (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL REFERENCES membership_messages(id) ON DELETE CASCADE,
  storage_provider TEXT NOT NULL DEFAULT 'r2' CHECK (storage_provider = 'r2'),
  object_key TEXT NOT NULL UNIQUE,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes > 0),
  attachment_kind TEXT NOT NULL CHECK (attachment_kind IN ('photo', 'pdf', 'private_video')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS membership_attachment_deletion_jobs (
  id TEXT PRIMARY KEY,
  object_key TEXT NOT NULL UNIQUE,
  requested_by_admin TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT 'conversation_deleted',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'deleted', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  created_at TEXT NOT NULL,
  completed_at TEXT,
  last_error_code TEXT
);

CREATE TABLE IF NOT EXISTS membership_admin_audit (
  id TEXT PRIMARY KEY,
  admin_identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_membership_admin_audit_created
  ON membership_admin_audit(created_at DESC);

CREATE TABLE IF NOT EXISTS membership_notification_deliveries (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES membership_customers(id),
  notification_type TEXT NOT NULL
    CHECK (notification_type IN ('admin_reply', 'expiry_7_day', 'expiry_today', 'payment_status')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'dashboard')),
  dedupe_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  scheduled_at TEXT NOT NULL,
  sent_at TEXT,
  last_error_code TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_membership_notifications_due
  ON membership_notification_deliveries(status, scheduled_at);
