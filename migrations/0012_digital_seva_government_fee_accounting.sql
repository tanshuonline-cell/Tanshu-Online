-- Government-fee accounting for the dedicated Digital Seva Preview database only.
-- Apply ONLY to digital_seva_preview_db. Never apply to Production or the video/payment database.
ALTER TABLE digital_seva_bookings ADD COLUMN government_fee REAL NOT NULL DEFAULT 0;
ALTER TABLE digital_seva_bookings ADD COLUMN tanshu_service_fee REAL NOT NULL DEFAULT 0;
ALTER TABLE digital_seva_bookings ADD COLUMN government_payment_status TEXT NOT NULL DEFAULT 'UNVERIFIED'
  CHECK (government_payment_status IN ('UNVERIFIED','NOT_REQUIRED','PENDING','PAID'));
ALTER TABLE digital_seva_bookings ADD COLUMN government_payment_reference TEXT;
ALTER TABLE digital_seva_bookings ADD COLUMN government_paid_at TEXT;

CREATE INDEX IF NOT EXISTS idx_digital_seva_bookings_government_payment
ON digital_seva_bookings(government_payment_status, created_at DESC);
