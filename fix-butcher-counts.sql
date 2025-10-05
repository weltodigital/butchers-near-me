-- Fix butcher counts for all locations (real data only)
-- Run this in Supabase SQL Editor

-- Update butcher_count for city/town locations based on actual butcher data
UPDATE public_locations
SET butcher_count = COALESCE(actual_counts.count, 0)
FROM (
  SELECT
    city_slug,
    COUNT(*) as count
  FROM public_butchers
  GROUP BY city_slug
) actual_counts
WHERE public_locations.slug = actual_counts.city_slug
  AND public_locations.type IN ('city', 'town');

-- Update county-level butcher counts
UPDATE public_locations
SET butcher_count = COALESCE(county_counts.count, 0)
FROM (
  SELECT
    county_slug,
    COUNT(*) as count
  FROM public_butchers
  GROUP BY county_slug
) county_counts
WHERE public_locations.slug = county_counts.county_slug
  AND public_locations.type = 'county';

-- Verify the updates for Bedfordshire
SELECT
  'UPDATED BEDFORDSHIRE COUNTS:' as result_type,
  name,
  type,
  butcher_count,
  CASE
    WHEN butcher_count = 0 THEN 'ZERO_COUNT'
    WHEN butcher_count > 0 THEN 'HAS_COUNT'
  END as status
FROM public_locations
WHERE county_slug = 'bedfordshire'
  OR slug = 'bedfordshire'
ORDER BY type, name;