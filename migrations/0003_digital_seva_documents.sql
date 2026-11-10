-- Digital Seva document metadata for the dedicated Digital Seva D1 database.
-- Keep document_type present from the initial table creation so later API inserts are compatible.
ALTER TABLE digital_seva_bookings ADD COLUMN document_upload_token_hash TEXT;
ALTER TABLE digital_seva_bookings ADD COLUMN document_upload_token_expires_at TEXT;
ALTER TABLE digital_seva_bookings ADD COLUMN document_consent_at TEXT;

CREATE TABLE IF NOT EXISTS digital_seva_documents (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  original_file_name TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('application/pdf', 'image/jpeg', 'image/png')),
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 5242880),
  sha256 TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES digital_seva_bookings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_digital_seva_documents_booking ON digital_seva_documents(booking_id, created_at DESC);
