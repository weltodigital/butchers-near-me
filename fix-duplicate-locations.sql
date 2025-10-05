-- Fix duplicate location pages for Bedfordshire towns
-- Run this in Supabase SQL Editor

-- First, check for duplicates
SELECT 'DUPLICATE LOCATIONS:' as info;
SELECT
  name,
  slug,
  county_slug,
  type,
  COUNT(*) as count,
  array_agg(id) as location_ids
FROM public_locations
WHERE county_slug = 'bedfordshire'
  AND name IN ('Flitwick', 'Great Barford', 'Kempston', 'Westoning', 'Wilden')
GROUP BY name, slug, county_slug, type
HAVING COUNT(*) > 1
ORDER BY name;

-- Remove duplicate entries (keep the first one, remove the rest)
-- For Flitwick
DELETE FROM public_locations
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name, slug, county_slug ORDER BY created_at) as rn
    FROM public_locations
    WHERE name = 'Flitwick' AND county_slug = 'bedfordshire'
  ) t WHERE rn > 1
);

-- For Great Barford
DELETE FROM public_locations
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name, slug, county_slug ORDER BY created_at) as rn
    FROM public_locations
    WHERE name = 'Great Barford' AND county_slug = 'bedfordshire'
  ) t WHERE rn > 1
);

-- For Kempston
DELETE FROM public_locations
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name, slug, county_slug ORDER BY created_at) as rn
    FROM public_locations
    WHERE name = 'Kempston' AND county_slug = 'bedfordshire'
  ) t WHERE rn > 1
);

-- For Westoning
DELETE FROM public_locations
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name, slug, county_slug ORDER BY created_at) as rn
    FROM public_locations
    WHERE name = 'Westoning' AND county_slug = 'bedfordshire'
  ) t WHERE rn > 1
);

-- For Wilden
DELETE FROM public_locations
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name, slug, county_slug ORDER BY created_at) as rn
    FROM public_locations
    WHERE name = 'Wilden' AND county_slug = 'bedfordshire'
  ) t WHERE rn > 1
);

-- Verify cleanup
SELECT 'AFTER CLEANUP:' as info;
SELECT
  name,
  slug,
  county_slug,
  type,
  COUNT(*) as count
FROM public_locations
WHERE county_slug = 'bedfordshire'
  AND name IN ('Flitwick', 'Great Barford', 'Kempston', 'Westoning', 'Wilden')
GROUP BY name, slug, county_slug, type
ORDER BY name;

-- Show all Bedfordshire locations to verify
SELECT 'ALL BEDFORDSHIRE LOCATIONS:' as info;
SELECT
  name,
  slug,
  type,
  butcher_count,
  created_at
FROM public_locations
WHERE county_slug = 'bedfordshire'
ORDER BY type, name;