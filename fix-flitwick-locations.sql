-- Fix incorrectly assigned Flitwick butchers
-- These butchers are currently assigned to Flitwick but are actually in other cities

-- Update butchers that are actually in Bedford
UPDATE butchers
SET
  city = 'Bedford',
  city_slug = 'bedford',
  full_url_path = REPLACE(full_url_path, '/flitwick/', '/bedford/')
WHERE name IN (
  'The Meat Shop',
  'Johnstone Family Butchers',
  'Langford''s Butchers',
  'Eric the Butcher',
  'Lingers high class Butchers LTD',
  'Meat Junction Centre'
) AND city = 'Flitwick';

-- Update butchers that are actually in Kempston
UPDATE butchers
SET
  city = 'Kempston',
  city_slug = 'kempston',
  full_url_path = REPLACE(full_url_path, '/flitwick/', '/kempston/')
WHERE name = 'McKenzies Butchers' AND city = 'Flitwick';

-- Update Southall Turkeys - this is actually in Great Barford
UPDATE butchers
SET
  city = 'Great Barford',
  city_slug = 'great-barford',
  full_url_path = REPLACE(full_url_path, '/flitwick/', '/great-barford/')
WHERE name = 'Southall Turkeys & Butchers' AND city = 'Flitwick';

-- Check which butchers actually remain in Flitwick after cleanup
SELECT
  name,
  address,
  city,
  postcode
FROM butchers
WHERE city = 'Flitwick'
ORDER BY name;

-- Count remaining Flitwick butchers
SELECT COUNT(*) as flitwick_butchers_remaining
FROM butchers
WHERE city = 'Flitwick';