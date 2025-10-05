-- Debug location and butcher count issues
-- Run this in Supabase SQL Editor

-- 1. Check for duplicate location entries
SELECT 'DUPLICATE LOCATIONS:' as issue_type;
SELECT name, slug, county_slug, type, COUNT(*) as count
FROM public_locations
WHERE county_slug = 'bedfordshire'
GROUP BY name, slug, county_slug, type
HAVING COUNT(*) > 1
ORDER BY name;

-- 2. Check all Bedfordshire locations and their butcher counts
SELECT 'BEDFORDSHIRE LOCATIONS:' as issue_type;
SELECT
  id,
  name,
  slug,
  type,
  county_slug,
  full_path,
  butcher_count,
  CASE
    WHEN butcher_count = 0 THEN 'ZERO_COUNT'
    WHEN butcher_count IS NULL THEN 'NULL_COUNT'
    ELSE 'HAS_COUNT'
  END as count_status
FROM public_locations
WHERE county_slug = 'bedfordshire'
ORDER BY type, name;

-- 3. Get actual butcher counts per location from butchers table
SELECT 'ACTUAL BUTCHER COUNTS:' as issue_type;
SELECT
  city,
  city_slug,
  county,
  county_slug,
  COUNT(*) as actual_butcher_count
FROM public_butchers
WHERE county_slug = 'bedfordshire'
GROUP BY city, city_slug, county, county_slug
ORDER BY city;

-- 4. Compare expected vs actual counts
SELECT 'COUNT COMPARISON:' as issue_type;
SELECT
  l.name as location_name,
  l.slug as location_slug,
  l.butcher_count as stored_count,
  COALESCE(b.actual_count, 0) as actual_count,
  CASE
    WHEN l.butcher_count = COALESCE(b.actual_count, 0) THEN 'MATCH'
    WHEN l.butcher_count = 0 AND COALESCE(b.actual_count, 0) > 0 THEN 'NEEDS_UPDATE'
    WHEN l.butcher_count > 0 AND COALESCE(b.actual_count, 0) = 0 THEN 'OVERCOUNT'
    ELSE 'MISMATCH'
  END as status
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
ORDER BY l.name;