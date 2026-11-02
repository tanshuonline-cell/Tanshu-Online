-- Separate manual grants from Cashfree payment records.
CREATE TABLE IF NOT EXISTS admin_video_access_grants (
  id TEXT PRIMARY KEY,
  customer_phone TEXT NOT NULL,
  video_id TEXT NOT NULL,
  note TEXT,
  granted_by TEXT NOT NULL DEFAULT 'admin',
  granted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_revoked INTEGER NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(customer_phone, video_id),
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_admin_grants_lookup
  ON admin_video_access_grants(customer_phone, video_id, is_revoked);
