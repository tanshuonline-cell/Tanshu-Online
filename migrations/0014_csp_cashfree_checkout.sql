-- CSP Cashfree hosted checkout for Preview D1 only. Never apply to Production without explicit approval.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS csp_cashfree_orders (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  payment_id TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  plan_code TEXT NOT NULL CHECK (plan_code IN ('basic','advanced','premium')),
  amount_inr INTEGER NOT NULL CHECK (amount_inr IN (99,199,299)),
  customer_phone TEXT NOT NULL,
  payment_session_id TEXT NOT NULL,
  cf_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PAID','FAILED','CANCELLED','EXPIRED')),
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES csp_payments(id),
  FOREIGN KEY (customer_id) REFERENCES csp_customers(id)
);
CREATE INDEX IF NOT EXISTS idx_csp_cashfree_orders_customer ON csp_cashfree_orders(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_csp_cashfree_orders_status ON csp_cashfree_orders(status, created_at DESC);

CREATE TABLE IF NOT EXISTS csp_cashfree_events (
  event_key TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  cf_payment_id TEXT,
  payment_amount REAL,
  payment_currency TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES csp_cashfree_orders(order_id)
);
CREATE INDEX IF NOT EXISTS idx_csp_cashfree_events_order ON csp_cashfree_events(order_id, created_at DESC);
