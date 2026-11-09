-- Extend only the dedicated Digital Seva Preview database.
-- Do NOT apply this migration to the production/video/payment database.
-- Existing rows remain NULL for audit honesty.
ALTER TABLE digital_seva_bookings ADD COLUMN requester_type TEXT;
ALTER TABLE digital_seva_bookings ADD COLUMN application_for TEXT;
ALTER TABLE digital_seva_bookings ADD COLUMN operator_name TEXT;
ALTER TABLE digital_seva_bookings ADD COLUMN operator_phone TEXT;
ALTER TABLE digital_seva_bookings ADD COLUMN operator_email TEXT;
ALTER TABLE digital_seva_bookings ADD COLUMN centre_name TEXT;
ALTER TABLE digital_seva_bookings ADD COLUMN centre_address TEXT;
ALTER TABLE digital_seva_bookings ADD COLUMN agency_name TEXT;
ALTER TABLE digital_seva_bookings ADD COLUMN agency_address TEXT;
ALTER TABLE digital_seva_bookings ADD COLUMN application_details_json TEXT;

CREATE INDEX IF NOT EXISTS idx_digital_seva_bookings_requester_type
  ON digital_seva_bookings(requester_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_digital_seva_bookings_operator_phone
  ON digital_seva_bookings(operator_phone);
