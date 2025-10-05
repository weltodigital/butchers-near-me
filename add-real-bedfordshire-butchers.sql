-- Add REAL Bedfordshire butchers from Google Maps data
-- Run this AFTER removing fake data with remove-fake-bedfordshire-butchers.sql
-- REPLACE ALL DATA BELOW WITH REAL GOOGLE MAPS BUSINESS DATA

-- Template for adding real butchers - REPLACE WITH ACTUAL DATA:
INSERT INTO butchers (
  id,
  name,
  description,
  address,
  postcode,
  city,
  county,
  phone,
  email,
  website,
  latitude,
  longitude,
  rating,
  review_count,
  specialties,
  opening_hours,
  images,
  is_active,
  full_url_path,
  created_at,
  updated_at
) VALUES
-- EXAMPLE TEMPLATE - REPLACE WITH REAL BUSINESS DATA:
-- (
--   gen_random_uuid(),
--   'REAL_BUTCHER_NAME_FROM_GOOGLE_MAPS',
--   'REAL_DESCRIPTION_FROM_GOOGLE_MAPS',
--   'REAL_ADDRESS_FROM_GOOGLE_MAPS',
--   'REAL_POSTCODE',
--   'Bedford',  -- or other real city
--   'Bedfordshire',
--   'REAL_PHONE_NUMBER',
--   'REAL_EMAIL_IF_AVAILABLE',
--   'REAL_WEBSITE_URL',
--   REAL_LATITUDE,
--   REAL_LONGITUDE,
--   REAL_GOOGLE_RATING,
--   REAL_REVIEW_COUNT,
--   ARRAY['REAL_SPECIALTIES'],
--   '{"monday": "REAL_HOURS", "tuesday": "REAL_HOURS", ...}',
--   ARRAY['REAL_IMAGE_URLS_IF_AVAILABLE'],
--   true,
--   'bedfordshire/bedford/real-butcher-name',
--   NOW(),
--   NOW()
-- );

-- INSTRUCTIONS:
-- 1. Search Google Maps for "butchers in Bedford, Bedfordshire"
-- 2. Search Google Maps for "butchers in Luton, Bedfordshire"
-- 3. Search Google Maps for "butchers in Dunstable, Bedfordshire"
-- 4. For each REAL business found, replace the template above with actual data
-- 5. Make sure to use real business names, addresses, phone numbers, etc.
-- 6. Only include businesses that actually exist and are currently operating

SELECT 'TEMPLATE READY - REPLACE WITH REAL GOOGLE MAPS DATA' as instruction;