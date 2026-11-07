-- Adds an administrator-managed estimated completion time for Digital Seva requests.
-- Apply ONLY to the dedicated digital_seva_preview_db after reviewing the Preview build.
-- Never apply this migration to the production/video/payment database.
ALTER TABLE digital_seva_bookings ADD COLUMN estimated_completion_at TEXT;
