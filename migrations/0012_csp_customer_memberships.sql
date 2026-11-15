-- CSP & Travel Cafe customer accounts, email OTP, memberships and admin audit.
-- Apply to the existing Cloudflare D1 database only after reviewing the preview branch.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS csp_customers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  email_verified_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS csp_email_otps (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE,
  otp_hash TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('signup','login')),
  expires_at TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  consumed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_csp_otp_email_created ON csp_email_otps(email, created_at DESC);

CREATE TABLE IF NOT EXISTS csp_subscriptions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  plan_code TEXT NOT NULL CHECK (plan_code IN ('basic','advanced','premium')),
  amount_inr INTEGER NOT NULL CHECK (amount_inr IN (99,199,299)),
  starts_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','suspended','cancelled')),
  activated_by TEXT NOT NULL DEFAULT 'admin',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES csp_customers(id)
);
CREATE INDEX IF NOT EXISTS idx_csp_subscriptions_customer ON csp_subscriptions(customer_id, expires_at DESC);

CREATE TABLE IF NOT EXISTS csp_payments (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  subscription_id TEXT,
  amount_inr INTEGER NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'manual',
  reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected','refunded')),
  verified_by TEXT,
  verified_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES csp_customers(id),
  FOREIGN KEY (subscription_id) REFERENCES csp_subscriptions(id)
);
CREATE INDEX IF NOT EXISTS idx_csp_payments_customer ON csp_payments(customer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS csp_admin_audit (
  id TEXT PRIMARY KEY,
  admin_username TEXT NOT NULL,
  action TEXT NOT NULL,
  customer_id TEXT,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS csp_plan_prices (
  plan_code TEXT PRIMARY KEY CHECK (plan_code IN ('basic','advanced','premium')),
  amount_inr INTEGER NOT NULL CHECK (amount_inr >= 0),
  is_active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO csp_plan_prices (plan_code, amount_inr) VALUES
  ('basic', 99), ('advanced', 199), ('premium', 299);

CREATE TABLE IF NOT EXISTS csp_reminder_log (
  id TEXT PRIMARY KEY,
  subscription_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  reminder_days INTEGER NOT NULL CHECK (reminder_days IN (7,3,1)),
  sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(subscription_id, reminder_days),
  FOREIGN KEY (subscription_id) REFERENCES csp_subscriptions(id),
  FOREIGN KEY (customer_id) REFERENCES csp_customers(id)
);
