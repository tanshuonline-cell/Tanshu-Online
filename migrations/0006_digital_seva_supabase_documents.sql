-- Digital Seva document metadata for the dedicated Preview D1.
-- Actual document bytes are stored only in the existing private Supabase Storage bucket.
-- Apply ONLY to digital_seva_preview_db. Do not apply to the general DB or Production.

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

CREATE INDEX IF NOT EXISTS idx_digital_seva_documents_booking
  ON digital_seva_documents(booking_id, created_at DESC);
