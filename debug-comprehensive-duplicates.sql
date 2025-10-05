-- Comprehensive duplicate investigation for Bedfordshire locations
-- Check all possible duplicate scenarios

-- 1. Check for duplicates by ALL relevant columns
SELECT 'DUPLICATE INVESTIGATION - COMPREHENSIVE CHECK' as info;

-- 2. Show ALL Bedfordshire locations with all details
SELECT
  id,
  name,
  slug,
  type,
  county_slug,
  butcher_count,
  created_at,
  updated_at
FROM public_locations
WHERE county_slug = 'bedfordshire'
ORDER BY name, created_at;

-- 3. Group by name only to find name duplicates
SELECT
  name,
  COUNT(*) as count,
  array_agg(id ORDER BY created_at) as ids,
  array_agg(slug ORDER BY created_at) as slugs,
  array_agg(type ORDER BY created_at) as types
FROM public_locations
WHERE county_slug = 'bedfordshire'
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY name;

-- 4. Group by slug to find slug duplicates
SELECT
  slug,
  COUNT(*) as count,
  array_agg(id ORDER BY created_at) as ids,
  array_agg(name ORDER BY created_at) as names
FROM public_locations
WHERE county_slug = 'bedfordshire'
GROUP BY slug
HAVING COUNT(*) > 1
ORDER BY slug;

-- 5. Check the specific problematic towns in detail
SELECT
  'SPECIFIC PROBLEM TOWNS' as info;

SELECT
  id,
  name,
  slug,
  type,
  county_slug,
  butcher_count,
  created_at
FROM public_locations
WHERE county_slug = 'bedfordshire'
  AND name IN ('Flitwick', 'Great Barford', 'Kempston', 'Westoning', 'Wilden')
ORDER BY name, created_at;

-- 6. Check for case sensitivity issues
SELECT
  'CASE SENSITIVITY CHECK' as info;

SELECT DISTINCT
  name,
  LOWER(name) as lower_name,
  slug,
  COUNT(*) OVER (PARTITION BY LOWER(name)) as count_by_lower_name
FROM public_locations
WHERE county_slug = 'bedfordshire'
  AND LOWER(name) IN ('flitwick', 'great barford', 'kempston', 'westoning', 'wilden')
ORDER BY LOWER(name);

-- 7. Check if there are multiple types for same location
SELECT
  'MULTIPLE TYPES CHECK' as info;

SELECT
  name,
  type,
  COUNT(*) as count
FROM public_locations
WHERE county_slug = 'bedfordshire'
  AND name IN ('Flitwick', 'Great Barford', 'Kempston', 'Westoning', 'Wilden')
GROUP BY name, type
ORDER BY name, type;