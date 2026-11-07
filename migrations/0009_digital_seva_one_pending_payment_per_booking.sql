-- Preview-only protection: allow at most one current PENDING payment link per booking.
-- Apply ONLY to digital_seva_preview_db. Never apply to DB or production databases.
CREATE UNIQUE INDEX IF NOT EXISTS idx_digital_seva_one_pending_per_booking
ON digital_seva_payments(booking_id)
WHERE status = 'PENDING';
