-- Preview-only Cashfree subscription contact details.
-- Apply only to tansu_online_preview_db after reviewing the target database.
CREATE TABLE IF NOT EXISTS membership_subscription_contacts (
  subscription_id TEXT PRIMARY KEY REFERENCES membership_subscriptions(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL CHECK (length(customer_phone) = 10),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
