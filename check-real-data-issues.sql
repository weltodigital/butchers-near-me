-- Check the real data issues without adding fake data
-- Run this in Supabase SQL Editor

-- 1. Check for duplicate location entries
SELECT 'DUPLICATE LOCATIONS:' as issue_type;
SELECT name, slug, county_slug, type, COUNT(*) as count
FROM public_locations
WHERE county_slug = 'bedfordshire'
GROUP BY name, slug, county_slug, type
HAVING COUNT(*) > 1
ORDER BY name;

-- 2. Check butcher counts vs reality
SELECT 'BUTCHER COUNT MISMATCH:' as issue_type;
SELECT
  l.name as location_name,
  l.slug as location_slug,
  l.butcher_count as stored_count,
  COALESCE(b.actual_count, 0) as actual_count
FROM public_locations l
LEFT JOIN (
  SELECT
    city_slug,
    COUNT(*) as actual_count
  FROM public_butchers
  WHERE county_slug = 'bedfordshire'
  GROUP BY city_slug
) b ON l.slug = b.city_slug
WHERE l.county_slug = 'bedfordshire'
  AND l.type IN ('city', 'town')
  AND l.butcher_count != COALESCE(b.actual_count, 0)
ORDER BY l.name;

-- 3. Check image status for real butchers (no fake data)
SELECT 'BUTCHER IMAGE STATUS:' as issue_type;
SELECT
  name,
  city,
  CASE
    WHEN images IS NULL OR images = '[]' OR array_length(images, 1) IS NULL THEN 'NO_IMAGES'
    ELSE 'HAS_IMAGES'
  END as image_status
FROM public_butchers
WHERE county_slug = 'bedfordshire'
ORDER BY city, name;