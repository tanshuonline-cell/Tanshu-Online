-- Separate affirmative policy acceptance records for Digital Seva Preview bookings.
-- Apply ONLY to digital_seva_preview_db after reviewing the updated Preview build.
-- Do NOT apply to the production/video database. Existing rows remain NULL for audit honesty.
ALTER TABLE digital_seva_bookings ADD COLUMN terms_accepted_at TEXT;
ALTER TABLE digital_seva_bookings ADD COLUMN terms_policy_version TEXT;
ALTER TABLE digital_seva_bookings ADD COLUMN refund_policy_accepted_at TEXT;
ALTER TABLE digital_seva_bookings ADD COLUMN refund_policy_version TEXT;

CREATE INDEX IF NOT EXISTS idx_digital_seva_bookings_terms_acceptance
  ON digital_seva_bookings(terms_policy_version, terms_accepted_at);

CREATE INDEX IF NOT EXISTS idx_digital_seva_bookings_refund_acceptance
  ON digital_seva_bookings(refund_policy_version, refund_policy_accepted_at);
