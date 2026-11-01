-- Preview D1 migration: manually controlled Homepage video placement.
-- Apply this file to the PREVIEW database only.
ALTER TABLE videos ADD COLUMN homepage_order INTEGER;

-- Default Homepage lineup requested by the site owner.
-- The positions are independent of price and match YouTube video IDs in saved URLs.
UPDATE videos SET homepage_order = 1 WHERE youtube_url LIKE '%kClJTQIZlQs%';
UPDATE videos SET homepage_order = 2 WHERE youtube_url LIKE '%wAR_IbOAy50%';
UPDATE videos SET homepage_order = 3 WHERE youtube_url LIKE '%Z8zFPwL8vpc%';
UPDATE videos SET homepage_order = 4 WHERE youtube_url LIKE '%fidfFbXOqiU%';
