-- TANSHU ONLINE membership core schema.
-- Preview-only migration. This file is NOT applied to any D1 database by this commit.
-- Apply only after reviewing the SQL and explicitly selecting the Preview D1 database.


CREATE TABLE IF NOT EXISTS membership_customers (
  id TEXT PRIMARY KEY,
  google_subject TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  display_name TEXT NOT NULL,
  profile_image_url TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0 CHECK (email_verified IN (0, 1)),
  account_status TEXT NOT NULL DEFAULT 'active'
    CHECK (account_status IN ('active', 'suspended', 'closed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS membership_plans (
  id TEXT PRIMARY KEY,
  plan_code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  monthly_amount_paise INTEGER NOT NULL CHECK (monthly_amount_paise >= 0),
  currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
  includes_all_site_tools INTEGER NOT NULL DEFAULT 0 CHECK (includes_all_site_tools IN (0, 1)),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO membership_plans
  (id, plan_code, display_name, monthly_amount_paise, currency, includes_all_site_tools, is_active, created_at, updated_at)
VALUES
  ('plan_basic', 'basic', 'Basic', 4900, 'INR', 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plan_standard', 'standard', 'Standard', 14900, 'INR', 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plan_premium', 'premium', 'Premium', 24900, 'INR', 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plan_professional', 'professional', 'Professional', 49900, 'INR', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

CREATE TABLE IF NOT EXISTS membership_subscriptions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES membership_customers(id),
  plan_id TEXT NOT NULL REFERENCES membership_plans(id),
  gateway TEXT NOT NULL,
  gateway_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL
    CHECK (status IN ('pending', 'active', 'payment_failed', 'cancelled', 'suspended', 'expired')),
  current_period_start TEXT,
  current_period_end TEXT,
  cancel_at_period_end INTEGER NOT NULL DEFAULT 0 CHECK (cancel_at_period_end IN (0, 1)),
  cancelled_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- A customer cannot hold two simultaneously effective/pending membership records.
CREATE UNIQUE INDEX IF NOT EXISTS idx_membership_one_nonexpired_subscription
  ON membership_subscriptions(customer_id)
  WHERE status IN ('pending', 'active', 'payment_failed', 'cancelled', 'suspended');

CREATE INDEX IF NOT EXISTS idx_membership_subscriptions_status_period
  ON membership_subscriptions(status, current_period_end);

CREATE TABLE IF NOT EXISTS membership_plan_changes (
  id TEXT PRIMARY KEY,
  subscription_id TEXT NOT NULL REFERENCES membership_subscriptions(id),
  from_plan_id TEXT REFERENCES membership_plans(id),
  to_plan_id TEXT NOT NULL REFERENCES membership_plans(id),
  effective_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'applied', 'cancelled')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS membership_payments (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES membership_customers(id),
  subscription_id TEXT REFERENCES membership_subscriptions(id),
  plan_id TEXT NOT NULL REFERENCES membership_plans(id),
  gateway TEXT NOT NULL,
  gateway_order_id TEXT UNIQUE,
  gateway_payment_id TEXT UNIQUE,
  amount_paise INTEGER NOT NULL CHECK (amount_paise >= 0),
  currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
  status TEXT NOT NULL
    CHECK (status IN ('created', 'pending', 'success', 'failed', 'refunded', 'partially_refunded', 'disputed')),
  paid_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_membership_payments_customer_created
  ON membership_payments(customer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS membership_refunds (
  id TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL REFERENCES membership_payments(id),
  gateway_refund_id TEXT UNIQUE,
  amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS membership_webhook_events (
  id TEXT PRIMARY KEY,
  gateway TEXT NOT NULL,
  gateway_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload_sha256 TEXT NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'received'
    CHECK (processing_status IN ('received', 'processed', 'ignored', 'failed')),
  received_at TEXT NOT NULL,
  processed_at TEXT,
  UNIQUE(gateway, gateway_event_id)
);

CREATE TABLE IF NOT EXISTS membership_conversations (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES membership_customers(id),
  generation INTEGER NOT NULL CHECK (generation >= 1),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'closed', 'deleted')),
  created_at TEXT NOT NULL,
  deleted_at TEXT,
  UNIQUE(customer_id, generation)
);

CREATE INDEX IF NOT EXISTS idx_membership_conversations_customer
  ON membership_conversations(customer_id, generation DESC);

CREATE TABLE IF NOT EXISTS membership_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES membership_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'admin')),
  sender_customer_id TEXT REFERENCES membership_customers(id),
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'attachment', 'private_video')),
  body TEXT,
  created_at TEXT NOT NULL,
  CHECK (
    (sender_type = 'customer' AND sender_customer_id IS NOT NULL)
    OR (sender_type = 'admin' AND sender_customer_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_membership_messages_conversation_created
  ON membership_messages(conversation_id, created_at);

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

-- Keep object keys until the R2 deletion worker confirms removal.
-- This queue is intentionally independent of message/attachment rows.
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
