-- Check all current Bedfordshire butchers to identify fake/sample data
-- Run this in Supabase SQL Editor

-- List all Bedfordshire butchers with key details
SELECT
  'CURRENT BEDFORDSHIRE BUTCHERS:' as info,
  name,
  address,
  city,
  postcode,
  phone,
  website,
  description,
  CASE
    WHEN name ILIKE '%sample%' OR name ILIKE '%test%' OR name ILIKE '%demo%' THEN 'LIKELY_FAKE'
    WHEN description ILIKE '%sample%' OR description ILIKE '%lorem%' OR description ILIKE '%placeholder%' THEN 'LIKELY_FAKE'
    WHEN phone IS NULL OR phone = '' THEN 'MISSING_PHONE'
    WHEN website IS NULL OR website = '' THEN 'MISSING_WEBSITE'
    ELSE 'LOOKS_REAL'
  END as data_quality
FROM public_butchers
WHERE county_slug = 'bedfordshire'
ORDER BY city, name;

-- Count by data quality
SELECT
  'DATA QUALITY SUMMARY:' as info,
  CASE
    WHEN name ILIKE '%sample%' OR name ILIKE '%test%' OR name ILIKE '%demo%' THEN 'LIKELY_FAKE'
    WHEN description ILIKE '%sample%' OR description ILIKE '%lorem%' OR description ILIKE '%placeholder%' THEN 'LIKELY_FAKE'
    WHEN phone IS NULL OR phone = '' THEN 'MISSING_PHONE'
    WHEN website IS NULL OR website = '' THEN 'MISSING_WEBSITE'
    ELSE 'LOOKS_REAL'
  END as data_quality,
  COUNT(*) as count
FROM public_butchers
WHERE county_slug = 'bedfordshire'
GROUP BY
  CASE
    WHEN name ILIKE '%sample%' OR name ILIKE '%test%' OR name ILIKE '%demo%' THEN 'LIKELY_FAKE'
    WHEN description ILIKE '%sample%' OR description ILIKE '%lorem%' OR description ILIKE '%placeholder%' THEN 'LIKELY_FAKE'
    WHEN phone IS NULL OR phone = '' THEN 'MISSING_PHONE'
    WHEN website IS NULL OR website = '' THEN 'MISSING_WEBSITE'
    ELSE 'LOOKS_REAL'
  END;